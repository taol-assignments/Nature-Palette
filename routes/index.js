let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.redirect('/upload.html');
    res.end();
    return;
    res.render('index', {
        title: "Nature's Palette"
    });
});

module.exports = router;
