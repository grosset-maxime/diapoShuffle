/* global
    define
*/

define(
[
    'jquery',

    // App Views
    'App/Views/HeaderView',
    'App/Views/FooterView',
    'App/Views/OptionsView',
    'App/Views/InfosView',
    'App/Views/PlayView',

    // App Actions
    'App/Actions/GetRandomPicAction',
    'App/Actions/HistoryPicAction'
],
function (
    $,

    HeaderView,
    FooterView,
    OptionsView,
    InfosView,
    PlayView,

    GetRandomPicAction,
    HistoryPicAction
) {
    'use strict';


    let View,
        _options = {},
        _els = {};

    // Private functions.
    let _buildSkeleton, _attachEvents, _attachKeyboardShorcuts,
        _showLoading, _hideLoading, _onBeforeStart, _onStop, _onPause,
        _onResume, _onBeforeGetRandom, _onGetRandom;


    _buildSkeleton = () => {
        let mainCtn, loadingCtn, pauseIconCtn;

        mainCtn = _els.mainCtn = $('<div>', {
            'class': 'diapo_shuffle flex'
        });

        _els.headerCtn = $('<div>', {
            'class': 'ds_header_ctn flex'
        }).appendTo(mainCtn);

        _els.middleCtn = $('<div>', {
            'class': 'ds_middle_ctn flex'
        }).appendTo(mainCtn);

        _els.footerCtn = $('<div>', {
            'class': 'ds_footer_ctn flex'
        }).appendTo(mainCtn);

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

        mainCtn.append(
            loadingCtn,
            pauseIconCtn
        );

        _options.root.append(mainCtn);
    };

    _attachEvents = () => {
        let resizeTimeout;

        _attachKeyboardShorcuts();

        $(window).resize(() => {
            clearTimeout(resizeTimeout);

            resizeTimeout = setTimeout(() => {
                PlayView.getViewDimension(true);
            }, 500);
        });
    };

    _attachKeyboardShorcuts = () => {
        $(document).on('keydown', (e) => {
            let keyPressed = e.which,
                doPreventDefault = false;

            // console.log(keyPressed);

            if (GetRandomPicAction.isPlaying()) {

                switch (keyPressed) {
                case 27: // ESC
                    GetRandomPicAction.stop();
                    break;

                case 32: // SPACE
                case 80: // p (as pause)
                    if (!GetRandomPicAction.isDisabled()) {
                        GetRandomPicAction.pause();
                        doPreventDefault = true;
                    }
                    break;

                case 73: // i (as inside)
                    if (GetRandomPicAction.isPausing()) {
                        PlayView.askInsideFolder();
                    }
                    break;

                case 65: // a (as add)
                    if (GetRandomPicAction.isPausing()) {
                        PlayView.askAddFolder();
                    }
                    break;

                case 68: // d (as delete)
                    if (GetRandomPicAction.isPausing()) {
                        PlayView.askDeletePic();
                    }
                    break;

                case 37: // left arrow.
                    if (GetRandomPicAction.isPausing() && !HistoryPicAction.isFirst()) {
                        PlayView.displayPrevious();
                    }
                    break;
                case 39: // right arrow.
                    if (GetRandomPicAction.isPausing() && !HistoryPicAction.isLast()) {
                        PlayView.displayNext();
                    }
                    break;
                }

            } else {

                switch (keyPressed) {
                case 13: // Enter
                    if (OptionsView.isFolderFinderOpen()) {
                        OptionsView.closeFolderFinder();
                        doPreventDefault = true;
                    }
                    break;

                case 27: // ESC
                    if (OptionsView.isFolderFinderOpen()) {
                        OptionsView.closeFolderFinder();
                    }
                    break;

                case 32: // SPACE
                case 80: // p (as pause)
                    if (!OptionsView.hasFocus()) {
                        GetRandomPicAction.start();
                        doPreventDefault = true;
                    }
                    break;

                case 66: // b (as browse)
                    OptionsView.toggleFolderFinder();
                    break;
                }

            }

            if (doPreventDefault) {
                e.preventDefault();
            }
        });
    };

    _showLoading = () => {
        _els.loadingCtn.show();
    };

    _hideLoading = () => {
        _els.loadingCtn.hide();
    };

    _onBeforeStart = () => {
        InfosView.hide();

        GetRandomPicAction.setOptions({
            interval: OptionsView.getTimeInterval(),
            customFolders: OptionsView.getCustomFolders() || []
        });

        PlayView.toggleStatePauseBtn(PlayView.BTN_PAUSE);
        _els.pauseIconCtn.hide();
    };

    _onStop = () => {
        PlayView.hide();
        InfosView.hide();

        _els.pauseIconCtn.hide();
        _els.loadingCtn.hide();

        PlayView.toggleStatePauseBtn(PlayView.BTN_RESUME);
    };

    _onPause = () => {
        PlayView.toggleStatePauseBtn();
        _els.pauseIconCtn.show();
    };

    _onResume = () => {
        PlayView.toggleStatePauseBtn();

        _els.pauseIconCtn.hide();
    };

    _onBeforeGetRandom = () => {
        _showLoading();
    };

    _onGetRandom = (Pic, onSuccess, onFailure) => {
        _hideLoading();

        if (Pic) {
            PlayView.setPic(Pic, onSuccess, onFailure);
            HistoryPicAction.add(Pic);
        }
    };


    View = {

        init: (opts) => {
            let mainCtn;

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

            _buildSkeleton();
            mainCtn = _els.mainCtn;

            HeaderView.init({
                root: _els.headerCtn
            });

            FooterView.init({
                root: _els.footerCtn
            });

            OptionsView.init({
                root: _els.middleCtn
            });

            InfosView.init({
                root: mainCtn
            });

            PlayView.init({
                root: mainCtn,
                mainView: View
            });

            GetRandomPicAction.init({
                events: {
                    onBeforeStart: _onBeforeStart,
                    onStop: _onStop,
                    onPause: _onPause,
                    onResume: _onResume,
                    onBeforeGetRandom: _onBeforeGetRandom,
                    onGetRandom: _onGetRandom
                }
            });

            HistoryPicAction.init({
                events: {
                    onFirst: () => {
                        PlayView.disablePreviousBtn();
                        PlayView.enableNextBtn();
                    },
                    onLast: () => {
                        PlayView.disableNextBtn();
                        PlayView.enablePreviousBtn();
                    },
                    onMiddle: () => {
                        PlayView.enablePreviousBtn();
                        PlayView.enableNextBtn();
                    }
                }
            });

            _attachEvents();
        },

        onBeforeDelete: () => {
            _els.pauseIconCtn.hide();
            _showLoading();
        },

        onDelete: () => {
            _hideLoading();
        }
    };

    return View;
});
