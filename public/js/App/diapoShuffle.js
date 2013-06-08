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
        options: {
            pathToCustomFolder: ''
        },
        view: null,
        interval: null
    };

    /**
    */
    DiapoShuffle.attachEvents = function () {
        var options = DiapoShuffle.options,
            optionsCtn = options.ctn;

        options.startBtn = optionsCtn.find('.btn_start_options')
            .click(DiapoShuffle.start);
        options.stopBtn = optionsCtn.find('.btn_stop_options')
            .click(DiapoShuffle.stop);
        options.pauseBtn = optionsCtn.find('.btn_pause_options')
            .click(DiapoShuffle.pause);

        DiapoShuffle.attachKeyboardShorcuts();
    };

    /**
     */
    DiapoShuffle.init = function () {
        var ctn = $('.diapo_shuffle'),
            optionsCtn = ctn.find('.ctn_options'),
            options = DiapoShuffle.options,
            info = ctn.find('.ctn_info'),
            view = ctn.find('.ctn_view');

        DiapoShuffle.ctn = ctn;
        DiapoShuffle.info = info;
        DiapoShuffle.view = view;

        options.ctn = optionsCtn;
        options.customFolder = optionsCtn.find('.text_custom_folder_options');

        DiapoShuffle.attachEvents();
    };

    /**
    */
    DiapoShuffle.getRandomPic = function () {
        var xhr, message,
            info = DiapoShuffle.info,
            view = DiapoShuffle.view,
            timeout = DiapoShuffle.timeout;

        DiapoShuffle.clearInterval();

        xhr = $.ajax({
            url: '/?r=getRandomPic_s',
            type: 'POST',
            dataType: 'json',
            async: true,
            data: {
                'customFolder': DiapoShuffle.options.pathToCustomFolder
            }
        });

        xhr.done(function (json) {
            var img;

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
                    'src': json.pic.src || '',
                    'alt': ''
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
        var message,
            options = DiapoShuffle.options,
            info = DiapoShuffle.info;

        info.empty();

        options.pathToCustomFolder = options.customFolder.val();

        if (DiapoShuffle.interval) {
            DiapoShuffle.stop();
        }

        DiapoShuffle.getRandomPic();
    };

    /**
    */
    DiapoShuffle.stop = function () {
        var info = DiapoShuffle.info,
            view = DiapoShuffle.view;

        view.empty();
        info.empty();

        DiapoShuffle.clearInterval();
    };

    /**
    */
    DiapoShuffle.pause = function () {
        var pauseBtn = DiapoShuffle.options.pauseBtn;

        if (DiapoShuffle.interval) {
            pauseBtn.val('resume');
            DiapoShuffle.clearInterval();
        } else {
            pauseBtn.val('pause');
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
            var keyPressed = e.which, doPreventDefault = false;
            // console.log(keyPressed);
            switch (keyPressed) {
            case 27: // ESC
                DiapoShuffle.stop();
                break;
            case 32: // SPACE
                doPreventDefault = true;
                DiapoShuffle.pause();
                break;
            }

            if (doPreventDefault) {
                e.preventDefault();
            }
        });
    };

    return DiapoShuffle;
});
