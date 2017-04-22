/* global
    define
*/

define(
[
    'jquery'
],
function ($) {
    'use strict';

    let Engine,
        _options = {},
        _navIndex = -1,
        _history = [];

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
                        onMiddle: () => {}
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
        }, // End setOptions()

        /**
         *
         */
        add: (pic) => {
            _history.push(pic);
            _navIndex = _history.length - 1;
        },

        /**
         *
         */
        remove: () => {
            _history.splice(_navIndex, 1);
            _navIndex--;
        },

        /**
         *
         */
        getCurrent: () => {
            return _history[_navIndex];
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

            return _history[_navIndex];
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

            return _history[_navIndex];
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
            return _navIndex >= (_history.length - 1);
        }
    };

    return Engine;
});
