
/*global
    curl
*/

curl([
    'jquery',
    'App/diapoShuffle'
], function ($, DiapoShuffle) {
    'use strict';
    DiapoShuffle.init();
});