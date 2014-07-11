/* global
    define
*/

define(
[
    'jquery',

    // PM
    'PM/Core',
    'PM/Cmp/Notify',

    // App
    'App/Actions/GetRandomPicAction',
    'App/Views/FolderFinderView',

    // Non AMD
    'js!jquery-ui'
],
function ($, PM, Notify, GetRandomPicAction, FolderFinderView) {
    'use strict';

    var DEFAULT_INTERVAL = GetRandomPicAction.DEFAULT_INTERVAL,
        DEFAULT_ZOOM = 1,
        NOTIFY_TYPE_ERROR = Notify.TYPE_ERROR,

        _defaultOptions = {
            root: null
        },
        _options = {},
        _els = {},
        _hasFocus = false,
        _notify = null;

    /**
     *
     */
    function buildSkeleton () {
        var mainCtn, customFolderCtn, selectedCustomFolderCtn,
            footerCtn, btnStart, inputInterval, btnClearCache,
            intervalCtn, inputScale, scaleCtn, zoomCtn,
            inputZoom, pathPicCtn, inputPathPic, btnUnSelectAll,
            nbSelectedCtn;

        /**
         * @private
         */
        function keyUpInput (e) {
            var keyPressed = e.which,
                doPreventDefault = false;
            // console.log(keyPressed);
            switch (keyPressed) {
            case 13: // Enter
                doPreventDefault = true;
                GetRandomPicAction.start();
                break;
            }

            if (doPreventDefault) {
                e.preventDefault();
            }
        } // End function keyUpInput()

        /**
         * @private
         */
        function clearCache () {
            var xhr,
                errorMessage = 'Server error while trying to clear cache.';

            /**
             * @private
             */
            function displayNotify (message, type) {
                if (!_notify) {
                    _notify = new Notify({
                        className: 'optionsView_notify',
                        container: $(document.body),
                        autoHide: true,
                        duration: 3
                    });
                }

                _notify.setMessage(message, type, true);
            } // End function displayErrorNotify()

            xhr = $.ajax({
                url: '/?r=clearCache_s',
                type: 'POST',
                dataType: 'json',
                async: true
            });

            xhr.done(function (json) {
                var error;

                if (json.success) {

                    FolderFinderView.clear();
                    displayNotify('Cache has been cleared successfully.', Notify.TYPE_INFO);

                } else {

                    error = json.error || {};
                    displayNotify(errorMessage + ' ' + (error.publicMessage || ''), NOTIFY_TYPE_ERROR);
                    PM.log(error.message || 'Undefined error.');

                }
            });

            xhr.fail(function (jqXHR, textStatus, errorThrown) {
                var message = 'OptionsView.clearCache()';

                displayNotify(errorMessage, NOTIFY_TYPE_ERROR);

                PM.logAjaxFail(jqXHR, textStatus, errorThrown, message);
            });
        } // End function clearCache()


        // =================================
        // Start of function buildSkeleton()
        // =================================

        mainCtn = _els.mainCtn = $('<div>', {
            'class': 'window ds_options_view flex',
            html: $('<div>', {
                'class': 'title_view',
                'text': 'Options'
            })
        });

        mainCtn.css('max-height', _options.root.height() - 160);

        footerCtn = _els.footerCtn = $('<div>', {
            'class': 'footer_ctn flex'
        });

        // Ctn custom folder
        // -----------------
        _els.btnUnSelectAll = btnUnSelectAll = $('<input>', {
            'class': 'btn btn_unselectall',
            type: 'button',
            value: 'Unselect All',
            on: {
                click: function () {
                    FolderFinderView.unSelectAll();
                }
            }
        }).button();

        _els.nbSelectedCtn = nbSelectedCtn = $('<div>', {
            'class': 'nb_selected'
        });

        customFolderCtn = $('<div>', {
            'class': 'el_ctn flex'
        }).append(
            $('<label>', {
                'class': 'title title_custom_folder',
                text: 'Folder(s) :'
            }),
            $('<input>', {
                'class': 'btn browse_custom_folder_btn',
                type: 'button',
                value: 'Browse ...',
                on: {
                    click: function () {
                        FolderFinderView.open();
                    }
                }
            }).button(),
            btnUnSelectAll,
            nbSelectedCtn
        );

        selectedCustomFolderCtn = _els.selectedCustomFolderCtn = $('<div>', {
            'class': 'el_ctn selected_custom_folder_ctn'
        });

        // Btn start
        btnStart = _els.btnStart = $('<input>', {
            'class': 'btn start_btn',
            type: 'button',
            value: 'Start',
            on: {
                click: GetRandomPicAction.start
            }
        }).button();

        // Input interval
        inputInterval = _els.inputInterval = $('<input>', {
            id: 'intervalOpts',
            'class': 'input_interval input_spinner',
            value: DEFAULT_INTERVAL,
            maxlength: 2,
            numberFormat: 'n',
            on: {
                focus: function () {
                    _hasFocus = true;
                },
                blur: function () {
                    _hasFocus = false;
                },
                keyup: keyUpInput
            }
        });

        // Ctn interval
        intervalCtn = $('<div>', {
            'class': 'el_ctn'
        }).append(
            $('<label>', {
                'class': 'title label',
                text: 'Interval (s) :',
                for: 'intervalOpts'
            }),
            inputInterval
        );

        // Checkbox scale
        inputScale = _els.inputScale = $('<input>', {
            id: 'scaleOpts',
            'class': 'input_text',
            type: 'checkbox',
            checked: true,
        });

        // Ctn scale
        scaleCtn = $('<div>', {
            'class': 'el_ctn'
        }).append(
            inputScale,
            $('<label>', {
                'class': 'title label',
                text: 'Scale',
                for: 'scaleOpts'
            })
        );

        // Spinner Zoom
        inputZoom = _els.inputZoom = $('<input>', {
            id: 'zoomOpts',
            'class': 'input_zoom input_spinner',
            value: DEFAULT_ZOOM,
            step: 0.1,
            maxlength: 2,
            numberFormat: 'n',
            on: {
                focus: function () {
                    _hasFocus = true;
                },
                blur: function () {
                    _hasFocus = false;
                },
                keyup: keyUpInput
            }
        });

        // Ctn Zoom
        zoomCtn = $('<div>', {
            'class': 'el_ctn'
        }).append(
            $('<label>', {
                'class': 'title label',
                text: 'Zoom :',
                for: 'zoomOpts',
                on: {
                    click: function () {
                        inputZoom.focus();
                    }
                }
            }),
            inputZoom
        );

                // Checkbox scale
        inputPathPic = _els.inputPathPic = $('<input>', {
            'class': 'input_text',
            type: 'checkbox',
            checked: true
        });

        // Ctn scale
        pathPicCtn = $('<div>', {
            'class': 'el_ctn'
        }).append(
            inputPathPic,
            $('<span>', {
                'class': 'title label',
                text: 'Display path picture',
                on: {
                    click: function () {
                        inputPathPic[0].checked = !inputPathPic[0].checked;
                    }
                }
            })
        );

        btnClearCache = $('<div>', {
            'class': 'clear_cache_btn',
            text: 'Clear cache',
            on: {
                click: clearCache
            }
        });

        footerCtn.append(
            btnStart,
            btnClearCache
        );

        mainCtn.append(
            customFolderCtn,
            selectedCustomFolderCtn,
            intervalCtn,
            zoomCtn,
            scaleCtn,
            pathPicCtn,
            footerCtn
        );

        _options.root.append(mainCtn);

        inputInterval.spinner({
            min: 1,
            max: 60
        });

        inputZoom.spinner({
            min: 1,
            max: 99
        });
    } // End function buildSkeleton()

    /**
     *
     */
    function onCloseFolderFinder () {
        var nbCustomFolderSelected = View.getCustomFolders().length,
            btnUnSelectAll = _els.btnUnSelectAll;

        updateNbCustomFolderSelected();

        if (!nbCustomFolderSelected) {
            btnUnSelectAll.hide();
            return;
        }

        btnUnSelectAll.show();
    } // End function onCloseFolderFinder()

    /**
     *
     */
    function updateNbCustomFolderSelected () {
        var nbCustomFolderSelected = View.getCustomFolders().length,
            nbSelectedCtn = _els.nbSelectedCtn;

        if (!nbCustomFolderSelected) {
            nbSelectedCtn.hide();
            return;
        }

        nbSelectedCtn.text('Selected: ' + nbCustomFolderSelected);
        nbSelectedCtn.show();
    } // End function updateNbCustomFolderSelected()


    var View = {
        /**
         *
         */
        init: function (opts) {
            $.extend(true, _options, _defaultOptions, opts || {});

            if (!_options.root) {
                _options.root = $(document.body);
            }

            buildSkeleton();

            FolderFinderView.init({
                root: opts.root,
                selectedFolderCtn: _els.selectedCustomFolderCtn,
                events: {
                    onClose: onCloseFolderFinder,
                    onNonSelected: onCloseFolderFinder,
                    onSelect: updateNbCustomFolderSelected,
                    onUnselect: updateNbCustomFolderSelected
                }
            });
        }, // End function init()

        /**
         *
         */
        hasFocus: function () {
            return _hasFocus;
        }, // End function hasFocus()

        /**
         *
         */
        getTimeInterval: function () {
            var inputInterval = _els.inputInterval,
                interval = inputInterval.spinner('value') || DEFAULT_INTERVAL;

            inputInterval.spinner('value', interval);

            return interval;
        }, // End function getTimeInterval()

        /**
         *
         */
        getZoom: function () {
            var inputZoom = _els.inputZoom,
                zoom = inputZoom.spinner('value') || DEFAULT_ZOOM;

            inputZoom.spinner('value', zoom);

            return zoom;
        }, // End function getZoom()

        /**
         *
         */
        getCustomFolders: function () {
            return FolderFinderView.getSelectedPath();
        }, // End function getCustomFolders()

        /**
         *
         */
        toggleFolderFinder: function () {
            if (FolderFinderView.isOpen()) {
                FolderFinderView.close();
            } else {
                FolderFinderView.open();
            }
        }, // End function toggleFolderFinder()

        /**
         *
         */
        closeFolderFinder: function () {
            FolderFinderView.close();
        }, // End function closeFolderFinder()

        /**
         *
         */
        isScaleOn: function () {
            return !!_els.inputScale[0].checked;
        }, // End function getScale()

        /**
         *
         */
        isPublicPathOn: function () {
            return !!_els.inputPathPic[0].checked;
        }, // End function isPublicPathOn()

        /**
         *
         */
        isFolderFinderOpen: function () {
            return FolderFinderView.isOpen();
        } // End function isFolderFinderOpen()
    };

    return View;
});
