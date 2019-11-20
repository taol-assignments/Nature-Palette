let express = require('express');
let Submission = require('../models/Submission');

let router = express.Router();

/* GET home page. */
router.get('/modifyPanel.html', async function (req, res) {
    res.render('modify/modifyPanel', {
        submissions: await Submission.find({})
        // submissions: await Submission.find({firstName: 'Shuaishuai'})
    });
});

router.get('/:id', async function (req, res) {
    submissionId = req.params.id
    res.render('modify/modifyFile', {
        submissionId: submissionId
    });
})

module.exports = router;
