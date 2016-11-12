/* global
    define
*/

define(
[
    'jquery'
],
function ($) {
    'use strict';

    let Action,
        _options = {},
        _navIndex = -1,
        _pined = [];

    Action = {

        /**
         *
         */
        init: (opts = {}) => {
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
            return _pined[_navIndex];
        },

        /**
         *
         */
        getPrevious: () => {
            let events = _options.events,
                onMiddle = events.onMiddle,
                onFirst = events.onFirst;

            _navIndex--;

            if (Action.isFirst()) {
                onFirst();
            } else {
                onMiddle();
            }

            return _pined[_navIndex];
        },

        /**
         *
         */
        getNext: () => {
            let events = _options.events,
                onMiddle = events.onMiddle,
                onLast = events.onLast;

            _navIndex++;

            if (Action.isLast()) {
                onLast();
            } else {
                onMiddle();
            }

            return _pined[_navIndex];
        },

        getRandom: () => {
            _navIndex = Math.floor(Math.random() * _pined.length);
            return _pined[_navIndex];
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

    return Action;
});
