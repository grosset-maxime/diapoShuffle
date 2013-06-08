
/*global
    curl
*/

curl([
    'jquery',
    'App/diapoShuffle'
], function ($, DiapoShuffle) {
    'use strict';

    DiapoShuffle.init({
        'buildInCtn': $('.app_content_ctn')
    });
});