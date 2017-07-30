/* global
    define, curl
*/

define(
[
    'jquery',

    // App Actions
    'App/Actions/PlayerAction',

    // App Views
    'App/Views/HeaderView',
    'App/Views/FooterView',
    'App/Views/OptionsView',
    'App/Views/InfosView',
    'App/Views/PlayerView'
],
function (
    $,

    PlayerAction,

    HeaderView,
    FooterView,
    OptionsView,
    InfosView,
    PlayerView
) {
    'use strict';

    let ShortcutsView;

    let View,
        _options = {},
        _els = {};

    // Private functions.
    let _buildSkeleton, _attachEvents, _attachKeyboardShorcuts,
        _toggleShortcutsView;


    _buildSkeleton = () => {
        let mainCtn;

        mainCtn = _els.mainCtn = $('<div>', {
            'class': 'diapo_shuffle flex'
        });

        _els.headerCtn = $('<div>', {
            'class': 'ds_header_ctn flex'
        }).appendTo(mainCtn);

        _els.middleCtn = $('<div>', {
            'class': 'ds_middle_ctn flex'
        }).appendTo(mainCtn);

        _els.footerCtn = $('<div>', {
            'class': 'ds_footer_ctn flex'
        }).appendTo(mainCtn);

        _options.root.append(mainCtn);
    };

    _attachEvents = () => {
        let resizeTimeout;

        _attachKeyboardShorcuts();

        $(window).resize(() => {
            clearTimeout(resizeTimeout);

            resizeTimeout = setTimeout(() => {
                PlayerView.getViewDimension(true);
            }, 500);
        });
    };

    _toggleShortcutsView = () => {
        curl(['App/Views/ShortcutsView'], function (View) {
            ShortcutsView = View;

            View.init({
                root: _els.mainCtn
            });

            View.toggle();
        });
    };

    _attachKeyboardShorcuts = () => {
        $(document).on('keydown', (e) => {
            let keyPressed = e.which,
                doPreventDefault = false,
                isPlaying = PlayerAction.isPlaying(),
                isDisabled = PlayerAction.isDisabled();

            console.log(keyPressed);

            if (isPlaying && !isDisabled) {

                switch (keyPressed) {
                    case 72: // h (help)
                        PlayerAction.pause(false);
                        _toggleShortcutsView();
                        break;

                    case 27: // ESC
                        if (ShortcutsView && ShortcutsView.isShow()) {
                            ShortcutsView.hide();
                        } else {
                            PlayerAction.stop();
                        }
                        break;

                    case 32: // SPACE
                    case 40: // down arrow
                        PlayerAction.pause();
                        doPreventDefault = true;
                        break;

                    case 73: // i (as inside)
                    case 38: // up arrow
                        PlayerView.askInsideFolder();
                        break;

                    case 65: // a (as add)
                        PlayerView.askAddFolder();
                        break;

                    case 68: // d (as delete)
                    case 46: // supp
                        PlayerView.askDeletePic();
                        break;

                    case 84: // t (as tags)
                        PlayerView.askTags();
                        doPreventDefault = true;
                        break;

                    case 80: // p (as pin)
                    // case 16: // shift
                        PlayerView.pin();
                        break;

                    case 37: // left arrow
                        PlayerView.displayPrevious();
                        break;

                    case 39: // right arrow
                        PlayerView.displayNext();
                        break;

                    case 111: // "/" slash
                        PlayerView.setNaturalSize();
                        break;

                    case 106: // "*" asterix
                        PlayerView.setScaleSize();
                        break;

                    case 107: // "+" plus
                        PlayerView.zoomIn();
                        break;

                    case 109: // "-" minus
                        PlayerView.zoomOut();
                        break;
                }

            } else if (!isPlaying && !isDisabled) {

                switch (keyPressed) {
                    case 72: // h (help)
                        _toggleShortcutsView();
                        break;

                    case 13: // Enter
                        if (OptionsView.isFolderFinderOpen()) {
                            OptionsView.closeFolderFinder();
                            doPreventDefault = true;
                        }
                        break;

                    case 27: // ESC
                        if (ShortcutsView && ShortcutsView.isShow()) {
                            ShortcutsView.hide();
                        } else {
                            if (OptionsView.isFolderFinderOpen()) {
                                OptionsView.closeFolderFinder();
                            }
                        }
                        break;

                    case 32: // SPACE
                    case 80: // p (as pause)
                        if (!OptionsView.hasFocus()) {
                            PlayerAction.play();
                            doPreventDefault = true;
                        }
                        break;

                    case 66: // b (as browse)
                        OptionsView.toggleFolderFinder();
                        break;
                }

            }

            if (doPreventDefault) {
                e.preventDefault();
            }
        });
    };

    View = {

        init: (opts) => {
            let mainCtn;

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

            _buildSkeleton();
            mainCtn = _els.mainCtn;

            HeaderView.init({
                root: _els.headerCtn
            });

            FooterView.init({
                root: _els.footerCtn
            });

            OptionsView.init({
                root: _els.middleCtn,
                mainView: View
            });

            InfosView.init({
                root: mainCtn
            });

            PlayerView.init({
                root: mainCtn,
                mainView: View
            });

            _attachEvents();
        },

        toggleShortcutsView: _toggleShortcutsView
    };

    return View;
});
