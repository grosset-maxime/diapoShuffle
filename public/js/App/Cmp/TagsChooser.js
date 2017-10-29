
/*global
    define, curl
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

    function setTagElCss (tagEl) {
        let Tag = tagEl.data('Tag');

        tagEl.css({
            'border-color': '#' + ((TagsManager.getTagCategoryById(Tag.getCategory()) || {}).color || '000')
        });

        return tagEl;
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
            editBtn: false,
            events: {
                onSelect: () => {},
                onDeselect: () => {}
            }
        },

        _allTags: null,
        _allTagCategories: null,

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
            let tag = $(e.target.parentElement);

            toggleSelectEl(tag);
        },

        _onTagCategoryClick: function (e) {
            let tagCategoryEl = $(e.target.parentElement),
                els = this.els,
                selectedCategoryEl = els.tagCategoriesCtn.find('.tag_category_el.selected');

            selectedCategoryEl[0] && unSelectEl(selectedCategoryEl);

            tagCategoryEl[0] !== selectedCategoryEl[0] && toggleSelectEl(tagCategoryEl);

            this._onFilterAvailableTags();
            this._onFilterSelectedTags();

            els.searchAvailableInput.focus();
        },

        _onEditTagClick: function (options) {
            let that = this,
                tagEl = options.tagEl,
                isNew = options.isNew;

            curl('App/Modals/EditTagModal', function (EditTagModal) {
                EditTagModal.ask({
                    isNew: isNew,
                    Tag: !isNew && tagEl.data('Tag'),
                    onClose: function () {
                    },
                    onOpen: function () {
                    },
                    onEnd: function (Tag) {
                        if (Tag.deleted) { // Delete tag.

                            tagEl.remove();

                        } else if (!isNew) { // Update tag.

                            tagEl.find('.text').text(Tag.getName());
                            setTagElCss(tagEl);
                            tagEl.data('Tag', Tag);

                        } else { // Add tag.
                            tagEl = that._createTagEl(that, Tag, false);
                            that.els.availableTagsCtn.append(tagEl);
                        }
                    }
                });
            });
        },

        _createTagEl: (scope, Tag, selected) => {
            let tagEl = $('<div>', {
                'class': 'tag_el ' + (selected ? 'selected' : ''),
                html: [
                        $('<div>', {
                            'class': 'text',
                            text: Tag.getName(),
                            on: {
                                click: scope._onTagClick
                            }
                        }),
                        $('<div>', {
                        'class': 'edit_btn',
                        text: 'o',
                        on: {
                            click: function () {
                                scope._onEditTagClick({
                                    tagEl: tagEl
                                });
                            }
                        }
                    })
                ]
            }).data('Tag', Tag);

            setTagElCss(tagEl);

            return tagEl;
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

            selectedTags.forEach(function (Tag) {
                selectedTagsCtn.append(that._createTagEl(that, Tag, true));
            });

            availableTagsCtn.append(
                $('<div>', {
                    'class': 'tag_el add_tag_el btn',
                    html: $('<div>', {
                        'class': 'text',
                        text: '+'
                    }),
                    on: {
                        click: function () {
                            that._onEditTagClick({ isNew: true });
                        }
                    }
                }).button()
            );

            allTagsWithoutSelected.forEach(function (Tag) {
                availableTagsCtn.append(that._createTagEl(that, Tag, false));
            });
        },

        _buildTagCategories: function () {
            let that = this;

            function createTagEl (TagCategory) {
                let tagEl = $('<div>', {
                    'class': 'tag_el tag_category_el',
                    html: [
                            $('<div>', {
                                'class': 'text',
                                text: TagCategory.getName(),
                                on: {
                                    click: that._onTagCategoryClick.bind(that)
                                }
                            }),
                            $('<div>', {
                            'class': 'edit_btn',
                            text: 'o',
                            on: {
                                click: function () {
                                    curl('App/Modals/EditTagCategoryModal', function (EditTagModal) {
                                        EditTagModal.ask({
                                            tag: TagCategory,
                                            onClose: function () {
                                            },
                                            onOpen: function () {
                                            },
                                            onEnd: function (TagCategory) {
                                                tagEl.find('.text').text(TagCategory.getName());
                                                tagEl.css({
                                                    'border-color': '#' + ((TagsManager.getTagCategoryById(TagCategory.getCategory()) || {}).color || '000')
                                                });
                                                tagEl.data('TagCategory', TagCategory);
                                            }
                                        });
                                    });
                                }
                            }
                        })
                    ],
                    css: {
                        'border-color': '#' + (TagCategory.color || '000')
                    }
                }).data('TagCategory', TagCategory);

                return tagEl;
            }

            that._allTagCategories.forEach(function (TagCategory) {
                that.els.tagCategoriesCtn.append(createTagEl(TagCategory));
            });
        },

        _onFilterAvailableTags: function () {

            let tags, els, availableTagsCtn, searchFilter, categoryFilter, tagToHighlight,
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

            tags = availableTagsCtn.find('.tag_el').slice(1);

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
            tagToHighlight = availableTagsCtn.find('.tag_el:not(.hide)');
            if (tags.length) {
                highlightEl(
                    tagToHighlight.first().hasClass('add_tag_el')
                        ? $(tagToHighlight[1])
                        : tagToHighlight
                );
            }
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
                tags = els.availableTagsCtn.find('.tag_el'),
                tagToHighlight;

            els.searchAvailableInput.val('').focus();

            tags.each(function(index, tagEl) {
                let el = $(tagEl);
                unHighlightEl(el);
                showEl(el);
            });

            tagToHighlight = $(tags[0]);
            tagToHighlight = tagToHighlight.hasClass('add_tag_el')
                ? $(tags[1])
                : tagToHighlight;

            highlightEl(tagToHighlight);
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
                els.availableTagsCtn.find('.tag_el:not(.selected):not(.hide)').slice(1)
            );
            randomTagEl && $(randomTagEl).find('.text').click();

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
                highlight = way === 'previous'
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

            tags = els.availableTagsCtn.find('.tag_el:not(.hide)').slice(1);
            // tags.shift();

            for (let i = 0; i < tags.length; i++) {
                let tag = $(tags[i]);

                if (tag.hasClass('highlighted')) {
                    unHighlightEl(tag);
                    highlight(tags, i);
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
                editBtnCtn,
                that = this,
                els = that.els;

            function builds () {
                that._allTags = TagsManager.getTags();
                that._allTagCategories = TagsManager.getTagCategories();

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
                html: els.selectRandomTagBtn = that.options.randomBtn
                    ? $('<input>', {
                        'class': 'btn',
                        value: 'Select random',
                        type: 'button',
                        tabIndex: -1,
                        on: {
                            click: that._selectRandomTag.bind(that)
                        }
                    }).button()
                    : null
            });

            editBtnCtn = els.editBtnCtn = $('<div>', {
                'class': 'edit_btn_ctn',
                html: els.editBtn = that.options.editBtn
                    ? $('<input>', {
                        'class': 'btn',
                        value: 'Edit',
                        type: 'button',
                        tabIndex: -1,
                        on: {
                            click: function () {
                                ctn.toggleClass('edit_mode');
                                searchAvailableInput.focus();
                            }
                        }
                    }).button()
                    : null
            });

            tagCategoriesCtn = els.tagCategoriesCtn = $('<div>', {
                'class': 'tag_categories_ctn'
            });

            ctn.append(
                selectedTagsCtn,
                searchAvailableCtn,
                selectRandomTagCtn,
                editBtnCtn,
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
