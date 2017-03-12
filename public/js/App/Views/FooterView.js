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
    let _buildSkeleton;


    _buildSkeleton = () => {
        let mainCtn;

        mainCtn = _els.mainCtn = $('<div>', {
            'class': 'ds_footer_view',
            html: $('<div>', {
                'class': 'app_title',
                text: 'Diapo Shuffle'
            })
        });

        // mainCtn.append(
        // );

        _options.root.append(mainCtn);
    };

    View = {
        /**
         *
         */
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
        },

        /**
         *
         */
        show: () => {
            _els.mainCtn.show();
        },

        /**
         *
         */
        hide: () => {
            _els.mainCtn.hide();
        }
    };

    return View;
});
