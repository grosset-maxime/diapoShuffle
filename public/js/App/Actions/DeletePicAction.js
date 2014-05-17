/* global
    define
*/

define(
[
    'jquery',

    // PM
    'PM/Core',

    // App Actions
    'App/Actions/GetRandomPicAction',

    // Non AMD
    'js!jquery-ui'
],
function ($, PM, GetRandomPicAction) {
    'use strict';

    /**
     *
     */
    function deletePic () {

    } // End function deletePic()

    var Action = {

        /**
         *
         */
        askDelete: function () {
            var isPaused = GetRandomPicAction.isPausing();

            if (!isPaused) {
                return;
            }

            $('<div>', {
                'class': '',
                html: 'Do you really want to delete this picture ?'
            }).dialog({
                resizable: false,
                modal: true,
                width: 400,
                position: {
                    at: 'center top+25%'
                },
                close: function(event) {
                    event.stopPropagation();
                    GetRandomPicAction.enable();
                },
                open: function () {
                    GetRandomPicAction.disable();
                },
                buttons: [{
                    text: 'Cancel',
                    tabIndex: -1,
                    click: function () {
                        $(this).dialog('close');
                    }
                }, {
                    text: 'Delete',
                    click: function () {
                        $(this).dialog('close');
                        deletePic();
                        GetRandomPicAction.pause();
                    }
                }]
            });
        } // End function askDelete()
    };

    return Action;
});

