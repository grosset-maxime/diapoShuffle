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
        let mainCtn, customFolderPathCtn, randomPublicPathCtn,
            picturePathCtn, pictureCounterCtn;

        mainCtn = _els.mainCtn = $('<div>', {
            'class': 'ds_infos_view'
        });

        _els.customFolderPathCtn = customFolderPathCtn = $('<span>', {
            'class': 'custom_folder_path'
        });

        _els.randomPublicPathCtn = randomPublicPathCtn = $('<span>', {
            'class': 'random_public_path'
        });

        _els.picturePathCtn = picturePathCtn = $('<div>', {
            'class': 'picture_path_ctn',
            html: [customFolderPathCtn, randomPublicPathCtn]
        });

        _els.pictureCounterCtn = pictureCounterCtn = $('<div>', {
            'class': 'picture_counter_ctn'
        });

        _els.mainCtn.append(
            pictureCounterCtn,
            picturePathCtn
        );

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

        setPicCounter: (counter) => {
            _els.pictureCounterCtn.html(counter);
        },

        /**
         *
         */
        setPicFolderPath: (customFolderPath, randomPublicPath) => {
            _els.customFolderPathCtn.html(customFolderPath);
            _els.randomPublicPathCtn.html(randomPublicPath);
        },

        show: () => {
            if (!OptionsView.isPublicPathOn()) {
                _els.picturePathCtn.hide();
            }

            if (OptionsView.isPlayPinedOn()) {
                _els.pictureCounterCtn.show();
            } else {
                _els.pictureCounterCtn.hide();
            }

            _els.mainCtn.show();
        },

        hide: () => {
            _els.mainCtn.hide();
        }
    };

    return View;
});
