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
        viewDimension: {
            width: 0,
            height: 0
        },
        interval: null
    };

    /**
    */
    DiapoShuffle.attachEvents = function () {
        var options = DiapoShuffle.options,
            optionsCtn = options.ctn,
            resizeTimeout;

        options.startBtn = optionsCtn.find('.btn_start_options')
            .click(DiapoShuffle.start);
        options.stopBtn = optionsCtn.find('.btn_stop_options')
            .click(DiapoShuffle.stop);
        options.pauseBtn = optionsCtn.find('.btn_pause_options')
            .click(DiapoShuffle.pause);

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
        DiapoShuffle.setViewDimension();
    };

    /**
    */
    DiapoShuffle.getRandomPic = function () {
        var xhr, message,
            info = DiapoShuffle.info,
            view = DiapoShuffle.view,
            viewDimension = DiapoShuffle.viewDimension;

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
        var options = DiapoShuffle.options;

        DiapoShuffle.info.empty();

        options.pathToCustomFolder = options.customFolder.val();

        if (DiapoShuffle.interval) {
            DiapoShuffle.stop();
        }

        $('body').addClass('diapo_shuffle_view_mode');
        DiapoShuffle.getRandomPic();
    };

    /**
    */
    DiapoShuffle.stop = function () {
        DiapoShuffle.view.empty();
        DiapoShuffle.info.empty();

        DiapoShuffle.clearInterval();
        $('body').removeClass('diapo_shuffle_view_mode');
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
            var keyPressed = e.which,
                doPreventDefault = false;
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

    /**
    */
    DiapoShuffle.setViewDimension = function () {
        var viewDimension = DiapoShuffle.viewDimension,
            doc = $(document);

        viewDimension.width = doc.width();
        viewDimension.height = doc.height();
    };

    return DiapoShuffle;
});
