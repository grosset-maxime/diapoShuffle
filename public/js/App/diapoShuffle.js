/*global
    define, console
*/

define([
    'jquery'
], function ($) {
    'use strict';

    var DiapoShuffle = {
        ctn: null,
        info: null,
        optionsCtn: {
            pathToCustomFolder: '',
            hasFocus: false
        },
        view: null,
        viewDimension: {
            width: 0,
            height: 0
        },
        interval: null
    };

    /**
     */
    DiapoShuffle.init = function (options) {
        DiapoShuffle.options = options || {};

        DiapoShuffle.buildSkeleton(options.buildInCtn);

        DiapoShuffle.attachEvents();
        DiapoShuffle.setViewDimension();
    };

    /**
    */
    DiapoShuffle.buildSkeleton = function (buildInCtn) {
        var mainCtn, infoCtn, inputCustomPathFolder, btnStartOptions,
            btnStopOptions, btnPauseOptions, viewCtn, ctnOptions,
            loadingCtn, pauseIconCtn,
            optionsCtn = DiapoShuffle.optionsCtn;

        mainCtn = DiapoShuffle.mainCtn = $('<div>').attr({
            'class': 'diapo_shuffle'
        });

        infoCtn = DiapoShuffle.infoCtn = $('<div>').attr({
            'class': 'ctn_info'
        });

        ctnOptions = $('<div>').attr({
            'class': 'ctn_options'
        });

        inputCustomPathFolder = optionsCtn.customFolder = $('<input>').attr({
            'class': 'text_custom_folder_options text_options',
            'type': 'text'
        }).focus(function () {
            DiapoShuffle.optionsCtn.hasFocus = true;
        }).blur(function () {
            DiapoShuffle.optionsCtn.hasFocus = false;
        });

        btnStartOptions = optionsCtn.btnStartOptions = $('<input>').attr({
            'class': 'btn_start_options btn_options',
            'type': 'button',
            'value': 'start'
        }).click(DiapoShuffle.start);

        btnStopOptions = optionsCtn.btnStopOptions = $('<input>').attr({
            'class': 'btn_stop_options btn_options',
            'type': 'button',
            'value': 'stop'
        }).click(DiapoShuffle.stop);

        btnPauseOptions = optionsCtn.btnPauseOptions = $('<input>').attr({
            'class': 'btn_pause_options btn_options',
            'type': 'button',
            'value': 'pause'
        }).click(DiapoShuffle.pause);

        loadingCtn = DiapoShuffle.loadingCtn = $('<div>').attr({
            'class': 'ctn_loading'
        }).append(
            $('<span>').attr({
                'class': 'el_loading_1 el_loading'
            }),
            $('<span>').attr({
                'class': 'el_loading_2 el_loading'
            }),
            $('<span>').attr({
                'class': 'el_loading_3 el_loading'
            })
        );

        pauseIconCtn = DiapoShuffle.pauseIconCtn = $('<div>').attr({
            'class': 'ctn_icon_pause'
        }).append(
            $('<span>').attr({
                'class': 'el_icon_pause'
            }),
            $('<span>').attr({
                'class': 'el_icon_pause'
            })
        );

        viewCtn = DiapoShuffle.viewCtn = $('<div>').attr({
            'class': 'ctn_view'
        });

        ctnOptions.append(
            'Folder : ',
            inputCustomPathFolder,
            btnStartOptions,
            btnStopOptions,
            btnPauseOptions
        );

        mainCtn.append(
            infoCtn,
            ctnOptions,
            loadingCtn,
            pauseIconCtn,
            viewCtn
        );

        if (buildInCtn) {
            buildInCtn.append(mainCtn);
        } else {
            $('body').append(mainCtn);
        }
    };

    /**
    */
    DiapoShuffle.attachEvents = function () {
        var resizeTimeout;

        DiapoShuffle.attachKeyboardShorcuts();

        $(window).resize(function () {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            resizeTimeout = setTimeout(DiapoShuffle.setViewDimension, 500);
        });
    };

    /**
    */
    DiapoShuffle.getRandomPic = function () {
        var xhr, message,
            info = DiapoShuffle.infoCtn,
            view = DiapoShuffle.viewCtn,
            viewDimension = DiapoShuffle.viewDimension;

        DiapoShuffle.clearInterval();
        DiapoShuffle.showLoading();

        xhr = $.ajax({
            url: '/?r=getRandomPic_s',
            type: 'POST',
            dataType: 'json',
            async: true,
            data: {
                'customFolder': DiapoShuffle.optionsCtn.pathToCustomFolder
            }
        });

        xhr.done(function (json) {
            var img;

            DiapoShuffle.hideLoading();

            if (json.error) {
                console.log('Error : ' + json.error.message || 'error');
                console.log(json.error);

                if (json.error.mandatory_fields_missing) {
                    info.html('mandatory fields are missing.');
                } else {
                    message = 'Unknown error.';
                    info.html(message);
                }
                return false;
            }

            if (json.success) {
                img = $('<img>').attr({
                    'class': 'random_pic',
                    'src': json.pic.src || '',
                    'alt': ''
                }).css({
                    'max-width': viewDimension.width,
                    'max-height': viewDimension.height
                });
                view.html(img);
                DiapoShuffle.setInterval();
            }
        });

        xhr.fail(function (jqXHR, textStatus) {
            console.log('error getRandomPic() : '
                + textStatus + ' / responseText : ' + jqXHR.responseText);
        });
    };

    /**
    */
    DiapoShuffle.start = function () {
        var optionsCtn = DiapoShuffle.optionsCtn;

        DiapoShuffle.infoCtn.empty();

        optionsCtn.pathToCustomFolder = optionsCtn.customFolder.val();

        if (DiapoShuffle.interval) {
            DiapoShuffle.stop();
        }

        $('body').addClass('diapo_shuffle_view_mode');
        DiapoShuffle.getRandomPic();
    };

    /**
    */
    DiapoShuffle.stop = function () {
        DiapoShuffle.viewCtn.empty();
        DiapoShuffle.infoCtn.empty();

        DiapoShuffle.pauseIconCtn.hide();
        DiapoShuffle.loadingCtn.hide();

        DiapoShuffle.clearInterval();
        $('body').removeClass('diapo_shuffle_view_mode');
    };

    /**
    */
    DiapoShuffle.pause = function () {
        var pauseBtn = DiapoShuffle.optionsCtn.btnPauseOptions,
            pauseIcon = DiapoShuffle.pauseIconCtn;

        if (DiapoShuffle.interval) {
            pauseBtn.val('resume');
            pauseIcon.stop(true, true).fadeIn('fast');
            DiapoShuffle.clearInterval();
        } else {
            pauseBtn.val('pause');
            pauseIcon.stop(true, true).fadeOut('fast');
            DiapoShuffle.start();
        }
    };

    /**
    */
    DiapoShuffle.setInterval = function () {
        DiapoShuffle.interval = setInterval(function () {
            DiapoShuffle.getRandomPic();
        }, 3000);
    };

    /**
    */
    DiapoShuffle.clearInterval = function () {
        clearInterval(DiapoShuffle.interval);
        DiapoShuffle.interval = null;
    };

    /**
    */
    DiapoShuffle.attachKeyboardShorcuts = function () {
        $(document).bind('keydown', function (e) {
            var keyPressed = e.which,
                doPreventDefault = false;
            // console.log(keyPressed);
            switch (keyPressed) {
            case 27: // ESC
                DiapoShuffle.stop();
                break;
            case 32: // SPACE
                if (!DiapoShuffle.optionsCtn.hasFocus) {
                    doPreventDefault = true;
                    DiapoShuffle.pause();
                }
                break;
            }

            if (doPreventDefault) {
                e.preventDefault();
            }
        });
    };

    /**
    */
    DiapoShuffle.setViewDimension = function () {
        var viewDimension = DiapoShuffle.viewDimension,
            doc = $(document);

        viewDimension.width = doc.width();
        viewDimension.height = doc.height();
    };

    /**
    */
    DiapoShuffle.showLoading = function () {
        DiapoShuffle.loadingCtn.stop().fadeIn('fast');
    };

    /**
    */
    DiapoShuffle.hideLoading = function () {
        DiapoShuffle.loadingCtn.stop().fadeOut('fast');
    };

    return DiapoShuffle;
});
