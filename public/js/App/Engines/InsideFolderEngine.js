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
        _pics = [],
        _currentIndex = 0;

    Engine = {

        init: (opts = {}) => {
            _options = {};
        },

        setOptions: (opts) => {
            $.extend(true, _options, opts || {});
        },

        run: (options) => {

            function onSuccess (results) {
                let navIndex, pic,
                    nbResult = results.length;

                navIndex = Utils.getRandomNum(nbResult - 1);
                pic = results[navIndex];

                if (!pic.incCounter) {
                    pic = new Pic({
                        publicPathWithName: 'pic/' + options.folder + '/' + pic,
                        // tags: pic.tags,
                        nbResult: nbResult
                    });
                    _pics[navIndex] = pic;
                }

                pic.incCounter();

                options.onSuccess && options.onSuccess(pic);
            }

            if (!_pics.length) {

                API.getPicsList({
                    folder: options.folder,
                    onSuccess: (picsList) => {
                        _pics = picsList;
                        _currentIndex = 0;

                        onSuccess(_pics);
                    },
                    onFailure: options.onFailure
                });
            } else {
                onSuccess(_pics);
            }
        },

        clear: () => {
            _pics = [];
            _folder = '';
            _currentIndex = 0;
        }
    };

    return Engine;
});
