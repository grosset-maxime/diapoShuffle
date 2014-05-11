/* global
    define
*/

define(
[
    'jquery',
    'App/Views/OptionsView',
    'App/Views/InfosView',
    'App/Views/PlayView',
    'App/Actions/GetRandomPicAction',
    'js!jquery-ui'
],
function ($, OptionsView, InfosView, PlayView, GetRandomPicAction) {
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
            'class': 'diapo_shuffle'
        });

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
            switch (keyPressed) {
            case 27: // ESC
                GetRandomPicAction.stop();
                break;
            case 32: // SPACE
                if (!OptionsView.hasFocus()) {
                    doPreventDefault = true;

                    if (GetRandomPicAction.isPlaying()) {
                        GetRandomPicAction.pause();
                    } else {
                        GetRandomPicAction.start();
                    }
                }
                break;
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
            customFolder: OptionsView.getCustomFolder() || ''
        });

        OptionsView.toggleStatePauseBtn('pause');
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

        OptionsView.toggleStatePauseBtn('pause');
    } // End function onBeforeStop(),

    /**
     *
     */
    function onPause () {
        OptionsView.toggleStatePauseBtn();
        els.pauseIconCtn.show();
    } // End function onBeforePause()

    /**
     *
     */
    function onResume () {
        OptionsView.toggleStatePauseBtn();

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

            OptionsView.init({
                root: mainCtn
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
