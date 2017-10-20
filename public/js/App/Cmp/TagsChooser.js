
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

    function hideEl (el) {
        el.addClass('hide');
    }

    function showEl (el) {
        el.removeClass('hide');
    }

    function selectEl (el) {
        el.addClass('selected');
    }

    function unSelectEl (el) {
        el.removeClass('selected');
    }

    function toggleSelectEl (el) {
        el.toggleClass('selected');
    }

    function highlightEl (el) {
        el.addClass('highlighted');
    }

    function unHighlightEl (el) {
        el.removeClass('highlighted');
    }

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

            toggleSelectEl($(tag));
        },

        _onTagCategoryClick: function (e) {
            let tagCategoryEl = $(e.target),
                els = this.els,
                selectedCategoryEl = els.tagCategoriesCtn.find('.tag_category_el.selected');

            selectedCategoryEl[0] && unSelectEl(selectedCategoryEl);

            tagCategoryEl[0] !== selectedCategoryEl[0] && toggleSelectEl(tagCategoryEl);

            this._onFilterAvailableTags();
            this._onFilterSelectedTags();

            els.searchAvailableInput.focus();
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
                    css: {
                        'border-color': '#' + ((TagsManager.getTagCategoryById(Tag.getCategory()) || {}).color || '000')
                    },
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

        _buildTagCategories: function () {
            let that = this;

            function createTagEl (TagCategory) {
                let tagEl = $('<div>', {
                    'class': 'tag_el tag_category_el',
                    text: TagCategory.getName(),
                    css: {
                        'border-color': '#' + (TagCategory.color || '000')
                    },
                    on: {
                        click: that._onTagCategoryClick.bind(that)
                    }
                }).data('TagCategory', TagCategory);

                return tagEl;
            }

            that._allCategories.forEach(function (TagCategory) {
                that.els.tagCategoriesCtn.append(createTagEl(TagCategory));
            });
        },

        _onFilterAvailableTags: function () {

            let tags, els, availableTagsCtn, searchFilter, categoryFilter,
                that = this,
                filters = that._getFilters();

            if (!filters) {
                that._clearFilterAvailableTags();
                return;
            }

            els = that.els;
            availableTagsCtn = els.availableTagsCtn;

            searchFilter = filters.search ? filters.search.toLowerCase() : '';
            categoryFilter = filters.category || '';

            tags = availableTagsCtn.find('.tag_el');

            showEl(tags);
            unHighlightEl(tags);

            tags.each(function(index, tagEl) {
                let tag = $(tagEl),
                    Tag = tag.data('Tag');

                if (
                    searchFilter && Tag.getName().toLowerCase().indexOf(searchFilter) === -1
                    || categoryFilter && categoryFilter !== Tag.getCategory()
                ) {
                    hideEl(tag);
                }
            });

            // Highlight the first tag in filtered list.
            tags = availableTagsCtn.find('.tag_el:not(.hide):first');
            tags.length && highlightEl(tags);
        },

        _onFilterSelectedTags: function () {
            let tags, els, selectedTagsCtn, searchFilter, categoryFilter,
                that = this,
                filters = that._getFilters();

            if (!filters) {
                that._clearFilterSelectedTags();
                return;
            }

            els = that.els;
            selectedTagsCtn = els.selectedTagsCtn;

            searchFilter = filters.search ? filters.search.toLowerCase() : '';
            categoryFilter = filters.category || '';

            tags = selectedTagsCtn.find('.tag_el');

            showEl(tags);

            tags.each(function(index, tagEl) {
                let tag = $(tagEl),
                    Tag = tag.data('Tag');

                if (
                    searchFilter && Tag.getName().toLowerCase().indexOf(searchFilter) === -1
                    || categoryFilter && categoryFilter !== Tag.getCategory()
                ) {
                    hideEl(tag);
                }
            });
        },

        _onFilterTagCategories: function () {
            let categories, els, searchFilter,
                that = this,
                filters = that._getFilters();

            if (!filters) {
                that._clearFilterTagCategories();
                return;
            }

            els = that.els;

            searchFilter = filters.search ? filters.search.toLowerCase() : '';

            categories = els.tagCategoriesCtn.find('.tag_el');

            categories.each(function(index, categoryEl) {
                let category = $(categoryEl);

                category.data('TagCategory').getName().toLowerCase().indexOf(searchFilter) === -1
                    ? hideEl(category)
                    : showEl(category);
            });
        },

        _clearFilterAvailableTags: function () {
            let els = this.els,
                tags = els.availableTagsCtn.find('.tag_el');

            els.searchAvailableInput.val('').focus();

            tags.each(function(index, tagEl) {
                let el = $(tagEl);
                unHighlightEl(el);
                showEl(el);
            });

            highlightEl($(tags[0]));
        },

        _clearFilterSelectedTags: function () {
            let els = this.els,
                tags = els.selectedTagsCtn.find('.tag_el.hide');

            tags.each(function(index, tagEl) {
                showEl($(tagEl));
            });
        },

        _clearFilterTagCategories: function () {
            let els = this.els,
                tags = els.tagCategoriesCtn.find('.tag_category_el');

            tags.each(function(index, tagEl) {
                let el = $(tagEl);
                showEl(el);
                unSelectEl(el);
            });
        },

        _clearFilters: function () {
            this._clearFilterAvailableTags();
            this._clearFilterSelectedTags();
            this._clearFilterTagCategories();
        },

        _getFilters: function () {
            let selectedCategory,
                filters = {};

            filters.search = this.els.searchAvailableInput.val();

            selectedCategory = this.els.tagCategoriesCtn.find('.tag_category_el.selected');
            filters.category = selectedCategory[0]
                ? selectedCategory.data('TagCategory').getId()
                : null;

            return filters.search || filters.category
                ? filters
                : null;
        },

        _selectRandomTag: function () {
            let randomTagEl,
                els = this.els;

            randomTagEl = Utils.getRandomElement(
                els.availableTagsCtn.find('.tag_el:not(.selected):not(.hide)')
            );
            randomTagEl && randomTagEl.click();

            els.searchAvailableInput.focus();
        },

        _toggleSelectHighlightedTag: function () {
            let tags,
                els = this.els;

            tags = els.availableTagsCtn.find('.tag_el.highlighted:first');
            tags.length && toggleSelectEl(tags);
        },

        _highlightTag: function (way) {
            let tags,
                els = this.els,
                fn = way === 'previous'
                    ? (tags, i) => {
                        highlightEl(
                            $(tags[
                                i - 1 >= 0
                                    ? i - 1
                                    : tags.length - 1
                            ])
                        );
                    }
                    : (tags, i) => {
                        highlightEl(
                            $(tags[
                                i + 1 < tags.length
                                    ? i + 1
                                    : 0
                            ])
                        );
                    };

            tags = els.availableTagsCtn.find('.tag_el:not(.hide)');

            for (let i = 0; i < tags.length; i++) {
                let tag = $(tags[i]);

                if (tag.hasClass('highlighted')) {
                    unHighlightEl(tag);
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
                searchAvailableInput, selectRandomTagCtn, tagCategoriesCtn,
                that = this,
                els = that.els;

            function builds () {
                that._allTags = TagsManager.getTags();
                that._allCategories = TagsManager.getTagCategories();

                that._buildTags();
                that._buildTagCategories();

                that._clearFilters();
            }

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

                            that._onFilterAvailableTags();
                            that._onFilterSelectedTags();
                            that._onFilterTagCategories();
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
                        click: that._clearFilters.bind(that)
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

            tagCategoriesCtn = els.tagCategoriesCtn = $('<div>', {
                'class': 'tag_categories_ctn'
            });

            ctn.append(
                selectedTagsCtn,
                searchAvailableCtn,
                that.options.randomBtn ? selectRandomTagCtn : null,
                tagCategoriesCtn,
                availableTagsCtn
            );

            if (TagsManager.hasFetchTags()) {
                builds();
            } else {
                TagsManager.init({ onSuccess: builds });
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
