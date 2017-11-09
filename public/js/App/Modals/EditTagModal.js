/* global
    define
*/

define(
[
    'jquery',

    'App/Notify',

    'App/API/API',

    'App/TagsManager',

    'App/Class/Tag',

    // Non AMD
    'js!jquery-ui'
],
function ($, Notify, API, TagsManager, TagClass) {
    'use strict';

    let _els = {},
        _options = {};

    let _buildSkeleton;

    _buildSkeleton = (options) => {
        let body,
            isNew = options.isNew,
            Tag = !isNew && options.Tag;

        function onCategoryChange () {
            let inputCategoryVal = _els.inputCategory.val(),
                color = 'fff';

            if (inputCategoryVal === '0') {
                _els.colorCategory.hide();
                return;
            }

            color = (TagsManager.getTagCategoryById(inputCategoryVal) || {}).color || color;

            _els.colorCategory.css({
                'background-color': '#' + color,
                display: 'inline-block'
            });
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
                            value: !isNew ? Tag.getId() : '',
                            disabled: !isNew
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
                            value: !isNew ? Tag.getName() : ''
                        })
                    ]
                }),
                $('<div>', {
                    'class': 'section',
                    html: [
                        $('<span>', {
                            'class': 'title',
                            text: 'Category'
                        }),
                        _els.inputCategory = $('<select>', {
                            'class': 'input_select',
                            html: [
                                $('<option>', {
                                    value: '0',
                                    text: 'None',
                                    selected: isNew || !Tag.getCategory()
                                        ? true
                                        : false
                                })
                            ].concat(TagsManager.getTagCategories().map(
                                function (TagCategory) {
                                    return $('<option>', {
                                        value: TagCategory.getId(),
                                        text: TagCategory.getName(),
                                        selected: !isNew && Tag.getCategory() === TagCategory.getId()
                                            ? true
                                            : false
                                    });
                                }
                            )),
                            on: {
                                change: onCategoryChange
                            }
                        }),
                        _els.colorCategory = $('<div>', {
                            'class': 'category_color'
                        })
                    ]
                })
            ]
        });

        onCategoryChange();

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
                    Tag: null,
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
                    tabIndex: -1,
                    click: () => {
                        let response = window.confirm('Are you sure to delete this tag ?');

                        if (response) {
                            API.editTag({
                                isDelete: true,
                                id: options.Tag.getId(),
                                onSuccess: function () {
                                    TagsManager.removeTag(options.Tag);
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
                    let id = _els.inputId.val().trim(),
                        name = _els.inputName.val().trim(),
                        category = _els.inputCategory.val();

                    if (isNew && TagsManager.existTagById(id)) {
                        Notify.error({ message: 'Tag with same id already exist.' });
                        return;
                    }

                    API.editTag({
                        isNew: isNew,
                        id: id,
                        name: name,
                        category: category,
                        onSuccess: function () {
                            let Tag;

                            if (isNew) {
                                Tag = new TagClass({
                                    id: id,
                                    name: name,
                                    category: category
                                });

                                TagsManager.addTag(Tag);
                            } else {
                                Tag = options.Tag;

                                Tag.name = name;
                                Tag.category = category;
                            }

                            _options.onEnd(Tag);
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
                dialogClass: 'edit_tag_modal',
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

