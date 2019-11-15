let express = require('express');
const SearchTerm = require('../models/SearchTerm');

let router = express.Router();

/* GET home page. */
router.get('/addPanel.html', async function (req, res) {
    res.locals.searchTerms = await SearchTerm.find({});
    res.render('searchTerm/addPanel');
});

router.post('/add', async function (req, res) {
    let newName = req.body.name;
    let searchTerm = new SearchTerm({name: newName});
    try {
        let newTerm = await searchTerm.save();
    } catch (e) {
        console.error(e);
        throw e;
    }
    res.locals.searchTerms = await SearchTerm.find({});
    res.locals.insertTerm = true;
    res.render('searchTerm/addPanel');
});

module.exports = router;