/*global
    define, console
*/

define([
    'jquery',
    'js!jquery-ui'
], function ($) {
    'use strict';

    var DiapoShuffle = {
        optionsCtn: {
            pathToCustomFolder: '',
            hasFocus: false
        },
        viewDimension: {
            width: 0,
            height: 0
        },
        interval: 3,
        idInterval: null,
        scale: false,
        zoom: 1,

        /**
         */
        init: function (options) {
            DiapoShuffle.options = options || {};

            DiapoShuffle.buildSkeleton(options.buildInCtn);

            DiapoShuffle.attachEvents();
            DiapoShuffle.setViewDimension();
        },

        /**
         */
        buildSkeleton: function (buildInCtn) {
            var mainCtn, infoCtn, inputCustomPathFolder, btnStartOptions,
                btnStopOptions, btnPauseOptions, viewCtn, ctnOptions,
                loadingCtn, pauseIconCtn, customFolderCtn, intervalCtn,
                inputInterval, inputScale, scaleCtn,
                optionsCtn = DiapoShuffle.optionsCtn;

            mainCtn = DiapoShuffle.mainCtn = $('<div>', {
                'class': 'diapo_shuffle'
            });

            infoCtn = DiapoShuffle.infoCtn = $('<div>', {
                'class': 'ctn_info'
            });

            // Options
            // -------
            ctnOptions = $('<div>', {
                'class': 'ctn_options'
            });

            // Input custom folder
            inputCustomPathFolder = optionsCtn.customFolder = $('<input>', {
                'class': 'input_custom_folder_options input_text_options',
                type: 'text'
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
            customFolderCtn = $('<div>', {
                'class': 'el_ctn_options'
            })
                .append(
                    $('<label>', {
                        'class': 'title_custom_folder_options title_options',
                        text: 'Folder :'
                    })
                        .click(function () {
                            inputCustomPathFolder.focus();
                        }),
                    inputCustomPathFolder
                );

            // Btn start
            btnStartOptions = optionsCtn.btnStartOptions = $('<input>', {
                'class': 'btn_start_options btn_options el_ctn_options',
                type: 'button',
                value: 'start'
            })
                .click(DiapoShuffle.start)
                .button();

            // Btn stop
            btnStopOptions = optionsCtn.btnStopOptions = $('<input>', {
                'class': 'btn_stop_options btn_options el_ctn_options',
                type: 'button',
                value: 'stop'
            })
                .click(DiapoShuffle.stop)
                .button();

            // Btn pause
            btnPauseOptions = optionsCtn.btnPauseOptions = $('<input>', {
                'class': 'btn_pause_options btn_options el_ctn_options',
                type: 'button',
                value: 'pause'
            })
                .click(DiapoShuffle.pause)
                .button();

            // Input interval
            inputInterval = optionsCtn.interval = $('<input>', {
                'class': 'input_interval_options input_text_options',
                value: DiapoShuffle.interval,
                maxlength: 2
            })
                .focus(function () {
                    DiapoShuffle.optionsCtn.hasFocus = true;
                })
                .blur(function () {
                    DiapoShuffle.optionsCtn.hasFocus = false;
                })
                .on('keyup', function (e) {
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
            intervalCtn = $('<div>', {
                'class': 'el_ctn_options'
            })
                .append(
                    $('<label>', {
                        'class': 'title_interval_options title_options',
                        text: 'Interval (s) :'
                    })
                        .click(function () {
                            inputInterval.focus();
                        }),
                    inputInterval
                );

            // Checkbox scale
            inputScale = optionsCtn.scale = $('<input>', {
                'class': 'input_interval_options input_text_options',
                type: 'checkbox'
            });

            // Ctn scale
            scaleCtn = $('<div>', {
                'class': 'el_ctn_options'
            }).append(
                inputScale,
                $('<span>', {
                    'class': 'title_scale_options title_options',
                    text: 'Scale'
                })
                    .click(function () {
                        inputScale[0].checked = !inputScale[0].checked;
                    })
            );

            // Loading
            // -------
            loadingCtn = DiapoShuffle.loadingCtn = $('<div>', {
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
            pauseIconCtn = DiapoShuffle.pauseIconCtn = $('<div>', {
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
            viewCtn = DiapoShuffle.viewCtn = $('<div>', {
                'class': 'ctn_view'
            });

            ctnOptions.append(
                customFolderCtn,
                btnStartOptions,
                btnStopOptions,
                btnPauseOptions,
                intervalCtn,
                scaleCtn
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
                $(document.body).append(mainCtn);
            }

            inputInterval.spinner({
                min: 1,
                max: 60
            });
        },

        /**
         */
        attachEvents: function () {
            var resizeTimeout;

            DiapoShuffle.attachKeyboardShorcuts();

            $(window).resize(function () {
                if (resizeTimeout) {
                    clearTimeout(resizeTimeout);
                }
                resizeTimeout = setTimeout(DiapoShuffle.setViewDimension, 500);
            });
        },

        /**
         */
        getRandomPic: function () {
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
                    customFolder: DiapoShuffle.optionsCtn.pathToCustomFolder
                }
            });

            xhr.done(function (json) {
                var img, error, pic, widthPic, heightPic, widthView, heightView,
                    newWidth, newHeight;

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

                    if (DiapoShuffle.scale) {
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

                    view.html(img);

                    DiapoShuffle.setInterval();
                }
            });

            xhr.fail(function (jqXHR, textStatus) {
                console.log('error getRandomPic() : '
                    + textStatus + ' / responseText : ' + jqXHR.responseText);
            });
        },

        /**
         */
        start: function () {
            var optionsCtn = DiapoShuffle.optionsCtn,
                interval = DiapoShuffle.interval,
                inputInterval = optionsCtn.interval;

            DiapoShuffle.infoCtn.empty();

            // Get custom folder option
            optionsCtn.pathToCustomFolder = optionsCtn.customFolder.val();

            // Get interval option
            interval = parseInt(inputInterval.val(), 10) || 3;
            inputInterval.spinner('value', interval);

            // Get scale option
            DiapoShuffle.scale = !!optionsCtn.scale[0].checked;

            if (DiapoShuffle.idInterval) {
                DiapoShuffle.stop();
            }

            $(document.body).addClass('diapo_shuffle_view_mode');
            DiapoShuffle.getRandomPic();
        },

        /**
         */
        stop: function () {
            DiapoShuffle.viewCtn.empty();
            DiapoShuffle.infoCtn.empty();

            DiapoShuffle.pauseIconCtn.hide();
            DiapoShuffle.loadingCtn.hide();

            DiapoShuffle.clearInterval();
            $(document.body).removeClass('diapo_shuffle_view_mode');
        },

        /**
         */
        pause: function () {
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
        },

        /**
         */
        setInterval: function () {
            DiapoShuffle.idInterval = setInterval(function () {
                DiapoShuffle.getRandomPic();
            }, DiapoShuffle.interval * 1000);
        },

        /**
         */
        clearInterval: function () {
            clearInterval(DiapoShuffle.idInterval);
            DiapoShuffle.idInterval = null;
        },

        /**
         */
        attachKeyboardShorcuts: function () {
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
        },

        /**
         */
        setViewDimension: function () {
            var viewDimension = DiapoShuffle.viewDimension,
                doc = $(document);

            viewDimension.width = doc.width();
            viewDimension.height = doc.height();
        },

        /**
         */
        showLoading: function () {
            DiapoShuffle.loadingCtn.stop().fadeIn('fast');
        },

        /**
         */
        hideLoading: function () {
            DiapoShuffle.loadingCtn.stop().fadeOut('fast');
        }
    };

    return DiapoShuffle;
});
