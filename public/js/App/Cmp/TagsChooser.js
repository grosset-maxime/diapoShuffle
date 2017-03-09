
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

        // selected: [],

        /**
         * @constructor TagsChooser.
         * @param {Object}   options                - Options values.
         * @param {String}   [options.className]    - Class name to add to Cmp.
         * @param {String[]} [options.selected]     - Selected tags.
         * @param {String[]} [options.available]    - Available tags.
         */
        __constructor: function (options) {
            let container,
                that = this;

            that.__base(options);

            container = options.container;

            // that.selected = options.selected;
        },

        /**
         * Build the DOM of the Cmp.
         */
        build: function () {
            let ctn, selectedTagsCtn, availableTagsCtn,
                that = this,
                options = that.options,
                selectedTags = options.selected || [],
                els = that.els;

            // Main ctn.
            ctn = els.container = $('<div>', {
                'class': CLASS_NAME + ' ' + options.className
            });

            selectedTagsCtn = $('<div>', {
                'class': 'selected_tags_ctn'
            });

            availableTagsCtn = $('<div>', {
                'class': 'available_tags_ctn'
            });

            selectedTags.forEach(function (Tag) {
                let tagEl = $('<div>', {
                    'class': 'tag_el',
                    text: Tag.getName()
                });

                selectedTagsCtn.append(tagEl);
            });

            API.getAllTags({
                onSuccess: function (tags) {
                    tags.forEach(function (Tag) {
                        let tagEl = $('<div>', {
                            'class': 'tag_el',
                            text: Tag.getName()
                        });

                        availableTagsCtn.append(tagEl);
                    });
                }
            });

            ctn.append(
                selectedTagsCtn,
                availableTagsCtn
            );

            return ctn;
        }
    });

    return TagsChooser;
});
