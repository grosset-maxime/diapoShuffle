/* global
    define
*/

define(
[
    'jquery',

    'App/Notify',

    'App/API/API',

    'App/TagsManager',

    'App/Class/TagCategory',

    // Non AMD
    'js!jquery-ui'
],
function ($, Notify, API, TagsManager, TagCategoryClass) {
    'use strict';

    let _els = {},
        _options = {};

    let _buildSkeleton;

    _buildSkeleton = (options) => {
        let body,
            isNew = options.isNew,
            TagCategory = !isNew && options.TagCategory;

        function onTextColorChange () {
            _els.inputColor.val(
                '#' + _els.inputTextColor.val().trim()
            );
        }

        function onColorChange () {
            _els.inputTextColor.val(
                _els.inputColor.val().substring(1)
            );
        }

        body = $('<div>', {
            html: [
                $('<div>', {
                    'class': 'section',
                    html: [
                        $('<span>', {
                            'class': 'title',
                            text: 'Id'
                        }),
                        _els.inputId = $('<input>', {
                            'class': 'input_text',
                            type: 'text',
                            value: !isNew ? TagCategory.getId() : '',
                            disabled: true
                        })
                    ]
                }),
                $('<div>', {
                    'class': 'section',
                    html: [
                        $('<span>', {
                            'class': 'title',
                            text: 'Name'
                        }),
                        _els.inputName = $('<input>', {
                            'class': 'input_text',
                            type: 'text',
                            value: !isNew ? TagCategory.getName() : ''
                        })
                    ]
                }),
                $('<div>', {
                    'class': 'section',
                    html: [
                        $('<span>', {
                            'class': 'title',
                            text: 'Color #'
                        }),
                        _els.inputTextColor = $('<input>', {
                            'class': 'input_text color_input_text',
                            type: 'text',
                            maxlength: 6,
                            value: !isNew ? TagCategory.getColor() : '',
                            on: {
                                change: onTextColorChange,
                                keyup: onTextColorChange
                            }
                        }),
                        _els.inputColor = $('<input>', {
                            'class': 'input_text color_input',
                            type: 'color',
                            value: !isNew ? TagCategory.getColor() : '',
                            on: {
                                change: onColorChange,
                                keyup: onColorChange
                            }
                        })
                    ]
                })
            ]
        });

        onTextColorChange();

        return body;
    };

    let Modal = {

        /**
         *
         */
        ask: (options = {}) => {
            let modal, modalOptions, parentModal, isNew,
                buttons = [];

            _options = {};

            $.extend(
                true,
                _options,
                {
                    isNew: false,
                    TagCategory: null,
                    onOpen: () => {},
                    onCancel: () => {},
                    onClose: () => {},
                    onEnd: () => {}
                },
                options
            );

            isNew = options.isNew;

            if (!isNew) {
                buttons.push({
                    text: 'Delete',
                    click: () => {
                        let response = window.confirm('Are you sure to delete this tag category ?');

                        if (response) {
                            API.editTagCategory({
                                isDelete: true,
                                id: options.TagCategory.getId(),
                                onSuccess: function () {
                                    TagsManager.removeTagCategory(options.TagCategory);
                                    _options.onEnd({ deleted: true });
                                    modal.dialog('close');
                                },
                                onFailure: function (error) {
                                    Notify.error({ message: error });
                                    modal.dialog('close');
                                }
                            });
                        }
                    }
                });
            }

            buttons = buttons.concat([{
                text: 'Cancel',
                tabIndex: -1,
                click: () => {
                    _options.onCancel();
                    modal.dialog('close');
                }
            }, {
                text: isNew ? 'Add': 'Update',
                click: () => {
                    let id = _els.inputId.val(),
                        name = _els.inputName.val().trim(),
                        color = _els.inputColor.val().substring(1);

                    API.editTagCategory({
                        isNew: isNew,
                        id: id,
                        name: name,
                        color: color,
                        onSuccess: function (response) {
                            let TagCategory;

                            if (isNew) {
                                TagCategory = new TagCategoryClass({
                                    id: response.tagCategoryId,
                                    name: name,
                                    color: color
                                });

                                TagsManager.addTagCategory(TagCategory);
                            } else {
                                TagCategory = options.TagCategory;

                                TagCategory.name = name;
                                TagCategory.color = color;
                            }

                            _options.onEnd(TagCategory);
                            modal.dialog('close');
                        },
                        onFailure: function (error) {
                            Notify.error({ message: error });
                            modal.dialog('close');
                        }
                    });
                }
            }]);

            modalOptions = {
                dialogClass: 'edit_tag_category_modal',
                resizable: false,
                modal: true,
                close: (event) => {
                    event.stopPropagation();
                    _options.onClose();
                    modal.remove();
                },
                open: () => {
                    _options.onOpen();
                },
                buttons: buttons
            };

            _els.modal = modal = $('<div>', {
                html: _buildSkeleton(options)
            }).dialog(modalOptions);

            parentModal = modal.parent();

            parentModal.css({
                width: 'calc(100% - 20px)',
                left: '10px'
            });
        }
    };

    return Modal;
});

