
/*global
    define
*/

define([
    'jquery',

    // PM
    'PM/Core',
    'PM/Cmp/Abstract',

    // Non AMD
    'js!jquery-inherit'
], function ($, PM, Abstract) {
    'use strict';

    let PathChooser;

    const CLASS_NAME = 'pathchooser_cmp';

    PathChooser = $.inherit(Abstract, {

        /**
         * @property {Object} defaultOptions - Default options values.
         */
        defaultOptions: {
            className: '',
            fullPath: '',
            selectedPath: '',
            container: null,
            events: {
                onChoose: () => {}
            }
        },

        pathParts: [],

        choosenIndex: 0,

        /**
         * @constructor PathChooser.
         * @param {Object} options                - Options values.
         * @param {String} [options.className]    - Class name to add to Cmp.
         * @param {String} [options.fullPath]     -.
         * @param {String} [options.selectedPath] -.
         */
        __constructor: function (options) {
            let container, selectedPathParts,
                that = this;

            that.__base(options);

            container = options.container;

            if ((options.fullPath || []).length) {
                that.pathParts = options.fullPath.split('/').filter(function (part) {
                    return !!part; // Remove empty part.
                });

                if ((options.selectedPath || []).length) {
                    selectedPathParts = options.selectedPath.split('/').filter(function (part) {
                        return !!part; // Remove empty part.
                    });

                    that.choosenIndex = $(that.pathParts).index($(selectedPathParts).last()) || 0;
                }
            }
        },

        /**
         * Build the DOM of the Cmp.
         */
        build: function () {
            let ctn,
                that = this,
                options = that.options,
                choosenIndex = that.choosenIndex,
                hasSelectedPath = !!options.selectedPath,
                els = that.els,
                nbPathParts = that.pathParts.length;

            // Main ctn.
            ctn = els.container = $('<div>', {
                'class': CLASS_NAME + ' ' + options.className,
                html: $('<span>', {
                    'class': CLASS_NAME + '_separator',
                    text: '/'
                })
            });

            for (let i = 0; i < nbPathParts; i++) {
                let el,
                    isSelected = false,
                    isDisabled = false,
                    part = that.pathParts[i];

                // Select last part.
                if (
                    (hasSelectedPath && i === choosenIndex) ||
                    (!hasSelectedPath && i === (nbPathParts - 1))
                ) {
                    isSelected = true;
                } else if (hasSelectedPath && i > choosenIndex) {
                    isDisabled = true;
                }

                el = $('<span>', {
                    'class': CLASS_NAME + '_part ' + (isSelected ? 'selected' : '') + (isDisabled ? 'disabled' : ''),
                    text: part,
                }).on({
                    click: that._onPartClick.bind(that)
                });

                ctn.append(el);
                ctn.append($('<span>', {
                    'class': CLASS_NAME + '_separator ' + (isDisabled ? 'disabled' : ''),
                    text: '/'
                }));
            }

            return ctn;
        }, // End function build()

        _onPartClick: function (event) {
            let parts, partIndex, separators,
                that = this,
                container = that.els.container,
                nbPathParts = that.pathParts.length,
                part = $(event.target);

            if (part.hasClass('selected')) {
                return;
            }

            container.find('.selected').removeClass('selected');
            part.addClass('selected');

            parts = container.find('.' + CLASS_NAME + '_part');
            separators = container.find('.' + CLASS_NAME + '_separator');
            that.choosenIndex = partIndex = parts.index(part);

            parts.removeClass('disabled');
            separators.removeClass('disabled');
            for (let i = partIndex + 1; i < nbPathParts; i++) {
                $(parts[i]).addClass('disabled');
                $(separators[i + 1]).addClass('disabled');
            }

            that._onChoose();
        },

        _onChoose: function () {
            let that = this;

            that.options.events.onChoose(
                '/' + that.pathParts.slice(0, that.choosenIndex + 1).join('/') + '/'
            );
        }
    });

    return PathChooser;
});
