/*global
    define, console
*/

define([
    'jquery',
    'js!jquery-ui'
], function ($) {
    'use strict';


    var DiapoShuffle = {

        /**
         *
         */
        defaultOption: {
            root: null
        },

        /**
         *
         */
        options: {},

        /**
         *
         */
        optionsCtn: {
            pathToCustomFolder: '',
            hasFocus: false
        },

        /**
         *
         */
        viewDimension: {
            width: 0,
            height: 0
        },

        /**
         *
         */
        interval: 3,

        /**
         *
         */
        idInterval: null,

        /**
         *
         */
        scale: false,

        /**
         *
         */
        zoom: 1,

        /**
         *
         */
        init: function (options) {
            $.extend(true, this.options, this.defaultOptions, options || {});

            this.buildSkeleton();

            this.attachEvents();
            this.setViewDimension();
        },

        /**
         *
         */
        buildSkeleton: function () {
            var mainCtn, infoCtn, inputCustomPathFolder, btnStartOptions,
                btnStopOptions, btnPauseOptions, viewCtn, ctnOptions,
                loadingCtn, pauseIconCtn, customFolderCtn, intervalCtn,
                inputInterval, inputScale, scaleCtn,
                that = this,
                els = {},
                optionsCtn = that.optionsCtn;

            that.els = els;

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
                    that.optionsCtn.hasFocus = true;
                })
            .blur(function () {
                    that.optionsCtn.hasFocus = false;
                })
            .on('keyup', function (e) {

                var keyPressed = e.which,
                    doPreventDefault = false;
                // console.log(keyPressed);
                switch (keyPressed) {
                case 13: // Enter
                    doPreventDefault = true;
                    that.start();
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
                .click(that.start.bind(that))
                .button();

            // Btn stop
            btnStopOptions = optionsCtn.btnStopOptions = $('<input>', {
                'class': 'btn_stop_options btn_options el_ctn_options',
                type: 'button',
                value: 'stop'
            })
                .click(that.stop.bind(that))
                .button();

            // Btn pause
            btnPauseOptions = optionsCtn.btnPauseOptions = $('<input>', {
                'class': 'btn_pause_options btn_options el_ctn_options',
                type: 'button',
                value: 'pause'
            })
                .click(that.pause.bind(that))
                .button();

            // Input interval
            inputInterval = optionsCtn.interval = $('<input>', {
                'class': 'input_interval_options input_text_options',
                value: that.interval,
                maxlength: 2
            })
                .focus(function () {
                    that.optionsCtn.hasFocus = true;
                })
                .blur(function () {
                    that.optionsCtn.hasFocus = false;
                })
                .on('keyup', function (e) {
                    var keyPressed = e.which,
                        doPreventDefault = false;
                    // console.log(keyPressed);
                    switch (keyPressed) {
                    case 13: // Enter
                        doPreventDefault = true;
                        that.start();
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
            loadingCtn = that.loadingCtn = $('<div>', {
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
            pauseIconCtn = that.pauseIconCtn = $('<div>', {
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
            viewCtn = that.els.viewCtn = $('<div>', {
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

            if (that.options.root) {
                that.options.root.append(mainCtn);
            } else {
                $(document.body).append(mainCtn);
            }

            inputInterval.spinner({
                min: 1,
                max: 60
            });
        },

        /**
         *
         */
        attachEvents: function () {
            var resizeTimeout,
                that = this;

            that.attachKeyboardShorcuts();

            $(window).resize(function () {
                if (resizeTimeout) {
                    clearTimeout(resizeTimeout);
                }
                resizeTimeout = setTimeout(that.setViewDimension.bind(that), 500);
            });
        },

        /**
         *
         */
        getRandomPic: function () {
            var xhr, message,
                that = this,
                els = that.els,
                info = els.infoCtn,
                view = els.viewCtn,
                viewDimension = that.viewDimension;

            that.clearInterval();
            that.showLoading();

            xhr = $.ajax({
                url: '/?r=getRandomPic_s',
                type: 'POST',
                dataType: 'json',
                async: true,
                data: {
                    customFolder: that.optionsCtn.pathToCustomFolder
                }
            });

            xhr.done(function (json) {
                var img, error, pic, widthPic, heightPic, widthView, heightView,
                    newWidth, newHeight, customFolderPath, randomPublicPath,
                    infoCtn = els.infoCtn;

                that.hideLoading();

                if (json.error) {
                    error = json.error;
                    console.log('Error : ' + (error.message || 'no error message available'));
                    console.log(error);

                    that.stop();

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

                    if (that.scale) {
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

                    infoCtn.html(
                        $('<div>').append(customFolderPath, randomPublicPath)
                    );
                    view.html(img);

                    that.setInterval();
                }
            });

            xhr.fail(function (jqXHR, textStatus) {
                console.log('error getRandomPic() : ' +
                    textStatus + ' / responseText : ' + jqXHR.responseText);

                that.stop();
            });
        },

        /**
         *
         */
        start: function () {
            var optionsCtn = this.optionsCtn,
                interval = this.interval,
                inputInterval = optionsCtn.interval;

            this.els.infoCtn.empty();

            // Get custom folder option
            optionsCtn.pathToCustomFolder = optionsCtn.customFolder.val().trim();

            // Get interval option
            this.interval = interval = parseInt(inputInterval.val(), 10) || 3;
            inputInterval.spinner('value', interval);

            // Get scale option
            this.scale = !!optionsCtn.scale[0].checked;

            if (this.idInterval) {
                this.stop();
            }

            $(document.body).addClass('diapo_shuffle_view_mode');
            this.getRandomPic();
        },

        /**
         *
         */
        stop: function () {
            this.els.viewCtn.empty();
            this.els.infoCtn.empty();

            this.pauseIconCtn.hide();
            this.loadingCtn.hide();

            this.clearInterval();
            $(document.body).removeClass('diapo_shuffle_view_mode');
        },

        /**
         *
         */
        pause: function () {
            var pauseBtn = this.optionsCtn.btnPauseOptions,
                pauseIcon = this.pauseIconCtn;

            if (this.idInterval) {
                pauseBtn.val('resume');
                pauseIcon.stop(true, true).fadeIn('fast');
                this.clearInterval();
            } else {
                pauseBtn.val('pause');
                pauseIcon.stop(true, true).fadeOut('fast');
                this.start();
            }
        },

        /**
         *
         */
        setInterval: function () {
            var that = this;

            that.idInterval = setInterval(function () {
                that.getRandomPic();
            }, that.interval * 1000);
        },

        /**
         *
         */
        clearInterval: function () {
            clearInterval(this.idInterval);
            this.idInterval = null;
        },

        /**
         *
         */
        attachKeyboardShorcuts: function () {
            var that = this;

            $(document).on('keydown', function (e) {
                var keyPressed = e.which,
                    doPreventDefault = false;
                // console.log(keyPressed);
                switch (keyPressed) {
                case 27: // ESC
                    that.stop();
                    break;
                case 32: // SPACE
                    if (!that.optionsCtn.hasFocus) {
                        doPreventDefault = true;
                        that.pause();
                    }
                    break;
                }

                if (doPreventDefault) {
                    e.preventDefault();
                }
            });
        },

        /**
         *
         */
        setViewDimension: function () {
            var viewDimension = this.viewDimension,
                doc = $(document);

            viewDimension.width = doc.width();
            viewDimension.height = doc.height();
        },

        /**
         *
         */
        showLoading: function () {
            this.loadingCtn.stop().fadeIn('fast');
        },

        /**
         *
         */
        hideLoading: function () {
            this.loadingCtn.stop().fadeOut('fast');
        }
    };

    return DiapoShuffle;
});
