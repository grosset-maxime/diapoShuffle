/* global
    define
*/

define(
[
    'jquery',

    'App/Cmp/TagsChooser',

    'App/Class/Tag',

    // Non AMD
    'js!jquery-ui'
],
function ($, TagsChooser, TagClass) {
    'use strict';

    let _els = {},
        _options = {};

    let _buildSkeleton, _getTags;

    _buildSkeleton = () => {
        let body, inputTags, tagsChooserCtn;

        inputTags = _els.inputTags = $('<input>',{
            type: 'text',
            value: _options.Pic.getTags().map(function (Tag) {
                return Tag.getName();
            }).join(';')
        });

        tagsChooserCtn = $('<div>', {
            html: (new TagsChooser({
                selected: _options.Pic.getTags()
            })).build()
        });

        body = $('<div>', {
            html: [$('<span>', {
                text: 'tags: '
            }),
                inputTags, tagsChooserCtn
            ]
        });

        return body;
    };

    _getTags = () => {
        let val = _els.inputTags.val();

        return val.split(';').map(function (el) {
            let Tag;

            el = el.trim();

            if (el) {
                Tag = new TagClass({
                    id: el
                });
            }

            return Tag;
        }).filter(function (el) {
            return el;
        });
    };

    let Modal = {

        /**
         *
         */
        ask: (options = {}) => {
            let modal, modalOptions;

            $.extend(
                true,
                _options,
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
                    _options.onClose();
                },
                open: () => {
                    _options.onOpen();
                },
                buttons: [{
                    text: 'Cancel',
                    tabIndex: -1,
                    click: () => {
                        modal.dialog('close');
                        _options.onCancel();
                    }
                }, {
                    text: 'Set',
                    click: () => {
                        modal.dialog('close');
                        // _options.Pic.addTags(_getTags());
                        _options.Pic.setTags(_getTags());
                        _options.onEnd();
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

