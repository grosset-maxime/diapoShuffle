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
    let _buildSkeleton, _setPicFolderPath, _setPicCounter, _displayOsPicPath,
        _setTags, _onTagsCtnClick, _setPicIndice;


    _buildSkeleton = () => {
        let mainCtn, customFolderPathCtn, randomPublicPathCtn,
            picturePathCtn, pictureCounterCtn, tagsCtn, pictureIndiceCtn;

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

        _els.pictureIndiceCtn = pictureIndiceCtn = $('<div>', {
            'class': 'picture_counter_ctn'
        });

        _els.tagsCtn = tagsCtn = $('<div>', {
            'class': 'tags_ctn',
            on: {
                click: _onTagsCtnClick
            }
        });

        _els.mainCtn.append(
            pictureCounterCtn,
            pictureIndiceCtn,
            picturePathCtn,
            tagsCtn
        );

        _options.root.append(mainCtn);
    };

    _setPicFolderPath = (pic = {}) => {
        _els.customFolderPathCtn.html(pic.customFolderPath);
        _els.randomPublicPathCtn.html(pic.randomPublicPath);
    };

    _setPicCounter = (pic = {}) => {
        let picCount = pic.count,
            counter = pic.nbResult ? (pic.nbResult + ' | ' + picCount) : picCount;

        _els.pictureCounterCtn.html(counter);
    };

    _setPicIndice = (pic = {}) => {
        let picIndice = pic.indice,
            indice = pic.nbResult
                ? (pic.indice + ' / ' + pic.nbResult)
                : picIndice;
            indice += ' | ' + pic.count;

        _els.pictureIndiceCtn.html(indice);
    };

    _setTags = (pic = {}) => {
        let tags = pic.tags || [],
            tagsCtn = _els.tagsCtn;

        tagsCtn
            .empty()
            .removeClass('no_tags hidden')
            .css('transform', '');

        if (!tags.length) {
            tagsCtn.html('No tags.')
                .addClass('no_tags');
            return;
        }

        tags.forEach(function (Tag) {
            tagsCtn.append(
                $('<div>', {
                    'class': 'tag',
                    text: Tag.getName()
                })
            );
        });
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

    _onTagsCtnClick = () => {
        let tagsCtn = _els.tagsCtn;

        if (tagsCtn.hasClass('hidden')) {
            // If tags ctn is not displayed, slide it to show it.
            tagsCtn.css('transform', 'none');
        } else {
            // If tags ctn is displayed, slide it to hide it.
            tagsCtn.css('transform', 'translateX(-' + tagsCtn.width() + 'px)');
        }

        tagsCtn.toggleClass('hidden');
    };


    View = {
        /**
         *
         */
        init: (opts = {}) => {
            _options = {};

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

            if (
                OptionsView.isPlayPinedOn()
            ) {
                _setPicCounter(pic);
                _els.pictureCounterCtn.show();
            } else {
                _els.pictureCounterCtn.hide();
            }

            if (
                OptionsView.isInsideFolder() ||
                OptionsView.getSelectedTags().length
            ) {
                _setPicIndice(pic);
                _els.pictureIndiceCtn.show();
            } else {
                _els.pictureIndiceCtn.hide();
            }

            if (OptionsView.showTags()) {
                _setTags(pic);
                _els.tagsCtn.show();
            } else {
                _els.tagsCtn.hide();
            }

            _els.mainCtn.show();
        },

        hide: () => {
            _els.mainCtn.hide();
        },

        updateTags: () => {
            if (OptionsView.showTags()) {
                _setTags(_currentPic);
            }
        }
    };

    return View;
});
