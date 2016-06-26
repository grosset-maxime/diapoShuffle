/* global
    define
*/

define(
[
    'jquery'
],
function ($) {
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

            xhr.done(function (json) {
                var error,
                    unknownErrorMessage = 'Unknown error.';

                if (json.error || !json.success) {
                    error = json.error || {};

                    onFailure(error.publicMessage || unknownErrorMessage);
                    return;
                }

                onSuccess(json.folderList);
            });

            xhr.fail(function (jqXHR, textStatus, errorThrown) {
                // var message = 'getRandomPicAction.getRandomPic()';

                onFailure('Server error.');

                // PM.logAjaxFail(jqXHR, textStatus, errorThrown, message);
            });
        }
    };

    return API;
});
