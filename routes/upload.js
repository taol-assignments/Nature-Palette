const util = require('util');
const path = require('path');
const rename = util.promisify(require('fs').rename);
const unlink = util.promisify(require('fs').unlink);
const readFile = util.promisify(require('fs').readFile);
const glob = util.promisify(require('glob'));
const rimraf = require('rimraf');
const express = require('express');
const multer = require('multer');
const mkdirp = util.promisify(require('mkdirp'));
const AdmZip = require('adm-zip');
const auth = require('../middlewares/auth');
const helpers = require('../lib/helpers');
const Submission = require('../models/Submission');
const Metadata = require('../models/Metadata');
const Metric = require('../models/Metric');

let router = express.Router();

router.post('/', /* auth.ensureUserPrivilege('uploadFiles'), */ function (req, res, next) {
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
    let baseDir = __dirname + "/../uploads/" + req.submission._id + "/";

    function cleanUploadedFiles() {
        rimraf(baseDir, err => {
            if (err) {
                console.error(err);
            }
        })
    }

    let extractTo = baseDir + "extractedZip";
    let rawFile = req.files.rawFile[0];
    let metadataFile = req.files.metadata[0];

    let metadata;

    try {
        await Promise.all([
            util.promisify((new AdmZip(rawFile.path)).extractAllToAsync)(extractTo, true).catch(e => {
                let err = new Error('Failed to extract zip file.');
                err.code = 500;
                throw err;
            }),
            util.promisify(readFile)(metadataFile.path).then(buf => {
                metadata = Metadata.parse(req.submission, buf.toString());
            })
        ]);
    } catch (e) {
        console.error(e);
        cleanUploadedFiles();

        if (typeof e.code !== 'number') {
            e = new Error('Internal server error.');
            e.code = 500;
        }

        return res.status(e.code).render('upload/result', {
            err: e
        }).end();
    }

    let files = await glob(extractTo + '/**/*.Master.Transmission');

    let duplicates = helpers.findDuplicates(files.map(f => {
        return path.basename(f);
    }));
    if (duplicates.length > 0) {
        return res.status(400).render('upload/result', {
            err: new Error("Duplicated raw files: " + duplicates.join(','))
        }).end();
    }

    const rawFileDir = baseDir + "RawFiles/";

    try {
        await Promise.all([
            mkdirp(rawFileDir).then(() => {
                return Promise.all(files.map(f => {
                    return rename(f, rawFileDir + path.basename(f))
                }))
            }),
            unlink(rawFile.path),
            rename(metadataFile.path, baseDir + metadataFile.originalname)
        ]);
    } catch (e) {
        console.error(e);
        cleanUploadedFiles();

        return res.status(500).render('upload/result', {
            err: new Error("Internal server error.")
        });
    }

    res.status(201).render('upload/result', {
        err: null
    });

    try {
        await Promise.all([
            req.submission.save(),
            Promise.all(metadata.map(row => row.save())),
            Metric.fromRawFile(req.submission, rawFileDir).then(metrics => {
                return Promise.all(metrics.map(m => m.save()));
            })
        ]);
    } catch (e) {
        console.error(e);
    }
});

router.get('/instruction.html', function (req, res, next) {
    res.render('upload/instruction');
});

router.get('/submission.html', function (req, res, next) {
    res.render('upload/submission');
});

module.exports = router;
