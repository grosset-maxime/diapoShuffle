/* global
    define
*/

define(
[
    'jquery',
    'App/Actions/GetRandomPicAction'
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
            btnStart, btnStop, btnPause, inputInterval,
            intervalCtn, inputScale, scaleCtn, zoomCtn,
            inputZoom;

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


        mainCtn = els.mainCtn =$('<div>', {
            'class': 'ds_options_view'
        });

        // Input custom folder
        inputCustomPathFolder = els.inputCustomFolder = $('<input>', {
            'class': 'input_custom_folder input_text',
            type: 'text',
            value: DEFAULT_CUSTOM_FOLDER,
        }).focus(function () {
                hasFocus = true;
            })
        .blur(function () {
                hasFocus = false;
            })
        .on('keyup', keyUpInput);

        // Ctn custom folder
        customFolderCtn = $('<div>', {
            'class': 'el_ctn'
        })
            .append($('<label>', {
                'class': 'title',
                text: 'Folder :'
            })
                .click(function () {
                    inputCustomPathFolder.focus();
                }),
                inputCustomPathFolder
            );

        // Btn start
        btnStart = els.btnStart = $('<input>', {
            'class': 'btn el_ctn',
            type: 'button',
            value: 'start'
        })
            .click(GetRandomPicAction.start)
            .button();

        // Btn stop
        btnStop = els.btnStop = $('<input>', {
            'class': 'btn el_ctn',
            type: 'button',
            value: 'stop'
        })
            .click(GetRandomPicAction.stop)
            .button();

        // Btn pause
        btnPause = els.btnPause = $('<input>', {
            'class': 'btn el_ctn',
            type: 'button',
            value: 'pause'
        })
            .click(GetRandomPicAction.pause)
            .button();

        // Input interval
        inputInterval = els.inputInterval = $('<input>', {
            'class': 'input_interval input_spinner',
            value: DEFAULT_INTERVAL,
            maxlength: 2,
            numberFormat: 'n'
        })
            .focus(function () {
                hasFocus = true;
            })
            .blur(function () {
                hasFocus = false;
            })
            .on('keyup', keyUpInput);

        // Ctn interval
        intervalCtn = $('<div>', {
            'class': 'el_ctn'
        })
            .append($('<label>', {
                'class': 'title',
                text: 'Interval (s) :'
            })
                    .click(function () {
                        inputInterval.focus();
                    }),
                inputInterval
            );

        // Checkbox scale
        inputScale = els.inputScale = $('<input>', {
            'class': 'input_text',
            type: 'checkbox'
        });

        // Ctn scale
        scaleCtn = $('<div>', {
            'class': 'el_ctn'
        }).append(
            inputScale,
            $('<span>', {
                'class': 'title',
                text: 'Scale'
            })
                .click(function () {
                    inputScale[0].checked = !inputScale[0].checked;
                })
        );

        // Spinner Zoom
        inputZoom = els.inputZoom = $('<input>', {
            'class': 'input_zoom input_spinner',
            value: DEFAULT_ZOOM,
            step: 0.1,
            maxlength: 2,
            numberFormat: 'n'
        })
            .focus(function () {
                hasFocus = true;
            })
            .blur(function () {
                hasFocus = false;
            })
            .on('keyup', keyUpInput);

        // Ctn Zoom
        zoomCtn = $('<div>', {
            'class': 'el_ctn'
        })
            .append($('<label>', {
                'class': 'title',
                text: 'Zoom :'
            })
                    .click(function () {
                        inputZoom.focus();
                    }),
                inputZoom
            );

        mainCtn.append(
            customFolderCtn,
            btnStart,
            btnStop,
            btnPause,
            intervalCtn,
            zoomCtn,
            scaleCtn
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
        toggleStatePauseBtn: function (force) {
            var btnPause = els.btnPause,
                isPaused = GetRandomPicAction.isPausing();

            if ((isPaused && !force) || force === 'resume') {
                btnPause.val('resume');
            } else if ((!isPaused && !force) || force === 'pause') {
                btnPause.val('pause');
            }
        } // End function toggleStatePauseBtn()
    };

    return View;
});
