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
        MainView.init({
            root: $(document.body)
        });
    }

    initView();
});
