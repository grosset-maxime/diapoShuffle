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
        _setTags;


    _buildSkeleton = () => {
        let mainCtn, customFolderPathCtn, randomPublicPathCtn,
            picturePathCtn, pictureCounterCtn, tagsCtn;

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

        _els.tagsCtn = tagsCtn = $('<div>', {
            'class': 'tags_ctn',
            on: {
                click: () => {
                    // If no tags, hide tags ctn.
                    if (tagsCtn.hasClass('no_tags')) {
                        tagsCtn.css('left', '-100%');
                        return;
                    }

                    // If tags ctn is displayed, slide it to hide it.
                    if (tagsCtn.hasClass('displayed')) {
                        tagsCtn.css('transform', 'none');

                    // If tags ctn is not displayed, slide it to show it.
                    } else {
                        tagsCtn.css('transform', 'translateX(' + tagsCtn.width() + 'px)');
                    }

                    tagsCtn.toggleClass('displayed');
                }
            }
        });

        _els.mainCtn.append(
            pictureCounterCtn,
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
        _els.pictureCounterCtn.html(pic.count);
    };

    _setTags = (pic = {}) => {
        let tags = pic.tags || [],
            tagsCtn = _els.tagsCtn;

        tagsCtn.empty();

        if (!tags.length) {
            tagsCtn.html('No tags.')
                .addClass('no_tags')
                // Reset css previously added by previous pic which has tags.
                .css({
                    left: '',
                    transform: ''
                });
            return;
        }

        tagsCtn.removeClass('no_tags');

        tags.forEach(function (Tag) {
            tagsCtn.append(
                $('<div>', {
                    'class': 'tag',
                    text: Tag.getName()
                })
            );
        });

        // hide tags ctn to left to hide it not completly.
        setTimeout(function () {
            tagsCtn.css('left', - (tagsCtn.width() - 10) + 'px');
        }, 10);
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

            if (OptionsView.isPlayPinedOn()) {
                _setPicCounter(pic);
                _els.pictureCounterCtn.show();
            } else {
                _els.pictureCounterCtn.hide();
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
