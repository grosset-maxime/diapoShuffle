
/*global
    define
*/

define([
    'jquery',

    // PM
    'PM/Core',
    'PM/Cmp/Abstract',

    'App/Utils/Utils',

    'App/TagsManager',

    // Non AMD
    'js!jquery-inherit'
], function ($, PM, Abstract, Utils, TagsManager) {
    'use strict';

    let TagsChooser;

    const CLASS_NAME = 'tagschooser_cmp';

    TagsChooser = $.inherit(Abstract, {

        /**
         * @property {Object} defaultOptions - Default options values.
         */
        defaultOptions: {
            className: '',
            selected: '',
            available: '',
            container: null,
            randomBtn: false,
            events: {
                onSelect: () => {},
                onDeselect: () => {}
            }
        },

        _allTags: null,

        /**
         * @constructor TagsChooser.
         * @param {Object}   options                - Options values.
         * @param {String}   [options.className]    - Class name to add to Cmp.
         * @param {String[]} [options.selected]     - Selected tags.
         * @param {String[]} [options.available]    - Available tags.
         */
        __constructor: function (options) {
            let that = this;
            that.__base(options);
        },

        _onTagClick: function (e) {
            let tag = e.target;

            $(tag).toggleClass('selected');
        },

        _buildTags: function () {
            let that = this,
                options = that.options,
                selectedTags = options.selected || [],
                els = that.els,
                selectedTagsCtn = els.selectedTagsCtn,
                availableTagsCtn = els.availableTagsCtn,
                allTagsWithoutSelected = that._allTags.filter(function (tag) {
                    return !selectedTags.find(function  (selectedTag) {
                        return tag.id === selectedTag.id;
                    });
                });

            function createTagEl (Tag, selected) {
                let tagEl = $('<div>', {
                    'class': 'tag_el ' + (selected ? 'selected' : ''),
                    text: Tag.getName(),
                    on: {
                        click: that._onTagClick
                    }
                }).data('Tag', Tag);

                return tagEl;
            }

            selectedTags.forEach(function (Tag) {
                selectedTagsCtn.append(createTagEl(Tag, true));
            });

            allTagsWithoutSelected.forEach(function (Tag) {
                availableTagsCtn.append(createTagEl(Tag, false));
            });
        },

        _onFilterAvailableTags: function (search) {
            let tags, els, availableTagsCtn,
                that = this;

            if (!search) {
                that._clearFilterAvailableTags();
                return;
            }

            els = that.els;
            availableTagsCtn = els.availableTagsCtn;

            search = search.toLowerCase();

            tags = availableTagsCtn.find('.tag_el');

            tags.each(function(index, tagEl) {
                let tag = $(tagEl);

                if (tag.data('Tag').getName().toLowerCase().indexOf(search) < 0) {
                    tag.addClass('hide');
                } else {
                    tag.removeClass('hide');
                }

                tag.removeClass('highlighted');
            });

            tags = availableTagsCtn.find('.tag_el:not(.hide):first');
            tags.length && tags.addClass('highlighted');
        },

        _clearFilterAvailableTags: function () {
            let els = this.els,
                tags = els.availableTagsCtn.find('.tag_el');

            els.searchAvailableInput.val('').focus();

            tags.each(function(index, tagEl) {
                $(tagEl).removeClass('hide highlighted');
            });

            $(tags[0]).addClass('highlighted');
        },

        _selectRandomTag: function () {
            let randomTagEl,
                els = this.els;

            randomTagEl = Utils.getRandomElement(
                els.availableTagsCtn.find('.tag_el:not(.selected)')
            );
            randomTagEl && randomTagEl.click();

            els.searchAvailableInput.val('').focus();
        },

        _toggleSelectHighlightedTag: function () {
            let tags,
                els = this.els;

            tags = els.availableTagsCtn.find('.tag_el.highlighted:first');
            tags.length && tags.toggleClass('selected');
        },

        _highlightTag: function (way) {
            let tags,
                els = this.els,
                fn = way === 'previous'
                    ? (tags, i) => {
                        if (i - 1 >= 0) {
                            $(tags[i - 1]).addClass('highlighted');
                        } else {
                            $(tags[tags.length - 1]).addClass('highlighted');
                        }
                    }
                    : (tags, i) => {
                        if (i + 1 < tags.length) {
                            $(tags[i + 1]).addClass('highlighted');
                        } else {
                            $(tags[0]).addClass('highlighted');
                        }
                    };

            tags = els.availableTagsCtn.find('.tag_el:not(.hide)');

            for (let i = 0; i < tags.length; i++) {
                let tag = $(tags[i]);

                if (tag.hasClass('highlighted')) {
                    tag.removeClass('highlighted');
                    fn(tags, i);
                    break;
                }
            }
        },

        /**
         * Build the DOM of the Cmp.
         */
        build: function () {
            let ctn, selectedTagsCtn, availableTagsCtn, searchAvailableCtn,
                searchAvailableInput, selectRandomTagCtn,
                that = this,
                els = that.els;

            // Main ctn.
            ctn = els.container = $('<div>', {
                'class': CLASS_NAME + ' ' + that.options.className
            });

            selectedTagsCtn = els.selectedTagsCtn = $('<div>', {
                'class': 'selected_tags_ctn',
                on: {
                    click: function () {
                        searchAvailableInput.focus();
                    }
                }
            });

            availableTagsCtn = els.availableTagsCtn = $('<div>', {
                'class': 'available_tags_ctn',
                on: {
                    click: function () {
                        searchAvailableInput.focus();
                    }
                }
            });

            searchAvailableCtn = els.searchAvailableCtn = $('<div>', {
                'class': 'search_available_tags_ctn',
                html: [searchAvailableInput = els.searchAvailableInput = $('<input>', {
                    'class': 'search_input',
                    type: 'text',
                    placeholder: 'filter',
                    on: {
                        keyup: function (e) {
                            let key = e.which;

                            if ([13, 27, 37, 39].indexOf(key) >= 0) {
                                return;
                            }

                            that._onFilterAvailableTags(
                                searchAvailableInput.val()
                            );
                        },
                        keydown: function (e) {
                            let key = e.which,
                                stopEvent = false;

                            switch (key) {
                                case 13: // Enter
                                    that._toggleSelectHighlightedTag();
                                    break;

                                case 27: // ESC
                                    that._clearFilterAvailableTags();
                                    stopEvent = true; // Prevent closing modal.
                                    break;

                                case 37: // Left arrow
                                    that._highlightTag('previous');
                                    break;

                                case 39: // Right arrow
                                    that._highlightTag('next');
                                    break;
                            }

                            if (stopEvent) {
                                e.stopPropagation();
                                e.preventDefault();
                            }
                        }
                    }
                }), $('<div>', {
                    'class': 'clear_search_btn',
                    text: 'x',
                    on: {
                        click: that._clearFilterAvailableTags.bind(that)
                    }
                })]
            });

            selectRandomTagCtn = els.selectRandomTagCtn = $('<div>', {
                'class': 'select_random_tag_ctn',
                html: els.selectRandomTagBtn = $('<input>', {
                    'class': 'btn',
                    value: 'Select random',
                    type: 'button',
                    tabIndex: -1,
                    on: {
                        click: that._selectRandomTag.bind(that)
                    }
                }).button()
            });

            ctn.append(
                selectedTagsCtn,
                searchAvailableCtn,
                that.options.randomBtn ? selectRandomTagCtn : null,
                availableTagsCtn
            );

            if (TagsManager.hasFetchTags()) {
                that._allTags = TagsManager.getTags();
                that._buildTags();
                that._clearFilterAvailableTags();
            } else {
                TagsManager.init({
                    onSuccess: (Tags) => {
                        that._allTags = Tags;
                        that._buildTags();
                        that._clearFilterAvailableTags();
                    }
                });
            }

            return ctn;
        },

        getSelected: function () {
            let els = this.els,
                selectedTags = [];

            function retriveSelectedTags (tagsCtn) {
                tagsCtn.find('.selected').each(function (index, tagEl) {
                    selectedTags.push($(tagEl).data('Tag'));
                });
            }

            retriveSelectedTags(els.selectedTagsCtn);
            retriveSelectedTags(els.availableTagsCtn);

            return selectedTags;
        }
    });

    return TagsChooser;
});
