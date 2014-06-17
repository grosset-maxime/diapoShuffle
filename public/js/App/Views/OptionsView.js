/* global
    define
*/

define(
[
    'jquery',

    // App
    'App/Actions/GetRandomPicAction',

    // Non AMD
    'js!jquery-ui'
],
function ($, GetRandomPicAction) {
    'use strict';

    var DEFAULT_INTERVAL = GetRandomPicAction.DEFAULT_INTERVAL,
        DEFAULT_CUSTOM_FOLDER = GetRandomPicAction.DEFAULT_CUSTOM_FOLDER,
        DEFAULT_ZOOM = 1;

    var defaultOptions = {
            root: null
        },
        options = {},
        els = {},
        hasFocus = false;

    /**
     *
     */
    function buildSkeleton () {
        var mainCtn, inputCustomPathFolder, customFolderCtn,
            footerCtn, btnStart, inputInterval,
            intervalCtn, inputScale, scaleCtn, zoomCtn,
            inputZoom, pathPicCtn, inputPathPic;

        /**
         *
         */
        function keyUpInput (e) {
            var keyPressed = e.which,
                doPreventDefault = false;
            // console.log(keyPressed);
            switch (keyPressed) {
            case 13: // Enter
                doPreventDefault = true;
                GetRandomPicAction.start();
                break;
            }

            if (doPreventDefault) {
                e.preventDefault();
            }
        } // End function keyUpInput()


        mainCtn = els.mainCtn = $('<div>', {
            'class': 'ds_options_view flex',
            html: $('<div>', {
                'class': 'title_view',
                'text': 'Options'
            })
        });

        mainCtn.css('max-height', options.root.height() - 160);

        footerCtn = els.footerCtn = $('<div>', {
            'class': 'footer_ctn flex'
        });

        // Input custom folder
        inputCustomPathFolder = els.inputCustomFolder = $('<input>', {
            'class': 'input_custom_folder input_text',
            type: 'text',
            value: DEFAULT_CUSTOM_FOLDER,
            on: {
                focus:function () {
                    hasFocus = true;
                },
                blur: function () {
                    hasFocus = false;
                },
                keyup: keyUpInput
            }
        });

        // Ctn custom folder
        customFolderCtn = $('<div>', {
            'class': 'el_ctn flex'
        }).append(
            $('<label>', {
                'class': 'title title_custom_folder',
                text: 'Folder :',
                on: {
                    click: function () {
                        inputCustomPathFolder.focus();
                    }
                }
            }),
            inputCustomPathFolder,
            $('<span>', {
                'class': 'clear_custom_folder',
                text: 'x',
                title: 'Clear custom folder.',
                on: {
                    click: function () {
                        inputCustomPathFolder.val('');
                    }
                }
            })
        );

        // Btn start
        btnStart = els.btnStart = $('<input>', {
            'class': 'btn start_btn',
            type: 'button',
            value: 'Start',
            on: {
                click: GetRandomPicAction.start
            }
        }).button();

        // Input interval
        inputInterval = els.inputInterval = $('<input>', {
            'class': 'input_interval input_spinner',
            value: DEFAULT_INTERVAL,
            maxlength: 2,
            numberFormat: 'n',
            on: {
                focus: function () {
                    hasFocus = true;
                },
                blur: function () {
                    hasFocus = false;
                },
                keyup: keyUpInput
            }
        });

        // Ctn interval
        intervalCtn = $('<div>', {
            'class': 'el_ctn'
        }).append(
            $('<label>', {
                'class': 'title',
                text: 'Interval (s) :',
                on: {
                    click: function () {
                        inputInterval.focus();
                    }
                }
            }),
            inputInterval
        );

        // Checkbox scale
        inputScale = els.inputScale = $('<input>', {
            'class': 'input_text',
            type: 'checkbox',
            checked: true
        });

        // Ctn scale
        scaleCtn = $('<div>', {
            'class': 'el_ctn'
        }).append(
            inputScale,
            $('<span>', {
                'class': 'title',
                text: 'Scale',
                on: {
                    click: function () {
                        inputScale[0].checked = !inputScale[0].checked;
                    }
                }
            })
        );

        // Spinner Zoom
        inputZoom = els.inputZoom = $('<input>', {
            'class': 'input_zoom input_spinner',
            value: DEFAULT_ZOOM,
            step: 0.1,
            maxlength: 2,
            numberFormat: 'n',
            on: {
                focus: function () {
                    hasFocus = true;
                },
                blur: function () {
                    hasFocus = false;
                },
                keyup: keyUpInput
            }
        });

        // Ctn Zoom
        zoomCtn = $('<div>', {
            'class': 'el_ctn'
        }).append(
            $('<label>', {
                'class': 'title',
                text: 'Zoom :',
                on: {
                    click: function () {
                        inputZoom.focus();
                    }
                }
            }),
            inputZoom
        );

                // Checkbox scale
        inputPathPic = els.inputPathPic = $('<input>', {
            'class': 'input_text',
            type: 'checkbox',
            checked: true
        });

        // Ctn scale
        pathPicCtn = $('<div>', {
            'class': 'el_ctn'
        }).append(
            inputPathPic,
            $('<span>', {
                'class': 'title',
                text: 'Display path picture',
                on: {
                    click: function () {
                        inputPathPic[0].checked = !inputPathPic[0].checked;
                    }
                }
            })
        );

        footerCtn.append(
            btnStart
        );

        mainCtn.append(
            customFolderCtn,
            intervalCtn,
            zoomCtn,
            scaleCtn,
            pathPicCtn,
            footerCtn
        );

        options.root.append(mainCtn);

        inputInterval.spinner({
            min: 1,
            max: 60
        });

        inputZoom.spinner({
            min: 1,
            max: 99
        });
    } // End function buildSkeleton()

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
        }, // End function init()

        /**
         *
         */
        hasFocus: function () {
            return hasFocus;
        }, // End function hasFocus()

        /**
         *
         */
        getTimeInterval: function () {
            var inputInterval = els.inputInterval,
                interval = inputInterval.spinner('value') || DEFAULT_INTERVAL;

            inputInterval.spinner('value', interval);

            return interval;
        }, // End function getTimeInterval()

        /**
         *
         */
        getZoom: function () {
            var inputZoom = els.inputZoom,
                zoom = inputZoom.spinner('value') || DEFAULT_ZOOM;

            inputZoom.spinner('value', zoom);

            return zoom;
        }, // End function getZoom()

        /**
         *
         */
        getCustomFolder: function () {
            var inputCustomFolder = els.inputCustomFolder,
                customFolder = inputCustomFolder.val().trim() || DEFAULT_CUSTOM_FOLDER;

            inputCustomFolder.val(customFolder);

            return customFolder;
        }, // End function getCustomFolder()

        /**
         *
         */
        isScaleOn: function () {
            return !!els.inputScale[0].checked;
        }, // End function getScale()

        /**
         *
         */
        isPublicPathOn: function () {
            return !!els.inputPathPic[0].checked;
        } // End function isPublicPathOn()
    };

    return View;
});
