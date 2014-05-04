/*global
    curl
*/

curl([
    'jquery',
    'view/diapoShuffle'
], function ($, DiapoShuffle) {
    'use strict';

    function initView () {
        var ctn = $('<div>').appendTo(document.body);

        DiapoShuffle.init({
            root: ctn
        });
    }

    initView();
});
