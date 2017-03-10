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
        _options = {},
        _tagChooser;

    let _buildSkeleton, _getTags;

    _buildSkeleton = () => {
        let body, tagsChooserCtn;

        _tagChooser = new TagsChooser({
            selected: _options.Pic.getTags()
        });

        tagsChooserCtn = $('<div>', {
            html: _tagChooser.build()
        });

        body = $('<div>', {
            html: [$('<span>', {
                text: 'tags: '
            }), tagsChooserCtn]
        });

        return body;
    };

    _getTags = () => {
        return _tagChooser.getSelected();
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

                        _options.Pic.setTags(
                            _getTags()
                        );

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

