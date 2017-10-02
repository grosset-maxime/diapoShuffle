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
                dialogClass: 'delete_modal',
                resizable: false,
                modal: true,
                width: 370,
                position: {
                    at: 'center top'
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
                    text: 'Delete',
                    click: () => {
                        opts.onDelete();
                        modal.dialog('close');
                    }
                }]
            };

            modal = $('<div>', {
                html: 'Delete this picture ?'
            }).dialog(modalOptions);

            modal.css({
                'min-height': 'auto'
            });

            modal.parent().css({
                display: 'flex',
                top: '3px'
            });

            $('.ui-widget-overlay').addClass('delete_modal_overlay');
        }
    };

    return Modal;
});

