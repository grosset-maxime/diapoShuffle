/*global
    define, console
*/

define([
    'jquery',
    'js!jquery-ui'
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
        interval: 3,
        idInterval: null
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
            loadingCtn, pauseIconCtn, customFolderCtn, intervalCtn,
            inputInterval,
            optionsCtn = DiapoShuffle.optionsCtn;

        mainCtn = DiapoShuffle.mainCtn = $('<div>').attr({
            'class': 'diapo_shuffle'
        });

        infoCtn = DiapoShuffle.infoCtn = $('<div>').attr({
            'class': 'ctn_info'
        });

        // Options
        // -------
        ctnOptions = $('<div>').attr({
            'class': 'ctn_options'
        });

        // Input custom folder
        inputCustomPathFolder = optionsCtn.customFolder = $('<input>').attr({
            'class': 'input_custom_folder_options input_text_options',
            'type': 'text'
        }).focus(function () {
            DiapoShuffle.optionsCtn.hasFocus = true;
        }).blur(function () {
            DiapoShuffle.optionsCtn.hasFocus = false;
        }).on('keyup', function (e) {
            var keyPressed = e.which,
                doPreventDefault = false;
            // console.log(keyPressed);
            switch (keyPressed) {
            case 13: // Enter
                doPreventDefault = true;
                DiapoShuffle.start();
                break;
            }

            if (doPreventDefault) {
                e.preventDefault();
            }
        });

        // Ctn custom folder
        customFolderCtn = $('<div>').attr({
            'class': 'el_ctn_options'
        }).append(
            $('<span>').attr({
                'class': 'title_custom_folder_options title_options'
            }).text('Folder :'),
            inputCustomPathFolder
        );

        // Btn start
        btnStartOptions = optionsCtn.btnStartOptions = $('<input>')
            .attr({
                'class': 'btn_start_options btn_options el_ctn_options',
                'type': 'button',
                'value': 'start'
            })
            .click(DiapoShuffle.start)
            .button();

        // Btn stop
        btnStopOptions = optionsCtn.btnStopOptions = $('<input>')
            .attr({
                'class': 'btn_stop_options btn_options el_ctn_options',
                'type': 'button',
                'value': 'stop'
            })
            .click(DiapoShuffle.stop)
            .button();

        // Btn pause
        btnPauseOptions = optionsCtn.btnPauseOptions = $('<input>')
            .attr({
                'class': 'btn_pause_options btn_options el_ctn_options',
                'type': 'button',
                'value': 'pause'
            })
            .click(DiapoShuffle.pause)
            .button();

        // Input interval
        inputInterval = optionsCtn.interval = $('<input>').attr({
            'class': 'input_interval_options input_text_options',
            'value': DiapoShuffle.interval,
            'maxlength': 2
        })
            .focus(function () {
                DiapoShuffle.optionsCtn.hasFocus = true;
            }).blur(function () {
                DiapoShuffle.optionsCtn.hasFocus = false;
            }).on('keyup', function (e) {
                var keyPressed = e.which,
                    doPreventDefault = false;
                // console.log(keyPressed);
                switch (keyPressed) {
                case 13: // Enter
                    doPreventDefault = true;
                    DiapoShuffle.start();
                    break;
                }

                if (doPreventDefault) {
                    e.preventDefault();
                }
            });

        // Ctn interval
        intervalCtn = $('<div>').attr({
            'class': 'el_ctn_options'
        }).append(
            $('<span>').attr({
                'class': 'title_interval_options title_options'
            }).text('Interval (s) :'),
            inputInterval
        );

        // Loading
        // -------
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

        // Pause icon
        // ----------
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

        // View
        // ----
        viewCtn = DiapoShuffle.viewCtn = $('<div>').attr({
            'class': 'ctn_view'
        });

        ctnOptions.append(
            customFolderCtn,
            btnStartOptions,
            btnStopOptions,
            btnPauseOptions,
            intervalCtn
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

        inputInterval.spinner({
            'min': 1,
            'max': 60
        });
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
            var img, error;

            DiapoShuffle.hideLoading();

            if (json.error) {
                error = json.error;
                console.log('Error : ' + (error.message || 'no error message available'));
                console.log(error);

                DiapoShuffle.stop();

                if (error.mandatory_fields_missing) {
                    info.html('Mandatory fields are missing.');
                } else if (error.wrong_custom_folder) {
                    message = 'Wrong custom folder.';
                    info.html(message);
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
        var optionsCtn = DiapoShuffle.optionsCtn,
            interval = DiapoShuffle.interval,
            inputInterval = optionsCtn.interval;

        DiapoShuffle.infoCtn.empty();

        // Get custom folder option
        optionsCtn.pathToCustomFolder = optionsCtn.customFolder.val();

        // Get interval option
        interval = parseInt(inputInterval.val(), 10) || 3;
        inputInterval.spinner('value', interval);

        if (DiapoShuffle.idInterval) {
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

        if (DiapoShuffle.idInterval) {
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
        DiapoShuffle.idInterval = setInterval(function () {
            DiapoShuffle.getRandomPic();
        }, DiapoShuffle.interval * 1000);
    };

    /**
    */
    DiapoShuffle.clearInterval = function () {
        clearInterval(DiapoShuffle.idInterval);
        DiapoShuffle.idInterval = null;
    };

    /**
    */
    DiapoShuffle.attachKeyboardShorcuts = function () {
        $(document).on('keydown', function (e) {
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
