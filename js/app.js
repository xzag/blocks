/**
 * @global Handlebars, jQuery
 */
jQuery(function ($) {
	'use strict';

    /**
     * delay for click handler
     * workaround for handling click and dblclick events on the same element
     * @type {number}
     */
	const CLICK_DELAY = 500;

    /**
     * "random" content
     */
	const LYRICS = [
		"I could bet on new-years eve",
		"He'd call me up at night",
		"From the other side of the world",
		"Ed was always there alright",
		"Ed's got the looks of a movie star ",
		"Ed's got the smile of a prince",
		"He ride a bike instead of a car",
		"I want to be his friend",
		"Dancing in the living room",
		"With the ladies so nice",
		"Like a child with a wisdom tooth",
		"He's just a friend of mine",
		"Ed's got the rings and the colors",
		"Ed's got the wind in his hair",
		"He goes a riding with the brothers",
		"He's got a fist in the air",
		"Going to the run, run Angel",
		"Going to the run, run Angel",
		"Well, heaven and hell came together that night",
		"Only for you this time",
		"Going to the run, forever Angel",
		"One summer at the festival",
		"Holding on real tight",
		"On the back of a Harley",
		"He took me for a ride in the sky",
		"Ed's got…"
	];

    /**
     * SimpleBlock object
     *
     * @param id
     * @param text
     * @constructor
     */
	var SimpleBlock = function(id, text) {
		this.id = id;
		this.text = text;
		this.selected = false;
	};

    /**
     * ComplexBlock object
     *
     * @param id
     * @param text
     * @param state
     * @constructor
     */
	var ComplexBlock = function(id, text, state) {
		SimpleBlock.apply(this, [id, text]);
		this.state = state;
		this.isComplex = true;
	};

    /**
     *
     * @type {{init: init, bindEvents: bindEvents, render: render, renderHeader: renderHeader, getSelectedBlocks: getSelectedBlocks, getRedBlocks: getRedBlocks, getGreenBlocks: getGreenBlocks, getIndexFromEl: getIndexFromEl, getRandomQuote: getRandomQuote, create: create, clickHandler: clickHandler, toggle: toggle, select: select, destroy: destroy}}
     */
	var App = {
		init: function () {
			this.nextId = 1;
			this.blocks = [];
			this.blockTemplate = Handlebars.compile($('#block-template').html());
			this.headerTemplate = Handlebars.compile($('#header-template').html());
			this.bindEvents();
			this.render();
		},
		bindEvents: function () {
			$('.btn-add').on('click', this.create.bind(this));
			$('#block-list')
				.on('click', '.block', this.clickHandler.bind(this))
				.on('click', '.close', this.destroy.bind(this));
		},
		render: function () {
			var blocks = this.blocks;
			$('#block-list').html(this.blockTemplate(blocks));
			this.renderHeader();
		},
		renderHeader: function () {
			var blockCount = this.blocks.length;
			var selectedBlocks = this.getSelectedBlocks();
			var selectedCount = selectedBlocks.length;
			var redCount = this.getRedBlocks(selectedBlocks).length;
			var greenCount = this.getGreenBlocks(selectedBlocks).length;
			var template = this.headerTemplate({
				blockCount: blockCount,
				selectedCount: selectedCount,
				redCount: redCount,
				greenCount: greenCount
			});

			$('#status-bar').toggle(blockCount >= 0).html(template);
		},
		getSelectedBlocks: function () {
			return this.blocks.filter(function (block) {
				return block.selected;
			});
		},
        /**
         * Select RED blocks from list
         * @param blocks
         */
		getRedBlocks: function(blocks) {
			return blocks.filter(function (block) {
				return typeof block.isComplex !== 'undefined' && !block.state;
			});
		},
		getGreenBlocks: function(blocks) {
			return blocks.filter(function (block) {
				return typeof block.isComplex !== 'undefined' && block.state;
			});
		},
		// accepts an element from inside the `.item` div and
		// returns the corresponding index in the `blocks` array
		getIndexFromEl: function (el) {
			var id = $(el).closest('div').data('id');
			var blocks = this.blocks;
			var i = blocks.length;

			while (i--) {
				if (blocks[i].id === id) {
					return i;
				}
			}
		},
		getRandomQuote: function() {
			var i = Math.floor(Math.random() * LYRICS.length);
			return LYRICS[i];
		},
		create: function (e) {
			var type = $(e.target).closest('button').data('type');

			var text = this.getRandomQuote();
			var id = this.nextId++;

			var block = type === 'simple'
					  ? new SimpleBlock(id, text)
					  : new ComplexBlock(id, text, false);
			this.blocks.push(
				block
			);

			this.render();
		},

        /**
         * Single handler for click and dblclick events
         * @param e
         */
		clickHandler: function(e) {
			var i = this.getIndexFromEl(e.target);
			var block = this.blocks[i];

            /**
             * Detect whether we clicked twice during CLICK_DELAY interval
             */
			if (typeof block.timer !== 'undefined') {
				clearTimeout(this.blocks[i].timer);
				delete this.blocks[i].timer;
				// we clicked twice = dblclick
				this.toggle(e);
			} else {
				var that = this;
				this.blocks[i].timer = setTimeout(function() {

				    // that was a single click = click
					that.select(e);
					delete that.blocks[i].timer;
				}, CLICK_DELAY);
			}
		},
		toggle: function (e) {
			console.log('toggle');
			var i = this.getIndexFromEl(e.target);

			if (typeof this.blocks[i].state === 'undefined') {
				return;
			}

			this.blocks[i].state = !this.blocks[i].state;
			this.render();
		},
		select: function (e) {
			console.log('select');
			var i = this.getIndexFromEl(e.target);
			if (typeof this.blocks[i] === 'undefined') {
				return;
			}

			this.blocks[i].selected = !this.blocks[i].selected;
			this.render();
		},
		destroy: function (e) {
			this.blocks.splice(this.getIndexFromEl(e.target), 1);
			this.render();
			e.stopPropagation();
			return false;
		}
	};

	App.init();
});
