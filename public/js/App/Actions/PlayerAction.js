/* global
    define
*/

define(
[
    'jquery',

    // App
    'App/Notify',

    // API
    'App/API/API',

    // Class
    'App/Class/Pic',

    // Engines
    'App/Engines/HistoryEngine',
    'App/Engines/PinedPicEngine',
    'App/Engines/BddEngine',
    'App/Engines/InsideFolderEngine',
],
function (
    $,

    // App
    Notify,

    // API
    API,

    // Class
    PicClass,

    // Engines
    HistoryEngine,
    PinedPicEngine,
    BddEngine,
    InsideFolderEngine
) {
    'use strict';

    const DEFAULT_INTERVAL = 3,
        VIEW_MODE_CLASS = 'diapo_shuffle_view_mode';

    let Action, _idInterval,
        _defaultOptions = {
            runMethod: 'random',
            interval: DEFAULT_INTERVAL,

            FoldersEngine: {
                customFolders: [],
            },

            InsideFolderEngine: {
                folder: '',
                getRandomly: false
            },

            PinedPicEngine: {
                enabled: false
            },

            BddEngine: {
                Tags: [],
                tagsOperator: '',
                types: []
            },

            FolderPicsEngine: {
                folder: '',
            },

            events: {
                onBeforeStart: () => {},
                onStart: () => {},
                onBeforePause: () => {},
                onPause: () => {},
                onBeforeResume: () => {},
                onResume: () => {},
                onBeforeStop: () => {},
                onStop: () => {},
                onBeforeGetPic: () => {},
                onGetPic: () => {},
                onResetInsideFolder: () => {},
                onAddCustomFolder: () => {}
            }
        },
        _options = {},
        _isPlaying = false,
        _isPausing = false,
        _isDisabled = false;


    // Private functons.
    let _getCustomFolders, _setTheInterval, _clearTheInterval, _start, _stop, _pause, _runEngine;

    _getCustomFolders = () => {
        return (_options.InsideFolderEngine.folder ? [_options.InsideFolderEngine.folder] : '') ||
            _options.FoldersEngine.customFolders;
    };


    _setTheInterval = () => {
        _clearTheInterval();

        _idInterval = setTimeout(
            _runEngine,
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

        _runEngine();

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

    _runEngine = () => {
        let events = _options.events,
            onBeforeGetPic = events.onBeforeGetPic,
            onGetPic = events.onGetPic;

        function onError (error) {
            _stop();

            Notify.error({
                message: error,
                autoHide: false
            });
        }

        _clearTheInterval();

        onBeforeGetPic();

        if (_options.PinedPicEngine.enabled) {
            let Pic = PinedPicEngine.run({
                runMethod: _options.runMethod
            });

            HistoryEngine.add(Pic);

            onGetPic(
                Pic,
                _setTheInterval,
                _runEngine
            );
        } else if (
            _options.BddEngine.Tags.length ||
            _options.BddEngine.types.length
        ) {

            BddEngine.run({
                runMethod: _options.runMethod,
                Tags: _options.BddEngine.Tags,
                tagsOperator: _options.BddEngine.tagsOperator,
                types: _options.BddEngine.types,
                onSuccess: (Pic) => {

                    HistoryEngine.add(Pic);

                    onGetPic(
                        Pic,
                        _setTheInterval,
                        _runEngine
                    );

                },
                onFailure: onError
            });

        } else if (
            _options.InsideFolderEngine.folder &&
            !_options.InsideFolderEngine.getRandomly
        ) {

            InsideFolderEngine.run({
                runMethod: _options.runMethod,
                folder: _options.InsideFolderEngine.folder,
                getRandomly: _options.InsideFolderEngine.getRandomly,
                onSuccess: (Pic) => {

                    HistoryEngine.add(Pic);

                    onGetPic(
                        Pic,
                        _setTheInterval,
                        _runEngine
                    );

                },
                onFailure: onError
            });

        } else {

            API.getRandomPic({
                runMethod: _options.runMethod,
                customFolders: _getCustomFolders(),
                onSuccess: (picInfo, warning) => {
                    let Pic = new PicClass(picInfo);

                    HistoryEngine.add(Pic);

                    onGetPic(
                        Pic,
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
                        _runEngine // Failure callback of _setPic()
                    );
                },
                onFailure: (error) => {
                    if (Action.isInside()) {

                        Notify.info({
                            message: 'No more pic into: "' + Action.getInsideFolder() + '"'
                        });

                        // Remove inside folder.
                        Action.setInsideFolder();

                        _runEngine();
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
            return !!_options.InsideFolderEngine.folder;
        },

        /**
         * @param {String} customFolders - Custom folder to add.
         */
        addCustomFolder: (customFolder = '') => {
            let customFolders = _options.FoldersEngine.customFolders;

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
            _options.FoldersEngine.customFolders = customFolders;
        },

        /**
         *
         */
        setInsideFolder: (folder = '', getRandomly = false) => {
            _options.InsideFolderEngine.folder = folder;
            _options.InsideFolderEngine.getRandomly = getRandomly;

            if (!folder) {
                _options.events.onResetInsideFolder();
                InsideFolderEngine.clear();
            }
        },

        /**
         * @returns {String} Inside folder path.
         */
        getInsideFolder: () => _options.InsideFolderEngine.folder,

        /**
         *
         */
        setOptions: (opts) => {
            let bddEngineOptions, PinedPicEngineOptions, FoldersEngineOptions;

            $.extend(true, _options, opts || {});

            _options.interval = opts.interval || DEFAULT_INTERVAL;

            // Folders engine options.
            FoldersEngineOptions = _options.FoldersEngine = _options.FoldersEngine || {};
            FoldersEngineOptions.customFolders = opts.FoldersEngine.customFolders || [],

            // Pined pic engine options.
            PinedPicEngineOptions = _options.PinedPicEngine = _options.PinedPicEngine || {};
            PinedPicEngineOptions.enabled = opts.PinedPicEngine.enabled,

            // Bdd engine options.
            bddEngineOptions = _options.BddEngine = _options.BddEngine || {};
            bddEngineOptions.Tags = opts.BddEngine.Tags || [];
            bddEngineOptions.tagsOperator = opts.BddEngine.tagsOperator;
            bddEngineOptions.types = opts.BddEngine.types || [];
        }
    };

    return Action;
});
