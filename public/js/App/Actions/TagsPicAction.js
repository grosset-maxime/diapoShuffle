/* global
    define
*/

define(
[
    'jquery',

    'App/API/API',
    'App/Class/Pic'
],
function ($, API, Pic) {
    'use strict';

    let Action,
        _options = {},
        _results = [];

    Action = {

        /**
         *
         */
        init: (opts = {}) => {
            _options = {};

            // $.extend(
            //     true,
            //     _options,
            //     {
            //         events: {
            //             onLast: () => {},
            //             onFirst: () => {},
            //             onMiddle: () => {},
            //             onClear: () => {},
            //             onRemove: () => {},
            //             onAdd: () => {}
            //         }
            //     },
            //     opts
            // );
        }, // End init()

        /**
         *
         */
        setOptions: (opts) => {
            $.extend(true, _options, opts || {});
        },


        getRandom: (options) => {

            function onSuccess (results) {
                let navIndex, pic,
                    nbResult = results.length;

                navIndex = Math.floor(Math.random() * nbResult);
                pic = results[navIndex];

                if (!pic.incCounter) {
                    pic = new Pic({
                        publicPathWithName: pic.path,
                        tags: pic.tags,
                        nbResult: nbResult
                    });
                    _results[navIndex] = pic;
                }

                pic.incCounter();

                options.onSuccess && options.onSuccess(pic);
            }


            if (!_results.length) {

                API.getPicsFromTags({
                    Tags: options.Tags,
                    operator: options.operator,
                    onSuccess: (results) => {
                        _results = results;
                        onSuccess(results);
                    },
                    onFailure: (error) => {
                        options.onFailure && options.onFailure(error);
                    }
                });
            } else {
                onSuccess(_results);
            }
        },

        clear: () => {
            _results = [];
        }
    };

    return Action;
});
