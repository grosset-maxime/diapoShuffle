/* global
    define, curl
*/

define(
[
    'jquery',

    // App API
    'App/API/API',
    'App/Notify',

    // App
    'App/Actions/GetRandomPicAction',
    'App/Actions/PinPicAction',
    'App/Views/FolderFinderView',

    // Non AMD
    'js!jquery-ui'
],
function (
    $,

    // App API
    API,
    Notify,

    GetRandomPicAction,
    PinPicAction,
    FolderFinderView
) {
    'use strict';

    const DEFAULT_INTERVAL = GetRandomPicAction.DEFAULT_INTERVAL,
        DEFAULT_ZOOM = 1;

    let View,
        _options = {},
        _els = {},
        _hasFocus = false;

    // Private functions.
    let _buildSkeleton, _clearCache, _onCloseFolderFinder, _updateNbCustomFolderSelected;


    _buildSkeleton = () => {
        let mainCtn, customFolderCtn, selectedCustomFolderCtn,
            footerCtn, btnStart, inputInterval, btnClearCache,
            intervalCtn, inputScale, scaleCtn, zoomCtn,
            inputZoom, pathPicCtn, inputPathPic, btnUnSelectAll,
            nbSelectedCtn, insideFolderCtn, keyUpInput, inputPinPic,
            pinPicCtn, tagsCtn, inputTags;

        /**
         * @private
         */
        keyUpInput = (e) => {
            let keyPressed = e.which,
                doPreventDefault = false;

            // console.log(keyPressed);

            switch (keyPressed) {
            case 13: // Enter
                doPreventDefault = true;
                GetRandomPicAction.start();
                break;
            }

            if (doPreventDefault) {
                e.preventDefault();
            }
        };


        mainCtn = _els.mainCtn = $('<div>', {
            'class': 'window ds_options_view flex',
            html: [$('<div>', {
                'class': 'title_view',
                'text': 'Options'
            }), $('<div>', {
                'class': 'help_btn',
                'text': '?',
                on: {
                    click: () => {
                        _options.mainView.toggleShortcutsView();
                    }
                }
            })]
        });

        footerCtn = _els.footerCtn = $('<div>', {
            'class': 'footer_ctn flex'
        });

        // Ctn custom folder
        // -----------------
        _els.btnUnSelectAll = btnUnSelectAll = $('<input>', {
            'class': 'btn btn_unselectall',
            type: 'button',
            value: 'Unselect All',
            on: {
                click: function () {
                    FolderFinderView.unSelectAll();
                }
            }
        }).button();

        _els.nbSelectedCtn = nbSelectedCtn = $('<div>', {
            'class': 'nb_selected'
        });

        customFolderCtn = _els.customFolderCtn = $('<div>', {
            'class': 'el_ctn flex'
        }).append(
            $('<label>', {
                'class': 'title title_custom_folder',
                text: 'Folder(s) :'
            }),
            $('<input>', {
                'class': 'btn browse_custom_folder_btn',
                type: 'button',
                value: 'Browse ...',
                on: {
                    click: function () {
                        FolderFinderView.open();
                    }
                }
            }).button(),
            btnUnSelectAll,
            nbSelectedCtn
        );

        selectedCustomFolderCtn = _els.selectedCustomFolderCtn = $('<div>', {
            'class': 'el_ctn selected_custom_folder_ctn'
        });

        insideFolderCtn = _els.insideFolderCtn = $('<div>', {
            'class': 'el_ctn inside_folder_ctn',
            html: [
                $('<label>', {
                    'class': 'title title_inside_folder',
                    text: 'Inside folder :'
                }),
                _els.insideFolder = $('<div>', {
                    'class': 'inside_folder'
                })
            ]
        });

        // Btn start
        btnStart = _els.btnStart = $('<input>', {
            'class': 'btn start_btn',
            type: 'button',
            value: 'Start',
            on: {
                click: GetRandomPicAction.start
            }
        }).button();

        // Input interval
        inputInterval = _els.inputInterval = $('<input>', {
            id: 'intervalOpts',
            'class': 'input_interval input_spinner',
            value: DEFAULT_INTERVAL,
            maxlength: 2,
            numberFormat: 'n',
            on: {
                focus: function () {
                    _hasFocus = true;
                },
                blur: function () {
                    _hasFocus = false;
                },
                keyup: keyUpInput
            }
        });

        // Ctn interval
        intervalCtn = $('<div>', {
            'class': 'el_ctn'
        }).append(
            $('<label>', {
                'class': 'title label',
                text: 'Interval (s) :',
                for: 'intervalOpts'
            }),
            inputInterval
        );

        // Checkbox scale
        inputScale = _els.inputScale = $('<input>', {
            id: 'scaleOpts',
            'class': 'input_text',
            type: 'checkbox',
            checked: true,
        });

        // Ctn scale
        scaleCtn = $('<div>', {
            'class': 'el_ctn'
        }).append(
            inputScale,
            $('<label>', {
                'class': 'title label',
                text: 'Scale',
                for: 'scaleOpts'
            })
        );

        // Spinner Zoom
        inputZoom = _els.inputZoom = $('<input>', {
            id: 'zoomOpts',
            'class': 'input_zoom input_spinner',
            value: DEFAULT_ZOOM,
            step: 0.1,
            maxlength: 2,
            numberFormat: 'n',
            on: {
                focus: function () {
                    _hasFocus = true;
                },
                blur: function () {
                    _hasFocus = false;
                },
                keyup: keyUpInput
            }
        });

        // Ctn Zoom
        zoomCtn = $('<div>', {
            'class': 'el_ctn'
        }).append(
            $('<label>', {
                'class': 'title label',
                text: 'Zoom :',
                for: 'zoomOpts',
                on: {
                    click: function () {
                        inputZoom.focus();
                    }
                }
            }),
            inputZoom
        );

        // Checkbox scale
        inputPathPic = _els.inputPathPic = $('<input>', {
            'class': 'input_text',
            type: 'checkbox',
            checked: true
        });

        // Ctn scale
        pathPicCtn = $('<div>', {
            'class': 'el_ctn'
        }).append(
            inputPathPic,
            $('<span>', {
                'class': 'title label',
                text: 'Display path picture',
                on: {
                    click: function () {
                        inputPathPic[0].checked = !inputPathPic[0].checked;
                    }
                }
            })
        );

        // Checkbox pin
        inputPinPic = _els.inputPinPic = $('<input>', {
            'class': 'input_text',
            type: 'checkbox',
            checked: false,
            on: {
                click: function () {
                    if (inputPinPic.parent().hasClass('disabled')) {
                        inputPinPic.attr('checked', false);
                    }
                }
            }
        });

        // Ctn pin
        pinPicCtn = $('<div>', {
            'class': 'el_ctn disabled'
        }).append(
            inputPinPic,
            $('<span>', {
                'class': 'title label',
                text: 'Display picture from pined',
                on: {
                    click: function () {
                        inputPinPic[0].checked = !pinPicCtn.hasClass('disabled') && !inputPinPic[0].checked;
                    }
                }
            }),
            $('<span>', {
                'class': 'title count',
                text: ''
            }),
            $('<span>', {
                'class': 'title clear_btn text_btn',
                text: 'clear',
                on: {
                    click: PinPicAction.clear
                }
            }).hide()
        );


        // Checkbox tags
        inputTags = _els.inputTags = $('<input>', {
            'class': 'input_text',
            type: 'checkbox',
            checked: true
        });

        // Ctn tags
        tagsCtn = $('<div>', {
            'class': 'el_ctn'
        }).append(
            inputTags,
            $('<span>', {
                'class': 'title label',
                text: 'Display tags',
                on: {
                    click: function () {
                        inputTags[0].checked = !inputTags[0].checked;
                    }
                }
            })
        );

        btnClearCache = $('<div>', {
            'class': 'clear_cache_btn text_btn',
            text: 'Clear cache',
            on: {
                click: _clearCache
            }
        });

        footerCtn.append(
            btnStart,
            btnClearCache
        );

        mainCtn.append(
            customFolderCtn,
            selectedCustomFolderCtn,
            insideFolderCtn,
            intervalCtn,
            zoomCtn,
            scaleCtn,
            pathPicCtn,
            pinPicCtn,
            tagsCtn,
            footerCtn
        );

        _options.root.append(mainCtn);

        inputInterval.spinner({
            min: 1,
            max: 60
        });

        inputZoom.spinner({
            min: 1,
            max: 99
        });
    };

    _clearCache = () => {
        API.clearCache({
            onSuccess: () => {
                FolderFinderView.clear();
                Notify.info({
                    message: 'Cache has been cleared successfully.'
                });
            },
            onFailure: (error) => {
                Notify.error({ message: error });
            }
        });
    };

    _onCloseFolderFinder = () => {
        let nbCustomFolderSelected = View.getCustomFolders().length,
            btnUnSelectAll = _els.btnUnSelectAll;

        _updateNbCustomFolderSelected();

        if (!nbCustomFolderSelected) {
            btnUnSelectAll.hide();
            return;
        }

        btnUnSelectAll.show();
    };

    _updateNbCustomFolderSelected = () => {
        var nbCustomFolderSelected = View.getCustomFolders().length,
            nbSelectedCtn = _els.nbSelectedCtn;

        if (!nbCustomFolderSelected) {
            nbSelectedCtn.hide();
            return;
        }

        nbSelectedCtn.text('Selected: ' + nbCustomFolderSelected);
        nbSelectedCtn.show();
    };


    View = {

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

            FolderFinderView.init({
                root: opts.root,
                selectedFolderCtn: _els.selectedCustomFolderCtn,
                events: {
                    onClose: _onCloseFolderFinder,
                    onNonSelected: _onCloseFolderFinder,
                    onSelect: _updateNbCustomFolderSelected,
                    onUnselect: _updateNbCustomFolderSelected
                }
            });
        },

        getTimeInterval: () => {
            let inputInterval = _els.inputInterval,
                interval = inputInterval.spinner('value') || DEFAULT_INTERVAL;

            inputInterval.spinner('value', interval);

            return interval;
        },

        getZoom: () => {
            let inputZoom = _els.inputZoom,
                zoom = inputZoom.spinner('value') || DEFAULT_ZOOM;

            inputZoom.spinner('value', zoom);

            return zoom;
        },

        isPlayPinedOn: () => !!_els.inputPinPic[0].checked,

        showTags: () => !!_els.inputTags[0].checked,

        toggleFolderFinder: () => {
            if (FolderFinderView.isOpen()) {
                FolderFinderView.close();
            } else {
                FolderFinderView.open();
            }
        },

        closeFolderFinder: () => {
            FolderFinderView.close();
        },

        setInsideFolder: (path) => {
            let css = {
                opacity: 0.3
            };

            _els.insideFolder.html(
                $('<div>', {
                    'class': 'btn btn_inside_folder',
                    text: path,
                    on: {
                        click: () => {
                            GetRandomPicAction.setInsideFolder(); // Remove Inside folder
                        }
                    }
                }).button()
            );

            _els.insideFolderCtn.show();

            _els.selectedCustomFolderCtn.css(css);
            _els.customFolderCtn.css(css);
        },

        resetInsideFolder: () => {
            let css = {
                opacity: 1
            };

            _els.insideFolderCtn.hide();
            _els.insideFolder.empty();

            _els.selectedCustomFolderCtn.css(css);
            _els.customFolderCtn.css(css);
        },

        addCustomFolder: (folder) => {
            FolderFinderView.addFolders(folder);
        },

        isScaleOn: () => !!_els.inputScale[0].checked,

        isPublicPathOn: () => !!_els.inputPathPic[0].checked,

        isFolderFinderOpen: () => FolderFinderView.isOpen(),

        hasFocus: () => _hasFocus,

        getCustomFolders: () => FolderFinderView.getSelectedPath(),

        onClearPined: () => {
            let inputPinPic = _els.inputPinPic,
                parent = inputPinPic.parent();

            parent.find('.count').text('');
            parent.addClass('disabled');
            parent.find('.clear_btn').hide();

            inputPinPic[0].checked = false;
        },

        onAddPined: () => {
            let inputPinPic = _els.inputPinPic,
                parent = inputPinPic.parent();

            parent.find('.count').text('(' + PinPicAction.getNbPined() + ')');
            parent.removeClass('disabled');
            parent.find('.clear_btn').show();
        },

        onRemovePined: () => {
            let inputPinPic = _els.inputPinPic,
                parent = inputPinPic.parent(),
                nbPined = PinPicAction.getNbPined();

            parent.find('.count').text('(' + nbPined + ')');

            if (!nbPined) {
                parent.addClass('disabled');
                parent.find('.clear_btn').hide();
                inputPinPic[0].checked = false;
            }
        }
    };

    return View;
});
