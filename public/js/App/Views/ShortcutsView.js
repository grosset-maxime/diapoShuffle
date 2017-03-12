/* global
    define
*/

define(
[
    'jquery',
],
function ($) {
    'use strict';

    let View,
        _options = {},
        _els = {};

    // Private functions.
    let _buildSkeleton, _fillContent, _createElements,
        _homeShortuctsElements = [{
            shortcut: 'h',
            desc: 'Display Shortcuts / Help'
        }, {
            shortcut: 'Enter',
            desc: 'Close folder finder'
        }, {
            shortcut: 'ESC',
            desc: 'Close folder finder'
        }, {
            shortcut: 'SPACE / p',
            desc: 'Start playing'
        }, {
            shortcut: 'b',
            desc: 'Open folder finder'
        }],
        _playerShortuctsElements = [{
            shortcut: 'h',
            desc: 'Display Shortcuts / Help'
        }, {
            shortcut: 'ESC',
            desc: 'Stop playing, return to home'
        }, {
            shortcut: 'SPACE / down arrow',
            desc: 'Pause playing'
        }, {
            shortcut: 'i / up arrow',
            desc: 'Ask to enter inside folder of current picture'
        }, {
            shortcut: 'a',
            desc: 'Ask to add the folder\'s picture to the random list folder'
        }, {
            shortcut: 'd / SUPP',
            desc: 'Ask to delete the current picture'
        }, {
            shortcut: 'p / SHIFT',
            desc: 'Pin the current picture'
        }, {
            shortcut: 'left arrow',
            desc: 'Display previous picture'
        }, {
            shortcut: 'right arrow',
            desc: 'Display next picture'
        }];


    _buildSkeleton = () => {
        let mainCtn, contentCtn;

        if (!View._isInit) {
            View.init();
        }

        contentCtn = _els.contentCtn = $('<div>', {'class': 'content_ctn'
        });

        contentCtn.css(
            'transition',
            'transform ' + View._transitionTime + 'ms ease'
        );

        mainCtn = _els.mainCtn = $('<div>', {
            'class': 'ds_shortcuts_view',
            html: _fillContent(contentCtn)
        });

        _options.root.append(mainCtn);

        View._isBuilt = true;
    };

    _createElements = (elements) => {
        let a = [];

        $(elements).each(function() {
            let el = this;

            a.push($('<div>', {
                'class': 'line flex',
                html: [$('<div>', {
                    'class': 'line_title',
                    text: el.shortcut
                }), $('<div>', {
                    'class': 'line_desc',
                    text: el.desc
                })]
            }));
        });

        return a;
    };

    _fillContent = (contentCtn) => {
        let close, mainTitle, homeShortuctsTitle, homeShortuctsSection,
            playerShortuctsTitle, playerShortuctsSection,
            LINE_HEIGHT = 26;

        function toggleCollapse (sectionEl) {
            $(sectionEl).toggleClass('collapse');
        }

        close = $('<div>', {
            'class': 'close',
            text: 'X',
            on: {
                click: View.hide
            }
        });

        mainTitle = $('<div>', {
            'class': 'main_title',
            text: 'Shortcuts / Help'
        });

        homeShortuctsTitle = $('<div>', {
            'class': 'section_title',
            text: 'Home shortcuts',
            on: {
                click: function () {
                    toggleCollapse(homeShortuctsSection);
                }
            }
        });

        homeShortuctsSection = $('<div>', {
            'class': 'section',
            html: _createElements(_homeShortuctsElements)
        }).css('height', _homeShortuctsElements.length * LINE_HEIGHT);

        playerShortuctsTitle = $('<div>', {
            'class': 'section_title',
            text: 'Player shortcuts',
            on: {
                click: function () {
                    toggleCollapse(playerShortuctsSection);
                }
            }
        });

        playerShortuctsSection = $('<div>', {
            'class': 'section',
            html: _createElements(_playerShortuctsElements)
        }).css('height', _playerShortuctsElements.length * LINE_HEIGHT);

        contentCtn.append(
            close,
            mainTitle,
            homeShortuctsTitle,
            homeShortuctsSection,
            playerShortuctsTitle,
            playerShortuctsSection
        );

        return contentCtn;
    };

    View = {

        _isInit: false,

        _isBuilt: false,

        _isShow: false,

        _transitionTime: 1000,

        init: (opts) => {
            if (View._isBuilt) {
                return;
            }

            _options = {};

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

            View._isInit = true;
        },

        /**
         *
         */
        show: () => {
            if (View._isShow) {
                return;
            }

            if (!View._isBuilt) {
                _buildSkeleton();
            }

            _els.mainCtn.show();

            setTimeout(function () {
                _els.contentCtn.addClass('show');
            }, 30);

            View._isShow = true;
        },

        /**
         *
         */
        hide: () => {
            if (!View._isBuilt || !View._isShow) {
                return;
            }

            _els.contentCtn.removeClass('show');

            setTimeout(function () {
                _els.mainCtn.hide();
            }, View._transitionTime);

            View._isShow = false;
        },

        toggle: () => {
            if (View._isShow) {
                View.hide();
            } else {
                View.show();
            }
        },

        isShow: () => {
            return View._isShow;
        }
    };

    return View;
});
