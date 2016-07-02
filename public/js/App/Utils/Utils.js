/* global
    define
*/

define(
[
    'jquery',

    // PM
    'PM/Cmp/Notify',
],
function ($, Notify) {
    'use strict';

    let Utils, notify;

    Utils = {

        /**
         * @param {Object} options - Options.
         * @param {String} message - Message to display.
         * @param {Boolean} [autoHide=true] - Auto hide.
         * @param {Integer} [duration=3] - Display duration in seconde.
         */
        notify: (options = {}) => {
            let opts = {};

            $.extend(
                true,
                opts,
                {
                    message: '',
                    type: Notify.TYPE_ERROR,
                    autoHide: true,
                    duration: 3
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
            }

            notify.setMessage(opts.message, opts.type, true);
        }
    };

    return Utils;
});