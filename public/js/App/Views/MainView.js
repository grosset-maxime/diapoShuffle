/* global
    define
*/

define(
[
    'jquery',
    'App/Views/OptionsView',
    'App/Actions/Action',
    'js!jquery-ui'
],
function ($, OptionsView, Action) {
    'use strict';

    /**
     *
     */
    var defaultOptions = {
            root: null
        },
        options = {},
        els = {},
        viewDimension = {
            width: 0,
            height: 0
        };

    /**
     *
     */
    function buildSkeleton () {
        var mainCtn, infoCtn, viewCtn, loadingCtn, pauseIconCtn;

        mainCtn = els.mainCtn = $('<div>', {
            'class': 'diapo_shuffle'
        });

        infoCtn = els.infoCtn = $('<div>', {
            'class': 'ctn_info'
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

        // View
        // ----
        viewCtn = els.viewCtn = $('<div>', {
            'class': 'ctn_view'
        });

        mainCtn.append(
            infoCtn,
            loadingCtn,
            pauseIconCtn,
            viewCtn
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
            resizeTimeout = setTimeout(setViewDimension, 500);
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
                Action.stop();
                break;
            case 32: // SPACE
                if (!OptionsView.hasFocus()) {
                    doPreventDefault = true;
                    Action.pause();
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
    function setViewDimension () {
        var doc = $(document);

        viewDimension.width = doc.width();
        viewDimension.height = doc.height();
    } // End function setViewDimension()

    /**
     *
     */
    function showLoading () {
        els.loadingCtn.stop().fadeIn('fast');
    } // End function showLoading()

    /**
     *
     */
    function hideLoading () {
        els.loadingCtn.stop().fadeOut('fast');
    } // End function hideLoading()

    /**
     *
     */
    function onBeforeStart () {
        els.infoCtn.empty();

        Action.setOptions({
            interval: OptionsView.getTimeInterval(),
            customFolder: OptionsView.getCustomFolder() || ''
        });
    } // End function onBeforeStart()

    /**
     *
     */
    function onBeforeStop () {
        els.viewCtn.empty();
        els.infoCtn.empty();

        els.pauseIconCtn.hide();
        els.loadingCtn.hide();
    } // End function onBeforeStop(),

    /**
     *
     */
    function onBeforePause () {
        OptionsView.toggleStatePauseBtn();
        els.pauseIconCtn
            .stop(true, true)
            .fadeIn('fast');
    } // End function onBeforePause()

    /**
     *
     */
    function onBeforeResume () {
        OptionsView.toggleStatePauseBtn();

        els.pauseIconCtn
            .stop(true, true)
            .fadeOut('fast');
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
        var scale, img, pic, widthPic, heightPic, widthView, heightView,
            newWidth, newHeight, customFolderPath, randomPublicPath;

        hideLoading();

        if (json.success) {
            pic = json.pic;
            widthPic = pic.width;
            heightPic = pic.height;
            widthView = viewDimension.width;
            heightView = viewDimension.height;

            img = $('<img>', {
                'class': 'random_pic',
                src: pic.src || ''
            }).css({
                'max-width': widthView,
                'max-height': heightView
            });

            if (scale) {
                newWidth = widthPic * heightView / heightPic;
                newHeight = widthView * heightPic / widthPic;

                if (newWidth < widthView) {
                    newWidth = widthView;
                    newHeight = widthView * heightPic / widthPic;
                    // debugger;
                } else if (widthPic < heightPic && widthPic < widthView) {
                    newWidth = widthPic * heightView / heightPic;
                    newHeight = heightView;
                } else if (widthPic === heightPic) {
                    if (heightView < widthView) {
                        newWidth = heightView;
                        newHeight = heightView;
                    } else {
                        newWidth = widthView;
                        newHeight = widthView;
                    }
                }

                if (newWidth && newHeight) {
                    img.css({
                        width: newWidth,
                        height: newHeight
                    });
                }
            }

            customFolderPath = $('<span>', {
                'class': 'custom_folder_path',
                html: pic.customFolderPath
            });

            randomPublicPath = $('<span>', {
                'class': 'random_public_path',
                html: pic.randomPublicPath
            });

            els.infoCtn.html(
                $('<div>').append(customFolderPath, randomPublicPath)
            );
            els.viewCtn.html(img);
        }
    } // End function onGetRandom()

    var View = {
        /**
         *
         */
        init: function (opts) {
            $.extend(true, options, defaultOptions, opts || {});

            if (!options.root) {
                options.root = $(document.body);
            }

            buildSkeleton();
            OptionsView.init({
                root: els.mainCtn
            });

            attachEvents();
            setViewDimension();

            Action.init({
                events: {
                    onBeforeStart: onBeforeStart,
                    onBeforeStop: onBeforeStop,
                    onBeforePause: onBeforePause,
                    onBeforeResume: onBeforeResume,
                    onBeforeGetRandom: onBeforeGetRandom,
                    onGetRandom: onGetRandom
                }
            });
        }
    };

    return View;
});
