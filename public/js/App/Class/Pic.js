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

    let Pic = $.inherit(Class, {

        /**
         * @property {Object} defaultOptions - Default options values.
         */
        defaultOptions: {
            customFolderPath: '',
            randomPublicPath: '',
            src: '',
            name: '',
            useCache: false,
            width: 0,
            height: 0,
            count: 0,
            tags: []
        },

        customFolderPath: '',
        randomPublicPath: '',
        src: '',
        name: '',

        useCache: false,

        width: 0,
        height: 0,
        count: 0, // Count of nb of display.

        tags: [],


        /**
         * @constructor Pic.
         * @param {Object} options - Options values.
         */
        __constructor: function (options) {
            let that = this;

            that.__base(options);

            that.customFolderPath = options.customFolderPath;
            that.randomPublicPath = options.randomPublicPath;
            that.src = options.src;
            that.name = options.name;

            that.useCache = options.useCache;

            that.width = options.width;
            that.height = options.height;

            that.count = options.count || 0;

            that.tags = options.tags || [];
        },

        getFullPath: function () {
            let that = this,
                currentPath = that.customFolderPath + (that.randomPublicPath || '');

            return currentPath.replace('//', '/');
        },

        incCounter: function () {
            this.count++;

            return this;
        },
    });

    return Pic;
});
