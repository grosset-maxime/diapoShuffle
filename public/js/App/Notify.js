/* global
    define
*/

define(
[
    'jquery',

    'App/Cmp/Notify',
],
function ($, Notify) {
    'use strict';

    let exports, notify;

    exports = {

        /**
         * @param {Object}  options          - Options.
         * @param {String}  message          - Message to display.
         * @param {Boolean} [autoHide=false] - Auto hide.
         * @param {Integer} [duration=8]     - Display duration in seconde.
         * @param {String}  [type="error"]   - Type of notify ("error", "info", "warning").
         */
        notify: (options = {}) => {
            let opts = {};

            $.extend(
                true,
                opts,
                {
                    message: 'Unknow error.',
                    type: Notify.TYPE_ERROR,
                    autoHide: false,
                    duration: 8
                },
                options || {}
            );

            if (!notify) {
                notify = new Notify({
                    className: 'ds_play_view-notify',
                    container: $(document.body),
                    autoHide: opts.autoHide,
                    duration: opts.duration
                });
            } else {
                notify.updateOptions({
                    autoHide: opts.autoHide,
                    duration: opts.duration
                });
            }

            notify.setMessage(opts.message, opts.type, true);
        },

        info: (options = {}) => {
            options.type = Notify.TYPE_INFO;
            exports.notify(options);
        },

        error: (options = {}) => {
            options.type = Notify.TYPE_ERROR;
            exports.notify(options);
        },

        warning: (options = {}) => {
            options.type = Notify.TYPE_WARNING;
            exports.notify(options);
        }
    };

    return exports;
});