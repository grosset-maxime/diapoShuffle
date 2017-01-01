/* global
    define, globals
*/

define(
[
    'jquery',

    // PM
    'PM/Utils/Client',

    // App View
    'App/Views/OptionsView'
],
function ($, Client, OptionsView) {
    'use strict';

    let View,
        _options = {},
        _els = {},
        _currentPic = {};


    // Private functions.
    let _buildSkeleton, _setPicFolderPath, _setPicCounter, _displayOsPicPath;


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
            html: [customFolderPathCtn, randomPublicPathCtn],
            on: {
                click: function () {
                    _displayOsPicPath();
                }
            }
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

    _setPicFolderPath = (pic = {}) => {
        _els.customFolderPathCtn.html(pic.customFolderPath);
        _els.randomPublicPathCtn.html(pic.randomPublicPath);
    };

    _setPicCounter = (pic = {}) => {
        _els.pictureCounterCtn.html(pic.count);
    };

    _displayOsPicPath = () => {
        let range,
            completePath = '',
            paths = [globals.picsRootPath || '', _currentPic.randomPublicPath, _currentPic.name];

        paths.forEach(function (path) {
            if (path && path.indexOf('/') !== 0) {
                path = '/' + path;
            }

            if (path.lastIndexOf('/') === (path.length - 1)) {
                path = path.slice(0, -1);
            }

            completePath += path;
        });

        if (Client.OS.win) {
            completePath = completePath.replace(new RegExp('/', 'g'), '\\');
        }

        _els.customFolderPathCtn.empty();
        _els.randomPublicPathCtn.html(completePath);

        // Select the path.
        range = document.createRange();
        range.selectNode(_els.randomPublicPathCtn[0]);
        window.getSelection().addRange(range);
    };

    View = {
        /**
         *
         */
        init: (opts = {}) => {
            $.extend(
                true,
                _options,
                {
                    root: null
                },
                opts
            );

            if (!_options.root) {
                _options.root = $(document.body);
            }

            _buildSkeleton();
        },

        show: (pic = {}) => {
            _currentPic = pic;

            if (OptionsView.isPublicPathOn()) {
                _setPicFolderPath(pic);
                _els.picturePathCtn.show();
            } else {
                _els.picturePathCtn.hide();
            }

            if (OptionsView.isPlayPinedOn()) {
                _setPicCounter(pic);
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
