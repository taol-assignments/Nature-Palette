let express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/modifyPanel.html', function (req, res) {
    res.render('modify/modifyPanel');
});

module.exports = router;
