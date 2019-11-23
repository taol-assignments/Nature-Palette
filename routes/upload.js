const util = require('util');
const path = require('path');
const rename = util.promisify(require('fs').rename);
const unlink = util.promisify(require('fs').unlink);
const rimraf = require('rimraf');
const express = require('express');
const multer = require('multer');
const mkdirp = util.promisify(require('mkdirp'));
const sendMail = require('../lib/sendEmail');
const auth = require('../middlewares/auth');
const helpers = require('../lib/helpers');
const upload = require('../lib/upload');
const Submission = require('../models/Submission');
const Metadata = require('../models/Metadata');
const Metric = require('../models/Metric');

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
    let baseDir = __dirname + "/../uploads/" + req.submission._id + "/";

    let rawFile = req.files.rawFile[0];
    let metadataFile = req.files.metadata[0];

    let result;

    try {
        result = await upload.validateMetadataAndExtractZip({
            isNewUpload: true,
            submission: req.submission,
            zipPath: rawFile.path,
            metadataFile: metadataFile
        });
    } catch (e) {
        res.status(e.code || 500).render('upload/result', {
            err: e
        });

        res.end();
        return;
    }

    const rawFileDir = baseDir + "RawFiles/";

    res.status(201).render('upload/result', {
        err: null
    });

    res.end();

    function makeErrorTable(rows) {
        return helpers.makeHtmlTable([
            'File', 'Wave Length', 'Value'
        ], rows.map(row => {
            return [row.file, row.wavelen, row.value];
        }));
    }

    Promise.all([
        req.submission.save(),
        Promise.all(result.metadata.map(row => row.save())),
        Metric.fromRawFile(req.submission, rawFileDir).then(result => {
            let html = `Dear ${req.submission.firstName} ${req.submission.lastName},\n\n`;

            if (result.warnings.length > 0 || result.errors.length > 0) {
                html += `We found ${result.warnings.length} small values and ${result.errors.length} large values in your raw files.\n\n`;

                if (result.warnings.length > 0) {
                    html += `${
                        result.warnings.length
                    } reflective values in range [-2, 0]:\n${
                        makeErrorTable(result.warnings)
                    }`;
                }

                if (result.errors.length > 0) {
                    html += `${
                        result.errors.length
                    } reflective value less than -2:\n${
                        makeErrorTable(result.errors)
                    }\n`
                }
            } else {
                html += 'All of your uploaded files have been processed successfully.';
            }

            html += '\nSincerely,\nNature\'s Palette';
            html = html.replace(/\n/g, '<br>');

            let args = {
                to: req.submission.email,
                from: 'test@example.com',
                subject: 'Nature\'s Palette: Your raw file uploading result.',
                content: [{
                    type: 'text/html',
                    value: html
                }]
            };

            sendMail(args);
            return Promise.all(result.metrics.map(m => m.save()));
        })
    ]).catch(e => {
        console.error(e);
    })
});

router.get('/instruction.html', function (req, res, next) {
    res.render('upload/instruction');
});

router.get('/submission.html', function (req, res, next) {
    res.render('upload/submission');
});

module.exports = router;
