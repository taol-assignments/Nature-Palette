const util = require('util');
const express = require('express');
const multer = require('multer');
const mkdirp = util.promisify(require('mkdirp'));
const auth = require('../middlewares/auth');
const upload = require('../lib/upload');
const Submission = require('../models/Submission');

let router = express.Router();

router.post('/', auth.ensureUserPrivilege('uploadFiles'), function (req, res, next) {
    req.submission = new Submission({
        user: req.user._id
    });

    next();
}, multer({
    storage: multer.diskStorage({
        destination: async function (req, file, cb) {
            let dir = __dirname + "/../uploads/" + req.submission._id;

            try {
                await mkdirp(dir);
                cb(null, dir);
            } catch (err) {
                cb(err);
            }
        }
    })
}).fields([{
    name: 'metadata', maxCount: 1
}, {
    name: 'rawFile', maxCount: 1
}]), async function (req, res) {
    for (let k of [
        'firstName',
        'lastName',
        'email',
        'institution',
        'dataType',
        'dataFrom',
        'isPublished',
        'availableAt',
        'isEmbargo',
    ]) {
        req.submission[k] = req.body[k];
    }

    let result;

    try {
        result = await upload.validateMetadataAndExtractZip({
            isModify: false,
            submission: req.submission,
            zipPath: req.files.rawFile[0].path,
            metadataFile: req.files.metadata[0]
        });
    } catch (e) {
        res.status(e.code || 500).render('upload/result', {
            err: e
        });

        res.end();
        return;
    }

    res.status(201).render('upload/result', {
        err: null
    });

    res.end();

    Promise.all([
        req.submission.save(),
        Promise.all(result.metadata.map(row => row.save())),
        upload.processRawFiles(req.submission, result.notMatched)
    ]).catch(e => {
        console.error(e);
    })
});

router.get('/instruction.html', function (req, res) {
    res.render('upload/instruction');
});

router.get('/submission.html', function (req, res) {
    res.render('upload/submission');
});

module.exports = router;
