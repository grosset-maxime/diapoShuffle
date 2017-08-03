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
        _currentIndex = -1;

    // Private functions
    let _getNextRandomly, _getNextAfter, _createPic;

    _getNextRandomly = () => {
        let navIndex, pic,
            nbPics = _pics.length;

        navIndex = Utils.getRandomNum(nbPics - 1);

        pic = _pics[navIndex];

        return !pic.incCounter ? _createPic(pic, navIndex, nbPics) : pic;
    };

    _getNextAfter = () => {
        let pic,
            nbPics = _pics.length;

        _currentIndex++;
        _currentIndex = _currentIndex >= nbPics ? 0 : _currentIndex;
        pic = _pics[_currentIndex];

        return !pic.incCounter ? _createPic(pic, _currentIndex, nbPics) : pic;
    };

    _createPic = (picInfo, navIndex, nbPics) => {
         let pic = new Pic({
            customFolderPath: _folder,
            publicPathWithName: picInfo.path,
            tags: picInfo.tags,
            indice: navIndex + 1,
            nbResult: nbPics
        });

         _pics[navIndex] = pic;

         return pic;
    };

    Engine = {

        init: (opts = {}) => {
            _options = {};
        },

        setOptions: (opts) => {
            $.extend(true, _options, opts || {});
        },

        getNext: (options) => {
            let pic;

            pic = options.getRandomly ? _getNextRandomly() : _getNextAfter();
            pic.incCounter();

            options.onSuccess && options.onSuccess(pic);

            return pic;
        },

        run: (options) => {
            if (!_pics.length) {
                API.getPicsList({
                    folder: options.folder,
                    onSuccess: (picsList) => {
                        _pics = picsList;
                        _folder = options.folder;
                        _currentIndex = -1;

                        if (!picsList.length) {
                            options.onFailure && options.onFailure();
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
            let nbPics = _pics.length;

            if (!nbPics) {
                return;
            }

            // Remove pic from the list.
            _pics.splice(_currentIndex, 1);

            // Set for each pic the new number of pics in the folder.
            _pics.forEach(function (pic) {
                pic.nbResult = nbPics - 1;
            });

            _currentIndex--;
        },

        clear: () => {
            _pics = [];
            _folder = '';
            _currentIndex = -1;
        }
    };

    return Engine;
});
