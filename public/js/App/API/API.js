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
                let error,
                    unknownErrorMessage = 'Unknown error.';

                if (json.error || !json.success) {
                    error = json.error || {};

                    onFailure(error.publicMessage || unknownErrorMessage);

                    PM.log(error.message || 'Undefined error.');
                } else {
                    onSuccess(json.folderList);
                }
            });

            xhr.fail((jqXHR, textStatus, errorThrown) => {
                let message = 'API.getFolderList()';

                onFailure('Server error.');

                PM.logAjaxFail(jqXHR, textStatus, errorThrown, message);
            });
        },

        /**
         * @param {Object} options - Options.
         * @param {Pic} Pic - Pic to delete.
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
                    picPath: Pic.src
                }
            });

            xhr.done((json) => {
                let error, errorMessage;

                if (json.error || !json.success) {
                    error = json.error || {};

                    errorMessage = 'Error: ' + error.message || 'Unknown error.';

                    onFailure(errorMessage);

                    PM.log(error.message || 'Undefined error.');
                } else {
                    onSuccess();
                }
            });

            xhr.fail(function (jqXHR, textStatus, errorThrown) {
                let message = 'API.deletePic()';

                onFailure('Server error.');

                PM.logAjaxFail(jqXHR, textStatus, errorThrown, message);
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
                let error, errorMessage;

                if (json.error || !json.success) {
                    error = json.error || {};

                    errorMessage = 'Error: ' + error.message || 'Unknown error.';

                    onFailure(errorMessage);

                    PM.log(error.message || 'Undefined error.');
                } else {
                    onSuccess();
                }
            });

            xhr.fail(function (jqXHR, textStatus, errorThrown) {
                let message = 'API.setTags()';

                onFailure('Server error.');

                PM.logAjaxFail(jqXHR, textStatus, errorThrown, message);
            });
        },

        /**
         * @param {Object} options - Options.
         * @param {Array}  [options.Tags] - Tags.
         * @param {String} [options.operator] - Operator ('AND' or 'OR').
         * @param {Function} [onSuccess] - Success callback, returns {Object[]} - List of pic matching tags.
         * @param {Function} [onFailure] - Failure callback.
         */
        getPicsFromTags: (options = {}) => {
            let xhr,
                onSuccess = options.onSuccess || (() => {}),
                onFailure = options.onFailure || (() => {});

            xhr = $.ajax({
                url: '/?r=getPicsFromTags_s',
                type: 'POST',
                dataType: 'json',
                async: true,
                data: {
                    operator: options.operator,
                    tags: options.Tags.map(function (Tag) {
                        return Tag.getId();
                    })
                }
            });

            xhr.done((json) => {
                let error,
                    unknownErrorMessage = 'Unknown error.';

                if (json.error || !json.success) {
                    error = json.error || {};

                    onFailure(error.publicMessage || unknownErrorMessage);

                    PM.log(error.message || 'Undefined error.');
                } else {
                    onSuccess(json.results);
                }
            });

            xhr.fail(function (jqXHR, textStatus, errorThrown) {
                let message = 'API.getPicsFromTags()';

                onFailure('Server error.');

                PM.logAjaxFail(jqXHR, textStatus, errorThrown, message);
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
                let error,
                    unknownErrorMessage = 'Unknown error.';

                if (json.error || !json.success) {
                    error = json.error || {};

                    onFailure(error.publicMessage || unknownErrorMessage);

                    PM.log(error.message || 'Undefined error.');
                } else {
                    onSuccess(json.pic, json.pic.warning);
                }
            });

            xhr.fail(function (jqXHR, textStatus, errorThrown) {
                let message = 'API.getRandomPic()';

                onFailure('Server error.');

                PM.logAjaxFail(jqXHR, textStatus, errorThrown, message);
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
                let error,
                    unknownErrorMessage = 'Unknown error.';

                if (json.error || !json.success) {
                    error = json.error || {};

                    onFailure(error.publicMessage || unknownErrorMessage);

                    PM.log(error.message || 'Undefined error.');
                } else {

                    onSuccess(json.tags);
                }
            });

            xhr.fail(function (jqXHR, textStatus, errorThrown) {
                let message = 'API.getAllTags()';

                onFailure('Server error.');

                PM.logAjaxFail(jqXHR, textStatus, errorThrown, message);
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
                onFailure = options.onFailure || (() => {}),
                errorMessage = 'Server error while trying to clear cache.';

            xhr = $.ajax({
                url: '/?r=clearCache_s',
                type: 'POST',
                dataType: 'json',
                async: true
            });

            xhr.done((json) => {
                let error;

                if (json.success) {
                    onSuccess();
                } else {
                    error = json.error || {};

                    onFailure(errorMessage + ' ' + (error.publicMessage || ''));

                    PM.log(error.message || 'Undefined error.');
                }
            });

            xhr.fail((jqXHR, textStatus, errorThrown) => {
                let message = 'API.clearCache()';

                onFailure(errorMessage);

                PM.logAjaxFail(jqXHR, textStatus, errorThrown, message);
            });
        }
    };

    return API;
});
