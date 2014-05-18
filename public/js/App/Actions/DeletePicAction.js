/* global
    define
*/

define(
[
    'jquery',

    // PM
    'PM/Core',
    'PM/Cmp/Notify',

    // App Actions
    'App/Actions/GetRandomPicAction',

    // Non AMD
    'js!jquery-ui'
],
function ($, PM, Notify, GetRandomPicAction) {
    'use strict';

    var NOTIFY_TYPE_ERROR = Notify.TYPE_ERROR;

    var errorNotify;

    /**
     *
     */
    function deletePic (callback) {
        var xhr;

        /**
         *
         */
        function displayErrorNotify (message, type) {
            if (!errorNotify) {
                errorNotify = new Notify({
                    className: 'deletePicAction-notify',
                    container: $(document.body),
                    autoHide: true,
                    duration: 3
                });
            }

            errorNotify.setMessage(message, type, true);
        } // End function displayErrorNotify()

        xhr = $.ajax({
            url: '/?r=deletePic_s',
            type: 'POST',
            dataType: 'json',
            async: true,
            data: {
                picPath: GetRandomPicAction.getPicSrc()
            }
        });

        xhr.done(function (json) {
            var error, typeMessage, errorMessage;

            if (json.error || !json.success) {
                error = json.error || {};

                errorMessage = 'Error: ' + error.message || 'Unknown error.';
                typeMessage = NOTIFY_TYPE_ERROR;

                PM.log('Error : ' + errorMessage);
                PM.log(error);

                displayErrorNotify(errorMessage, typeMessage);
                return;
            }

            if ($.isFunction(callback)) {
                callback();
            }
        });

        xhr.fail(function (jqXHR, textStatus, errorThrown) {
            var message = 'deletePicAction.deletePic()';

            displayErrorNotify('Server error.', NOTIFY_TYPE_ERROR);

            PM.logAjaxFail(jqXHR, textStatus, errorThrown, message);
        });
    } // End function deletePic()

    var Action = {

        /**
         *
         */
        askDelete: function () {
            var isPaused = GetRandomPicAction.isPausing();

            if (!isPaused) {
                return;
            }

            $('<div>', {
                'class': '',
                html: 'Do you really want to delete this picture ?'
            }).dialog({
                resizable: false,
                modal: true,
                width: 400,
                position: {
                    at: 'center top+25%'
                },
                close: function(event) {
                    event.stopPropagation();
                    GetRandomPicAction.enable();
                },
                open: function () {
                    GetRandomPicAction.disable();
                },
                buttons: [{
                    text: 'Cancel',
                    tabIndex: -1,
                    click: function () {
                        $(this).dialog('close');
                    }
                }, {
                    text: 'Delete',
                    click: function () {
                        $(this).dialog('close');

                        deletePic(function () {
                            GetRandomPicAction.pause();
                        });
                    }
                }]
            });
        } // End function askDelete()
    };

    return Action;
});

