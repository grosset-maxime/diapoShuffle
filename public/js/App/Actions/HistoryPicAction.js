/* global
    define
*/

define(
[
    'jquery'
],
function ($) {
    'use strict';

    var _defaultOptions = {
            events: {
                onLast: () => {},
                onFirst: () => {},
                onMiddle: () => {}
            }
        },
        _options = {},
        _navIndex = -1,
        _history = [];

    var Action = {

        /**
         *
         */
        init: function (opts) {
            $.extend(true, _options, _defaultOptions, opts || {});
        }, // End function init()

        /**
         *
         */
        setOptions: function (opts) {
            $.extend(true, _options, opts || {});
        }, // End function setOptions()

        /**
         *
         */
        add: function (pic) {
            _history.push(pic);
            _navIndex = _history.length - 1;
        },

        /**
         *
         */
        remove: function () {
            _history.splice(_navIndex, 1);
            _navIndex--;
        },

        /**
         *
         */
        getCurrent: function () {
            return _history[_navIndex];
        },

        /**
         *
         */
        getPrevious: function () {
            var events = _options.events,
                onMiddle = events.onMiddle,
                onFirst = events.onFirst;

            _navIndex--;

            if (Action.isFirst()) {
                onFirst();
            } else {
                onMiddle();
            }

            return _history[_navIndex];
        },

        /**
         *
         */
        getNext: function () {
            var events = _options.events,
                onMiddle = events.onMiddle,
                onLast = events.onLast;

            _navIndex++;

            if (Action.isLast()) {
                onLast();
            } else {
                onMiddle();
            }

            return _history[_navIndex];
        },

        /**
         *
         */
        isFirst: function () {
            return _navIndex <= 0;
        },

        /**
         *
         */
        isLast: function () {
            return _navIndex >= (_history.length - 1);
        }
    };

    return Action;
});
