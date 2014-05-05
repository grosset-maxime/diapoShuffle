/* global
    define, console
*/

define(
[
    'jquery',
    'App/Views/OptionsView',
    'js!jquery-ui'
],
function ($, OptionsView) {
    'use strict';

    /**
     *
     */
    var defaultOptions = {
            root: null
        },
        options = {},
        els = {},
        optionsCtn = {
            pathToCustomFolder: '',
            hasFocus: false
        },
        viewDimension = {
            width: 0,
            height: 0
        },
        interval = 3,
        idInterval = null,
        scale = false;

    /**
     *
     */
    function buildSkeleton () {
        var mainCtn, infoCtn, inputCustomPathFolder, btnStartOptions,
            btnStopOptions, btnPauseOptions, viewCtn, ctnOptions,
            loadingCtn, pauseIconCtn, customFolderCtn, intervalCtn,
            inputInterval, inputScale, scaleCtn;

        mainCtn = $('<div>', {
            'class': 'diapo_shuffle'
        });

        infoCtn = els.infoCtn = $('<div>', {
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
                optionsCtn.hasFocus = true;
            })
        .blur(function () {
                optionsCtn.hasFocus = false;
            })
        .on('keyup', function (e) {

            var keyPressed = e.which,
                doPreventDefault = false;
            // console.log(keyPressed);
            switch (keyPressed) {
            case 13: // Enter
                doPreventDefault = true;
                start();
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
            .append($('<label>', {
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
            .click(start.bind())
            .button();

        // Btn stop
        btnStopOptions = optionsCtn.btnStopOptions = $('<input>', {
            'class': 'btn_stop_options btn_options el_ctn_options',
            type: 'button',
            value: 'stop'
        })
            .click(stop.bind())
            .button();

        // Btn pause
        btnPauseOptions = optionsCtn.btnPauseOptions = $('<input>', {
            'class': 'btn_pause_options btn_options el_ctn_options',
            type: 'button',
            value: 'pause'
        })
            .click(pause.bind())
            .button();

        // Input interval
        inputInterval = optionsCtn.interval = $('<input>', {
            'class': 'input_interval_options input_text_options',
            value: interval,
            maxlength: 2
        })
            .focus(function () {
                optionsCtn.hasFocus = true;
            })
            .blur(function () {
                optionsCtn.hasFocus = false;
            })
            .on('keyup', function (e) {
                var keyPressed = e.which,
                    doPreventDefault = false;
                // console.log(keyPressed);
                switch (keyPressed) {
                case 13: // Enter
                    doPreventDefault = true;
                    start();
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
            .append($('<label>', {
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

        if (options.root) {
            options.root.append(mainCtn);
        } else {
            $(document.body).append(mainCtn);
        }

        inputInterval.spinner({
            min: 1,
            max: 60
        });
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
            resizeTimeout = setTimeout(setViewDimension.bind(), 500);
        });
    } // End function attachEvents()

    /**
     *
     */
    function getRandomPic () {
        var xhr, message,
            info = els.infoCtn,
            view = els.viewCtn;

        clearTheInterval();
        showLoading();

        xhr = $.ajax({
            url: '/?r=getRandomPic_s',
            type: 'POST',
            dataType: 'json',
            async: true,
            data: {
                customFolder: optionsCtn.pathToCustomFolder
            }
        });

        xhr.done(function (json) {
            var img, error, pic, widthPic, heightPic, widthView, heightView,
                newWidth, newHeight, customFolderPath, randomPublicPath;

            hideLoading();

            if (json.error) {
                error = json.error;
                console.log('Error : ' + (error.message || 'no error message available'));
                console.log(error);

                stop();

                if (error.mandatoryFieldsMissing) {
                    info.html('Mandatory fields are missing.');
                } else if (error.wrongCustomFolder) {
                    message = 'Wrong custom folder.';
                    info.html(message);
                } else {
                    message = 'Error: ' + error.message || 'Unknown error.';
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
                view.html(img);

                setTheInterval();
            }
        });

        xhr.fail(function (jqXHR, textStatus) {
            console.log('error getRandomPic() : ' +
                textStatus + ' / responseText : ' + jqXHR.responseText);

            stop();
        });
    } // End function getRandomPic()

    /**
     *
     */
    function start () {
        var inputInterval = optionsCtn.interval;

        els.infoCtn.empty();

        // Get custom folder option
        optionsCtn.pathToCustomFolder = optionsCtn.customFolder.val().trim();

        // Get interval option
        interval = parseInt(inputInterval.val(), 10) || 3;
        inputInterval.spinner('value', interval);

        // Get scale option
        scale = !!optionsCtn.scale[0].checked;

        if (idInterval) {
            stop();
        }

        $(document.body).addClass('diapo_shuffle_view_mode');
        getRandomPic();
    } // End function start()

    /**
     *
     */
    function stop () {
        els.viewCtn.empty();
        els.infoCtn.empty();

        els.pauseIconCtn.hide();
        els.loadingCtn.hide();

        clearTheInterval();
        $(document.body).removeClass('diapo_shuffle_view_mode');
    } // End function stop()

    /**
     *
     */
    function pause () {
        var pauseBtn = optionsCtn.btnPauseOptions,
            pauseIcon = els.pauseIconCtn;

        if (idInterval) {
            pauseBtn.val('resume');
            pauseIcon.stop(true, true).fadeIn('fast');
            clearTheInterval();
        } else {
            pauseBtn.val('pause');
            pauseIcon.stop(true, true).fadeOut('fast');
            start();
        }
    } // End function pause()

    /**
     *
     */
    function setTheInterval () {
        idInterval = setInterval(function () {
            getRandomPic();
        }, interval * 1000);
    } // End function setTheInterval()

    /**
     *
     */
    function clearTheInterval () {
        clearInterval(idInterval);
        idInterval = null;
    } // End function clearTheInterval()

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
                stop();
                break;
            case 32: // SPACE
                if (!optionsCtn.hasFocus) {
                    doPreventDefault = true;
                    pause();
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

    var View = {
        /**
         *
         */
        init: function (opts) {
            $.extend(true, options, defaultOptions, opts || {});

            buildSkeleton();
            OptionsView.init();

            attachEvents();
            setViewDimension();
        }
    };

    return View;
});
