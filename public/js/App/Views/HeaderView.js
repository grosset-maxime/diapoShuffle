/* global
    define
*/

define(
[
    'jquery',
],
function ($) {
    'use strict';

    var defaultOptions = {
            root: null
        },
        options = {},
        els = {};

    /**
     *
     */
    function buildSkeleton () {
        var mainCtn;

        mainCtn = els.mainCtn = $('<div>', {
            'class': 'ds_header_view'
        });

        // mainCtn.append(
        // );

        options.root.append(mainCtn);
    } // End function buildSkeleton()

    var View = {
        /**
         *
         */
        init: function (opts) {
            $.extend(true, options, defaultOptions, opts || {});

            if (!options.root) {
                options.root = $(document.body);
            }

            buildSkeleton();
        }, // End function init()

        /**
         *
         */
        show: function () {
            els.mainCtn.show();
        }, // End function show()

        /**
         *
         */
        hide: function () {
            els.mainCtn.hide();
        } // End function hide()
    };

    return View;
});
