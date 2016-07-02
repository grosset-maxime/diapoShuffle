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

    let View,
        _options = {},
        _els = {};


    // Private functions.
    let _buildSkeleton;


    _buildSkeleton = () => {
        let mainCtn;

        mainCtn = _els.mainCtn = $('<div>', {
            'class': 'ds_infos_view'
        });

        // mainCtn.append(
        // );

        _options.root.append(mainCtn);
    };

    View = {
        /**
         *
         */
        init: (opts) => {
            $.extend(
                true,
                _options,
                {
                    root: null
                },
                opts || {}
            );

            if (!_options.root) {
                _options.root = $(document.body);
            }

            _buildSkeleton();
        },

        /**
         *
         */
        setPicFolderPath: (customFolderPath, randomPublicPath) => {
            let customFolderPathCtn, randomPublicPathCtn;

            customFolderPathCtn = $('<span>', {
                'class': 'custom_folder_path',
                html: customFolderPath
            });

            randomPublicPathCtn = $('<span>', {
                'class': 'random_public_path',
                html: randomPublicPath
            });

            _els.mainCtn.html(
                $('<div>').append(customFolderPathCtn, randomPublicPathCtn)
            );

            View.show();
        },

        show: () => {
            if (!OptionsView.isPublicPathOn()) {
                View.hide();
                return;
            }

            _els.mainCtn.show();
        },

        hide: () => {
            _els.mainCtn.hide();
        }
    };

    return View;
});
