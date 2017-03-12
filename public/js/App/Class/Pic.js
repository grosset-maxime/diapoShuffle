/* global
    define
*/

define(
[
    'jquery',

    'PM/Class',

    'App/Class/Tag'
],
function (
    $,

    Class,

    Tag
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
            path: '',
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
        path: '',
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
            let path,
                that = this;

            that.__base(options);

            if (options.publicPathWithName) {
                let path,
                    src = options.publicPathWithName,
                    pathParts = src.split('/').filter(function (part) {
                        return part.trim();
                    });

                that.src = src;

                that.name = pathParts[pathParts.length - 1];

                pathParts.shift();
                pathParts.pop();
                path = pathParts.join('/');
                that.randomPublicPath = path;
                that.path = path;

            } else {

                that.customFolderPath = options.customFolderPath;
                that.randomPublicPath = options.randomPublicPath;
                that.src = options.src;

                path = that.customFolderPath ? that.customFolderPath : '';
                path += that.randomPublicPath ? that.randomPublicPath : '';
                that.path = options.path || path;

                that.name = options.name;

                that.useCache = options.useCache;

                that.width = options.width;
                that.height = options.height;
            }

            that.count = options.count || 0;

            that.setTags(options.tags || []);
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

        addTags: function (newTags = []) {
            function has (tags, newTag) {
                return tags.find(function (tag) {
                    return newTag.id === tag.id;
                });
            }

            let tags = this.tags;

            if (typeof newTags === 'string') {
                newTags = newTags.substring(1, newTags.length - 1);
                newTags = newTags.split(';');
            }

            if (newTags.length && typeof newTags[0] === 'string') {
                newTags = newTags.map(function (tag) {
                    return new Tag({
                        id: tag
                    });
                });
            }

            newTags.forEach(function (newTag) {
                if (!has(tags, newTag)) {
                    tags.push(newTag);
                }
            });
        },

        setTags: function (tags = []) {
            this.tags = [];
            this.addTags(tags);
        },

        getTags: function () {
            return this.tags;
        },

        getTagsId: function () {
            return this.tags.map(function (tag) {
                return tag.id;
            });
        }
    });

    return Pic;
});
