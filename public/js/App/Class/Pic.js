/* global
    define
*/

define(
[
    'jquery',

    'PM/Class',

    'App/TagsManager'
],
function (
    $,

    Class,

    TagsManager
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
            indice: 0,
            tags: [],
            nbResult: 0
        },

        customFolderPath: '',
        randomPublicPath: '',
        src: '',
        path: '',
        name: '',

        useCache: false,

        width: 0,
        height: 0,
        count: 0,  // Count of nb of display.
        indice: 0, // Indice of the pic inside a pics list.

        tags: [],

        nbResult: 0, // Nb of result on filter. (should not be in Pic instance but keep here it is easier)

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
            that.indice = options.indice || 0;
            that.nbResult = options.nbResult || 0;

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

        addTags: function (newTags = [], force = false) {
            function has (tags, newTag) {
                return tags.find(function (tag) {
                    return newTag.id === tag.id;
                });
            }

            function compare (a, b) {
                let res = 0,
                    aName = a.getName().toLowerCase(),
                    bName = b.getName().toLowerCase();

                if (aName < bName) {
                    res = -1;
                } else if (aName > bName) {
                    res = 1;
                }
                return res;
            }

            let tags = this.tags;

            if (typeof newTags === 'string') {
                newTags = newTags.substring(1, newTags.length - 1);
                newTags = newTags.split(';');
            }

            if (newTags.length && typeof newTags[0] === 'string') {
                newTags = TagsManager.getTagsByIds(newTags);
            }

            newTags.forEach(function (newTag) {
                if (force || !has(tags, newTag)) {
                    tags.push(newTag);
                }
            });

            tags = tags.sort(compare);
        },

        setTags: function (tags = []) {
            this.tags = [];
            this.addTags(tags, true);
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
