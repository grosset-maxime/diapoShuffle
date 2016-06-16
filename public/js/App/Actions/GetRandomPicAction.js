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

    var _idInterval, _errorNotify,
        _defaultOptions = {
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
                onGetRandom: null
            }
        },
        _options = {},
        _isPlaying = false,
        _isPausing = false,
        _isDisabled = false;

    /**
     *
     */
    function setTheInterval () {
        clearTheInterval();

        _idInterval = setTimeout(function () {
            getRandomPic();
        }, _options.interval * 1000);
    } // End function setTheInterval()

    /**
     *
     */
    function clearTheInterval () {
        clearTimeout(_idInterval);
        _idInterval = null;
    } // End function clearTheInterval()

    /**
     *
     */
    function start () {
        var onBeforeStart = _options.events.onBeforeStart;

        if (_isPlaying && !_isPausing) {
            return;
        }

        if ($.isFunction(onBeforeStart)) {
            onBeforeStart();
        }

        if (_idInterval) {
            stop();
        }

        $(document.body).addClass(VIEW_MODE_CLASS);
        getRandomPic();
        _isPlaying = true;
        _isPausing = false;
    } // End function start()

    /**
     *
     */
    function stop () {
        var events = _options.events,
            onBeforeStop = events.onBeforeStop,
            onStop = events.onStop;

        if ($.isFunction(onBeforeStop)) {
            onBeforeStop();
        }

        clearTheInterval();

        $(document.body).removeClass(VIEW_MODE_CLASS);
        _isPlaying = false;
        _isPausing = false;

        if ($.isFunction(onStop)) {
            onStop();
        }
    } // End function stop()

    /**
     *
     */
    function pause () {
        var events = _options.events,
            onBeforePause = events.onBeforePause,
            onBeforeResume = events.onBeforeResume,
            onPause = events.onPause,
            onResume = events.onResume;

        if (_idInterval) {
            if ($.isFunction(onBeforePause)) {
                onBeforePause();
            }

            clearTheInterval();
            _isPausing = true;

            if ($.isFunction(onPause)) {
                onPause();
            }
        } else {
            if ($.isFunction(onBeforeResume)) {
                onBeforeResume();
            }

            start();
            _isPausing = false;

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
            events = _options.events,
            onBeforeGetRandom = events.onBeforeGetRandom,
            onGetRandom = events.onGetRandom;

        /**
         *
         */
        function displayErrorNotify (message, type) {
            if (!_errorNotify) {
                _errorNotify = new Notify({
                    className: 'getRandomPicAction_notify',
                    container: $(document.body),
                    autoHide: true,
                    duration: 3
                });
            }

            _errorNotify.setMessage(message, type, true);
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
                customFolders: _options.customFolders
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

            $.isFunction(onGetRandom) && onGetRandom(json, setTheInterval);
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
            $.extend(true, _options, _defaultOptions, opts || {});
        }, // End function init()

        /**
         *
         */
        start: function (opts) {
            if (_isDisabled) {
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
            if (_isDisabled) {
                return;
            }

            pause();
        }, // End function pause()

        /**
         *
         */
        disable: function () {
            _isDisabled = true;
        }, // End function disable()

        /**
         *
         */
        enable: function () {
            _isDisabled = false;
        }, // End function enable()

        /**
         *
         */
        isDisabled: function () {
            return _isDisabled;
        }, // End function isDisabled()

        /**
         *
         */
        isPlaying: function () {
            return _isPlaying;
        }, // End function isPlaying()

        /**
         *
         */
        isPausing: function () {
            return _isPausing && _isPlaying;
        }, // End function isPausing()

        /**
         *
         */
        setCustomFolders: function (customFolders) {
            _options.customFolders = customFolders;
        }, // End function setCustomFolders()

        /**
         *
         */
        setTimeInterval: function (timeInterval) {
            _options.interval = timeInterval;
        }, // End function setTimeInterval()

        /**
         *
         */
        setOptions: function (opts) {
            $.extend(true, _options, opts || {});
            _options.customFolders = opts.customFolders || [];
        } // End function setOptions()
    };

    return Action;
});
