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
        DEFAULT_CUSTOM_FOLDERS = [],
        VIEW_MODE_CLASS = 'diapo_shuffle_view_mode',
        NOTIFY_TYPE_ERROR = Notify.TYPE_ERROR;

    var idInterval, errorNotify,
        defaultOptions = {
            interval: DEFAULT_INTERVAL,
            customFolders: DEFAULT_CUSTOM_FOLDERS,
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
        isPausing = false,
        isDisabled = false,
        currentPicPath;

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

        if (isPlaying && !isPausing) {
            return;
        }

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
            events = options.events,
            onBeforeGetRandom = events.onBeforeGetRandom,
            onGetRandom = events.onGetRandom;

        /**
         *
         */
        function displayErrorNotify (message, type) {
            if (!errorNotify) {
                errorNotify = new Notify({
                    className: 'getRandomPicAction_notify',
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
                customFolders: options.customFolders
            }
        });

        xhr.done(function (json) {
            var error,
                unknownErrorMessage = 'Unknown error.';

            if (json.error || !json.success) {
                error = json.error || {};

                displayErrorNotify(
                    error.publicMessage || unknownErrorMessage,
                    error.severity || Notify.TYPE_ERROR
                );

                PM.log('Error : ' + error.message || unknownErrorMessage);
                PM.log(error);

                stop();
                return;
            }

            if ($.isFunction(onGetRandom)) {
                currentPicPath = json.pic.src;
                onGetRandom(json);
            }

            setTheInterval();
        });

        xhr.fail(function (jqXHR, textStatus, errorThrown) {
            var message = 'getRandomPicAction.getRandomPic()';

            displayErrorNotify('Server error.', NOTIFY_TYPE_ERROR);

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
        DEFAULT_CUSTOM_FOLDERS: DEFAULT_CUSTOM_FOLDERS,

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
            if (isDisabled) {
                return;
            }

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
            if (isDisabled) {
                return;
            }

            pause();
        }, // End function pause()

        /**
         *
         */
        disable: function () {
            isDisabled = true;
        }, // End function disable()

        /**
         *
         */
        enable: function () {
            isDisabled = false;
        }, // End function enable()

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
        getPicSrc: function () {
            return currentPicPath || '';
        }, // End function getPicSrc()

        /**
         *
         */
        setCustomFolders: function (customFolders) {
            options.customFolders = customFolders;
        }, // End function setCustomFolders()

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
            options.customFolders = opts.customFolders || [];
        } // End function setOptions()
    };

    return Action;
});
