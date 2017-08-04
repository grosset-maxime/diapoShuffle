/* global
    define
*/

define(
[
    'jquery',

    'App/Utils/Utils'
],
function ($, Utils) {
    'use strict';

    let Engine,
        _options = {},
        _currentIndex = -1,
        _pined = [];


    // Private functions
    let _getNextRandomly, _getNextAfter;

    _getNextRandomly = () => {
        let nbItems = _pined.length,
            item;

        _currentIndex = Utils.getRandomNum(nbItems - 1);
        item = _pined[_currentIndex];
        item.index = _currentIndex + 1;
        item.nbResult = nbItems;

        return item;
    };

    _getNextAfter = () => {
        let nbItems = _pined.length,
            item;

        _currentIndex++;
        _currentIndex = _currentIndex >= nbItems ? 0 : _currentIndex;
        item = _pined[_currentIndex];
        item.index = _currentIndex + 1;
        item.nbResult = nbItems;

        return item;
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

        run: (options) => {
            return Engine.getNext(options);
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
