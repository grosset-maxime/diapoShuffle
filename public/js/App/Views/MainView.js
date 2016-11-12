/* global
    define
*/

define(
[
    'jquery',

    // App Views
    'App/Views/HeaderView',
    'App/Views/FooterView',
    'App/Views/OptionsView',
    'App/Views/InfosView',
    'App/Views/PlayView'
],
function (
    $,

    HeaderView,
    FooterView,
    OptionsView,
    InfosView,
    PlayView
) {
    'use strict';


    let View,
        _options = {},
        _els = {};

    // Private functions.
    let _buildSkeleton, _attachEvents, _attachKeyboardShorcuts;


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
                PlayView.getViewDimension(true);
            }, 500);
        });
    };

    _attachKeyboardShorcuts = () => {
        $(document).on('keydown', (e) => {
            let keyPressed = e.which,
                doPreventDefault = false;

            // console.log(keyPressed);

            if (PlayView.isPlaying()) {

                switch (keyPressed) {
                case 27: // ESC
                    PlayView.stop();
                    break;

                case 32: // SPACE
                    PlayView.pause();
                    doPreventDefault = true;
                    break;

                case 73: // i (as inside)
                    PlayView.askInsideFolder();
                    break;

                case 65: // a (as add)
                    PlayView.askAddFolder();
                    break;

                case 68: // d (as delete)
                    PlayView.askDeletePic();
                    break;

                case 80: // p (as pin)
                    PlayView.pin();
                    break;

                case 37: // left arrow.
                    PlayView.displayPrevious();
                    break;

                case 39: // right arrow.
                    PlayView.displayNext();
                    break;
                }

            } else {

                switch (keyPressed) {
                case 13: // Enter
                    if (OptionsView.isFolderFinderOpen()) {
                        OptionsView.closeFolderFinder();
                        doPreventDefault = true;
                    }
                    break;

                case 27: // ESC
                    if (OptionsView.isFolderFinderOpen()) {
                        OptionsView.closeFolderFinder();
                    }
                    break;

                case 32: // SPACE
                case 80: // p (as pause)
                    if (!OptionsView.hasFocus()) {
                        PlayView.play();
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
                root: _els.middleCtn
            });

            InfosView.init({
                root: mainCtn
            });

            PlayView.init({
                root: mainCtn,
                mainView: View
            });

            _attachEvents();
        }
    };

    return View;
});
