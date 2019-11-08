const _ = require('lodash');

exports.findDuplicates = function (arr) {
    return _.filter(arr, (val, i, iteratee) => _.includes(iteratee, val, i + 1));
};