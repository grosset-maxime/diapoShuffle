/* global
    define
*/

define(
[
    'jquery',

    // App Views
    'App/Views/OptionsView',
    'App/Views/InfosView',

    // App Actions
    'App/Actions/GetRandomPicAction',
    'App/Actions/DeletePicAction',
    'App/Actions/HistoryPicAction',

    // Non AMD
    'js!jquery-ui'
],
function ($, OptionsView, InfosView, GetRandomPicAction, DeletePicAction, HistoryPicAction) {
    'use strict';

    var BTN_PAUSE = 'Pause',
        BTN_RESUME = 'Resume';

    var _defaultOptions = {
            root: null
        },
        _options = {},
        _els = {},
        _viewDimension = {
            width: 0,
            height: 0
        };

    /**
     *
     */
    function _buildSkeleton () {
        var mainCtn, cmdCtn, playCtn;

        /**
         * @private
         */
        function buildCmd () {
            var btnStop, btnPrevious, btnNext, btnPause, btnDelete;

            // Btn delete
            btnDelete = _els.btnDelete = $('<input>', {
                'class': 'btn delete_btn',
                type: 'button',
                value: 'Delete',
                on: {
                    click: _askDelete
                }
            }).button();

            // Btn previous pic
            btnPrevious = _els.btnPrevious = $('<input>', {
                'class': 'btn previous_btn',
                type: 'button',
                value: '<',
                on: {
                    click: _displayPrevious
                }
            }).button();

            // Btn next pic
            btnNext = _els.btnNext = $('<input>', {
                'class': 'btn next_btn',
                type: 'button',
                value: '>',
                on: {
                    click: _displayNext
                }
            }).button();

            // Btn stop
            btnStop = $('<input>', {
                'class': 'btn stop_btn',
                type: 'button',
                value: 'Stop',
                on: {
                    click: GetRandomPicAction.stop
                }
            }).button();

            // Btn pause
            btnPause = _els.btnPause = $('<input>', {
                'class': 'btn pause_btn',
                type: 'button',
                value: BTN_PAUSE,
                on: {
                    click: GetRandomPicAction.pause
                }
            }).button();

            cmdCtn.append(
                btnDelete,
                btnPrevious,
                btnNext,
                btnStop,
                btnPause
            );

        } // End function buildCmd()


        // ==================================
        // Start of function _buildSkeleton()
        // ==================================

        mainCtn = _els.mainCtn = $('<div>', {
            'class': 'ds_play_view'
        });

        cmdCtn = _els.cmdCtn = $('<div>', {
            'class': 'cmd_ctn flex'
        });

        playCtn = _els.playCtn = $('<div>', {
            'class': 'play_ctn'
        });

        buildCmd();

        mainCtn.append(
            cmdCtn,
            playCtn
        );

        _options.root.append(mainCtn);
    } // End function _buildSkeleton()

    /**
     *
     */
    function _getViewDimension () {
        var doc = $(document);

        _viewDimension.width = doc.width();
        _viewDimension.height = doc.height();
    } // End function setViewDimension()

    /**
     *
     */
    function _scalePic (picInfos, picEl) {
        var cssObj, dw, dh,
            widthPic = picInfos.width || 0,
            heightPic = picInfos.height || 0,
            widthView = _viewDimension.width,
            heightView = _viewDimension.height;

        if (widthPic >= widthView || heightPic >= heightView) {
            return;
        }

        dw = widthView / widthPic;
        dh = heightView / heightPic;

        if (dh >= dw) {
            cssObj = {'min-width': widthView};
        } else {
            cssObj = {'min-height': heightView};
        }

        picEl.css(cssObj);
    } // End function _scalePic()

    /**
     *
     */
    function _zoomPic (picInfos, picEl) {
        var widthPic = picInfos.width || 0,
            heightPic = picInfos.height || 0,
            zoom = OptionsView.getZoom(),
            newWidth = widthPic * zoom,
            newHeight = heightPic * zoom,
            widthView = _viewDimension.width,
            heightView = _viewDimension.height;

        if (newWidth >= widthView || newHeight >= heightView) {
            _scalePic(picInfos, picEl);
            return;
        }

        picEl.css({
            width: newWidth,
            height: newHeight
        });
    } // End function _zoomPic()

    /**
     *
     */
    function _askDelete () {
        if (GetRandomPicAction.isPausing()) {
            DeletePicAction.askDelete({
                onClose: function () {
                    GetRandomPicAction.enable();
                },
                onOpen: function () {
                    GetRandomPicAction.disable();
                },
                onDelete: function () {
                    HistoryPicAction.remove();
                    GetRandomPicAction.enable();
                    GetRandomPicAction.pause();
                }
            });
        }
    } // End function _askDelete()

    /**
     *
     */
    function _displayPrevious () {
        _setPic(HistoryPicAction.getPrevious());
    } // End function _displayPrevious()

    /**
     *
     */
    function _displayNext () {
        _setPic(HistoryPicAction.getNext());
    } // End function _displayNext()

    /**
     *
     */
    function _setPic (pic) {
        var img = _els.img;

        InfosView.setPicFolderPath(pic.customFolderPath, pic.randomPublicPath);

        if (img) {
            img.remove();
        }

        img = _els.img = $('<img>', {
            'class': 'random_pic',
            src: pic.src || ''
        }).css({
            'max-width': _viewDimension.width,
            'max-height': _viewDimension.height
        });

        if (OptionsView.isScaleOn()) {
            _scalePic(pic, img);
        } else if (OptionsView.getZoom() > 1) {
            _zoomPic(pic, img);
        }

        _els.playCtn.html(img);
        View.show();
    } // End function _setPic()


    var View = {

        /**
         *
         */
        BTN_PAUSE: BTN_PAUSE,

        /**
         *
         */
        BTN_RESUME: BTN_RESUME,

        /**
         *
         */
        init: function (opts) {
            $.extend(true, _options, _defaultOptions, opts || {});

            if (!_options.root) {
                _options.root = $(document.body);
            }

            _getViewDimension();

            _buildSkeleton();
        }, // End function init()

        /**
         *
         */
        setPic: function (pic) {
            _setPic(pic);
        }, // End function setPic()

        /**
         *
         */
        deletePic: function () {
            _askDelete();
        }, // End function deletePic()

        /**
         *
         */
        displayPrevious: function () {
            _displayPrevious();
        }, // End function displayPrevious()

        /**
         *
         */
        displayNext: function () {
            _displayNext();
        }, // End function displayNext()

        /**
         *
         */
        getViewDimension: function (force) {
            if (force) {
                _getViewDimension();
            }

            return _viewDimension;
        }, // End function getViewDimension()

        /**
         *
         */
        show: function () {
            _els.mainCtn.show();
        }, // End function show()

        /**
         *
         */
        hide: function () {
            _els.mainCtn.hide();
        }, // End function hide()

        /**
         *
         */
        toggleStatePauseBtn: function (force) {
            var btnPause = _els.btnPause,
                btnDelete = _els.btnDelete,
                btnPrevious = _els.btnPrevious,
                btnNext = _els.btnNext,
                isPaused = GetRandomPicAction.isPausing();

            if ((isPaused && !force) || force === BTN_RESUME) {

                btnPause.val(BTN_RESUME);
                btnDelete.show();
                btnPrevious.show();
                btnNext.show();
                View.disableNextBtn();

                if (HistoryPicAction.isFirst()) {
                    View.disablePreviousBtn();
                } else {
                    View.enablePreviousBtn();
                }


            } else if ((!isPaused && !force) || force === BTN_PAUSE) {

                btnPause.val(BTN_PAUSE);
                btnDelete.hide();
                btnPrevious.hide();
                btnNext.hide();

            }
        }, // End function toggleStatePauseBtn()

        /**
         *
         */
        enablePreviousBtn: function () {
            _els.btnPrevious.button('enable');
        }, // End function enablePreviousBtn()

        /**
         *
         */
        disablePreviousBtn: function () {
            _els.btnPrevious.button('disable');
        }, // End function disablePreviousBtn()

        /**
         *
         */
        enableNextBtn: function () {
            _els.btnNext.button('enable');
        }, // End function enableNextBtn()

        /**
         *
         */
        disableNextBtn: function () {
            _els.btnNext.button('disable');
        } // End function disableNextBtn()
    };

    return View;
});
