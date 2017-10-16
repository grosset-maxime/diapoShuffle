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
    let _getCustomFolders, _setTheInterval, _clearTheInterval, _start, _stop, _pause, _runEngine,
        _runInsideFolderEngine, _onRunEngineError, _runBddEngine, _runPinedEngine, _runGetRandomPic;

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

    _start = (options) => {
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

        _runEngine(options);
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
        let events = _options.events;

        if (_idInterval || !shouldPlay) {
            events.onBeforePause();

            _clearTheInterval();

            _isPausing = true;

            events.onPause();
        } else if (shouldPlay) {
            events.onBeforeResume();

            _start();
            _isPausing = false;

            events.onResume();
        }
    };

    _runEngine = (options) => {
        options = options || {};

        _clearTheInterval();

        if (!_isPlaying || _isPausing) {
            return;
        }

        _options.events.onBeforeGetPic();

        if (_options.PinedEngine.enabled) {
            _runPinedEngine(options);
            return;
        }

        if (
            _options.BddEngine.Tags.length ||
            _options.BddEngine.types.length
        ) {
            _runBddEngine(options);
            return;
        }

        if (
            _options.InsideFolderEngine.folder &&
            _options.runMethod !== 'randomAsBefore'
        ) {
            _runInsideFolderEngine(options);
            return;
        } else {
            _runGetRandomPic(options);
            return;
        }
    };

    _runPinedEngine = (options) => {
        let way = options.way,
            Pic = PinedEngine.run({
                runMethod: _options.runMethod,
                way: way
            });

        way !== 'previous' && HistoryEngine.add(Pic);

        _options.events.onGetPic(
            Pic,
            _setTheInterval,
            function () {
                PinedEngine.remove();
                HistoryEngine.remove();
                _runEngine(options);
            }
        );
    };

    _runBddEngine = (options) => {
        BddEngine.run({
            runMethod: _options.runMethod,
            way: options.way,
            Tags: _options.BddEngine.Tags,
            tagsOperator: _options.BddEngine.tagsOperator,
            types: _options.BddEngine.types,
            onSuccess: (Pic) => {
                if (!_isPlaying) {
                    return;
                }

                options.way !== 'previous' && HistoryEngine.add(Pic);

                _options.events.onGetPic(
                    Pic,
                    function () {
                        if (options.pause) {
                            _pause(false);
                        } else {
                            _setTheInterval();
                        }
                    },
                    function (item) {
                        BddEngine.remove();
                        HistoryEngine.remove();

                        API.deletePic({
                            Pic: item,
                            deleteOnlyFromBdd: true
                        });

                        _runEngine(options);
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
                    _onRunEngineError(error);
                }
            }
        });
    };

    _runInsideFolderEngine = (options) => {
        InsideFolderEngine.run({
            runMethod: _options.runMethod,
            folder: _options.InsideFolderEngine.folder,
            way: options.way,
            onSuccess: (Pic) => {
                if (!_isPlaying) {
                    return;
                }

                options.way !== 'previous' && HistoryEngine.add(Pic);

                _options.events.onGetPic(
                    Pic,
                    function () {
                        if (options.pause) {
                            _pause(false);
                        } else {
                            _setTheInterval();
                        }
                    },
                    function () {
                        HistoryEngine.remove();
                        _runEngine(options);
                    }
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
                    _onRunEngineError(error);
                }
            }
        });
    };

    _runGetRandomPic = (options) => {
        function onGetPic (Pic, warning) {
            _options.events.onGetPic(
                Pic,
                function () { // Success callback of _setPic()
                    if (warning) {
                        _pause(false);
                        Notify.warning({
                            message: warning,
                            autoHide: false
                        });
                    } else {

                        if (options.pause) {
                            _pause(false);
                        } else {
                            _setTheInterval();
                        }
                    }
                },
                function () { // Failure callback of _setPic()
                    HistoryEngine.remove();
                    _runEngine(options);
                }
            );
        }

        if (options.way === 'previous') {

            onGetPic(HistoryEngine.getPrevious());

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

                    onGetPic(Pic, warning);
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
                        _onRunEngineError(error);
                    }
                }
            });
        }
    };

    _onRunEngineError = (error) => {
        _stop();

        Notify.error({
            message: error,
            autoHide: false
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

            _pause(true);
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
