/* global
    define
*/

define(
[
    'jquery',

    // App
    'App/API/API',
    'App/Notify',

    // Actions
    'App/Actions/PlayerAction',

    // Modals
    'App/Modals/TagsModal',
],
function (
    $,
    API,
    Notify,

    PlayerAction,

    TagsModal
) {
    'use strict';

    let View,
        _defaultModel = {
            level: 0,
            parent: null,
            name: '',
            path: '',
            child: [],
            ctn: null,
            childCtn: null
        },
        _options = {},
        _els = {},
        _isBuilt = false,
        _isOpen = false,
        _rootModel = $.extend(true, {}, _defaultModel),
        _selectedPaths = [],
        _selectedItems = [],
        _selectedFolderCtn = null,
        _guid = 1;


    // Private functions.
    let _buildSkeleton, _updateNbSelected, _fillFolderCtn, _onCheckItem,
        _onUncheckItem, _getFolderList, _getBtnText, _setBtnText, _onSetOrUnsetTags,
        _enableBtn, _disableBtn;


    _buildSkeleton = () => {
        let mainCtn, btnUnSelectAll, btnClose, footerCtn, foldersCtn,
            nbSelectedCtn, btnFetchTags, btnSetTags, btnUnsetTags;

        mainCtn = _els.mainCtn = $('<div>', {
            'class': 'window ds_folder_finder',
            html: $('<div>', {
                'class': 'title_view flex',
                'text': 'Folder finder'
            })
        });

        footerCtn = _els.footerCtn = $('<div>', {
            'class': 'footer_ctn flex'
        });

        _els.nbSelectedCtn = nbSelectedCtn = $('<div>', {
            'class': 'nb_selected'
        });

        _els.btnUnSelectAll = btnUnSelectAll = $('<input>', {
            'class': 'btn btn_unselectall',
            type: 'button',
            value: 'Unselect All',
            on: {
                click: () => {
                    View.unSelectAll();
                }
            }
        }).button({disabled: true});

        btnClose = $('<input>', {
            'class': 'btn btn_close',
            type: 'button',
            value: 'Close',
            on: {
                click: () => {
                    View.close();
                }
            }
        }).button();

        btnFetchTags = _els.btnFetchTags = $('<input>', {
            'class': 'btn btn_fetch_tags',
            type: 'button',
            value: 'Fetch Tags',
            on: {
                click: () => {
                    var onFinish = () => {
                            _enableBtn(_els.btnFetchTags);
                            _enableBtn(_els.btnSetTags);
                            _enableBtn(_els.btnUnsetTags);

                            _options.hideLoading();
                        };

                    _options.showLoading();

                    _disableBtn(_els.btnFetchTags);
                    _disableBtn(_els.btnSetTags);
                    _disableBtn(_els.btnUnsetTags);

                    API.fetchTags({
                        folders: View.getSelectedPath(),
                        onSuccess: function (response) {
                            Notify.info({
                                message: 'Fetch tags success. Nb files processes: ' + response.nbFiles
                            });

                            onFinish();
                        },
                        onFailure: function (error) {
                            Notify.error({
                                message: 'Fetch tags error: ' + (error.publicMessage || 'unknow error') + '.'
                            });

                            onFinish();
                        }
                    });
                }
            }
        }).button();

        btnSetTags = _els.btnSetTags = $('<input>', {
            'class': 'btn btn_set_tags',
            type: 'button',
            value: 'Set Tags',
            on: {
                click: () => {
                    _onSetOrUnsetTags('set');
                }
            }
        }).button();

        btnUnsetTags = _els.btnUnsetTags = $('<input>', {
            'class': 'btn btn_unset_tags',
            type: 'button',
            value: 'Unset Tags',
            on: {
                click: () => {
                    _onSetOrUnsetTags('unset');
                }
            }
        }).button();

        _rootModel.childCtn = _rootModel.ctn = foldersCtn = _els.foldersCtn = $('<div>', {'class': 'folders_ctn'});

        footerCtn.append(
            nbSelectedCtn,
            btnUnsetTags,
            btnSetTags,
            btnFetchTags,
            btnUnSelectAll,
            btnClose
        );

        mainCtn.append(
            foldersCtn,
            footerCtn
        );

        _options.root.append(mainCtn);
        _isBuilt = true;

        _fillFolderCtn(_rootModel);

        _updateNbSelected();
    };

    _onSetOrUnsetTags = (action) => {
        TagsModal.ask({
            editBtn: true,
            onClose: function () {
                PlayerAction.enable();
            },
            onOpen: function () {
                PlayerAction.disable();
            },
            onEnd: function (selectedTags) {
                var onFinish = () => {
                        _enableBtn(_els.btnFetchTags);
                        _enableBtn(_els.btnSetTags);
                        _enableBtn(_els.btnUnsetTags);

                        _options.hideLoading();
                    };

                _options.showLoading();

                _disableBtn(_els.btnFetchTags);
                _disableBtn(_els.btnSetTags);
                _disableBtn(_els.btnUnsetTags);

                API.setTagsFolders({
                    folders: View.getSelectedPath(),
                    tags: selectedTags.map(function (tag) {
                        return tag.getId();
                    }),
                    method: action || 'set',
                    onSuccess: function (response) {
                        response = response || {};

                        let warnings = response.warning || {};

                        Notify[response.hasWarning ? 'warning' : 'info']({
                            message: 'Success'
                                + (response.hasWarning ? '<br>' : '')
                                + (warnings.foldersError ? '<br><b>Folders not done:</b> ' + warnings.foldersError.join(' - ') : '')
                                + (warnings.itemsError ? '<br><b>Items not done:</b> ' + warnings.itemsError.join(' - ') : ''),
                            autoHide: !response.hasWarning
                        });

                        onFinish();
                    },
                    onFailure: function (error) {
                        Notify.error({ message: error });
                        onFinish();
                    }
                });
            }
        });
    };

    _updateNbSelected = () => {
        if (!_isBuilt) {
            return;
        }

        let nbSelectedCtn = _els.nbSelectedCtn,
            btnUnSelectAll = _els.btnUnSelectAll,
            btnFetchTags = _els.btnFetchTags,
            btnSetTags = _els.btnSetTags,
            btnUnsetTags = _els.btnUnsetTags,
            nbSelected = _selectedItems.length;

        if (!nbSelected) {
            nbSelectedCtn.hide();

            _disableBtn(btnUnSelectAll);
            _disableBtn(btnFetchTags);
            _disableBtn(btnSetTags);
            _disableBtn(btnUnsetTags);

            _options.events.onNonSelected();

            return;
        }

        nbSelectedCtn.text('Selected: ' + nbSelected);
        nbSelectedCtn.show();

        _enableBtn(btnUnSelectAll);
        _enableBtn(btnFetchTags);
        _enableBtn(btnSetTags);
        _enableBtn(btnUnsetTags);
    };

    _disableBtn = (btn) => {
        btn.button('disable');
    };

    _enableBtn = (btn) => {
        btn.button('enable');
    };

    /**
     *
     */
    _fillFolderCtn = (model) => {
        let buildItem,
            modelChild = model.child,
            modelChildCtn = model.childCtn,
            modelPath = model.path;

        /**
         * @private
         */
        buildItem = (itemText) => {
            let item, expand, label, checkbox, newModel, childCtn,
                btnSelectAllChild,
                currentLevel = model.level + 1,
                completePathTemp = (modelPath ? '/' : '') + modelPath + '/' + itemText + '/',
                completePath = completePathTemp.replace(new RegExp('//', 'g'), '/'),
                isSelected = _selectedPaths.indexOf(completePath) >= 0,
                guid = _guid++;

            expand = $('<div>', {
                'class': 'expand_btn btn small',
                text: '+',
                on: {
                    click: () => {
                        _fillFolderCtn(newModel);

                        if (_getBtnText(expand) === '+') {
                            _setBtnText(expand, '-');
                            expand.addClass('minus');
                            btnSelectAllChild.show();
                        } else {
                            _setBtnText(expand, '+');
                            expand.removeClass('minus');
                            btnSelectAllChild.hide();
                        }
                    }
                }
            }).button();

            checkbox = $('<input>', {
                'class': 'checkbox',
                type: 'checkbox',
                id: 'folder_' + currentLevel + '_' + guid,
                checked: isSelected,
                on: {
                    change: () => {
                        if (checkbox.prop('checked')) {
                            _onCheckItem(newModel);
                        } else {
                            _onUncheckItem(newModel);
                        }
                    }
                }
            });

            label = $('<label>', {
                'class': 'label',
                text: itemText,
                for: 'folder_' + currentLevel + '_' + guid
            });

            btnSelectAllChild = $('<input>', {
                'class': 'btn btn_selectallchild',
                type: 'button',
                value: 'Select all',
                on: {
                    click: () => {
                        let children = newModel.child || [];

                        if (!children.length) {
                            return;
                        }

                        if (_getBtnText(btnSelectAllChild) === 'Select all') {
                            children.forEach ((child) => {
                                _onCheckItem(child);
                            });
                            _setBtnText(btnSelectAllChild, 'Unselect all');
                        } else {
                            children.forEach((child) => {
                                _onUncheckItem(child);
                            });
                            _setBtnText(btnSelectAllChild, 'Select all');
                        }
                    }
                }
            }).button();

            childCtn = $('<div>', {'class': 'child_items'});

            item = $('<div>', {
                'class': 'item',
                on: {
                    check: () => {
                        checkbox.prop('checked', true);
                    },
                    uncheck: () => {
                        checkbox.prop('checked', false);
                    }
                }
            });

            item.append(
                expand,
                checkbox,
                label,
                btnSelectAllChild
            );

            modelChildCtn.append(
                item,
                childCtn
            );

            newModel = {
                level: currentLevel,
                name: itemText,
                parent: model,
                child: [],
                childCtn: childCtn,
                ctn: item,
                path: completePath
            };

            modelChild.push(newModel);

            if (isSelected) {
                let i, selectedItem, thumb;

                for (i = _selectedItems.length - 1; i >= 0; i--) {
                    selectedItem = _selectedItems[i];

                    if (selectedItem.path === completePath) {
                        thumb = selectedItem.thumb;
                        newModel.thumb = thumb;
                        _selectedItems[i] = newModel;
                        break;
                    }
                }
            }
        };


        // ==============================
        // Start fillFolderCtn()
        // ==============================

        if (modelChild && modelChild.length) {
            modelChildCtn.toggle();
            return;
        }

        _getFolderList(modelPath, (folderList) => {
            let modelCtn = model.ctn;

            if (!folderList.length) {
                modelCtn.addClass('empty');
                modelCtn.find('.btn').button('destroy').remove();
                modelChildCtn.remove();
                return;
            }

            folderList.forEach(buildItem);
        });
    };

    /**
     *
     */
    _onCheckItem = (model) => {
        let item,
            onSelect = _options.events.onSelect,
            thumb = model.thumb,
            modelCtn = model.ctn;

        if ($.inArray(model.path, _selectedPaths) > -1) {
            return;
        }

        _selectedItems.push(model);
        _selectedPaths.push(model.path);

        if (modelCtn) { modelCtn.trigger('check'); }

        if (thumb) { thumb.show(); }
        else {
            item = model.thumb = $('<div>', {
                'class': 'thumb btn',
                text: model.path,
                on: {
                    click: () => {
                        _onUncheckItem(model);
                    }
                }
            }).button();

            _selectedFolderCtn.append(item);
            _selectedFolderCtn.addClass('not_empty');
        }

        _updateNbSelected();

        if ($.isFunction(onSelect)) { onSelect(); }
    };

    /**
     *
     */
    _onUncheckItem = (model) => {
        let index = $.inArray(model.path, _selectedPaths),
            onUnselect = _options.events.onUnselect || (() => {}),
            thumb = model.thumb,
            modelCtn = model.ctn;

        _selectedItems.splice(index, 1);
        _selectedPaths.splice(index, 1);

        if (modelCtn) { modelCtn.trigger('uncheck'); }

        if (thumb) { thumb.hide(); }

        _updateNbSelected();
        onUnselect();
    };

    /**
     *
     */
    _getFolderList = (folder, callback) => {
        API.getFolderList({
            folder: folder,
            onSuccess: (folders) => {
                callback(folders);
            },
            onFailure: (error) => {
                Notify.error({ message: error });
            }
        });
    };

    /**
     *
     */
    _getBtnText = (btn) => {
        return btn.button('option', 'label');
    };

    /**
     *
     */
    _setBtnText = (btn, text) => {
        btn.button('option', 'label', text);
    };


    View = {
        /**
         *
         */
        init: (opts) => {
            _options = {};

            $.extend(
                true,
                _options,
                {
                    root: null,
                    selectedFolderCtn: null,
                    showLoading: null,
                    hideLoading: null,
                    events: {
                        onClose: null,
                        onNonSelected: null,
                        onSelect: null,
                        onUnselect: null
                    }
                },
                opts || {}
            );

            if (!_options.root) {
                _options.root = $(document.body);
            }

            if (_options.selectedFolderCtn) {
                _selectedFolderCtn = _options.selectedFolderCtn;
            }
        },

        /**
         *
         */
        open: () => {
            if (!_isBuilt) { _buildSkeleton(); }

            _els.mainCtn.show();
            _isOpen = true;
        },

        /**
         *
         */
        close: () => {
            let onClose = _options.events.onClose;

            if (!_isBuilt) { return; }

            _els.mainCtn.hide();
            _isOpen = false;

            if ($.isFunction(onClose)) { onClose(); }
        },

        /**
         *
         */
        unSelectAll: () => {
            let i;

            for (i = _selectedItems.length - 1; i >= 0; i--) {
                _onUncheckItem(_selectedItems[i]);
            }
        },

        /**
         *
         */
        getSelectedPath: () => {
            return _selectedPaths.slice();
        },

        /**
         *
         */
        isOpen: () => {
            return _isOpen;
        },

        /**
         *
         */
        clear: () => {
            _selectedPaths = [];
            _selectedItems = [];

            if (_selectedFolderCtn) {
                _selectedFolderCtn.empty();
                _selectedFolderCtn.removeClass('not_empty');
            }

            View.clearUI();
        },

        clearUI: () => {
            let onNonSelected = _options.events.onNonSelected;

            if (_isBuilt) {
                View.close();

                _els.mainCtn.remove();
                _rootModel = $.extend(true, {}, _defaultModel);
                _isBuilt = false;
            }

            if ($.isFunction(onNonSelected)) {
                onNonSelected();
            }
        },

        addFolders: (folderList) => {
            let addFolder = (folder) => {
                let model = {
                    path: folder
                };

                _onCheckItem(model);
            };

            if ($.type(folderList) === 'array') {
                folderList.forEach(addFolder);
            } else {
                addFolder(folderList);
            }
        }
    };

    return View;
});
