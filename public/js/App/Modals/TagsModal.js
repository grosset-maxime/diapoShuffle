/* global
    define
*/

define(
[
    'jquery',

    'App/Cmp/TagsChooser',

    // Non AMD
    'js!jquery-ui'
],
function ($, TagsChooser) {
    'use strict';

    let _els = {},
        _options = {},
        _tagChooser;

    let _buildSkeleton, _getTags;

    _buildSkeleton = () => {
        let body, tagsChooserCtn;

        _tagChooser = new TagsChooser({
            selected: _options.selectedTags ? _options.selectedTags : []
        });

        tagsChooserCtn = $('<div>', {
            html: _tagChooser.build()
        });

        body = $('<div>', {
            html: tagsChooserCtn
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

            _options = {};

            $.extend(
                true,
                _options,
                {
                    selectedTags: [],
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
                        _options.onEnd(_getTags());
                    }
                }]
            };

            modal = $('<div>', {
                html: _buildSkeleton()
            }).dialog(modalOptions);

            modal.css({
                'min-height': 'auto'
            });

            modal.parent().css({
                width: 'calc(100% - 6px)',
                top: '3px',
                left: '3px'
            });

            $('.ui-widget-overlay').addClass('tags_modal_overlay');
        }
    };

    return Modal;
});

