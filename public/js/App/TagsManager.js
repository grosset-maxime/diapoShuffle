/* global
    define
*/

define(
[
    'jquery',

    'App/API/API',
    'App/Class/Tag'
],
function ($, API, TagClass) {
    'use strict';

    let Manager,
        _hasFetchTags = false,
        _tags = [];

    Manager = {

        init: (options = {}) => {

            function onSuccess () {
                options.onSuccess && options.onSuccess(_tags);
            }

            if (_tags.length) {
                onSuccess();
                return;
            }

            API.getAllTags({
                onSuccess: (allTags) => {
                    _tags = allTags.map(function (tag) {
                        return new TagClass(tag);
                    });

                    _hasFetchTags = true;

                    onSuccess();
                },
                onFailure: options.onFailure
            });
        },

        hasFetchTags: () => {
            return _hasFetchTags;
        },

        getTags: () => {
            return _tags;
        },

        getTagsByIds: (ids = []) => {
            return ids.map(Manager.getTagById);
        },

        getTagById: (id = '') => {
            let tag = _tags.find(function (tag) {
                return tag.id === id;
            });

            if (!tag) {
                tag = new TagClass({
                    id: id
                });
            }

            return tag;
        }
    };

    return Manager;
});
