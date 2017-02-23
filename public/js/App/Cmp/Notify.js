
/*global
    define
*/

define('App/Cmp/Notify', [
    'jquery',

    'App/Cmp/Abstract',

    // Non AMD
    'js!jquery-inherit'
], function ($, Abstract) {
    'use strict';

    var Notify, staticObj;

    var TYPE_ERROR = 'error',
        TYPE_WARNING = 'warning',
        TYPE_INFO = 'info';

    staticObj = {
        /**
         * Message types.
         */
        TYPE_INFO: TYPE_INFO,
        TYPE_WARNING: TYPE_WARNING,
        TYPE_ERROR: TYPE_ERROR
    };

    Notify = $.inherit(Abstract, {

        /**
         * @property {Object} defaultOptions - Default options values.
         */
        defaultOptions: {
            className: '',
            container: null,
            autoHide: false,
            duration: 3
        },

        /**
         * @private
         */
        hideTimeout: null,

        /**
         * @constructor Notify.
         * @param {Object} options                - Options values.
         * @param {String} [options.className]    - Class name to add to Cmp.
         */
        __constructor: function (options) {
            var container;
            this.__base(options);

            container = this.options.container;

            if (container) {
                this.inject(container, 'top');
            }
        }, // End function __constructor()

        /**
         * Build the DOM of the Cmp.
         */
        build: function () {
            var ctn, messageCtn,
                that = this,
                els = that.els,
                options = that.options;

            // Main ctn.
            ctn = els.container = $('<div>', {
                'class': 'pm_notify_cmp ' + options.className,
                html: $('<div>', {
                    'class': 'close',
                    text: 'x',
                    on: {
                        click: function (e) {
                            e.stopPropagation();
                            that.hide();
                        }
                    }
                }),
                on: {
                    click: function () {
                        clearTimeout(that.hideTimeout);
                        that.hideTimeout = null;
                    }
                }
            });

            messageCtn = els.messageCtn = $('<div>', {
                'class': 'message-ctn'
            }).appendTo(ctn);
        }, // End function build()

        /**
         * Inject the Cmp into the DOM.
         * @param {Element} element - DOM Element where to inject the Cmp.
         * @param {String}  where   - Position inside the Element.
         */
        inject: function (element, where) {
            this.build();
            this.__base(element, where);
        }, // End function inject()

        /**
         *
         */
        setMessage: function (message, type, display) {
            var els = this.els,
                container = this.getContainer(),
                messageCtn = els.messageCtn;

            container.removeClass(TYPE_ERROR + ' ' + TYPE_WARNING + ' ' + TYPE_INFO);

            switch (type) {
            case TYPE_ERROR:
                container.addClass(TYPE_ERROR);
                break;
            case TYPE_WARNING:
                container.addClass(TYPE_WARNING);
                break;
            case TYPE_INFO:
                container.addClass(TYPE_INFO);
                break;
            }

            messageCtn.html(message);

            if (display) {
                this.show();
            }
        }, // End function setMessage()

        /**
         *
         */
        show: function () {
            var that = this,
                duration, hideTimeout,
                options = that.options;

            that.getContainer().fadeIn('slow');

            if (options.autoHide) {
                duration = options.duration;
                hideTimeout = that.hideTimeout;

                if (!duration || duration < 1) {
                    duration = 1;
                }

                if (hideTimeout) {
                    clearTimeout(hideTimeout);
                }

                that.hideTimeout = setTimeout(function () {
                    that.hide();
                    that.hideTimeout = null;
                }, duration * 1000);
            }
        }, // End function show()

        /**
         *
         */
        hide: function () {
            this.getContainer().fadeOut('fast');
        } // End function show()
    }, staticObj); // End Class Notify()

    return Notify;
});
