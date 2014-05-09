/* global
    define, console
*/

define(
[
    'jquery'
],
function ($) {
    'use strict';

    var DEFAULT_INTERVAL = 3,
        DEFAULT_CUSTOM_FOLDER = '',
        VIEW_MODE_CLASS = 'diapo_shuffle_view_mode';

    var defaultOptions = {
            interval: DEFAULT_INTERVAL,
            customFolder: DEFAULT_CUSTOM_FOLDER,
            events: {
                onBeforeStart: null,
                onStart: null,
                onBeforePause: null,
                onPause: null,
                onBeforeResume: null,
                onResume: null,
                onBeforeStop: null,
                onStop: null,
                onBeforeGetRandom: null,
                onGetRandom: null,
                toto: null
            }
        },
        options = {},
        idInterval;

    /**
     *
     */
    function setTheInterval () {
        idInterval = setInterval(function () {
            getRandomPic();
        }, options.interval * 1000);
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
    function start () {
        var onBeforeStart = options.events.onBeforeStart;

        if ($.isFunction(onBeforeStart)) {
            onBeforeStart();
        }

        if (idInterval) {
            stop();
        }

        $(document.body).addClass(VIEW_MODE_CLASS);
        getRandomPic();
    } // End function start()

    /**
     *
     */
    function stop () {
        var onBeforeStop = options.events.onBeforeStop;

        if ($.isFunction(onBeforeStop)) {
            onBeforeStop();
        }

        clearTheInterval();
        $(document.body).removeClass(VIEW_MODE_CLASS);
    } // End function stop()

    /**
     *
     */
    function pause () {
        var events = options.events,
            onBeforePause = events.onBeforePause,
            onBeforeResume = events.onBeforeResume;

        if (idInterval) {
            if ($.isFunction(onBeforePause)) {
                onBeforePause();
            }

            clearTheInterval();
        } else {
            if ($.isFunction(onBeforeResume)) {
                onBeforeResume();
            }

            start();
        }
    } // End function pause()

    /**
     *
     */
    function getRandomPic () {
        var xhr,
            //message,
            events = options.events,
            onBeforeGetRandom = events.onBeforeGetRandom,
            onGetRandom = events.onGetRandom;

        clearTheInterval();

        if ($.isFunction(onBeforeGetRandom)) {
            onBeforeGetRandom();
        }

        xhr = $.ajax({
            url: '/?r=getRandomPic_s',
            type: 'POST',
            dataType: 'json',
            async: true,
            data: {
                customFolder: options.customFolder
            }
        });

        xhr.done(function (json) {
            var error;

            if (json.error || !json.success) {
                error = json.error || {};
                console.log('Error : ' + (error.message || 'no error message available'));
                console.log(error);

                stop();

                // if (error.mandatoryFieldsMissing) {
                //     // info.html('Mandatory fields are missing.');
                // } else if (error.wrongCustomFolder) {
                //     message = 'Wrong custom folder.';
                //     // info.html(message);
                // } else {
                //     message = 'Error: ' + error.message || 'Unknown error.';
                //     // info.html(message);
                // }
                return;
            }

            if ($.isFunction(onGetRandom)) {
                onGetRandom(json);
            }

            setTheInterval();
        });

        xhr.fail(function (jqXHR, textStatus) {
            console.log('error getRandomPic() : ' +
                textStatus + ' / responseText : ' + jqXHR.responseText);

            stop();
        });
    } // End function getRandomPic()

    var Action = {

        /**
         *
         */
        DEFAULT_INTERVAL: DEFAULT_INTERVAL,

        /**
         *
         */
        DEFAULT_CUSTOM_FOLDER: DEFAULT_CUSTOM_FOLDER,

        /**
         *
         */
        init: function (opts) {
            $.extend(true, options, defaultOptions, opts || {});
        }, // End function init()

        /**
         *
         */
        start: function (opts) {
            start(opts);
        }, // End function start()

        /**
         *
         */
        stop: function  () {
            stop();
        }, // End function stop()

        /**
         *
         */
        pause: function () {
            pause();
        }, // End function pause()

        /**
         *
         */
        setCustomFolder: function (customFolder) {
            options.customFolder = customFolder;
        }, // End function setCustomFolder()

        /**
         *
         */
        setTimeInterval: function (timeInterval) {
            options.interval = timeInterval;
        }, // End function setTimeInterval()

        /**
         *
         */
        setOptions: function (opts) {
            $.extend(true, options, opts || {});
        } // End function setOptions()
    };

    return Action;
});
