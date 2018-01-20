/* global
    define
*/

define(
[
    'jquery',

    'App/Utils/Utils',
    'App/API/API',
    'App/Class/Pic',

    'App/Engines/HistoryEngine'
],
function ($, Utils, API, Pic, HistoryEngine) {
    'use strict';

    let Engine,
        _options = {},
        _folder = '',
        _items = [],
        _currentIndex = -1;

    // Private functions
    let _getNextRandomly, _getNextAfter, _createItem, _getPreviousAfter, _getItem;

    _createItem = (itemInfo, index, nbItems) => {
         let item = new Pic({
            customFolderPath: _folder,
            publicPathWithName: itemInfo.path,
            tags: itemInfo.tags,
            index: index + 1,
            nbResult: nbItems
        });

         _items[index] = item;

         return item;
    };

    _getItem = (index) => {
        let nbItems = _items.length,
            item = _items[index || _currentIndex];

        item = !item.incCounter ? _createItem(item, _currentIndex, nbItems) : item;
        item.index = _currentIndex + 1;
        item.nbResult = nbItems;

        return item;
    };

    _getNextRandomly = () => {
        _currentIndex = Utils.getRandomNum(_items.length - 1);

        return _getItem();
    };

    _getNextAfter = () => {
        _currentIndex++;
        _currentIndex = _currentIndex >= _items.length ? 0 : _currentIndex;

        return _getItem();
    };

    _getPreviousAfter = () => {
        var item;

        _currentIndex--;
        _currentIndex = _currentIndex < 0 ? _items.length - 1 : _currentIndex;

        item = _getItem();
        HistoryEngine.add(item);

        return item;
    };


    Engine = {

        init: (opts = {}) => {
            _options = {};
        },

        setOptions: (opts) => {
            $.extend(true, _options, opts || {});
        },

        getNext: (options) => {
            let item;

            item = options.runMethod === 'random' ? _getNextRandomly() : _getNextAfter();
            item.incCounter();

            options.onSuccess && options.onSuccess(item);

            return item;
        },

        getPrevious: (options) => {
            let item;

            item = options.runMethod === 'random' ? HistoryEngine.getPrevious() : _getPreviousAfter();
            item.incCounter();

            options.onSuccess && options.onSuccess(item);

            return item;
        },

        run: (options) => {
            function getItem () {
                 Engine['get' + (options.way === 'previous' ? 'Previous' : 'Next')](options);
            }

            if (!_items.length) {
                API.getPicsList({
                    folder: options.folder,
                    onSuccess: (items) => {
                        _items = items;
                        _folder = options.folder;
                        _currentIndex = -1;

                        if (!items.length) {
                            options.onFailure && options.onFailure('##empty##');
                            return;
                        }

                        getItem();
                    },
                    onFailure: options.onFailure
                });
            } else {
                getItem();
            }
        },

        remove: () => {
            let nbItems = _items.length;

            if (!nbItems) {
                return;
            }

            // Remove item from the list.
            _items.splice(_currentIndex, 1);
            _currentIndex--;
        },

        clear: () => {
            _items = [];
            _folder = '';
            _currentIndex = -1;
        }
    };

    return Engine;
});
