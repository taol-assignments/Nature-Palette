const express = require('express');
const SearchTerm = require('../models/SearchTerm');

let router = express.Router();

/* GET search panel. */
router.get('/searchPanel.html', async function (req, res) {
    res.locals.searchTerms = await SearchTerm.find({});
    res.render('search/searchPanel');
});

module.exports = router;