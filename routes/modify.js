const util = require('util');
const mkdirp = util.promisify(require('mkdirp'));
const express = require('express');
const Metadata = require('../models/Metadata');
const Submission = require('../models/Submission');
const multer = require('multer');
const upload = require('../lib/upload');
const helpers = require('../lib/helpers');

let router = express.Router();

router.get('/modifyPanel.html', async function (req, res) {
    res.render('modify/modifyPanel', {
        submissions: await Submission.find({
            user: req.user._id
        })
    });
});

router.get('/:id', async function (req, res) {
    res.render('modify/modifyFile', {
        submissionId: req.params.id
    });
});

router.post('/:id', multer({
    storage: multer.diskStorage({
        destination: async function (req, file, cb) {
            let submissionId = req.body['submissionId'];
            let dir = __dirname + "/../uploads/" + submissionId;
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
    let submission;

    try {
        submission = await Submission.findOne({
            _id: req.params.id.toString(),
            user: req.user._id
        });
    } catch (e) {
        console.error(e);

        e = new Error("Internal server error.");
        res.status(500).render('modify/result', {
            err: e
        });
    }

    if (submission === null) {
        let e = new Error("Submission not found");
        e.code = 404;
        res.status(404).render('modify/result', {
            err: e
        });
        return;
    }

    let result;
    let files;

    try {
        result = await upload.validateMetadataAndExtractZip({
            isModify: true,
            submission: submission,
            zipPath: req.files.rawFile[0].path,
            metadataFile: req.files.metadata[0]
        });

        files = (await Metadata.find({
            Submission: submission,
            FileName: {
                $nin: [
                    ...result.metadata.replace,
                    ...result.metadata.delete
                ].map(doc => doc.FileName)
            }
        })).map(doc => doc.FileName).concat(result.metadata.add.map(doc => doc.NewFileName));

        let duplicates = helpers.findDuplicates(files);
        if (duplicates.length > 0) {
            throw new Error("Duplicated filename after modify: " + duplicates.join(', '));
        }

        await submission.modify(result.metadata);
    } catch (e) {
        console.error(e);

        if (!(e instanceof Error)) {
            e = new Error(e);
        }

        if (typeof e.code !== 'number') {
            e.code = 500;
        }

        res.status(e.code).render('modify/result', {
            err: e
        });

        return;
    }

    res.render('modify/result', {
        err: null,
        result: result.metadata
    });

    res.end();

    upload.processRawFiles(submission, result.notMatched).catch(e => {
        console.error(e);
    });
});

module.exports = router;
