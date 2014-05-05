/*global
    curl
*/

curl(
[
    'jquery',
    'App/Views/MainView'
],
function ($, MainView) {
    'use strict';

    function initView () {
        var ctn = $('<div>').appendTo(document.body);

        MainView.init({
            root: ctn
        });
    }

    initView();
});
