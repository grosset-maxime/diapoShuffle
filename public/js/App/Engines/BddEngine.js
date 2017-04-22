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

    let Engine,
        _options = {},
        _results = [];

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

                API.getPicsFromBdd({
                    Tags: options.Tags,
                    tagsOperator: options.tagsOperator,
                    types: options.types,
                    onSuccess: (results) => {
                        _results = results;
                        onSuccess(results);
                    },
                    onFailure: options.onFailure
                });
            } else {
                onSuccess(_results);
            }
        },

        clear: () => {
            _results = [];
        }
    };

    return Engine;
});
