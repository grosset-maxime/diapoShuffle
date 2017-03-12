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
            let pic, navIndex;

            function onSuccess (results) {
                navIndex = Math.floor(Math.random() * results.length);
                pic = results[navIndex];

                if (pic.incCounter) {
                    pic.incCounter();
                } else {
                    pic = new Pic({
                        publicPathWithName: pic.path,
                        tags: pic.tags
                    });
                    _results[navIndex] = pic;
                }

                options.onSuccess && options.onSuccess(pic);
            }


            if (!_results.length) {

                API.getPicsFromTags({
                    Tags: options.Tags,
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
