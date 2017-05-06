/* global
    define
*/

define(
[
    'jquery'
],
function ($) {
    'use strict';

    let Utils;

    Utils = {

        /**
         * Get a random number between min and max (included).
         * @param {Integer} a - Min integer. If no b provided so min = 0 and max = a.
         * @param {Integer} [b] - Max integer.
         * @returns {Integer} - Random number.
         */
        getRandomNum: (a, b) => {
            let min = 0,
                max = 0;

            if (!b) {
                max = a;
            } else {
                min = a;
                max = b;
            }

            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        /**
         * Get a random element of an array.
         * @param {Array} array - Array to get a random element.
         * @returns {Any} - Random element.
         */
        getRandomElement: (array = []) => {
            return array.length ? array[Utils.getRandomNum(array.length - 1)] : null;
        }
    };

    return Utils;
});