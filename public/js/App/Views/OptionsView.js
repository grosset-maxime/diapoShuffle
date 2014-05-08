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
        DEFAULT_CUSTOM_FOLDER = GetRandomPicAction.DEFAULT_CUSTOM_FOLDER;

    var defaultOptions = {
            root: null
        },
        options = {},
        els = {},
        hasFocus = false,
        isPaused = false;

    /**
     *
     */
    function buildSkeleton () {
        var mainCtn, inputCustomPathFolder, customFolderCtn,
            btnStart, btnStop, btnPause, inputInterval,
            intervalCtn, inputScale, scaleCtn;

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
        .on('keyup', function (e) {

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
        });

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
            'class': 'input_interval input_text',
            value: DEFAULT_INTERVAL,
            maxlength: 2
        })
            .focus(function () {
                hasFocus = true;
            })
            .blur(function () {
                hasFocus = false;
            })
            .on('keyup', function (e) {
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
            });

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

        mainCtn.append(
            customFolderCtn,
            btnStart,
            btnStop,
            btnPause,
            intervalCtn,
            scaleCtn
        );

        options.root.append(mainCtn);

        inputInterval.spinner({
            min: 1,
            max: 60
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
                interval = parseInt(inputInterval.val(), 10) || DEFAULT_INTERVAL;

            inputInterval.spinner('value', interval);

            return interval;
        }, // End function getTimeInterval()

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
        toggleStatePauseBtn: function () {
            var btnPause = els.btnPause;

            if (isPaused) {
                btnPause.val('resume');
                isPaused = false;
            } else {
                isPaused = true;
                btnPause.val('pause');
            }
        } // End function toggleStatePauseBtn()
    };

    return View;
});
