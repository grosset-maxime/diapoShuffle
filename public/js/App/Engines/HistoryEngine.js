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
        },

        setOptions: (opts) => {
            $.extend(true, _options, opts || {});
        },

        add: (pic) => {
            _history.push(pic);
            _navIndex = _history.length - 1;
        },

        remove: () => {
            if (!_history.length) {
                return;
            }

            _history.splice(_navIndex, 1);
            _navIndex--;
        },

        getCurrent: () => {
            return _history[_navIndex];
        },

        getPrevious: () => {
            let events = _options.events;

            _navIndex--;
            _navIndex = _navIndex < 0 ? 0 : _navIndex;

            if (Engine.isFirst()) {
                events.onFirst();
            } else {
                events.onMiddle();
            }

            return _history[_navIndex];
        },

        getNext: () => {
            let events = _options.events,
                nbItem = _history.length;

            _navIndex++;
            _navIndex = _navIndex >= nbItem ? nbItem - 1 : _navIndex;

            if (Engine.isLast()) {
                events.onLast();
            } else {
                events.onMiddle();
            }

            return _history[_navIndex];
        },

        isFirst: () => {
            return _navIndex <= 0;
        },

        isLast: () => {
            return _navIndex >= (_history.length - 1);
        }
    };

    return Engine;
});
