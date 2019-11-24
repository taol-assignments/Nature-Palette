const _ = require('lodash');
const util = require('util');
const access = require('fs').access;
const unlink = util.promisify(require('fs').unlink);
const rename = util.promisify(require('fs').rename);
const readFile = util.promisify(require('fs').readFile);
const path = require('path');
const glob = util.promisify(require('glob'));
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const uuidv1 = require('uuid/v1');
const helpers = require('./helpers');
const sendMail = require('./sendEmail');
const AdmZip = require('adm-zip');
const Metadata = require('../models/Metadata');
const Metric = require('../models/Metric');

function ensureNoDuplicates(files) {
    let duplicates = helpers.findDuplicates(files.map(f => {
        return path.basename(f);
    }));

    if (duplicates.length > 0) {
        let err = new Error("Duplicated raw files: " + duplicates.join(', '));
        err.code = 400;
        throw err;
    }
}

function extractZip(zipPath, extractTo) {
    return new Promise((resolve, reject) => {
        new AdmZip(zipPath).extractAllToAsync(extractTo, true, err => {
            if (err) {
                err = new Error(err);
                err.code = 400;
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function removeDir(dir) {
    rimraf(dir, err => {
        if (err) {
            console.error(err);
        }
    })
}

function tryMakeDir(dir) {
    return new Promise((resolve, reject) => {
        access(dir, err => {
            if (err) {
                mkdirp(dir, err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                })
            } else {
                resolve();
            }
        })
    });
}

function makeRawFileDir(baseDir) {
    return Promise.all([
        baseDir + "RawFiles",
        baseDir + "Unprocessed",
        baseDir + "NotMatched"
    ].map(tryMakeDir));
}

async function generateExtractToDir(baseDir) {
    const isExists = util.promisify(access);

    while (true) {
        let dir = baseDir + uuidv1();

        try {
            await isExists(dir);
        } catch (e) {
            return dir;
        }
    }
}

function getBaseDir(submission) {
    return __dirname + '/../uploads/' + submission._id + '/';
}

exports.validateMetadataAndExtractZip = async function (args) {
    let files;
    let metadata;
    let fileStatus;

    let baseDir = getBaseDir(args.submission);
    let extractTo = await generateExtractToDir(baseDir);

    try {
        await Promise.all([
            extractZip(args.zipPath, extractTo).then(() => {
                return glob(extractTo + '/**/*.Master.Transmission');
            }).then(f => {
                ensureNoDuplicates(files = f);

                return Promise.all([
                    makeRawFileDir(baseDir),
                    unlink(args.zipPath)
                ]);
            }),
            readFile(args.metadataFile.path).then(buf => {
                metadata = Metadata.parse(args.submission, buf.toString());
                return rename(
                    args.metadataFile.path,
                    baseDir + args.metadataFile.originalname);
            })
        ]);

        fileStatus = Metadata.setRawFileStatus(files, metadata);

        await Promise.all(files.map(f => {
            const name = path.basename(f);

            if (fileStatus.intersection.indexOf(path.basename(f)) !== -1) {
                return rename(f, baseDir + "Unprocessed/" + name);
            } else {
                return rename(f, baseDir + "NotMatched/" + name);
            }
        }));

        removeDir(extractTo);
    } catch (e) {
        console.error(e);

        if (args.isNewUpload) {
            removeDir(baseDir);
        } else {
            for (let dir in [
                extractTo,
                args.metadataFile.path,
                baseDir + args.metadataFile.originalname,
                args.zipPath
            ]) {
                removeDir(dir);
            }
        }

        if (!(e instanceof Error)) {
            e = new Error(e);
        }

        if (typeof e.code !== 'number') {
            e.code = 500;
        }

        throw e;
    }

    return {
        fileStatus,
        metadata,
        files,
    };
};

function makeErrorTable(rows) {
    return helpers.makeHtmlTable([
        'File', 'Wave Length', 'Value'
    ], rows.map(row => {
        return [row.file, row.wavelen, row.value];
    }));
}

exports.processRawFiles = async function (submission) {
    let result = await Metric.fromRawFile(submission);

    let rawFilePath = getBaseDir(submission) + '/RawFiles/';

    await Promise.all((await glob(
        getBaseDir(submission) +
        'Unprocessed/**/*.Master.Transmission'
    )).map(file => {
        let basename = path.basename(file);

        if (result.corrupt.indexOf(basename) === -1) {
            return rename(file, rawFilePath + basename);
        } else {
            return unlink(file);
        }
    }));

    let notMatched = await glob(getBaseDir(submission) + 'NotMatched/**/*.Master.Transmission');

    let html = `Dear ${submission.firstName} ${submission.lastName},\n\n`;

    if (result.warnings.length > 0 ||
        result.errors.length > 0 ||
        result.corrupt.length > 0 ||
        notMatched.length > 0)
    {
        html +=
            `We found some issues in your uploaded files. Please check your raw files, metadata file and upload correct files in the modify page.\n\n`;
    } else {
        html += 'All of your uploaded files have been processed successfully.\n';
    }

    if (notMatched.length > 0) {
        html += 'Raw files not in metadata file:\n\n' +
            notMatched.map(f => path.basename(f) + '\n') +
            '\n';
    }

    if (result.corrupt.length > 0) {
        html += 'Corrupt files:\n\n' + result.corrupt.map(f => f + '\n') + '\n';
    }

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

    html += '\nSincerely,\nNature\'s Palette';
    html = html.replace(/\n/g, '<br>');

    let args = {
        to: submission.email,
        from: 'test@example.com',
        subject: 'Nature\'s Palette: Your raw file uploading result.',
        content: [{
            type: 'text/html',
            value: html
        }]
    };

    sendMail(args);
    return Promise.all(result.metrics.map(m => m.save()));
};
