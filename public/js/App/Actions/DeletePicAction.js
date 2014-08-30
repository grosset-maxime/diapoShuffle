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
    'App/Actions/HistoryPicAction',

    // Non AMD
    'js!jquery-ui'
],
function ($, PM, Notify, HistoryPicAction) {
    'use strict';

    var NOTIFY_TYPE_ERROR = Notify.TYPE_ERROR;

    var _errorNotify,
        _defaultOptions = {
            events: {
                onBeforeDelete: null,
                onDelete: null
            }
        },
        _options = {};

    /**
     *
     */
    function _deletePic (callback) {
        var xhr,
            events = _options.events,
            onBeforeDelete = events.onBeforeDelete,
            onDelete = events.onDelete;

        /**
         *
         */
        function displayErrorNotify (message, type) {
            if (!_errorNotify) {
                _errorNotify = new Notify({
                    className: 'deletePicAction-notify',
                    container: $(document.body),
                    autoHide: true,
                    duration: 3
                });
            }

            _errorNotify.setMessage(message, type, true);
        } // End function displayErrorNotify()

        if ($.isFunction(onBeforeDelete)) {
            onBeforeDelete();
        }

        xhr = $.ajax({
            url: '/?r=deletePic_s',
            type: 'POST',
            dataType: 'json',
            async: true,
            data: {
                picPath: HistoryPicAction.getCurrent().src
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

            if ($.isFunction(onDelete)) {
                onDelete();
            }

            if ($.isFunction(callback)) {
                callback();
            }
        });

        xhr.fail(function (jqXHR, textStatus, errorThrown) {
            var message = 'deletePicAction._deletePic()';

            displayErrorNotify('Server error.', NOTIFY_TYPE_ERROR);

            PM.logAjaxFail(jqXHR, textStatus, errorThrown, message);
        });
    } // End function _deletePic()

    var Action = {

        /**
         *
         */
        init: function (opts) {
            $.extend(true, _options, _defaultOptions, opts || {});
        },

        /**
         *
         */
        askDelete: function (opts) {
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

                    if ($.isFunction(opts.onClose)) {
                        opts.onClose();
                    }
                },
                open: function () {
                    if ($.isFunction(opts.onOpen)) {
                        opts.onOpen();
                    }
                },
                buttons: [{
                    text: 'Cancel',
                    tabIndex: -1,
                    click: function () {
                        $(this).dialog('close');

                        if ($.isFunction(opts.onCancel)) {
                            opts.onCancel();
                        }
                    }
                }, {
                    text: 'Delete',
                    click: function () {
                        $(this).dialog('close');

                        _deletePic(function () {
                            if ($.isFunction(opts.onDelete)) {
                                opts.onDelete();
                            }
                        });
                    }
                }]
            });
        } // End function askDelete()
    };

    return Action;
});

