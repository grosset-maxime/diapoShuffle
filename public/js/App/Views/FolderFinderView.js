/* global
    define
*/

define(
[
    'jquery',

    // PM
    'PM/Core',
    'PM/Cmp/Notify'
],
function ($, PM, Notify) {
    'use strict';

    var NOTIFY_TYPE_ERROR = Notify.TYPE_ERROR,

        _defaultOptions = {
            root: null,
            selectedFolderCtn: null,
            events: {
                onClose: null,
                onNonSelected: null,
                onSelect: null,
                onUnselect: null
            }
        },
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
        _notify = null,
        _isBuilt = false,
        _isOpen = false,
        _rootModel = $.extend(true, {}, _defaultModel),
        _selectedPaths = [],
        _selectedItems = [],
        _selectedFolderCtn = null;

    /**
     *
     */
    function buildSkeleton () {
        var mainCtn, btnUnSelectAll, btnClose, footerCtn, foldersCtn,
            nbSelectedCtn;

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
                click: function () {
                    View.unSelectAll();
                }
            }
        }).button({disabled: true});

        btnClose = $('<input>', {
            'class': 'btn btn_close',
            type: 'button',
            value: 'Close',
            on: {
                click: function () {
                    View.close();
                }
            }
        }).button();

        _rootModel.childCtn = _rootModel.ctn = foldersCtn = _els.foldersCtn = $('<div>', {'class': 'folders_ctn'});

        footerCtn.append(
            nbSelectedCtn,
            btnUnSelectAll,
            btnClose
        );

        mainCtn.append(
            foldersCtn,
            footerCtn
        );

        _options.root.append(mainCtn);
        _isBuilt = true;

        fillFolderCtn(_rootModel);
    } // End function buildSkeleton()

    /**
     *
     */
    function updateNbSelected () {
        var onNonSelected,
            nbSelectedCtn = _els.nbSelectedCtn,
            btnUnSelectAll = _els.btnUnSelectAll,
            nbSelected = _selectedItems.length;

        if (!nbSelected) {
            nbSelectedCtn.hide();
            btnUnSelectAll.button('disable');

            onNonSelected = _options.events.onNonSelected;
            if ($.isFunction(onNonSelected)) {
                onNonSelected();
            }

            return;
        }

        nbSelectedCtn.text('Selected: ' + nbSelected);
        nbSelectedCtn.show();
        btnUnSelectAll.button('enable');
    } // End function updateNbSelected()

    /**
     *
     */
    function fillFolderCtn (model) {
        var modelChild = model.child,
            modelChildCtn = model.childCtn,
            modelPath = model.path;

        /**
         * @private
         */
        function buildItem (el) {
            var item, expand, label, checkbox, newModel, childCtn,
                btnSelectAllChild,
                currentLevel = model.level + 1;

            expand = $('<div>', {
                'class': 'expand_btn btn small',
                text: '+',
                on: {
                    click: function () {
                        var btn = $(this);

                        fillFolderCtn(newModel);

                        if (getBtnText(btn) === '+') {
                            setBtnText(btn, '-');
                            btn.addClass('minus');
                            btnSelectAllChild.show();
                        } else {
                            setBtnText(btn, '+');
                            btn.removeClass('minus');
                            btnSelectAllChild.hide();
                        }
                    }
                }
            }).button();

            checkbox = $('<input>', {
                'class': 'checkbox',
                type: 'checkbox',
                id: 'folder_' + el + '_' + currentLevel,
                on: {
                    change: function () {
                        if ($(this).prop('checked')) {
                            onCheckItem(newModel);
                        } else {
                            onUncheckItem(newModel);
                        }
                    }
                }
            });

            label = $('<label>', {
                'class': 'label',
                text: el,
                for: 'folder_' + el + '_' + currentLevel
            });

            btnSelectAllChild = $('<input>', {
                'class': 'btn btn_selectallchild',
                type: 'button',
                value: 'Select all',
                on: {
                    click: function () {
                        var btn = $(this),
                            children = newModel.child || [];

                        if (!children.length) {
                            return;
                        }

                        if (getBtnText(btn) === 'Select all') {
                            children.forEach(function (child) {
                                onCheckItem(child);
                            });
                            setBtnText(btn, 'Unselect all');
                        } else {
                            children.forEach(function (child) {
                                onUncheckItem(child);
                            });
                            setBtnText(btn, 'Select all');
                        }
                    }
                }
            }).button();

            childCtn = $('<div>', {'class': 'child_items'});

            item = $('<div>', {
                'class': 'item',
                on: {
                    check: function () {
                        checkbox.prop('checked', true);
                    },
                    uncheck: function () {
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
                name: el,
                parent: model,
                child: [],
                childCtn: childCtn,
                ctn: item,
                path: modelPath ? modelPath + '/' + el : el
            };

            modelChild.push(newModel);
        } // End function buildItem()


        // ==============================
        // Start function fillFolderCtn()
        // ==============================

        if (modelChild && modelChild.length) {
            modelChildCtn.toggle();
            return;
        }

        getFolderList(modelPath, function (folderList) {
            var modelCtn = model.ctn;

            if (!folderList.length) {
                modelCtn.addClass('empty');
                modelCtn.find('.btn').button('destroy').remove();
                modelChildCtn.remove();
                return;
            }

            folderList.forEach(buildItem);
        });
    } // End function fillFolderCtn()

    /**
     *
     */
    function onCheckItem (model) {
        var item,
            onSelect = _options.events.onSelect;

        _selectedItems.push(model);
        _selectedPaths.push(model.path);

        model.ctn.trigger('check');

        if (model.thumb) {
            model.thumb.show();
        } else {
            item = model.thumb = $('<div>', {
                'class': 'thumb btn',
                text: model.path,
                on: {
                    click: function () {
                        onUncheckItem(model);
                    }
                }
            }).button();

            _selectedFolderCtn.append(item);
        }

        updateNbSelected();

        if ($.isFunction(onSelect)) {
            onSelect();
        }
    }

    /**
     *
     */
    function onUncheckItem (model) {
        var index = $.inArray(model.path, _selectedPaths),
            onUnselect = _options.events.onUnselect;

        _selectedItems.splice(index, 1);
        _selectedPaths.splice(index, 1);

        model.ctn.trigger('uncheck');

        if (model.thumb) {
            model.thumb.hide();
        }

        updateNbSelected();

        if ($.isFunction(onUnselect)) {
            onUnselect();
        }
    }

    /**
     *
     */
    function getFolderList (folder, callback) {
        var xhr;

        /**
         * @private
         */
        function displayNotify (message, type) {
            if (!_notify) {
                _notify = new Notify({
                    className: 'fillFolderCtn_notify',
                    container: $(document.body),
                    autoHide: true,
                    duration: 3
                });
            }

            _notify.setMessage(message, type, true);
        } // End function displayNotify()


        // ==============================
        // Start function getFolderList()
        // ==============================

        xhr = $.ajax({
            url: '/?r=getFolderList_s',
            type: 'POST',
            dataType: 'json',
            async: true,
            data: {
                folder: folder || ''
            }
        });

        xhr.done(function (json) {
            var error,
                unknownErrorMessage = 'Unknown error.';

            if (json.error || !json.success) {
                error = json.error || {};

                displayNotify(
                    error.publicMessage || unknownErrorMessage,
                    error.severity || Notify.TYPE_ERROR
                );

                PM.log('Error : ' + error.message || unknownErrorMessage);
                PM.log(error);

                return;
            }

            if ($.isFunction(callback)) {
                callback(json.folderList);
            }
        });

        xhr.fail(function (jqXHR, textStatus, errorThrown) {
            var message = 'getRandomPicAction.getRandomPic()';

            displayNotify('Server error.', NOTIFY_TYPE_ERROR);

            PM.logAjaxFail(jqXHR, textStatus, errorThrown, message);
        });
    } // End function getFolderList()

    /**
     *
     */
    function getBtnText (btn) {
        return btn.button('option', 'label');
    } // End function getBtnText()

    /**
     *
     */
    function setBtnText (btn, text) {
        btn.button('option', 'label', text);
    } // End function setBtnText()


    var View = {
        /**
         *
         */
        init: function (opts) {
            $.extend(true, _options, _defaultOptions, opts || {});

            if (!_options.root) {
                _options.root = $(document.body);
            }

            if (_options.selectedFolderCtn) {
                _selectedFolderCtn = _options.selectedFolderCtn;
            }
        }, // End function init()

        /**
         *
         */
        open: function () {
            if (!_isBuilt) {
                buildSkeleton();
            }

            _els.mainCtn.show();
            _isOpen = true;
        }, // End function show()

        /**
         *
         */
        close: function () {
            var onClose = _options.events.onClose;

            if (!_isBuilt) {
                return;
            }

            _els.mainCtn.hide();
            _isOpen = false;

            if ($.isFunction(onClose)) {
                onClose();
            }
        }, // End function close()

        /**
         *
         */
        unSelectAll: function () {
            var i;

            for (i = _selectedItems.length - 1; i >= 0; i--) {
                onUncheckItem(_selectedItems[i]);
            }
        },// End function unSelectAll()

        /**
         *
         */
        getSelectedPath: function () {
            return _selectedPaths;
        }, // End function getSelectedPath()

        /**
         *
         */
        isOpen: function () {
            return _isOpen;
        }, // End function isOpen()

        /**
         *
         */
        clear: function () {
            var onNonSelected = _options.events.onNonSelected;

            this.close();

            _els.mainCtn.remove();
            _rootModel = $.extend(true, {}, _defaultModel);
            _isBuilt = false;
            _selectedPaths = [];
            _selectedItems = [];

            if (_selectedFolderCtn) {
                _selectedFolderCtn.empty();
            }

            if ($.isFunction(onNonSelected)) {
                onNonSelected();
            }
        } // End function clear()
    };

    return View;
});
