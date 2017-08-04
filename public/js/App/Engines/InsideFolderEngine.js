/* global
    define
*/

define(
[
    'jquery',

    'App/Utils/Utils',
    'App/API/API',
    'App/Class/Pic'
],
function ($, Utils, API, Pic) {
    'use strict';

    let Engine,
        _options = {},
        _folder = '',
        _items = [],
        _currentIndex = -1;

    // Private functions
    let _getNextRandomly, _getNextAfter, _createItem;

    _getNextRandomly = () => {
        let item,
            nbItems = _items.length;

        _currentIndex = Utils.getRandomNum(nbItems - 1);

        item = _items[_currentIndex];
        item = !item.incCounter ? _createItem(item, _currentIndex, nbItems) : item;
        item.index = _currentIndex + 1;
        item.nbResult = nbItems;

        return item;
    };

    _getNextAfter = () => {
        let item,
            nbItems = _items.length;

        _currentIndex++;
        _currentIndex = _currentIndex >= nbItems ? 0 : _currentIndex;
        item = _items[_currentIndex];
        item = !item.incCounter ? _createItem(item, _currentIndex, nbItems) : item;
        item.index = _currentIndex + 1;
        item.nbResult = nbItems;

        return item;
    };

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

        run: (options) => {
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

                        Engine.getNext(options);
                    },
                    onFailure: options.onFailure
                });
            } else {
                Engine.getNext(options);
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
