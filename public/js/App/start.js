/*global
    curl
*/

curl(
[
    'jquery',

    // PM
    'PM/Core',

    // App
    'App/Views/MainView',
],
function ($, PM, MainView) {
    'use strict';

    function initView () {
        MainView.init({
            root: $(document.body)
        });
    }

    PM.setDebug(true);

    initView();
});
