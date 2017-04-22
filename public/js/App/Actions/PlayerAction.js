/* global
    define
*/

define(
[
    'jquery',

    // API
    'App/API/API',

    // Notify
    'App/Notify',

    // Class
    'App/Class/Pic',

    // Actions
    'App/Actions/PinPicAction',
    'App/Actions/TagsPicAction'
],
function (
    $,

    // API
    API,

    Notify,

    PicClass,

    // App
    PinPicAction,
    TagsPicAction
) {
    'use strict';

    const DEFAULT_INTERVAL = 3,
        DEFAULT_CUSTOM_FOLDERS = [],
        VIEW_MODE_CLASS = 'diapo_shuffle_view_mode';

    let Action, _idInterval,
        _defaultOptions = {
            interval: DEFAULT_INTERVAL,
            customFolders: DEFAULT_CUSTOM_FOLDERS,
            insideFolder: '',
            playPined: false,
            playTags: [],
            playTypes: [],
            tagsOperator: '',
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
                onGetRandom: () => {},
                onResetInsideFolder: () => {},
                onAddCustomFolder: () => {}
            }
        },
        _options = {},
        _isPlaying = false,
        _isPausing = false,
        _isDisabled = false;


    // Private functons.
    let _getCustomFolders, _setTheInterval, _clearTheInterval, _start, _stop, _pause, _getRandomPic;

    _getCustomFolders = () => (_options.insideFolder ? [_options.insideFolder] : '') || _options.customFolders;


    _setTheInterval = () => {
        _clearTheInterval();

        _idInterval = setTimeout(
            _getRandomPic,
            _options.interval * 1000
        );
    };

    _clearTheInterval = () => {
        clearTimeout(_idInterval);
        _idInterval = null;
    };

    _start = () => {
        let onBeforeStart = _options.events.onBeforeStart;

        if (_isPlaying && !_isPausing) {
            return;
        }

        onBeforeStart();

        if (_idInterval) {
            _stop();
        }

        $(document.body).addClass(VIEW_MODE_CLASS);

        _getRandomPic();

        _isPlaying = true;
        _isPausing = false;
    };

    _stop = () => {
        let events = _options.events,
            onBeforeStop = events.onBeforeStop,
            onStop = events.onStop;

        onBeforeStop();

        _clearTheInterval();

        $(document.body).removeClass(VIEW_MODE_CLASS);

        _isPlaying = false;
        _isPausing = false;

        onStop();
    };

    _pause = (shouldPlay = true) => {
        let events = _options.events,
            onBeforePause = events.onBeforePause,
            onBeforeResume = events.onBeforeResume,
            onPause = events.onPause,
            onResume = events.onResume;

        if (_idInterval || !shouldPlay) {
            onBeforePause();

            _clearTheInterval();

            _isPausing = true;

            onPause();
        } else if (shouldPlay) {
            onBeforeResume();

            _start();
            _isPausing = false;

            onResume();
        }
    };

    _getRandomPic = () => {
        let events = _options.events,
            onBeforeGetRandom = events.onBeforeGetRandom,
            onGetRandom = events.onGetRandom;

        function onError (error) {
            _stop();

            Notify.error({
                message: error,
                autoHide: false
            });
        }

        _clearTheInterval();

        onBeforeGetRandom();

        if (_options.playPined) {

            onGetRandom(
                PinPicAction.getRandom(),
                _setTheInterval,
                _getRandomPic
            );
        } else if (
            _options.playTags.length ||
            _options.playTypes.length
        ) {

            TagsPicAction.getRandom({
                Tags: _options.playTags,
                types: _options.playTypes,
                operator: _options.tagsOperator,
                onSuccess: (Pic) => {
                    onGetRandom(
                        Pic,
                        _setTheInterval,
                        _getRandomPic
                    );
                },
                onFailure: onError
            });

        } else {

            API.getRandomPic({
                customFolders: _getCustomFolders(),
                onSuccess: (picInfo, warning) => {

                    onGetRandom(
                        new PicClass(picInfo),
                        function () { // Success callback of _setPic()
                            if (warning) {
                                _pause(false);
                                Notify.warning({
                                    message: warning || 'teset',
                                    autoHide: false
                                });
                            } else {
                                _setTheInterval();
                            }
                        },
                        _getRandomPic // Failure callback of _setPic()
                    );
                },
                onFailure: (error) => {
                    if (Action.isInside()) {

                        Notify.info({
                            message: 'No more pic into: "' + Action.getInsideFolder() + '"'
                        });

                        // Remove inside folder.
                        Action.setInsideFolder();

                        _getRandomPic();
                    } else {
                        onError(error);
                    }
                }
            });
        }
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
        init: (opts) => {
            _options = {};
            $.extend(true, _options, _defaultOptions, opts || {});
        },

        /**
         *
         */
        start: (opts) => {
            if (_isDisabled) {
                return;
            }

            _start(opts);
        },

        /**
         *
         */
        stop: () => {
            _stop();
        },

        /**
         *
         */
        pause: (shouldPlay) => {
            if (_isDisabled) {
                return;
            }

            _pause(shouldPlay);
        },

        resume: () => {
            if (_isDisabled) {
                return;
            }

            _pause();
        },

        /**
         *
         */
        disable: () => {
            _isDisabled = true;
        },

        /**
         *
         */
        enable: () => {
            _isDisabled = false;
        },

        /**
         *
         */
        isDisabled: () => {
            return _isDisabled;
        },

        /**
         *
         */
        isPlaying: () => {
            return _isPlaying;
        },

        /**
         *
         */
        isPausing: () => {
            return _isPausing && _isPlaying;
        },

        /**
         *
         */
        isInside: () => {
            return !!_options.insideFolder;
        },

        /**
         * @param {String} customFolders - Custom folder to add.
         */
        addCustomFolder: (customFolder = '') => {
            let customFolders = _options.customFolders;

            if (!customFolder || customFolders.indexOf(customFolder) !== -1) {
                return;
            }

            // If no custom folder, get all folders at root.
            if (!customFolders.length) {
                API.getFolderList({
                    folder: '/',
                    onSuccess: (folders) => {
                        let i, folder,
                            nbFolders = folders.length;

                        for (i = 0; i < nbFolders; i++) {
                            folder = '/' + folders[i] + '/';

                            folders[i] = customFolders.indexOf(folder) < 0 ? folder : '';
                        }

                        folders = folders.filter(function (folder) {
                            return folder;
                        });

                        _options.events.onAddCustomFolder(folders);
                    }
                });
            }

            _options.events.onAddCustomFolder(customFolder);
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

            if (!insideFolder) {
                _options.events.onResetInsideFolder();
            }
        },

        /**
         * @returns {String} Inside folder path.
         */
        getInsideFolder: () => _options.insideFolder,

        /**
         *
         */
        setTimeInterval: (timeInterval) => {
            _options.interval = timeInterval;
        },

        /**
         *
         */
        setOptions: (opts) => {
            $.extend(true, _options, opts || {});

            _options.customFolders = opts.customFolders || [];
            _options.playTags = opts.playTags || [];
            _options.playTypes = opts.playTypes || [];
            _options.tagsOperator = opts.tagsOperator;
        }
    };

    return Action;
});
