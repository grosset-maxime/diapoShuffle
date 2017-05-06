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
        _navIndex = -1,
        _pined = [];

    Engine = {

        /**
         *
         */
        init: (opts = {}) => {
            _options = {};

            $.extend(
                true,
                _options,
                {
                    events: {
                        onLast: () => {},
                        onFirst: () => {},
                        onMiddle: () => {},
                        onClear: () => {},
                        onRemove: () => {},
                        onAdd: () => {}
                    }
                },
                opts
            );
        }, // End init()

        /**
         *
         */
        setOptions: (opts) => {
            $.extend(true, _options, opts || {});
        },

        /**
         *
         */
        add: (pic) => {
            var result = _pined.find(function (aPic) {
                return aPic.src === pic.src;
            });

            if (result) {
                return;
            }

            _pined.push(pic);
            _navIndex = _pined.length - 1;

            _options.events.onAdd();
        },

        /**
         *
         */
        remove: () => {
            _pined.splice(_navIndex, 1);
            _navIndex--;

            _options.events.onRemove();
        },

        clear: () => {
            _navIndex = -1;
            _pined = [];

            _options.events.onClear();
        },

        /**
         *
         */
        getCurrent: () => {
            return _pined[_navIndex].incCounter();
        },

        /**
         *
         */
        getPrevious: () => {
            let events = _options.events,
                onMiddle = events.onMiddle,
                onFirst = events.onFirst;

            _navIndex--;

            if (Engine.isFirst()) {
                onFirst();
            } else {
                onMiddle();
            }

            return _pined[_navIndex].incCounter();
        },

        /**
         *
         */
        getNext: () => {
            let events = _options.events,
                onMiddle = events.onMiddle,
                onLast = events.onLast;

            _navIndex++;

            if (Engine.isLast()) {
                onLast();
            } else {
                onMiddle();
            }

            return _pined[_navIndex].incCounter();
        },

        getRandom: () => {
            _navIndex = Utils.getRandomNum(_pined.length - 1);

            return _pined[_navIndex].incCounter();
        },

        run: () => {
            return Engine.getRandom();
        },

        /**
         *
         */
        isFirst: () => {
            return _navIndex <= 0;
        },

        /**
         *
         */
        isLast: () => {
            return _navIndex >= (_pined.length - 1);
        },

        getNbPined: () => {
            return _pined.length;
        }
    };

    return Engine;
});
