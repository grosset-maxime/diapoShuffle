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

    const DEFAULT_INTERVAL = 3,
        DEFAULT_CUSTOM_FOLDERS = [],
        VIEW_MODE_CLASS = 'diapo_shuffle_view_mode',
        NOTIFY_TYPE_ERROR = Notify.TYPE_ERROR;

    let Action, _idInterval, _errorNotify,
        _defaultOptions = {
            interval: DEFAULT_INTERVAL,
            customFolders: DEFAULT_CUSTOM_FOLDERS,
            insideFolder: '',
            events: {
                onBeforeStart: () => {},
                onStart: () => {},
                onBeforePause: () => {},
                onPause: () => {},
                onBeforeResume: () => {},
                onResume: () => {},
                onBeforeStop: () => {},
                onStop: () => {},
                onBeforeGetRandom: () => {},
                onGetRandom: () => {}
            }
        },
        _options = {},
        _isPlaying = false,
        _isPausing = false,
        _isDisabled = false;


    let setTheInterval, clearTheInterval, start, stop, pause, getRandomPic;

    // Private functons.
    let _getCustomFolders;

    _getCustomFolders = () => (_options.insideFolder ? [_options.insideFolder] : '') || _options.customFolders;


    setTheInterval = () => {
        clearTheInterval();

        _idInterval = setTimeout(function () {
            getRandomPic();
        }, _options.interval * 1000);
    };

    clearTheInterval = () => {
        clearTimeout(_idInterval);
        _idInterval = null;
    };

    start = () => {
        var onBeforeStart = _options.events.onBeforeStart;

        if (_isPlaying && !_isPausing) {
            return;
        }

        onBeforeStart();

        if (_idInterval) {
            stop();
        }

        $(document.body).addClass(VIEW_MODE_CLASS);
        getRandomPic();
        _isPlaying = true;
        _isPausing = false;
    };

    stop = () => {
        var events = _options.events,
            onBeforeStop = events.onBeforeStop,
            onStop = events.onStop;

        onBeforeStop();

        clearTheInterval();

        $(document.body).removeClass(VIEW_MODE_CLASS);
        _isPlaying = false;
        _isPausing = false;

        onStop();
    };

    pause = () => {
        var events = _options.events,
            onBeforePause = events.onBeforePause,
            onBeforeResume = events.onBeforeResume,
            onPause = events.onPause,
            onResume = events.onResume;

        if (_idInterval) {
            onBeforePause();

            clearTheInterval();
            _isPausing = true;

            onPause();
        } else {
            onBeforeResume();

            start();
            _isPausing = false;

            onResume();
        }
    };

    getRandomPic = () => {
        var xhr, displayErrorNotify,
            events = _options.events,
            onBeforeGetRandom = events.onBeforeGetRandom,
            onGetRandom = events.onGetRandom;

        displayErrorNotify = (message, type) => {
            if (!_errorNotify) {
                _errorNotify = new Notify({
                    className: 'getRandomPicAction_notify',
                    container: $(document.body),
                    autoHide: true,
                    duration: 3
                });
            }

            _errorNotify.setMessage(message, type, true);
        };

        clearTheInterval();

        onBeforeGetRandom();

        xhr = $.ajax({
            url: '/?r=getRandomPic_s',
            type: 'POST',
            dataType: 'json',
            async: true,
            data: {
                customFolders: _getCustomFolders()
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

            onGetRandom(json, setTheInterval, getRandomPic);
        });

        xhr.fail(function (jqXHR, textStatus, errorThrown) {
            var message = 'getRandomPicAction.getRandomPic()';

            displayErrorNotify('Server error.', NOTIFY_TYPE_ERROR);

            PM.logAjaxFail(jqXHR, textStatus, errorThrown, message);
            stop();
        });
    };

    Action = {

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

        resume: () => {
            if (_isDisabled) {
                return;
            }

            pause();
        },

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
        },

        /**
         *
         */
        isPausing: function () {
            return _isPausing && _isPlaying;
        },

        /**
         *
         */
        isInside: function () {
            return !!_options.insideFolder;
        },

        /**
         *
         */
        setCustomFolders: (customFolders = []) => {
            _options.customFolders = customFolders;
        },

        /**
         *
         */
        setInsideFolder: (insideFolder = '') => {
            _options.insideFolder = insideFolder;
        },

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
