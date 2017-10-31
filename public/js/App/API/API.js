/* global
    define
*/

define(
[
    'jquery',

    // PM
    'PM/Core'
],
function ($, PM) {
    'use strict';

    let API;

    function _onDone (json, onOK, onKO) {
        let error,
            unknownErrorMessage = 'Unknown error.';

        if (json.error || !json.success) {
            error = json.error || {};

            onKO && onKO(error.publicMessage || error.message || unknownErrorMessage);

            PM.log(error.message || 'Undefined error.');
        } else {
            onOK && onOK(json);
        }
    }

    function _onFail (jqXHR, textStatus, errorThrown, message, onFailure) {
        onFailure && onFailure('Server error.');
        PM.logAjaxFail(jqXHR, textStatus, errorThrown, message);
    }

    API = {

        /**
         * @param {Object} options - Options.
         * @param {String} [folder=""] - Folder path.
         * @param {Function} [onSuccess] - Success callback, returns {Array} - folder list.
         * @param {Function} [onFailure] - Failure callback.
         */
        getFolderList: (options = {}) => {
            let xhr,
                onSuccess = options.onSuccess || (() => {}),
                onFailure = options.onFailure || (() => {});

            xhr = $.ajax({
                url: '/?r=getFolderList_s',
                type: 'POST',
                dataType: 'json',
                async: true,
                data: {
                    folder: options.folder || ''
                }
            });

            xhr.done((json) => {
                _onDone(
                    json,
                    function (json) {
                        onSuccess(json.folderList);
                    },
                    onFailure
                );
            });

            xhr.fail((jqXHR, textStatus, errorThrown) => {
                _onFail(jqXHR, textStatus, errorThrown, 'API.getFolderList()', onFailure);
            });
        },

        /**
         * @param {Object} options - Options.
         * @param {String} [folder=""] - Folder path.
         * @param {Function} [onSuccess] - Success callback, returns {String[]} - Pics list.
         * @param {Function} [onFailure] - Failure callback.
         */
        getPicsList: (options = {}) => {
            let xhr,
                onSuccess = options.onSuccess || (() => {}),
                onFailure = options.onFailure || (() => {});

            xhr = $.ajax({
                url: '/?r=getPicsList_s',
                type: 'POST',
                dataType: 'json',
                async: true,
                data: {
                    folder: options.folder || ''
                }
            });

            xhr.done((json) => {
                _onDone(
                    json,
                    function (json) {
                        onSuccess(json.pics);
                    },
                    onFailure
                );
            });

            xhr.fail((jqXHR, textStatus, errorThrown) => {
                _onFail(jqXHR, textStatus, errorThrown, 'API.getPicsList()', onFailure);
            });
        },

        /**
         * @param {Object} options - Options.
         * @param {Pic} Pic - Item to delete.
         * @param {Boolean} [continueIfNotExist=false] - Continue delete script if item doesn't exist in file system.
         * @param {Boolean} [deleteOnlyFromBdd=false] - Delete item only from the bdd, do not remove it from file system.
         * @param {Function} [onSuccess] - Success callback.
         * @param {Function} [onFailure] - Failure callback.
         */
        deletePic: (options = {}) => {
            let xhr,
                Pic = options.Pic || {},
                onSuccess = options.onSuccess || (() => {}),
                onFailure = options.onFailure || (() => {});

            if (!Pic.src) {
                onFailure('No Picture to delete.');
                return;
            }

            xhr = $.ajax({
                url: '/?r=deletePic_s',
                type: 'POST',
                dataType: 'json',
                async: true,
                data: {
                    picPath: Pic.src,
                    continueIfNotExist: options.continueIfNotExist,
                    deleteOnlyFromBdd: options.deleteOnlyFromBdd
                }
            });

            xhr.done((json) => {
                _onDone(json, onSuccess, onFailure);
            });

            xhr.fail(function (jqXHR, textStatus, errorThrown) {
                _onFail(jqXHR, textStatus, errorThrown, 'API.deletePic()', onFailure);
            });
        },

        /**
         * @param {Object} options - Options.
         * @param {Pic} Pic - Pic to set tags.
         * @param {Function} [onSuccess] - Success callback.
         * @param {Function} [onFailure] - Failure callback.
         */
        setTags: (options = {}) => {
            let xhr,
                Pic = options.Pic || {},
                onSuccess = options.onSuccess || (() => {}),
                onFailure = options.onFailure || (() => {});

            if (!Pic.name || !Pic.path) {
                onFailure('Missing Picture information (name or path) to set tags.');
                return;
            }

            xhr = $.ajax({
                url: '/?r=setTags_s',
                type: 'POST',
                dataType: 'json',
                async: true,
                data: {
                    name: Pic.name,
                    path: Pic.path,
                    tags: Pic.getTagsId()
                }
            });

            xhr.done((json) => {
                _onDone(json, onSuccess, onFailure);
            });

            xhr.fail(function (jqXHR, textStatus, errorThrown) {
                _onFail(jqXHR, textStatus, errorThrown, 'API.setTags()', onFailure);
            });
        },

        /**
         * @param {Object}   options  - Options.
         * @param {Boolean}  isNew    - Is a new tag.
         * @param {Boolean}  isDelete - Should delete tag.
         * @param {String}   id       - Tag id.
         * @param {String}   name     - Tag name.
         * @param {Integer}  category - Tag category id.
         * @param {Function} [onSuccess] - Success callback.
         * @param {Function} [onFailure] - Failure callback.
         */
        editTag: (options = {}) => {
            let xhr,
                onSuccess = options.onSuccess || (() => {}),
                onFailure = options.onFailure || (() => {});

            if (!options.id && !options.name) {
                onFailure('Missing id or name tag information to edit tag.');
                return;
            }

            xhr = $.ajax({
                url: '/?r=editTag_s',
                type: 'POST',
                dataType: 'json',
                async: true,
                data: {
                    isNew: options.isNew,
                    isDelete: options.isDelete,
                    id: options.id,
                    name: options.name,
                    category: options.category
                }
            });

            xhr.done((json) => {
                _onDone(json, onSuccess, onFailure);
            });

            xhr.fail(function (jqXHR, textStatus, errorThrown) {
                _onFail(jqXHR, textStatus, errorThrown, 'API.editTag()', onFailure);
            });
        },

        /**
         * @param {Object}   options  - Options.
         * @param {Boolean}  isNew    - Is a new tag category.
         * @param {Boolean}  isDelete - Should delete tag category.
         * @param {String}   id       - Tag category id.
         * @param {String}   name     - Tag category name.
         * @param {String}   color    - Tag category color.
         * @param {Function} [onSuccess] - Success callback.
         * @param {Function} [onFailure] - Failure callback.
         */
        editTagCategory: (options = {}) => {
            let xhr,
                onSuccess = options.onSuccess || (() => {}),
                onFailure = options.onFailure || (() => {});

            if (
                (!options.isDelete && !options.name)
                || ((options.isDelete || !options.isNew) && !options.id)
            ) {
                onFailure('Missing id or name tag category information to edit tag category.');
                return;
            }

            xhr = $.ajax({
                url: '/?r=editTagCategory_s',
                type: 'POST',
                dataType: 'json',
                async: true,
                data: {
                    isNew: options.isNew,
                    isDelete: options.isDelete,
                    id: options.id,
                    name: options.name,
                    color: options.color
                }
            });

            xhr.done((json) => {
                _onDone(json, onSuccess, onFailure);
            });

            xhr.fail(function (jqXHR, textStatus, errorThrown) {
                _onFail(jqXHR, textStatus, errorThrown, 'API.editTagCategory()', onFailure);
            });
        },

        /**
         * @param {Object} options - Options.
         * @param {Array}  [options.Tags] - Tags.
         * @param {Array}  [options.types] - Types (JPG, GIF, PNG).
         * @param {String} [options.tagsOperator] - Operator for tags filtering ('AND' or 'OR').
         * @param {Function} [onSuccess] - Success callback, returns {Object[]} - List of pic matching tags.
         * @param {Function} [onFailure] - Failure callback.
         */
        getPicsFromBdd: (options = {}) => {
            let xhr,
                onSuccess = options.onSuccess || (() => {}),
                onFailure = options.onFailure || (() => {});

            xhr = $.ajax({
                url: '/?r=getPicsFromBdd_s',
                type: 'POST',
                dataType: 'json',
                async: true,
                data: {
                    tags: options.Tags.map(function (Tag) {
                        return Tag.getId();
                    }),
                    tagsOperator: options.tagsOperator,
                    types: options.types
                }
            });

            xhr.done((json) => {
                _onDone(
                    json,
                    function (json) {
                        onSuccess(json.results);
                    },
                    onFailure
                );
            });

            xhr.fail(function (jqXHR, textStatus, errorThrown) {
                _onFail(jqXHR, textStatus, errorThrown, 'API.getPicsFromBdd()', onFailure);
            });
        },

        /**
         * @param {Object} options - Options.
         * @param {Array}  [customFolders=[]] - Custom folders list.
         * @param {Function} [onSuccess] - Success callback, returns {Pic} - Random Pic info.
         * @param {Function} [onFailure] - Failure callback.
         */
        getRandomPic: (options = {}) => {
            let xhr,
                onSuccess = options.onSuccess || (() => {}),
                onFailure = options.onFailure || (() => {});

            xhr = $.ajax({
                url: '/?r=getRandomPic_s',
                type: 'POST',
                dataType: 'json',
                async: true,
                data: {
                    customFolders: options.customFolders
                }
            });

            xhr.done((json) => {
                _onDone(
                    json,
                    function (json) {
                        onSuccess(json.pic, json.warning);
                    },
                    onFailure
                );
            });

            xhr.fail(function (jqXHR, textStatus, errorThrown) {
                _onFail(jqXHR, textStatus, errorThrown, 'API.getRandomPic()', onFailure);
            });
        },

        /**
         * @param {Object} options - Options.
         * @param {Function} [onSuccess] - Success callback, returns {Tag[]} - All tags.
         * @param {Function} [onFailure] - Failure callback.
         */
        getAllTags: (options = {}) => {
            let xhr,
                onSuccess = options.onSuccess || (() => {}),
                onFailure = options.onFailure || (() => {});

            xhr = $.ajax({
                url: '/?r=getAllTags_s',
                type: 'POST',
                dataType: 'json',
                async: true
            });

            xhr.done((json) => {
                _onDone(
                    json,
                    function() {
                        onSuccess(json.tags);
                    },
                    onFailure
                );
            });

            xhr.fail(function (jqXHR, textStatus, errorThrown) {
                _onFail(jqXHR, textStatus, errorThrown, 'API.getAllTags()', onFailure);
            });
        },

        /**
         * @param {Object} options - Options.
         * @param {Function} [onSuccess] - Success callback, returns {TagCategory[]} - All tag categories.
         * @param {Function} [onFailure] - Failure callback.
         */
        getAllTagCategories: (options = {}) => {
            let xhr,
                onSuccess = options.onSuccess || (() => {}),
                onFailure = options.onFailure || (() => {});

            xhr = $.ajax({
                url: '/?r=getAllTagCategories_s',
                type: 'POST',
                dataType: 'json',
                async: true
            });

            xhr.done((json) => {
                _onDone(
                    json,
                    function() {
                        onSuccess(json.tagCategories);
                    },
                    onFailure
                );
            });

            xhr.fail(function (jqXHR, textStatus, errorThrown) {
                _onFail(jqXHR, textStatus, errorThrown, 'API.getAllTagCategories()', onFailure);
            });
        },

        /**
         * @param {Object} options - Options.
         * @param {Function} [onSuccess] - Success callback.
         * @param {Function} [onFailure] - Failure callback.
         */
        clearCache: (options = {}) => {
            let xhr,
                onSuccess = options.onSuccess || (() => {}),
                onFailure = options.onFailure || (() => {});

            xhr = $.ajax({
                url: '/?r=clearCache_s',
                type: 'POST',
                dataType: 'json',
                async: true
            });

            xhr.done((json) => {
                _onDone(json, onSuccess, onFailure);
            });

            xhr.fail((jqXHR, textStatus, errorThrown) => {
                _onFail(jqXHR, textStatus, errorThrown, 'API.clearCache()', onFailure);
            });
        }
    };

    return API;
});
