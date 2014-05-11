/* global
    define
*/

define(
[
    'jquery',

    // PM
    'PM/Core',
    'PM/Cmp/Notify',
],
function ($, PM, Notify) {
    'use strict';

    var DEFAULT_INTERVAL = 3,
        DEFAULT_CUSTOM_FOLDER = '',
        VIEW_MODE_CLASS = 'diapo_shuffle_view_mode';

    var idInterval, errorNotify,
        defaultOptions = {
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
        isPlaying = false,
        isPausing = false;

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
        isPlaying = true;
        isPausing = false;
    } // End function start()

    /**
     *
     */
    function stop () {
        var events = options.events,
            onBeforeStop = events.onBeforeStop,
            onStop = events.onStop;

        if ($.isFunction(onBeforeStop)) {
            onBeforeStop();
        }

        clearTheInterval();
        $(document.body).removeClass(VIEW_MODE_CLASS);
        isPlaying = false;
        isPausing = false;

        if ($.isFunction(onStop)) {
            onStop();
        }
    } // End function stop()

    /**
     *
     */
    function pause () {
        var events = options.events,
            onBeforePause = events.onBeforePause,
            onBeforeResume = events.onBeforeResume,
            onPause = events.onPause,
            onResume = events.onResume;

        if (idInterval) {
            if ($.isFunction(onBeforePause)) {
                onBeforePause();
            }

            clearTheInterval();
            isPausing = true;

            if ($.isFunction(onPause)) {
                onPause();
            }
        } else {
            if ($.isFunction(onBeforeResume)) {
                onBeforeResume();
            }

            start();
            isPausing = false;

            if ($.isFunction(onResume)) {
                onResume();
            }
        }
    } // End function pause()

    /**
     *
     */
    function getRandomPic () {
        var xhr,
            errorMessage,
            events = options.events,
            onBeforeGetRandom = events.onBeforeGetRandom,
            onGetRandom = events.onGetRandom;

        /**
         *
         */
        function displayErrorNotify (message, type) {
            if (!errorNotify) {
                errorNotify = new Notify({
                    className: 'getRandomPicAction-notify',
                    container: $(document.body),
                    autoHide: true,
                    duration: 3
                });
            }

            errorNotify.setMessage(message, type, true);
        } // End function displayErrorNotify()

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
            var error, typeMessage;

            if (json.error || !json.success) {
                error = json.error || {};

                if (error.wrongCustomFolder || error.noPic) {
                    errorMessage = error.message;
                    typeMessage = Notify.TYPE_WARNING;
                } else {
                    errorMessage = 'Error: ' + error.message || 'Unknown error.';
                    typeMessage = Notify.TYPE_ERROR;
                }

                PM.log('Error : ' + errorMessage);
                PM.log(error);

                displayErrorNotify(errorMessage, typeMessage);
                stop();
                return;
            }

            if ($.isFunction(onGetRandom)) {
                onGetRandom(json);
            }

            setTheInterval();
        });

        xhr.fail(function (jqXHR, textStatus, errorThrown) {
            var message = 'getRandomPicAction.getRandomPic()';

            PM.logAjaxFail(jqXHR, textStatus, errorThrown, message);
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
        isPlaying: function () {
            return isPlaying;
        }, // End function isPlaying()

        /**
         *
         */
        isPausing: function () {
            return isPausing && isPlaying;
        }, // End function isPausing()

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
