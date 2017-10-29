/* global
    define
*/

define(
[
    'jquery',

    'App/API/API',
    'App/Class/Tag',
    'App/Class/TagCategory'
],
function ($, API, TagClass, TagCategoryClass) {
    'use strict';

    let Manager,
        _hasFetchTags = false,
        _hasFetchTagCategories = false,
        _tags = [],
        _tagCategories = [];


    let _fetchAllTags, _fetchAllTagCategories, _sortTags;

    _fetchAllTags = () => {
        return new Promise (function (resolve, reject) {
            API.getAllTags({
                onSuccess: (allTags) => {
                    _tags = allTags.map(function (tag) {
                        return new TagClass(tag);
                    });

                    _hasFetchTags = true;

                    resolve();
                },
                onFailure: reject
            });
        });
    };

    _fetchAllTagCategories = () => {
        return new Promise (function (resolve, reject) {
            API.getAllTagCategories({
                onSuccess: (allTagCategories) => {
                    _tagCategories = allTagCategories.map(function (category) {
                        return new TagCategoryClass(category);
                    });

                    _hasFetchTagCategories = true;

                    resolve();
                },
                onFailure: reject
            });
        });
    };

    _sortTags = () => {
        _tags.sort(function (a, b) {
            return a.getName().localeCompare(b.getName());
        });
    };

    Manager = {

        init: (options = {}) => {

            function onSuccess () {
                options.onSuccess && options.onSuccess();
            }

            if (_tags.length) {
                onSuccess();
                return;
            }

            Promise.all([_fetchAllTags(), _fetchAllTagCategories()])
                .then(onSuccess)
                .catch(function (error) {
                    options.onFailure && options.onFailure(error);
                });
        },

        hasFetchTags: () => {
            return _hasFetchTags;
        },

        hasFetchTagCategories: () => {
            return _hasFetchTagCategories;
        },

        getTags: () => {
            return _tags;
        },

        getTagCategories: () => {
            return _tagCategories;
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
        },

        getTagsByCategories: (categoryIds = []) => {
            let tags = [];

            categoryIds.forEach(function (categoryId) {
                tags = tags.concat(tags, Manager.getTagsByCategory(categoryId));
            });

            return tags;
        },

        getTagsByCategory: (categoryId = '') => {
            return _tags.filter(function (tag) {
                return tag.category === categoryId;
            });
        },

        getTagCategoryById: (categoryId = '') => {
            return _tagCategories.find(function (TagCategory) {
                return TagCategory.getId() === categoryId;
            });
        },

        existTagById: (id = '') => {
            let tag = _tags.find(function (tag) {
                    return tag.id === id;
                });

            return !!tag;
        },

        addTag: (Tag) => {
            Tag && _tags.push(Tag);

            setTimeout(_sortTags, 0);
        },

        removeTag: (Tag) => {
            let i,
                tagId = Tag.getId();

            for (i = _tags.length - 1; i > 0; i--) {
                if (tagId === _tags[i].getId()) {
                    _tags.splice(i, 1);
                    break;
                }
            }
        }
    };

    return Manager;
});
