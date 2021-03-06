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
        _addPath = '';

    // Private functions.
    let _buildBody, _getAddPath;


    _buildBody = (opts, Pic) => {
        let body, message;

        message = 'Add folder: ';

        body = $('<div>', {
            html: [
                $('<span>', {
                    text: message
                }), $('<span>', {
                    html: (new PathChooser({
                        fullPath: Pic.getFullPath(),
                        events: {
                            onChoose: (path) => {
                                _addPath = path;
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

    _getAddPath = () => {
        return _addPath;
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
                    onOpen: () => {},
                    onCancel: () => {},
                    onClose: () => {},
                    onAdd: () => {}
                },
                options
            );

            Pic = options.Pic;
            _addPath = Pic.getFullPath();

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
                    text: 'Cancel',
                    tabIndex: -1,
                    click: () => {
                        opts.onCancel();
                        modal.dialog('close');
                    }
                }, {
                    text: 'Add',
                    tabIndex: 0,
                    click: () => {
                        opts.onAdd(
                            _getAddPath()
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

