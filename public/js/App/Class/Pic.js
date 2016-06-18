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
            useCache: false,
            width: 0,
            height: 0
        },

        customFolderPath: '',
        randomPublicPath: '',
        src: '',

        useCache: false,

        width: 0,
        height: 0,


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

            that.useCache = options.useCache;

            that.width = options.width;
            that.height = options.height;
        },

        getFullPath: function () {
            let that = this,
                currentPath = that.customFolderPath + (that.randomPublicPath || '');

            return currentPath.replace('//', '/');
        }
    });

    return Pic;
});
