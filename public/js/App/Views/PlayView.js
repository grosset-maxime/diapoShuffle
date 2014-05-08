/* global
    define
*/

define(
[
    'jquery',
    'App/Views/OptionsView'
],
function ($, OptionsView) {
    'use strict';

    var defaultOptions = {
            root: null
        },
        options = {},
        els = {},
        viewDimension = {
            width: 0,
            height: 0
        };

    /**
     *
     */
    function buildSkeleton () {
        var mainCtn;

        mainCtn = els.mainCtn = $('<div>', {
            'class': 'ds_play_view'
        });

        // mainCtn.append(
        // );

        options.root.append(mainCtn);
    } // End function buildSkeleton()

    /**
     *
     */
    function getViewDimension () {
        var doc = $(document);

        viewDimension.width = doc.width();
        viewDimension.height = doc.height();
    } // End function setViewDimension()

    /**
     *
     */
    function scalePic (picInfos, picEl) {
        var cssObj, dw, dh,
            widthPic = picInfos.width || 0,
            heightPic = picInfos.height || 0,
            widthView = viewDimension.width,
            heightView = viewDimension.height;

        if (widthPic >= widthView || heightPic >= heightView) {
            return;
        }

        dw = widthView / widthPic;
        dh = heightView / heightPic;

        if (dh >= dw) {
            cssObj = {'min-width': widthView};
        } else {
            cssObj = {'min-height': heightView};
        }

        picEl.css(cssObj);
    } // End function scalePic()

    /**
     *
     */
    function zoomPic (picInfos, picEl) {
        var widthPic = picInfos.width || 0,
            heightPic = picInfos.height || 0,
            zoom = OptionsView.getZoom(),
            newWidth = widthPic * zoom,
            newHeight = heightPic * zoom,
            widthView = viewDimension.width,
            heightView = viewDimension.height;

        if (newWidth >= widthView || newHeight >= heightView) {
            scalePic(picInfos, picEl);
            return;
        }

        picEl.css({
            width: newWidth,
            height: newHeight
        });
    } // End function zoomPic()

    var View = {
        /**
         *
         */
        init: function (opts) {
            $.extend(true, options, defaultOptions, opts || {});

            if (!options.root) {
                options.root = $(document.body);
            }

            getViewDimension();

            buildSkeleton();
        }, // End function init()

        /**
         *
         */
        setPic: function (pic) {
            var img;

            img = $('<img>', {
                'class': 'random_pic',
                src: pic.src || ''
            }).css({
                'max-width': viewDimension.width,
                'max-height': viewDimension.height
            });

            if (OptionsView.isScaleOn()) {
                scalePic(pic, img);
            } else if (OptionsView.getZoom() > 1) {
                zoomPic(pic, img);
            }

            els.mainCtn.html(img);
            View.show();
        }, // End function setPic()

        /**
         *
         */
        getViewDimension: function (force) {
            if (force) {
                getViewDimension();
            }

            return viewDimension;
        }, // End function getViewDimension()

        /**
         *
         */
        show: function () {
            els.mainCtn.show();
        }, // End function show()

        /**
         *
         */
        hide: function () {
            els.mainCtn.hide();
        } // End function hide()
    };

    return View;
});
