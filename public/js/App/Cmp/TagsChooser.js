
/*global
    define
*/

define([
    'jquery',

    // PM
    'PM/Core',
    'PM/Cmp/Abstract',

    'App/API/API',

    // Non AMD
    'js!jquery-inherit'
], function ($, PM, Abstract, API) {
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
            });
        },

        _clearFilterAvailableTags: function () {
            let els = this.els;

            els.searchAvailableInput.val('').focus();

            els.availableTagsCtn.find('.tag_el').each(function(index, tagEl) {
                $(tagEl).removeClass('hide');
            });
        },

        /**
         * Build the DOM of the Cmp.
         */
        build: function () {
            let ctn, selectedTagsCtn, availableTagsCtn, searchAvailableCtn,
                searchAvailableInput,
                that = this,
                els = that.els;

            // Main ctn.
            ctn = els.container = $('<div>', {
                'class': CLASS_NAME + ' ' + that.options.className
            });

            selectedTagsCtn = els.selectedTagsCtn = $('<div>', {
                'class': 'selected_tags_ctn'
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
                        keyup: /*$.throttle(300,*/ function () {
                            that._onFilterAvailableTags(
                                searchAvailableInput.val()
                            );
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

            ctn.append(
                selectedTagsCtn,
                searchAvailableCtn,
                availableTagsCtn
            );

            API.getAllTags({
                onSuccess: (allTags) => {
                    that._allTags = allTags;
                    that._buildTags();
                }
            });

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
