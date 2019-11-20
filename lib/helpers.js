const _ = require('lodash');
const escapeHtml = require('escape-html');

exports.findDuplicates = function (arr) {
    return _.filter(arr, (val, i, iteratee) => _.includes(iteratee, val, i + 1));
};

exports.makeHtmlTable = function(cols, rows) {
    return `<table><thead><tr>${cols.map(col => `<th>${escapeHtml(col)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(val => `<td>${escapeHtml(val.toString())}</td>`).join('')}</tr>`).join('')}</tbody></table>`
};
