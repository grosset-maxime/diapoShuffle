
/*global
    define
*/

define('App/Cmp/Abstract', [
    'jquery',

    // PM
    'PM/Core',
    'PM/Class',

    // Non AMD,
    'js!jquery-inherit'
], function ($, PM, Class) {
    'use strict';

    var Abstract = $.inherit(Class, {

        /**
         * @property {Object} - Cmp Dom elements.
         */
        els: null,

        /**
         * Set the options to the Cmp instance.
         *
         * @param {Object} options - Options.
         */
        __constructor: function (options) {
            this.__base(options);
            this.els = {};
        },

        /**
         * Inject Cmp in the Dom.
         *
         * @param {HTMLelement} element - Dom target.
         * @param {String}      where   - Where to inject (optional).
         * @return {Object} - The current PM.Cmp.Abstract instance.
         */
        inject: function (element, where) {
            var container = this.getContainer();

            element = $(element || document.body);

            if (container) {
                switch (where) {
                case 'before':
                    element.before(container);
                    break;
                case 'after':
                    element.after(container);
                    break;
                case 'top':
                    element.prepend(container);
                    break;
                default:
                case 'bottom':
                    container.appendTo(element);
                    break;
                }
            }

            return this;
        },

        /**
         * Returns Cmp container.
         * @return {HTMLelement} - Cmp container.
         */
        getContainer: function () {
            if (!this.els.container) {
                throw new Error('You don\'t have an els.container.');
            }

            return this.els.container;
        },

        /**
         * Hide Cmp container.
         */
        hide: function () {
            this.getContainer().hide();
        },

        /**
         * Show Cmp container.
         */
        show: function () {
            this.getContainer().show();
        },

        /**
         * Destroy the Cmp elements and its children.
         * Remove the element from the dom.
         * This Cmp and its children should not be used
            after this.
         */
        destroy: function () {
            var els = this.els || {};

            // Remove Elements
            $.each(els, function (i, el) {
                if (els.hasOwnProperty(i)) {
                    el.remove();

                    // Remove reference
                    delete els[el];
                }
            });

            // Remove Options
            delete this.options;
        }
    });

    return Abstract;
});

