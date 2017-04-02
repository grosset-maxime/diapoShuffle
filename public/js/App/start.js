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
    'App/TagsManager'
],
function ($, PM, MainView, TagsManager) {
    'use strict';

    let _initView;

    _initView = () => {
        MainView.init({
            root: $(document.body)
        });

        TagsManager.init();
    };

    PM.setDebug(true);

    _initView();
});
