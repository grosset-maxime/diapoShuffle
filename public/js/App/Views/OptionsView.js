/* global
    define, curl
*/

define(
[
    'jquery',

    // App
    'App/Notify',

    // API
    'App/API/API',

    // Actions
    'App/Actions/PlayerAction',

    // Views
    'App/Views/FolderFinderView',

    // Modals
    'App/Modals/TagsModal',

    // Engines
    'App/Engines/PinedEngine',
    'App/Engines/BddEngine',

    // Non AMD
    'js!jquery-ui'
],
function (
    $,

    // App
    Notify,

    // API
    API,

    // Actions
    PlayerAction,

    // Views
    FolderFinderView,

    // Modals
    TagsModal,

    // Engines
    PinedEngine,
    BddEngine
) {
    'use strict';

    const DEFAULT_INTERVAL = PlayerAction.DEFAULT_INTERVAL,
        DEFAULT_ZOOM = 1;

    let View,
        _options = {},
        _els = {},
        _hasFocus = false,
        _selectedTags = [],
        _isInsideFolder = false;

    // Private functions.
    let _buildSkeleton, _clearCache, _onCloseFolderFinder, _updateNbCustomFolderSelected,
        _onTagsSelectBtnClick, _onUnSelectAllTagsBtnClick, _buildTagsFilter, _buildFolderFilter,
        _buildInsideOption, _buildIntervalOption, _keyUpInput, _buildZoomOption, _buildScaleOption,
        _buildPathOption, _buildPinOption, _buildTagsOption, _buildFooter, _onTagsSelect, _buildTypesFilter,
        _onTypesSelectBtnClick, _removeTagFromSelected, _buildMuteVideoOption, _export, _showLoading,
        _hideLoading;


    _keyUpInput = (e) => {
        let keyPressed = e.which,
            doPreventDefault = false;

        switch (keyPressed) {
        case 13: // Enter
            doPreventDefault = true;
            PlayerAction.start();
            break;
        }

        if (doPreventDefault) {
            e.preventDefault();
        }
    };

    _buildFolderFilter = () => {
        let btnUnSelectAllFolders, nbSelectedCtn, customFolderCtn, selectedCustomFolderCtn;

        _els.btnUnSelectAllFolders = btnUnSelectAllFolders = $('<input>', {
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

        _els.customFolderCtn = customFolderCtn = $('<div>', {
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
            btnUnSelectAllFolders,
            nbSelectedCtn
        );

        _els.selectedCustomFolderCtn = selectedCustomFolderCtn = $('<div>', {
            'class': 'el_ctn selected_custom_folder_ctn'
        });

        _els.mainCtn.append(
            customFolderCtn,
            selectedCustomFolderCtn
        );
    };

    _buildTypesFilter = () => {
        let typesCtn;

        typesCtn = _els.typesCtn = $('<div>', {
            'class': 'el_ctn flex type_filter_ctn'
        }).append(
            $('<label>', {
                'class': 'title',
                text: 'Type(s) :'
            }),
            $('<input>', {
                'class': 'btn',
                type: 'button',
                value: 'JPG',
                on: {
                    click: _onTypesSelectBtnClick
                }
            }).button(),
            $('<input>', {
                'class': 'btn',
                type: 'button',
                value: 'GIF',
                on: {
                    click: _onTypesSelectBtnClick
                }
            }).button(),
            $('<input>', {
                'class': 'btn',
                type: 'button',
                value: 'PNG',
                on: {
                    click: _onTypesSelectBtnClick
                }
            }).button(),
            $('<input>', {
                'class': 'btn',
                type: 'button',
                value: 'WEBM',
                on: {
                    click: _onTypesSelectBtnClick
                }
            }).button(),
            $('<input>', {
                'class': 'btn',
                type: 'button',
                value: 'MP4',
                on: {
                    click: _onTypesSelectBtnClick
                }
            }).button(),
            $('<input>', {
                'class': 'btn',
                type: 'button',
                value: 'MKV',
                on: {
                    click: _onTypesSelectBtnClick
                }
            }).button()
        );

        _els.mainCtn.append(
            typesCtn
        );
    };

    _buildTagsFilter = () => {
        let btnTagOperator, btnUnSelectAllTags, tagsCtn,selectedTagsCtn;

        _els.btnUnSelectAllTags = btnUnSelectAllTags = $('<input>', {
            'class': 'btn btn_unselectall',
            type: 'button',
            value: 'Unselect All',
            on: {
                click: _onUnSelectAllTagsBtnClick
            }
        }).button();

        _els.btnTagOperator = btnTagOperator = $('<input>', {
            'class': 'btn btn_tag_operator',
            type: 'button',
            value: 'AND',
            on: {
                click: function () {
                    this.value = this.value === 'AND' ? 'OR' : 'AND';
                    _onTagsSelect(_selectedTags);
                }
            }
        }).button();

        tagsCtn = _els.tagsCtn = $('<div>', {
            'class': 'el_ctn flex'
        }).append(
            $('<label>', {
                'class': 'title',
                text: 'Tag(s) :'
            }),
            $('<input>', {
                'class': 'btn',
                type: 'button',
                value: 'Select ...',
                on: {
                    click: _onTagsSelectBtnClick
                }
            }).button(),
            btnTagOperator,
            btnUnSelectAllTags
        );

        selectedTagsCtn = _els.selectedTagsCtn = $('<div>', {
            'class': 'el_ctn selected_tags_ctn'
        });

        _els.mainCtn.append(
            tagsCtn,
            selectedTagsCtn
        );
    };

    _buildInsideOption = () => {
        let insideFolderCtn;

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

        _els.mainCtn.append(insideFolderCtn);
    };

    _buildIntervalOption = () => {
        let inputInterval, intervalCtn;

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
                keyup: _keyUpInput
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

        _els.mainCtn.append(intervalCtn);

        inputInterval.spinner({
            min: 1,
            max: 60
        });
    };

    _buildZoomOption = () => {
        let inputZoom, zoomCtn;

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
                keyup: _keyUpInput
            }
        });

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

        _els.mainCtn.append(zoomCtn);

        inputZoom.spinner({
            min: 1,
            max: 99
        });
    };

    _buildScaleOption = () => {
        let inputScale, scaleCtn;

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

        _els.mainCtn.append(scaleCtn);
    };

    _buildPathOption = () => {
        let inputPathPic, pathPicCtn;

        inputPathPic = _els.inputPathPic = $('<input>', {
            'class': 'input_text',
            type: 'checkbox',
            checked: true
        });

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

        _els.mainCtn.append(pathPicCtn);
    };

    _buildPinOption = () => {
        let inputPinPic, pinPicCtn;

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
                    click: PinedEngine.clear
                }
            }).hide()
        );

        _els.mainCtn.append(pinPicCtn);
    };

    _buildTagsOption = () => {
        let inputTags, displayTagsCtn;

        inputTags = _els.inputTags = $('<input>', {
            'class': 'input_text',
            type: 'checkbox',
            checked: true
        });

        // Ctn display tags
        displayTagsCtn = $('<div>', {
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

        _els.mainCtn.append(displayTagsCtn);
    };

    _buildMuteVideoOption = () => {
        let inputMuteVideo, muteVideoCtn;

        inputMuteVideo = _els.inputMuteVideo = $('<input>', {
            'class': 'input_text',
            type: 'checkbox',
            checked: true
        });

        // Ctn display tags
        muteVideoCtn = $('<div>', {
            'class': 'el_ctn'
        }).append(
            inputMuteVideo,
            $('<span>', {
                'class': 'title label',
                text: 'Mute video',
                on: {
                    click: function () {
                        inputMuteVideo[0].checked = !inputMuteVideo[0].checked;
                    }
                }
            })
        );

        _els.mainCtn.append(muteVideoCtn);
    };

    _buildFooter = () => {
        let footerCtn, btnClearCache, btnStart, btnExport;

        footerCtn = _els.footerCtn = $('<div>', {
            'class': 'footer_ctn flex'
        });

        // Export btn
        // ----------
        btnExport = $('<div>', {
            'class': 'export_btn text_btn',
            text: 'Export',
            on: {
                click: _export
            }
        });

        // Clear Pic cache
        // ---------------
        btnClearCache = $('<div>', {
            'class': 'clear_cache_btn text_btn',
            text: 'Clear cache',
            on: {
                click: _clearCache
            }
        });

        // Btn start
        // ---------
        btnStart = _els.btnStart = $('<input>', {
            'class': 'btn start_btn',
            type: 'button',
            value: 'Start',
            on: {
                click: PlayerAction.start
            }
        }).button();

        footerCtn.append(
            btnStart,
            btnExport,
            btnClearCache
        );

        _els.mainCtn.append(footerCtn);
    };

    _buildSkeleton = () => {
        let mainCtn, loadingCtn;

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

        // Loading
        // -------
        loadingCtn = _els.loadingCtn = $('<div>', {
            'class': 'ctn_loading'
        }).append(
            $('<span>', {
                'class': 'el_loading_1 el_loading'
            }),
            $('<span>', {
                'class': 'el_loading_2 el_loading'
            }),
            $('<span>', {
                    'class': 'el_loading_3 el_loading'
                })
        );

        mainCtn.append(loadingCtn);

        _buildFolderFilter();

        _buildTagsFilter();

        _buildTypesFilter();

        _buildInsideOption();

        _buildIntervalOption();

        _buildZoomOption();

        _buildScaleOption();

        _buildPathOption();

        _buildPinOption();

        _buildTagsOption();

        _buildMuteVideoOption();

        _buildFooter();

        _options.root.append(mainCtn);
    };

    _showLoading = () => {
        _els.loadingCtn.show();
    };

    _hideLoading = () => {
        _els.loadingCtn.hide();
    };

    _removeTagFromSelected = (tagId) => {
        _onTagsSelect(
            _selectedTags.filter(function (tag) {
                return tag.getId() !== tagId;
            })
        );
    };

    _onTagsSelect = (selectedTags) => {
        let selectedTagsCtn = _els.selectedTagsCtn,
            btnUnSelectAllTags = _els.btnUnSelectAllTags,
            selectedTagsLength = selectedTags.length;

        _selectedTags = selectedTags;
        selectedTagsCtn.empty();

        if (selectedTagsLength) {
            BddEngine.clear();
            btnUnSelectAllTags.show();

            selectedTags.forEach(function (Tag) {
                selectedTagsCtn.append(
                    $('<div>', {
                        'class': 'tag_el thumb btn',
                        text: Tag.getName(),
                        on: {
                            click: function () {
                                _removeTagFromSelected(Tag.getId());
                            }
                        }
                    }).button()
                );
            });

            selectedTagsCtn.show();

            if (selectedTagsLength >= 2) {
                _els.btnTagOperator.show();
            } else {
                _els.btnTagOperator.hide();
            }
        } else {
            _onUnSelectAllTagsBtnClick();
        }
    };

    _onTagsSelectBtnClick = () => {
        PlayerAction.setInsideFolder(); // Reset inside folder.

        TagsModal.ask({
            selectedTags: _selectedTags,
            randomBtn: true,
            editBtn: true,
            onClose: function () {
                PlayerAction.enable();
            },
            onOpen: function () {
                PlayerAction.disable();
            },
            onEnd: _onTagsSelect
        });
    };

    _onTypesSelectBtnClick = (e) => {
        PlayerAction.setInsideFolder(); // Reset inside folder.

        $(e.target).toggleClass('selected');
        BddEngine.clear();
    };

    _onUnSelectAllTagsBtnClick = () => {
        _selectedTags = [];
        _els.selectedTagsCtn.hide().empty();
        _els.btnUnSelectAllTags.hide();
        _els.btnTagOperator.hide();
        BddEngine.clear();
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

    _export = () => {
        _showLoading();

        API.export({
            tags: View.getSelectedTags(),
            tagsOperator: View.getTagsOperator(),
            types: View.getSelectedTypes(),
            onSuccess: function (response) {
                _hideLoading();

                response = response || {};

                Notify.info({
                    message: 'Copied file: ' + (response.nbCopiedFiles || 0)
                });
            },
            onFailure: function (e) {
                _hideLoading();

                Notify.error({
                    message: e
                });
            }
        });
    };

    _onCloseFolderFinder = () => {
        let nbCustomFolderSelected = View.getCustomFolders().length,
            btnUnSelectAllFolders = _els.btnUnSelectAllFolders;

        _updateNbCustomFolderSelected();

        if (!nbCustomFolderSelected) {
            btnUnSelectAllFolders.hide();
            return;
        }

        btnUnSelectAllFolders.show();
    };

    _updateNbCustomFolderSelected = () => {
        var nbCustomFolderSelected = View.getCustomFolders().length,
            nbSelectedCtn = _els.nbSelectedCtn;

        PlayerAction.setInsideFolder(); // Reset inside folder.

        if (!nbCustomFolderSelected) {
            nbSelectedCtn.hide();
            return;
        }

        nbSelectedCtn.text('Selected: ' + nbCustomFolderSelected);
        nbSelectedCtn.show();
    };


    View = {

        init: (opts) => {
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

            FolderFinderView.init({
                root: opts.root,
                selectedFolderCtn: _els.selectedCustomFolderCtn,
                showLoading: _showLoading,
                hideLoading: _hideLoading,
                events: {
                    onClose: _onCloseFolderFinder,
                    onNonSelected: _onCloseFolderFinder,
                    onSelect: _updateNbCustomFolderSelected,
                    onUnselect: _updateNbCustomFolderSelected
                }
            });
        },

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

        resetInsideFolder: () => {
            let css = {
                opacity: 1
            };

            _els.insideFolderCtn.hide();
            _els.insideFolder.empty();

            _els.selectedCustomFolderCtn.css(css);
            _els.customFolderCtn.css(css);

            _isInsideFolder = false;
        },

        addCustomFolder: (folder) => {
            FolderFinderView.addFolders(folder);
        },

        isScaleOn: () => !!_els.inputScale[0].checked,

        isMuteVideo: () => !!_els.inputMuteVideo[0].checked,

        isPublicPathOn: () => !!_els.inputPathPic[0].checked,

        isFolderFinderOpen: () => FolderFinderView.isOpen(),

        isPlayPinedOn: () => !!_els.inputPinPic[0].checked,

        isInsideFolder: () => _isInsideFolder,

        hasFocus: () => _hasFocus,

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

            parent.find('.count').text('(' + PinedEngine.getNbPined() + ')');
            parent.removeClass('disabled');
            parent.find('.clear_btn').show();
        },

        onRemovePined: () => {
            let inputPinPic = _els.inputPinPic,
                parent = inputPinPic.parent(),
                nbPined = PinedEngine.getNbPined();

            parent.find('.count').text('(' + nbPined + ')');

            if (!nbPined) {
                parent.addClass('disabled');
                parent.find('.clear_btn').hide();
                inputPinPic[0].checked = false;
            }
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

        getCustomFolders: () => FolderFinderView.getSelectedPath(),

        getSelectedTags: () => {
            return _selectedTags;
        },

        getSelectedTypes: () => {
            return _els.typesCtn.find('.btn.selected').map(function (index, btn) {
                return btn.value;
            }).get();
        },

        getTagsOperator: () => {
            return _els.btnTagOperator.val();
        },

        setInsideFolder: (path) => {
            _isInsideFolder = true;

            _els.insideFolder.html(
                $('<div>', {
                    'class': 'btn btn_inside_folder',
                    text: path,
                    on: {
                        click: () => {
                            PlayerAction.setInsideFolder(); // Remove Inside folder
                        }
                    }
                }).button()
            );

            _els.insideFolderCtn.show();
        }
    };

    return View;
});
