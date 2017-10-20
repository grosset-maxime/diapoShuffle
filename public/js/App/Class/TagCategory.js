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

    let TagCategory = $.inherit(Class, {

        /**
         * @property {Object} defaultOptions - Default options values.
         */
        defaultOptions: {
            id: '',
            name: '',
            color: ''
        },

        id: '',
        name: '',
        color: '',

        /**
         * @constructor Tag category.
         * @param {Object} options - Options.
         * @param {String} options.id - Id.
         * @param {String} options.name - Name.
         * @param {String} options.color - Color.
         */
        __constructor: function (options) {
            let that = this;

            that.__base(options);

            that.id = options.id;
            that.name = options.name;
            that.color = options.color;
        },

        getId: function () {
            return this.id;
        },

        getName: function () {
            return this.name || this.id;
        },

        getColor: function () {
            return this.color || '';
        }
    });

    return TagCategory;
});
