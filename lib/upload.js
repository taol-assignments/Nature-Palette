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
const AdmZip = require('adm-zip');
const Metadata = require('../models/Metadata');

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

function makeRawFileDir(baseDir) {
    let dir = baseDir + 'RawFiles';

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

exports.validateMetadataAndExtractZip = async function (args) {
    let files;
    let metadata;
    let fileStatus;

    let baseDir = __dirname + '/../uploads/' + args.submission._id + '/';
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

        if (args.isNewUpload) {
            await Promise.all(_.compact(files.map(f => {
                if (fileStatus.intersection.indexOf(path.basename(f)) !== -1) {
                    return rename(f, baseDir + "RawFiles/" + path.basename(f));
                } else {
                    return null
                }
            })));

            if (fileStatus.notInMetadata.length === 0) {
                removeDir(extractTo);
            }
        }
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
        extractTo,
        metadata,
        files,
    };
};

exports.validateAndProcessRawFiles = async function () {

};
