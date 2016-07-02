/* global
    define
*/

define(
[
    'jquery',

    // Non AMD
    'js!jquery-ui'
],
function ($) {
    'use strict';

    let Modal = {

        /**
         *
         */
        ask: (options = {}) => {
            let modal, modalOptions,
                opts = {};

            $.extend(
                true,
                opts,
                {
                    onOpen: () => {},
                    onCancel: () => {},
                    onClose: () => {},
                    onDelete: () => {}
                },
                options
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
                    text: 'Cancel',
                    tabIndex: -1,
                    click: () => {
                        modal.dialog('close');
                        opts.onCancel();
                    }
                }, {
                    text: 'Delete',
                    click: () => {
                        modal.dialog('close');
                        opts.onDelete();
                    }
                }]
            };

            modal = $('<div>', {
                'class': '',
                html: 'Do you really want to delete this picture ?'
            }).dialog(modalOptions);
        }
    };

    return Modal;
});

