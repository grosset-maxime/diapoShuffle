/* global
    define
*/

define(
[
    'jquery',

    'PM/Class'
],
function (
    $,

    Class
) {
    'use strict';

    let Tag = $.inherit(Class, {

        /**
         * @property {Object} defaultOptions - Default options values.
         */
        defaultOptions: {
            id: '',
            name: '',
            category: ''
        },

        id: '',
        name: '',
        category: '',

        /**
         * @constructor Tag.
         * @param {Object} options - Options values.
         */
        __constructor: function (options) {
            let that = this;

            that.__base(options);

            that.id = options.id;
            that.name = options.name;
            that.category = options.category;

            delete that.options;
        },

        getId: function () {
            return this.id;
        },

        getName: function () {
            return this.name || this.id;
        },

        getCategory: function () {
            return this.category;
        }

    });

    return Tag;
});
