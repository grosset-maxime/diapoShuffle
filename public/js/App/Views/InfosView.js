/* global
    define
*/

define(
[
    'jquery',

    // App View
    'App/Views/OptionsView'
],
function ($, OptionsView) {
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
            'class': 'ds_infos_view'
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
        setPicFolderPath: function (customFolderPath, randomPublicPath) {
            var customFolderPathCtn, randomPublicPathCtn;

            customFolderPathCtn = $('<span>', {
                'class': 'custom_folder_path',
                html: customFolderPath
            });

            randomPublicPathCtn = $('<span>', {
                'class': 'random_public_path',
                html: randomPublicPath
            });

            els.mainCtn.html(
                $('<div>').append(customFolderPathCtn, randomPublicPathCtn)
            );

            View.show();
        }, // End function setPicPath()

        /**
         *
         */
        show: function () {
            if (!OptionsView.isPublicPathOn()) {
                View.hide();
                return;
            }

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
