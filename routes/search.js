const crypto = require('crypto');
const express = require('express');
const AdmZip = require('adm-zip');
const SearchTerm = require('../models/SearchTerm');
const Metadata = require('../models/Metadata');

let router = express.Router();

async function searchTermsMiddleware(req, res, next) {
    res.locals.searchTerms = await SearchTerm.find({});

    let query = {};
    res.locals.searchTerms.forEach(k => {
        if (req.query.hasOwnProperty(k.name)) {
            query[k.name] = req.query[k.name].toString();
        }
    });

    req.query = query;

    next();
}

router.get('/searchPanel.html', searchTermsMiddleware, async function (req, res, next) {
    res.render('search/searchPanel', {
        query: Object.keys(req.query).length === 0 ? null : req.query,
        result: Object.keys(req.query).length === 0 ? null : await Metadata.search(req.query)
    });
});

router.get('/download.html', searchTermsMiddleware, async function (req, res, next) {
    let zip = new AdmZip();

    try {
        await Promise.all([
            Metadata.findRawFiles(req.query).then(files => {
                for (let file of files) {
                    let id = file._id.toString();
                    zip.addLocalFile(
                        __dirname + `/../uploads/${id}/RawFiles/${file.FileName}.Master.Transmission`,
                        `${id}/`);
                }
            }),
            Metadata.findPublicRows(req.query).then(rows => {
                let columns = [];

                for (let row of rows) {
                    for (let k of Object.keys(row)) {
                        if (k !== "Submission" &&
                            k!== "__v"  &&
                            k !== "_id" &&
                            columns.indexOf(k) === -1)
                        {
                            columns.push(k);
                        }
                    }
                }

                let table = rows.map(row => {
                    let r = [row.Submission.toString()];

                    for (let k of columns) {
                        if (typeof row[k] !== 'undefined') {
                            r.push(row[k]);
                        } else {
                            r.push('');
                        }
                    }

                    return r.join(',');
                });

                columns.unshift("SubmissionNumber");

                const csv = columns.join(',') + '\r\n' + table.join('\r\n');

                zip.addFile("metadata.csv", Buffer.alloc(csv.length, csv));
            }),
            Metadata.findSubmissions(req.query).then(submissions => {
                submissions = JSON.stringify(submissions, null, 4);

                zip.addFile(
                    "submissions.json",
                    Buffer.alloc(submissions.length, submissions));
            })
        ]);
    } catch (e) {
        console.error(e);
        res.status(500).send("Internal server error.").end();
        return;
    }

    let zipBuffer = zip.toBuffer();

    res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-disposition': 'attachment;filename=' +
            crypto.createHash('sha256')
                .update(JSON.stringify(req.query))
                .digest('hex') + '.zip',
        'Content-Length': zipBuffer.length
    });
    res.end(zipBuffer);
});

module.exports = router;
