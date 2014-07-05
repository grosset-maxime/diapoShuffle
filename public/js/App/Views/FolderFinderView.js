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

    var NOTIFY_TYPE_ERROR = Notify.TYPE_ERROR;

    var _defaultOptions = {
            root: null
        },
        _options = {},
        _els = {},
        _notify = null,
        _isBuilt = false,
        _rootModel = {
            level: 0,
            parent: null,
            name: '',
            path: '',
            child: [],
            ctn: null,
            childCtn: null
        },
        _selectedPaths = [];

    /**
     *
     */
    function buildSkeleton () {
        var mainCtn, btnClose, footerCtn, foldersCtn;

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

        btnClose = $('<input>', {
            'class': 'btn btn_close',
            type: 'button',
            value: 'Close',
            on: {
                click: function () {
                    View.hide();
                }
            }
        }).button();

        _rootModel.childCtn = _rootModel.ctn = foldersCtn = _els.foldersCtn = $('<div>', {'class': 'folders_ctn'});

        footerCtn.append(
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
    function fillFolderCtn (model) {
        var modelChild = model.child,
            modelChildCtn = model.childCtn,
            modelPath = model.path;

        /**
         * @private
         */
        function buildItem (el) {
            var item, expand, label, checkbox, newModel, childCtn,
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
                        } else {
                            setBtnText(btn, '+');
                            btn.removeClass('minus');
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
                            _selectedPaths.push(newModel.path);
                        } else {
                            _selectedPaths.splice(
                                $.inArray(newModel.path, _selectedPaths),
                                1
                            );
                        }
                    }
                }
            });

            label = $('<label>', {
                'class': 'label',
                text: el,
                for: 'folder_' + el + '_' + currentLevel
            });

            childCtn = $('<div>', {'class': 'child_items'});

            item = $('<div>', {'class': 'item'});

            item.append(
                expand,
                checkbox,
                label
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
        }, // End function init()

        /**
         *
         */
        show: function () {
            if (!_isBuilt) {
                buildSkeleton();
            }

            _els.mainCtn.show();
        }, // End function show()

        /**
         *
         */
        hide: function () {
            if (!_isBuilt) {
                return;
            }

            _els.mainCtn.hide();
        }, // End function hide()

        /**
         *
         */
        getSelectedPath: function () {
            return _selectedPaths;
        } // End function getSelectedPath()
    };

    return View;
});
