
/*global
    curl
*/

curl([
    'jquery',
    'App/diapoShuffle'
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
