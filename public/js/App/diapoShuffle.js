/*global
    define, console
*/

define([
    'jquery'
], function ($) {
    'use strict';

    var DiapoShuffle = {
        container: null,
        info: null,
        options: {
            customFolder: ''
        },
        view: null,
        interval: null
    };

    /**
    */
    DiapoShuffle.attachEvents = function () {
        var container = DiapoShuffle.container,
            options = DiapoShuffle.options;

        options.container.find('.start').click(DiapoShuffle.start);
        options.container.find('.stop').click(DiapoShuffle.stop);
    };

    /**
     */
    DiapoShuffle.init = function () {
        var container = $('.diapo_shuffle'),
            options = container.find('.options'),
            info = container.find('.info'),
            view = container.find('.view');

        DiapoShuffle.container = container;
        DiapoShuffle.options.container = options;
        DiapoShuffle.info = info;
        DiapoShuffle.view = view;

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
                'customFolder': DiapoShuffle.options.customFolder
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
        var customFolder, message,
            options = DiapoShuffle.options,
            info = DiapoShuffle.info;

        info.empty();

        customFolder = options.container.find('.custom_folder').val();
        DiapoShuffle.options.customFolder = customFolder;

        /*if (!folder) {
            message = 'Folder is empty !';
            info.html(message);
            return false;
        }*/

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

    return DiapoShuffle;
});
