/* global
    define
*/

define(
[
    'jquery',

    'App/Utils/Utils',

    'App/Engines/HistoryEngine'
],
function ($, Utils, HistoryEngine) {
    'use strict';

    let Engine,
        _options = {},
        _currentIndex = -1,
        _pined = [];


    // Private functions
    let _getNextRandomly, _getNextAfter, _getPreviousAfter, _getItem;

    _getItem = (index) => {
        let nbItems = _pined.length,
            item = _pined[index || _currentIndex];

        item.index = _currentIndex + 1;
        item.nbResult = nbItems;

        return item;
    };

    _getNextRandomly = () => {
        _currentIndex = Utils.getRandomNum(_pined.length - 1);

        return _getItem();
    };

    _getNextAfter = () => {
        _currentIndex++;
        _currentIndex = _currentIndex >= _pined.length ? 0 : _currentIndex;

        return _getItem();
    };

    _getPreviousAfter = () => {
        _currentIndex--;
        _currentIndex = _currentIndex < 0 ? _pined.length - 1 : _currentIndex;

        return _getItem();
    };

    Engine = {

        init: (opts = {}) => {
            _options = {};

            $.extend(
                true,
                _options,
                {
                    events: {
                        onClear: () => {},
                        onRemove: () => {},
                        onAdd: () => {}
                    }
                },
                opts
            );
        },

        setOptions: (opts) => {
            $.extend(true, _options, opts || {});
        },

        add: (item) => {
            let nbItem,
                result = _pined.find(function (aItem) {
                    return aItem.src === item.src;
                });

            if (result) {
                return;
            }

            _pined.push(item);
            nbItem = _pined.length;
            _currentIndex = nbItem - 1;
            item.index = nbItem;

            _pined.forEach(function (item) {
                item.nbResult = nbItem;
            });

            _options.events.onAdd();
        },

        remove: () => {
            let nbItem = _pined.length;

            if (!nbItem) {
                return;
            }

            _pined.splice(_currentIndex, 1);
            _currentIndex--;

            _options.events.onRemove();
        },

        clear: () => {
            _currentIndex = -1;
            _pined = [];

            _options.events.onClear();
        },

        getNext: (options) => {
            let item;

            item = options.runMethod === 'random' ? _getNextRandomly() : _getNextAfter();
            item.incCounter();

            return item;
        },

        getPrevious: (options) => {
            let item;

            item = options.runMethod === 'random' ? HistoryEngine.getPrevious() : _getPreviousAfter();
            item.incCounter();

            return item;
        },

        run: (options) => {
            return Engine['get' + (options.way === 'previous' ? 'Previous' : 'Next')](options);
        },

        isFirst: () => {
            return _currentIndex <= 0;
        },

        isLast: () => {
            return _currentIndex >= (_pined.length - 1);
        },

        getNbPined: () => {
            return _pined.length;
        }
    };

    return Engine;
});
