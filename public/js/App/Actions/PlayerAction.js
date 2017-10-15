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
    'App/Engines/PinedEngine',
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
    PinedEngine,
    BddEngine,
    InsideFolderEngine
) {
    'use strict';

    const DEFAULT_INTERVAL = 3,
        DEFAULT_RUN_METHOD = 'random',
        VIEW_MODE_CLASS = 'diapo_shuffle_view_mode';

    let Action, _idInterval,
        _defaultOptions = {
            runMethod: DEFAULT_RUN_METHOD,
            interval: DEFAULT_INTERVAL,

            FoldersEngine: {
                customFolders: [],
            },

            InsideFolderEngine: {
                folder: ''
            },

            PinedEngine: {
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

        if (!_isPlaying) {
            return;
        }

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

        _isPlaying = true;
        _isPausing = false;

        _runEngine();
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

        if (!_isPlaying) {
            return;
        }

        onBeforeGetPic();

        if (_options.PinedEngine.enabled) {
            let Pic = PinedEngine.run({
                runMethod: _options.runMethod
            });

            HistoryEngine.add(Pic);

            onGetPic(
                Pic,
                _setTheInterval,
                function () {
                    PinedEngine.remove();
                    HistoryEngine.remove();
                    _runEngine();
                }
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
                    if (!_isPlaying) {
                        return;
                    }

                    HistoryEngine.add(Pic);

                    onGetPic(
                        Pic,
                        _setTheInterval,
                        function (item) {
                            BddEngine.remove();
                            HistoryEngine.remove();

                            API.deletePic({
                                Pic: item,
                                deleteOnlyFromBdd: true
                            });

                            _runEngine();
                        }
                    );

                },
                onFailure: (error) => {
                    if (error === '##empty##') {
                        Notify.info({
                            message: 'No more pic for current filter criterias'
                        });

                        _stop();
                    } else {
                        onError(error);
                    }
                }
            });

        } else if (
            _options.InsideFolderEngine.folder &&
            _options.runMethod !== 'randomAsBefore'
        ) {

            InsideFolderEngine.run({
                runMethod: _options.runMethod,
                folder: _options.InsideFolderEngine.folder,
                onSuccess: (Pic) => {
                    if (!_isPlaying) {
                        return;
                    }

                    HistoryEngine.add(Pic);

                    onGetPic(
                        Pic,
                        _setTheInterval,
                        _runEngine
                    );

                },
                onFailure: (error) => {
                    if (error === '##empty##') {
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

        } else {

            API.getRandomPic({
                runMethod: _options.runMethod,
                customFolders: _getCustomFolders(),
                onSuccess: (picInfo, warning) => {
                    if (!_isPlaying) {
                        return;
                    }

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
                        function () { // Failure callback of _setPic()
                            _runEngine();
                        }

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
        setInsideFolder: (folder = '') => {
            _options.InsideFolderEngine.folder = folder;

            if (!folder) {
                _options.events.onResetInsideFolder();
                InsideFolderEngine.clear();
            }
        },

        setRunMethod: (runMethod) => {
            _options.runMethod = runMethod || DEFAULT_RUN_METHOD;
        },

        /**
         * @returns {String} Inside folder path.
         */
        getInsideFolder: () => _options.InsideFolderEngine.folder,

        /**
         *
         */
        setOptions: (opts) => {
            let bddEngineOptions, PinedEngineOptions, FoldersEngineOptions;

            $.extend(true, _options, opts || {});

            _options.runMethod = opts.runMethod || DEFAULT_RUN_METHOD;
            _options.interval = opts.interval || DEFAULT_INTERVAL;

            // Folders engine options.
            FoldersEngineOptions = _options.FoldersEngine = _options.FoldersEngine || {};
            FoldersEngineOptions.customFolders = opts.FoldersEngine.customFolders || [],

            // Pined pic engine options.
            PinedEngineOptions = _options.PinedEngine = _options.PinedEngine || {};
            PinedEngineOptions.enabled = opts.PinedEngine.enabled,

            // Bdd engine options.
            bddEngineOptions = _options.BddEngine = _options.BddEngine || {};
            bddEngineOptions.Tags = opts.BddEngine.Tags || [];
            bddEngineOptions.tagsOperator = opts.BddEngine.tagsOperator;
            bddEngineOptions.types = opts.BddEngine.types || [];
        }
    };

    return Action;
});
