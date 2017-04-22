/* global
    define, console
*/

define(
[
    'jquery',

    // App
    'App/Notify',

    // API
    'App/API/API',

    // Views
    'App/Views/OptionsView',
    'App/Views/InfosView',
    'App/Views/FolderFinderView',

    // Actions
    'App/Actions/PlayerAction',
    'App/Actions/HistoryPicAction',

    // Modals
    'App/Modals/AddFolderModal',
    'App/Modals/InsideFolderModal',
    'App/Modals/DeletePicModal',
    'App/Modals/TagsModal',

    // Engines
    'App/Engines/PinedPicEngine',

    // Non AMD
    'js!jquery-ui'
],
function (
    $,

    // APp
    Notify,

    // API
    API,

    // Views
    OptionsView,
    InfosView,
    FolderFinderView,

    // Actions
    PlayerAction,
    HistoryPicAction,

    // Modals
    AddFolderModal,
    InsideFolderModal,
    DeletePicModal,
    TagsModal,

    // Engines
    PinedPicEngine
) {
    'use strict';

    const BTN_PAUSE = 'Pause',
        BTN_RESUME = 'Resume',
        BTN_INSIDE = 'In',
        BTN_OUTSIDE = 'Out';

    let View,
        _options = {},
        _els = {},
        _viewDimension = {
            width: 0,
            height: 0
        };

    // Private functions.
    let _buildSkeleton, _getViewDimension, _scalePic, _onStop, _onBeforeStart,
        _zoomPic, _displayPrevious, _displayNext, _setPic, _onPause,
        _onGetPic, _setNbPinBtn, _onBeforeGetRandom, _onResume,
        _hideLoading, _showLoading, _doActionAnim;

    // Private vars.
    let _doActionTimeout;


    _buildSkeleton = () => {
        let mainCtn, cmdCtn, playCtn, pauseIconCtn, loadingCtn, actionIconCtn;

        let buildCmd = () => {
            let btnStop, btnPrevious, btnNext, btnPause, btnDelete,
                btnInside, btnAddFolder, btnPin, btnUnPin;

            // Btn delete
            btnDelete = _els.btnDelete = $('<input>', {
                'class': 'btn delete_btn',
                type: 'button',
                value: 'Delete',
                on: {
                    click: View.askDeletePic
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
                    click: PlayerAction.stop
                }
            }).button();

            // Btn pause
            btnPause = _els.btnPause = $('<input>', {
                'class': 'btn pause_btn',
                type: 'button',
                value: BTN_PAUSE,
                on: {
                    click: PlayerAction.pause
                }
            }).button();

            // Btn pause
            btnInside = _els.btnInside = $('<input>', {
                'class': 'btn inside_btn',
                type: 'button',
                value: BTN_INSIDE,
                on: {
                    click: View.askInsideFolder
                }
            }).button();

            // Btn pause
            btnAddFolder = _els.btnAddFolder = $('<input>', {
                'class': 'btn addfolder_btn',
                type: 'button',
                value: 'Add',
                on: {
                    click: View.askAddFolder
                }
            }).button();

            // Btn pin
            btnPin = _els.btnPin = $('<input>', {
                'class': 'btn pin_btn',
                type: 'button',
                value: 'Pin',
                on: {
                    click: View.pin
                }
            }).button();

            btnUnPin = _els.btnUnPin = $('<input>', {
                'class': 'btn unpin_btn',
                type: 'button',
                value: 'Unpin',
                on: {
                    click: View.unPin
                }
            })
                .button()
                .hide();

            cmdCtn.append(
                btnDelete, btnPrevious,
                btnNext,
                btnStop,
                btnPause,
                btnInside,
                btnAddFolder,
                btnPin,
                btnUnPin
            );
        }; // End function buildCmd()


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

        // Loading
        // -------
        loadingCtn = _els.loadingCtn = $('<div>', {
            'class': 'ctn_loading'
        }).append(
            $('<span>', {
                'class': 'el_loading_1 el_loading'
            }),
            $('<span>', {
                'class': 'el_loading_2 el_loading'
            }),
            $('<span>', {
                    'class': 'el_loading_3 el_loading'
                })
        );

        // Pause icon
        // ----------
        pauseIconCtn = _els.pauseIconCtn = $('<div>', {
            'class': 'ctn_icon_pause'
        }).append(
            $('<span>', {
                'class': 'el_icon_pause'
            }),
            $('<span>', {
                'class': 'el_icon_pause'
            })
        );

        actionIconCtn = _els.actionIconCtn = $('<div>', {
            'class': 'ctn_icon_action'
        });

        mainCtn.append(
            loadingCtn,
            pauseIconCtn,
            actionIconCtn,
            cmdCtn,
            playCtn
        );

        buildCmd();

        _options.root.append(mainCtn);
    }; // End function _buildSkeleton()

    _getViewDimension = () => {
        let doc = $(document);

        _viewDimension.width = doc.width();
        _viewDimension.height = doc.height();
    };

    /**
     * @param {Object} picInfos -
     * @param {Element} picEl -
     */
    _scalePic = (picInfos, picEl) => {
        let cssObj, dw, dh,
            widthPic = picInfos.width || 0,
            heightPic = picInfos.height || 0,
            widthView = _viewDimension.width,
            heightView = _viewDimension.height;

        if (!widthPic || !heightPic) {
            return;
        }

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
    };

    /**
     * @param {Object} picInfos -
     * @param {Element} picEl -
     */
    _zoomPic = (picInfos, picEl) => {
        let widthPic = picInfos.width || 0,
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
    };

    _displayPrevious = () => {
        if (HistoryPicAction.isFirst()) {
            return;
        }

        if (!PlayerAction.isPausing()) {
            PlayerAction.pause();
        }

        _setPic(HistoryPicAction.getPrevious());
    };

    _displayNext = () => {
        if (HistoryPicAction.isLast()) {

            PlayerAction.pause();
            PlayerAction.start();

        } else {
            _setPic(HistoryPicAction.getNext());
        }
    };

    /**
     * @param {Object} pic -
     * @param {Function} onSuccess -
     * @param {Function} onFailure -
     */
    _setPic = (pic, onSuccess, onFailure) => {
        let img = _els.img;

        if (img) {
            img.remove();
        }

        img = _els.img = $('<img>', {
            'class': 'random_pic',
            src: pic.src || '',
        })
            .on({
                load: () => {
                    let imgEl;

                    if (!pic.width || !pic.height) {
                        imgEl = img[0];
                        pic.width = imgEl.naturalWidth;
                        pic.height = imgEl.naturalHeight;
                        _scalePic(pic, img);
                    }

                    View.show();
                    onSuccess && onSuccess();
                },
                error: () => {
                    console.error && console.error('Cannot display pic: "' + pic.src + '"');
                    onFailure && onFailure(pic);
                }
            })
            .css({
                'max-width': _viewDimension.width,
                'max-height': _viewDimension.height
            });

        if (OptionsView.isScaleOn()) {
            _scalePic(pic, img);
        } else if (OptionsView.getZoom() > 1) {
            _zoomPic(pic, img);
        }

        _els.playCtn.html(img);

        View.currentPic = pic;

        InfosView.show(pic);
    };

    _showLoading = () => {
        _els.loadingCtn.show();
    };

    _hideLoading = () => {
        _els.loadingCtn.hide();
    };

    _onBeforeStart = () => {
        let isPlayPined = OptionsView.isPlayPinedOn();

        PlayerAction.setOptions({
            interval: OptionsView.getTimeInterval(),
            customFolders: OptionsView.getCustomFolders() || [],
            playPined: isPlayPined,
            playTags: OptionsView.getSelectedTags(),
            playTypes: OptionsView.getSelectedTypes(),
            tagsOperator: OptionsView.getTagsOperator()
        });

        View.toggleStatePauseBtn(View.BTN_PAUSE);

        InfosView.hide();
        _els.pauseIconCtn.hide();

        if (isPlayPined) {
            _els.btnUnPin.show();
        } else {
            _els.btnUnPin.hide();
        }
    };

    _onStop = () => {
        View.hide();
        InfosView.hide();

        _els.pauseIconCtn.hide();
        _els.loadingCtn.hide();

        View.toggleStatePauseBtn(View.BTN_RESUME);
    };

    _onPause = () => {
        View.toggleStatePauseBtn();
        _els.pauseIconCtn.show();
    };

    _onResume = () => {
        View.toggleStatePauseBtn();

        _els.pauseIconCtn.hide();
    };

    _onBeforeGetRandom = () => {
        _showLoading();
    };

    _onGetPic = (Pic, onSuccess, onFailure) => {
        _hideLoading();

        if (Pic) {
            _setPic(Pic, onSuccess, onFailure);
        }
    };

    _setNbPinBtn = (nb) => {
        _els.btnPin.attr('value', 'pin (' + nb + ')');
    };

    _doActionAnim = () => {
        let actionIconCtn = _els.actionIconCtn;

        clearTimeout(_doActionTimeout);
        actionIconCtn.removeClass('anim');

        setTimeout(() => {
            actionIconCtn.addClass('anim');
        });

        _doActionTimeout = setTimeout(() => {
            actionIconCtn.removeClass('anim');
        }, 1000);
    };

    View = {

        currentPic: null,

        /**
         *
         */
        BTN_PAUSE: BTN_PAUSE,

        /**
         *
         */
        BTN_RESUME: BTN_RESUME,

        /**
         * @param {Object} opts -
         */
        init: (opts) => {
            _options = {};

            $.extend(
                true,
                _options,
                {
                    root: null
                },
                opts || {}
            );

            if (!_options.root) {
                _options.root = $(document.body);
            }

            _getViewDimension();

            _buildSkeleton();

            PlayerAction.init({
                events: {
                    onBeforeStart: _onBeforeStart,
                    onStop: _onStop,
                    onPause: _onPause,
                    onResume: _onResume,
                    onBeforeGetRandom: _onBeforeGetRandom,
                    onGetPic: _onGetPic,
                    onResetInsideFolder: OptionsView.resetInsideFolder,
                    onAddCustomFolder: OptionsView.addCustomFolder
                }
            });

            HistoryPicAction.init({
                events: {
                    onFirst: () => {
                        View.disablePreviousBtn();
                        View.enableNextBtn();
                    },
                    onLast: () => {
                        View.disableNextBtn();
                        View.enablePreviousBtn();
                    },
                    onMiddle: () => {
                        View.enablePreviousBtn();
                        View.enableNextBtn();
                    }
                }
            });

            PinedPicEngine.init({
                events: {
                    onFirst: () => {
                        View.disablePreviousBtn();
                        View.enableNextBtn();
                    },
                    onLast: () => {
                        View.disableNextBtn();
                        View.enablePreviousBtn();
                    },
                    onMiddle: () => {
                        View.enablePreviousBtn();
                        View.enableNextBtn();
                    },
                    onAdd: OptionsView.onAddPined,
                    onRemove: OptionsView.onRemovePined,
                    onClear: () => {
                        _setNbPinBtn(0);
                        OptionsView.onClearPined();
                    }
                }
            });
        },

        askDeletePic: () => {
            if (!PlayerAction.isPausing()) {
                PlayerAction.pause();
            }

            DeletePicModal.ask({
                onClose: function () {
                    PlayerAction.enable();
                },
                onOpen: function () {
                    PlayerAction.disable();
                },
                onDelete: function () {
                    _els.pauseIconCtn.hide();
                    _showLoading();

                    API.deletePic({
                        Pic: HistoryPicAction.getCurrent(),
                        onSuccess: () => {
                            _hideLoading();
                            _els.pauseIconCtn.show();
                            HistoryPicAction.remove();
                            PlayerAction.enable();
                            _displayNext();
                        },
                        onFailure: (error) => {
                            Notify.error({ message: error });
                        }
                    });

                }
            });
        },

        askTags: () => {
            let Pic = HistoryPicAction.getCurrent();

            if (!PlayerAction.isPausing()) {
                PlayerAction.pause();
            }

            TagsModal.ask({
                selectedTags: Pic.getTags(),
                onClose: function () {
                    PlayerAction.enable();
                },
                onOpen: function () {
                    PlayerAction.disable();
                },
                onEnd: function (selectedTags) {
                    let previousPicTags;

                    function onResponse () {
                        _hideLoading();
                        _els.pauseIconCtn.show();
                        PlayerAction.enable();
                    }

                    _els.pauseIconCtn.hide();
                    _showLoading();

                    previousPicTags = Pic.getTags();
                    Pic.setTags(selectedTags);

                    API.setTags({
                        Pic: Pic,
                        tags: selectedTags,
                        onSuccess: () => {
                            onResponse();
                            InfosView.updateTags();
                            Pic.setTags(selectedTags);
                        },
                        onFailure: (error) => {
                            onResponse();
                            Pic.setTags(previousPicTags);
                            Notify.error({
                                message: error,
                                autoHide: false
                            });
                        }
                    });

                }
            });
        },

        askInsideFolder: () => {
            if (!PlayerAction.isPausing()) {
                PlayerAction.pause();
            }

            InsideFolderModal.ask({
                Pic: HistoryPicAction.getCurrent(),
                isInside: PlayerAction.isInside(),
                insidePath: PlayerAction.getInsideFolder(),
                onClose: () => {
                    PlayerAction.enable();
                },
                onOpen: () => {
                    PlayerAction.disable();
                },
                onInside: (insidePath) => {
                    _els.btnInside.val(BTN_OUTSIDE);
                    PlayerAction.setInsideFolder(insidePath);
                    PlayerAction.enable();
                    PlayerAction.resume();

                    OptionsView.setInsideFolder(insidePath);
                },
                onOutside: () => {
                    _els.btnInside.val(BTN_INSIDE);
                    PlayerAction.setInsideFolder();
                    PlayerAction.enable();
                    PlayerAction.resume();

                    OptionsView.resetInsideFolder();
                }
            });
        },

        askAddFolder: () => {
            if (!PlayerAction.isPausing()) {
                PlayerAction.pause();
            }

            AddFolderModal.ask({
                Pic: HistoryPicAction.getCurrent(),
                onClose: () => {
                    PlayerAction.enable();
                },
                onOpen: () => {
                    PlayerAction.disable();
                },
                onAdd: (addPath) => {
                    FolderFinderView.clearUI();
                    PlayerAction.addCustomFolder(addPath);
                    PlayerAction.enable();
                    _displayNext();
                }
            });
        },

        displayPrevious: _displayPrevious,

        displayNext: _displayNext,

        pin: () => {
            PinedPicEngine.add(View.currentPic);
            _setNbPinBtn(PinedPicEngine.getNbPined());
            _doActionAnim();
        },

        unPin: () => {
            PinedPicEngine.remove();
            _setNbPinBtn(PinedPicEngine.getNbPined());
            _displayNext();
            _doActionAnim();
        },

        /**
         * @param {Boolean} force -
         */
        getViewDimension: (force) => {
            if (force) {
                _getViewDimension();
            }

            return _viewDimension;
        },

        show: () => {
            _els.mainCtn.show();
        },

        hide: () => {
            _els.mainCtn.hide();
        },

        /**
         * @param {Boolean} force -
         */
        toggleStatePauseBtn: (force) => {
            let btnPause = _els.btnPause,
                btnDelete = _els.btnDelete,
                btnPrevious = _els.btnPrevious,
                btnNext = _els.btnNext,
                btnInside = _els.btnInside,
                isPaused = PlayerAction.isPausing();

            if ((isPaused && !force) || force === BTN_RESUME) {

                btnPause.val(BTN_RESUME);
                btnDelete.show();
                btnPrevious.show();
                btnNext.show();
                btnInside.show();

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
                btnInside.hide();

            }
        },

        enablePreviousBtn: () => {
            _els.btnPrevious.button('enable');
        },

        disablePreviousBtn: () => {
            _els.btnPrevious.button('disable');
        },

        enableNextBtn: () => {
            _els.btnNext.button('enable');
        },

        disableNextBtn: () => {
            _els.btnNext.button('disable');
        }
    };

    return View;
});