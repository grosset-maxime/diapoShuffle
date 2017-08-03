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
function ($, Utils, API, Item) {
    'use strict';

    let Engine,
        _options = {},
        _items = [],
        _currentIndex = -1;

    // Private functions
    let _getNextRandomly, _getNextAfter, _createPic;

    _getNextRandomly = () => {
        let item,
            nbItems = _items.length;

        _currentIndex = Utils.getRandomNum(nbItems - 1);

        item = _items[_currentIndex];

        return !item.incCounter ? _createPic(item, _currentIndex, nbItems) : item;
    };

    _getNextAfter = () => {
        let item,
            nbItems = _items.length;

        _currentIndex++;
        _currentIndex = _currentIndex >= nbItems ? 0 : _currentIndex;
        item = _items[_currentIndex];

        return !item.incCounter ? _createPic(item, _currentIndex, nbItems) : item;
    };

    _createPic = (itemInfo, index, nbItems) => {
         let item = new Item({
            publicPathWithName: itemInfo.path,
            tags: itemInfo.tags,
            indice: index + 1,
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

                API.getPicsFromBdd({
                    Tags: options.Tags,
                    tagsOperator: options.tagsOperator,
                    types: options.types,
                    onSuccess: (itemsList) => {
                        _items = itemsList;
                        _currentIndex = -1;

                        if (!itemsList.length) {
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

        remove: (pic) => {
            let nbItems = _items.length;

            if (!nbItems) {
                return;
            }

            // Remove pic from the list.
            _items.splice(_currentIndex, 1);

            // Set for each pic the new number of pics in the folder.
            _items.forEach(function (pic) {
                pic.nbResult = nbItems - 1;
            });

            _currentIndex--;
        },

        clear: () => {
            _items = [];
            _currentIndex = -1;
        }
    };

    return Engine;
});
