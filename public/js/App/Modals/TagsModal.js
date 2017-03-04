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

    let _els = {};

    let _buildSkeleton, _getTags;

    _buildSkeleton = () => {
        let body, inputTags;

        inputTags = _els.inputTags = $('<input>',{
            type: 'text'
        });

        body = $('<div>', {
            html: [$('<span>', {
                text: 'tags: '
            }),
                inputTags
            ]
        });

        return body;
    };

    _getTags = () => {
        let val = _els.inputTags.val();

        return val.split(';').map(function (el) {
            return el.trim();
        }).filter(function (el) {
            return el;
        });
    };

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
                    Pic: {},
                    onOpen: () => {},
                    onCancel: () => {},
                    onClose: () => {},
                    onEnd: () => {}
                },
                options
            );

            modalOptions = {
                dialogClass: 'tags_modal',
                resizable: false,
                modal: true,
                width: 370,
                position: {
                    at: 'center top'
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
                    text: 'Set',
                    click: () => {
                        modal.dialog('close');
                        opts.Pic.addTags(_getTags());
                        opts.onEnd();
                    }
                }]
            };

            modal = $('<div>', {
                html: _buildSkeleton()
            }).dialog(modalOptions);

            // modal.css({
            //     'min-height': 'auto'
            // });

            // modal.parent().css({
            //     display: 'flex',
            //     top: '3px'
            // });

            // $('.ui-widget-overlay').addClass('delete_modal_overlay');
        }
    };

    return Modal;
});

