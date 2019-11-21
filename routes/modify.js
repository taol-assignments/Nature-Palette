const express = require('express');
const util = require('util');
const Submission = require('../models/Submission');
const multer = require('multer');
const mkdirp = util.promisify(require('mkdirp'));

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

router.post('/upload', function (req, res, next) {

    next();
}, multer({
    storage: multer.diskStorage({
        destination: async function (req, file, cb) {
            let submissionId = req.body['submissionId'];
            let dir = __dirname + "/../uploads/Temp/" + submissionId;
            try {
                await mkdirp(dir);
                cb(null, dir);
            } catch (e) {
                cb(e);
            }
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })
}).fields([{
    name: 'metadata', maxCount: 1
}, {
    name: 'rawFile', maxCount: 1
}]), async function (req, res) {
    res.render('modify/successPanel');
})

module.exports = router;
