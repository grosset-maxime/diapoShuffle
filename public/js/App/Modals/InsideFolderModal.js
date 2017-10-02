/* global
    define
*/

define(
[
    'jquery',

    // App Cmp
    'App/Cmp/PathChooser',

    // Non AMD
    'js!jquery-ui'
],
function (
    $,

    PathChooser
) {
    'use strict';

    let Modal,
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
                }),
                $('<span>', {
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


    Modal = {
        /**
         *
         */
        ask: (options = {}) => {
            let modal, modalOptions, Pic,
                opts = {};

            $.extend(
                true,
                opts,
                {
                    Pic: {},
                    isInside: false,
                    insidePath: '',
                    onOpen: () => {},
                    onCancel: () => {},
                    onClose: () => {},
                    onInside: () => {},
                    onOutside: () => {}
                },
                options
            );

            Pic = options.Pic;
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
                    modal.remove();
                },
                open: () => {
                    opts.onOpen();
                },
                buttons: [{
                    text: 'Go outside',
                    tabIndex: opts.isInside ? 0 : -1,
                    click: () => {
                        opts.onOutside();
                        modal.dialog('close');
                    }
                }, {
                    text: 'Cancel',
                    tabIndex: -1,
                    click: () => {
                        opts.onCancel();
                        modal.dialog('close');
                    }
                }, {
                    text: 'Go inside',
                    tabIndex: opts.isInside ? -1 : 0,
                    click: () => {
                        opts.onInside(
                            _getInsidePath()
                        );
                        modal.dialog('close');
                    }
                }]
            };

            modal = $('<div>', {
                'class': '',
                html: _buildBody(opts, Pic)
            }).dialog(modalOptions);
        }
    };

    return Modal;
});

