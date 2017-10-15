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

    let _buildSkeleton, _getTags, _seeThroughModal;

    _buildSkeleton = () => {
        let body, tagsChooserCtn;

        _tagChooser = new TagsChooser({
            selected: _options.selectedTags ? _options.selectedTags : [],
            randomBtn: _options.randomBtn
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

    _seeThroughModal = (event, hide) => {
        if (event.which === 17 || event.target === _els.modal[0]) { // 17 = Ctrl
            _els.parentModal.css('opacity', hide ? 0 : 1);
        }
    };

    let Modal = {

        /**
         *
         */
        ask: (options = {}) => {
            let modal, modalOptions, parentModal;

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
                    modal.remove();
                    _tagChooser = null;
                },
                open: () => {
                    _options.onOpen();
                },
                buttons: [{
                    text: 'Cancel',
                    tabIndex: -1,
                    click: () => {
                        _options.onCancel();
                        modal.dialog('close');
                    }
                }, {
                    text: 'Set',
                    click: () => {
                        _options.onEnd(_getTags());
                        modal.dialog('close');
                    }
                }]
            };

            _els.modal = modal = $('<div>', {
                html: _buildSkeleton(),
                on: {
                    keydown: function (e) {
                        _seeThroughModal(e, true);
                    },
                    keyup: function (e) {
                        _seeThroughModal(e, false);
                    },
                    mousedown: function (e) {
                        _seeThroughModal(e, true);
                    },
                    mouseup: function (e) {
                        _seeThroughModal(e, false);
                    }
                }
            }).dialog(modalOptions);

            modal.css({
                'min-height': 'auto',
                'max-height': '',
                height: '100%'
            });

            _els.parentModal = parentModal = modal.parent();

            parentModal.css({
                width: 'calc(100% - 6px)',
                height: '100%',
                top: '3px',
                left: '3px'
            });

            $('.ui-widget-overlay').addClass('tags_modal_overlay');
        }
    };

    return Modal;
});

