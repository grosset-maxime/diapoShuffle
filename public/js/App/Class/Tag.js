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
            name: ''
        },

        id: '',
        name: '',

        /**
         * @constructor Tag.
         * @param {Object} options - Options values.
         */
        __constructor: function (options) {
            let that = this;

            that.__base(options);

            that.name = options.name;
            that.id = options.id;
        },

        getName: function () {
            return this.name || this.id;
        },

        getId: function () {
            return this.id;
        }
    });

    return Tag;
});
