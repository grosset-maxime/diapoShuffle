
/*global
    define
*/

define([
    'jquery',

    // PM
    'PM/Core',
    'PM/Cmp/Abstract',

    // Non AMD
    'js!jquery-inherit'
], function ($, PM, Abstract) {
    'use strict';

    let PathChooser;

    PathChooser = $.inherit(Abstract, {

        /**
         * @property {Object} defaultOptions - Default options values.
         */
        defaultOptions: {
            className: '',
            path: '',
            container: null,
            events: {
                onChoose: () => {}
            }
        },

        pathParts: [],

        /**
         * @constructor PathChooser.
         * @param {Object} options                - Options values.
         * @param {String} [options.className]    - Class name to add to Cmp.
         * @param {String} [options.path]         -.
         */
        __constructor: function (options) {
            var container,
                that = this;

            that.__base(options);

            container = options.container;
            that.pathParts = options.path.split('/');

            if (container) {
                that.inject(container, 'top');
            }
        },

        /**
         * Build the DOM of the Cmp.
         */
        build: function () {
            var ctn,
                that = this,
                els = that.els,
                options = that.options;

            // Main ctn.
            ctn = els.container = $('<div>', {
                'class': 'pathchooser_cmp ' + options.className,
                text: options.path,
                html: []
            });

            return ctn;
        }, // End function build()

        /**
         * Inject the Cmp into the DOM.
         * @param {Element} element - DOM Element where to inject the Cmp.
         * @param {String}  where   - Position inside the Element.
         */
        inject: function (element, where) {
            this.build();
            this.__base(element, where);
        },
    });

    return PathChooser;
});
