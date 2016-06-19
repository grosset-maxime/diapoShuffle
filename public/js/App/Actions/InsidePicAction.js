/* global
    define
*/

define(
[
    'jquery',

    // App Actions
    'App/Actions/HistoryPicAction',

    // App Cmp
    'App/Cmp/PathChooser',

    // Non AMD
    'js!jquery-ui'
],
function (
    $,

    HistoryPicAction,

    PathChooser
) {
    'use strict';

    let Action,
        _insidePath = '';

    // Private functions.
    let _buildBody, _getInsidePath;


    _buildBody = (opts, Pic) => {
        let body, message;

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
                    html: (new PathChooser({
                        fullPath: Pic.getFullPath(),
                        selectedPath: opts.insidePath,
                        events: {
                            onChoose: (path) => {
                                _insidePath = path;
                            }
                        }
                    })).build()
                }).css({
                    'font-weight': 'bold'
                })
            ]
        });

        return body;
    };

    _getInsidePath = () => {
        return _insidePath;
    };


    Action = {
        /**
         *
         */
        askInside: (options) => {
            let modal, modalOptions,
                opts = {},
                Pic = HistoryPicAction.getCurrent();

            $.extend(
                true,
                opts,
                {
                    isInside: false,
                    insidePath: '',
                    onOpen: () => {},
                    onCancel: () => {},
                    onClose: () => {},
                    onInside: () => {},
                    onOutside: () => {}
                },
                options || {}
            );

            _insidePath = opts.insidePath || Pic.getFullPath();

            modalOptions = {
                resizable: false,
                modal: true,
                width: 800,
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
                html: _buildBody(opts, Pic)
            }).dialog(modalOptions);
        }
    };

    return Action;
});

