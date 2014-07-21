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
    'App/Actions/DeletePicAction'
],
function ($, HeaderView, FooterView, OptionsView, InfosView, PlayView, GetRandomPicAction, DeletePicAction) {
    'use strict';

    /**
     *
     */
    var defaultOptions = {
            root: null
        },
        options = {},
        els = {};

    /**
     *
     */
    function buildSkeleton () {
        var mainCtn, loadingCtn, pauseIconCtn;

        mainCtn = els.mainCtn = $('<div>', {
            'class': 'diapo_shuffle flex'
        });

        els.headerCtn = $('<div>', {
            'class': 'ds_header_ctn flex'
        }).appendTo(mainCtn);

        els.middleCtn = $('<div>', {
            'class': 'ds_middle_ctn flex'
        }).appendTo(mainCtn);

        els.footerCtn = $('<div>', {
            'class': 'ds_footer_ctn flex'
        }).appendTo(mainCtn);

        // Loading
        // -------
        loadingCtn = els.loadingCtn = $('<div>', {
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
        pauseIconCtn = els.pauseIconCtn = $('<div>', {
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

        options.root.append(mainCtn);
    } // End function buildSkeleton()

    /**
     *
     */
    function attachEvents () {
        var resizeTimeout;

        attachKeyboardShorcuts();

        $(window).resize(function () {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }

            resizeTimeout = setTimeout(function () {
                PlayView.getViewDimension(true);
            }, 500);
        });
    } // End function attachEvents()

    /**
     *
     */
    function attachKeyboardShorcuts () {
        $(document).on('keydown', function (e) {
            var keyPressed = e.which,
                doPreventDefault = false;

            // console.log(keyPressed);

            if (GetRandomPicAction.isPlaying()) {

                switch (keyPressed) {
                case 27: // ESC
                    GetRandomPicAction.stop();
                    break;

                case 32: // SPACE
                case 80: // p (as pause)
                    GetRandomPicAction.pause();
                    doPreventDefault = true;
                    break;

                case 68: // d (as delete)
                    if (GetRandomPicAction.isPausing()) {
                        DeletePicAction.askDelete();
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
    } // End function attachKeyboardShorcuts()

    /**
     *
     */
    function showLoading () {
        els.loadingCtn.show();
    } // End function showLoading()

    /**
     *
     */
    function hideLoading () {
        els.loadingCtn.hide();
    } // End function hideLoading()

    /**
     *
     */
    function onBeforeStart () {
        InfosView.hide();

        GetRandomPicAction.setOptions({
            interval: OptionsView.getTimeInterval(),
            customFolders: OptionsView.getCustomFolders() || []
        });

        PlayView.toggleStatePauseBtn(PlayView.BTN_PAUSE);
        els.pauseIconCtn.hide();
    } // End function onBeforeStart()

    /**
     *
     */
    function onStop () {
        PlayView.hide();
        InfosView.hide();

        els.pauseIconCtn.hide();
        els.loadingCtn.hide();

        PlayView.toggleStatePauseBtn(PlayView.BTN_RESUME);
    } // End function onBeforeStop(),

    /**
     *
     */
    function onPause () {
        PlayView.toggleStatePauseBtn();
        els.pauseIconCtn.show();
    } // End function onBeforePause()

    /**
     *
     */
    function onResume () {
        PlayView.toggleStatePauseBtn();

        els.pauseIconCtn.hide();
    } // End function onBeforeResume()

    /**
     *
     */
    function onBeforeGetRandom () {
        showLoading();
    } // End function onBeforeGetRandom()

    /**
     *
     */
    function onGetRandom (json) {
        var pic;

        hideLoading();

        if (json.success) {
            pic = json.pic;

            InfosView.setPicFolderPath(pic.customFolderPath, pic.randomPublicPath);
            PlayView.setPic(pic);
        }
    } // End function onGetRandom()

    var View = {
        /**
         *
         */
        init: function (opts) {
            var mainCtn;

            $.extend(true, options, defaultOptions, opts || {});

            if (!options.root) {
                options.root = $(document.body);
            }

            buildSkeleton();
            mainCtn = els.mainCtn;

            HeaderView.init({
                root: els.headerCtn
            });

            FooterView.init({
                root: els.footerCtn
            });

            OptionsView.init({
                root: els.middleCtn
            });

            InfosView.init({
                root: mainCtn
            });

            PlayView.init({
                root:mainCtn
            });

            GetRandomPicAction.init({
                events: {
                    onBeforeStart: onBeforeStart,
                    onStop: onStop,
                    onPause: onPause,
                    onResume: onResume,
                    onBeforeGetRandom: onBeforeGetRandom,
                    onGetRandom: onGetRandom
                }
            });

            attachEvents();
        }
    };

    return View;
});
