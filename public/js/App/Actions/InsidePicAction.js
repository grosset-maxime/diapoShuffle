/* global
    define
*/

define(
[
    'jquery',

    'App/Actions/HistoryPicAction',

    // Non AMD
    'js!jquery-ui'
],
function (
    $,

    HistoryPicAction
) {
    'use strict';

    let Action;

    // Private functions.
    let _buildBody, _getInsidePath;


    _buildBody = (opts) => {
        let body, message,
            Pic = HistoryPicAction.getCurrent();

        if (!opts.isInside) {
            message = 'Go inside of : ';
        } else {
            message = 'Go outside of : ';
        }

        body = $('<div>', {
            html: [
                $('<span>', {
                    text: message
                }), $('<span>', {
                    text: Pic.getFullPath()
                }).css({
                    'font-weight': 'bold'
                })
            ]
        });

        return body;
    };

    _getInsidePath = () => {
        return HistoryPicAction.getCurrent().getFullPath();
    };


    Action = {
        /**
         *
         */
        askInside: (options) => {
            let modal, modalOptions,
                opts = {};

            $.extend(
                true,
                opts,
                {
                    isInside: false,
                    onOpen: () => {},
                    onCancel: () => {},
                    onClose: () => {},
                    onInside: () => {},
                    onOutside: () => {}
                },
                options || {}
            );

            modalOptions = {
                resizable: false,
                modal: true,
                width: 400,
                position: {
                    at: 'center top+25%'
                },
                close: (event) => {
                    event.stopPropagation();
                    opts.onClose();
                },
                open: () => {
                    opts.onOpen();
                },
                buttons: [{
                    text: 'Go outside',
                    tabIndex: opts.isInside ? 0 : -1,
                    click: () => {
                        modal.dialog('close');

                        opts.onOutside();
                    }
                }, {
                    text: 'Cancel',
                    tabIndex: -1,
                    click: () => {
                        modal.dialog('close');

                        opts.onCancel();
                    }
                }, {
                    text: 'Go inside',
                    tabIndex: opts.isInside ? -1 : 0,
                    click: () => {
                        modal.dialog('close');

                        opts.onInside(
                            _getInsidePath()
                        );
                    }
                }]
            };

            modal = $('<div>', {
                'class': '',
                html: _buildBody(opts)
            }).dialog(modalOptions);
        }
    };

    return Action;
});

