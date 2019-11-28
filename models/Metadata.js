const _ = require('lodash');
const path = require('path');
const helpers = require('../lib/helpers');
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

let Metadata;

let schemaDef = {
    Submission: {
        type: ObjectId,
        ref: 'Submission',
        require: true
    },
    Comments: {
        type: String,
        require: false
    },
    FileName: {
        type: String,
        require: true,
        minlength: 1
    },
    LightAngle1: {
        type: Number,
        min: [-90, "LightAngle1 should not less than -90."],
        max: [90, "LightAngle1 should not larger then -90."],
        require: true,
    },
    LightAngle2: {
        type: Number,
        min: [-90, "LightAngle2 should not less than -90."],
        max: [90, "LightAngle2 should not larger then -90."],
        require: true
    },
    Patch: {
        type: String,
        index: true,
        require: true
    },
    ProbeAngle1: {
        type: Number,
        min: [-90, "ProbeAngle1 should not less than -90."],
        max: [90, "ProbeAngle1 should not larger then -90."],
        require: true
    },
    ProbeAngle2: {
        type: Number,
        min: [-90, "ProbeAngle2 should not less than -90."],
        max: [90, "ProbeAngle2 should not larger then -90."],
        require: true
    },
    Replicate: {
        type: Number,
        min: [1, "Replicate should not less than 1."],
        require: true
    },
    UniqueID: {
        type: String,
        require: function () {
            return typeof this.institutionCode === 'undefined' &&
                typeof this.catalogueNumber === 'undefined';
        }
    },
    catalogueNumber: {
        type: String,
        index: true,
        require: function () {
            return typeof this.UniqueID === 'undefined';
        }
    },
    class: {
        type: String,
        index: true,
        require: false
    },
    collectionCode: {
        type: String,
        index: true,
        require: false,
    },
    country: {
        type: String,
        index: true,
        enum: require('../countryList'),
        require: false
    },
    decimalLatitude: {
        type: Number,
        min: [-90, "decimalLatitude should not less than -90."],
        max: [90, "decimalLatitude should not larger then -90."],
        require: false
    },
    decimalLongitude: {
        type: Number,
        min: [-180, "decimalLongitude should not less than -180."],
        max: [180, "decimalLongitude should not larger then -180."],
        require: false
    },
    eventDate: {
        type: Date,
        require: false
    },
    family: {
        type: String,
        index: 'type',
        require: false
    },
    genus: {
        type: String,
        index: true,
        require: true
    },
    geodeticDatum: {
        type: String,
        require: function () {
            return typeof this.decimalLatitude === 'number' ||
                typeof this.decimalLongitude === 'number';
        }
    },
    infraspecificEpithet: {
        type: String,
        index: true,
        require: false
    },
    institutionCode: {
        type: String,
        index: true,
        require: function () {
            return typeof this.UniqueID === 'undefined';
        }
    },
    lifeStage: {
        type: String,
        index: true,
        require: false
    },
    locality: {
        type: String,
        require: false
    },
    measurementDeterminedDate: {
        type: Date,
        require: false
    },
    order: {
        type: String,
        index: true,
        require: false
    },
    sex: {
        type: String,
        index: true,
        require: false
    },
    specificEpithet: {
        type: String,
        index: true,
        require: true
    },
    verbatimElevation: {
        type: Number,
        require: false
    },
    RawFileStatus: {
        type: String,
        enum: ['Missing', 'Processing', 'Ok', 'Warn', 'Error'],
        require: true,
        default: 'Processing'
    }
};

let metadataSchema = new mongoose.Schema(schemaDef);

const csvColumns = [
    'Comments',
    'FileName',
    'LightAngle1',
    'LightAngle2',
    'Patch',
    'ProbeAngle1',
    'ProbeAngle2',
    'Replicate',
    'UniqueID',
    'catalogueNumber',
    'class',
    'collectionCode',
    'country',
    'decimalLatitude',
    'decimalLongitude',
    'eventDate',
    'family',
    'genus',
    'geodeticDatum',
    'infraspecificEpithet',
    'institutionCode',
    'lifeStage',
    'locality',
    'measurementDeterminedDate',
    'order',
    'sex',
    'specificEpithet',
    'verbatimElevation',
];

function parseColumns(dataForm, cols, isModify) {
    cols = cols.split(',');

    let duplicates = helpers.findDuplicates(cols);

    if (duplicates.length > 0) {
        throw new Error("Duplicated metadata rows: " + duplicates.join(', '));
    }

    let s = new Set(cols);
    csvColumns.forEach(key => {
        let requireField = schemaDef[key].require;

        if (typeof requireField === 'boolean') {
            if (requireField && !s.has(key)) {
                throw new Error(`Missing required metadata field: "${key}"`);
            }
        }
    });

    if (dataForm === 'Field' && !s.has('UniqueID')) {
        throw new Error('Missing required column in field metadata file: UniqueID.');
    }

    if (dataForm === 'Museum') {
        for (let k of ['institutionCode', 'catalogueNumber']) {
            if (!s.has(k)) {
                throw new Error(`Missing required column in museum metadata file: ${k}.`);
            }
        }
    }

    for (let col of cols) {
        if (!(isModify && col === 'NewFileName') && csvColumns.indexOf(col) === -1) {
            throw new Error(`Invalid metadata field name: ${col}`);
        }
    }

    return cols;
}

metadataSchema.statics.parse = function (submission, csv, isModify) {
    try {
        csv = csv.split(/\r?\n/);
        let cols = parseColumns(submission.dataFrom, csv[0], isModify);

        let content = csv.slice(1).map(row => row.split(','));
        let skip = content.filter(row => row.length < cols.length);

        let metadatas =  _.compact(content.map((row, i) => {
            if (skip.indexOf(row) !== -1) {
                return null
            }

            let doc = {
                Submission: submission
            };

            for (let i in row) {
                if (i >= cols.length) {
                    break;
                }

                if (row[i]) {
                    doc[cols[i]] = row[i];

                    if (cols[i] === 'NewFileName' && !isModify) {
                        delete doc[cols[i]];
                    }
                }
            }

            if (!isModify) {
                doc = new Metadata(doc);

                let err = doc.validateSync();
                if (err) {
                    throw err;
                }
            }

            return doc;
        }));

        let fileDuplicates = helpers.findDuplicates(_.compact(metadatas.map(m => m.FileName)));

        if (fileDuplicates.length > 0) {
            throw new Error("Duplicated FileName in metadata file: " + fileDuplicates.join(', '));
        }

        if (isModify) {
            let result = {
                add: [],
                delete: [],
                replace: []
            };

            for (let row of metadatas) {
                if (row.NewFileName) {
                    if (row.FileName) {
                        result.replace.push(row);
                    } else {
                        result.add.push(row);
                    }
                } else {
                    if (row.FileName) {
                        result.delete.push(row);
                    } else {
                        throw new Error('Fields "NewFileName" and "FileName" cannot be null in same row.');
                    }
                }
            }

            return result;
        } else {
            return metadatas;
        }
    } catch (e) {
        e.message = "Failed to parse metadata file: " + e.message;
        e.code = 400;
        throw e;
    }
};

const embargoSelector = [{
    $lookup: {
        from: "submissions",
        localField: "Submission",
        foreignField: "_id",
        as: "Submission"
    }
}, {
    $unwind: "$Submission"
}, {
    $match: {
        $or: [{
            'Submission.availableAt': {
                $lte: new Date()
            }
        }, {
            'Submission.isEmbargo': false
        }]
    }
}];

metadataSchema.statics.search = async function (query) {
    query.RawFileStatus = 'Ok';

    return Metadata.aggregate([{
        $match: query
    }, ...embargoSelector, {
        $group: {
            _id: {
                genus: '$genus',
                specificEpithet: '$specificEpithet',
                infraspecificEpithet: '$infraspecificEpithet',
                sex: '$sex',
                lifeStage: '$lifeStage',
                Patch: '$Patch',
            }
        }
    }, {
        $replaceWith: "$_id"
    }]);
};

metadataSchema.statics.findPublicRows = async function (query) {
    return Metadata.aggregate([{
        $match: query
    }, ...embargoSelector, {
        $set: {
            "Submission": "$Submission._id"
        }
    }]);
};

metadataSchema.statics.findRawFiles = async function (query) {
    return Metadata.aggregate([{
        $match: query
    }, ...embargoSelector, {
        $project: {
            _id: "$Submission._id",
            FileName: "$FileName"
        }
    }]);
};

metadataSchema.statics.findSubmissions = async function (query) {
    return Metadata.aggregate([{
        $match: query
    }, ...embargoSelector, {
        $replaceWith: '$Submission'
    }, {
        $group: {
            _id: "$_id",
            doc: {
                $first: "$$ROOT"
            }
        }
    }, {
        $replaceWith: '$doc'
    }, {
        $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user"
        }
    }, {
        $unwind: '$user'
    }]);
};

metadataSchema.statics.setRawFileStatus = function (files, metadata) {
    files = files.map(f => path.basename(f));
    let filesInMetadata = metadata.map(m => (m.NewFileName || m.FileName) + '.Master.Transmission');

    let valid = _.intersection(files, filesInMetadata);
    let notInMetadata = _.difference(files, filesInMetadata);
    let missing = _.difference(filesInMetadata, files);

    for (let m of metadata) {
        let filename = m.NewFileName || m.FileName;

        if (missing.indexOf(filename) !== -1) {
            m.RawFileStatus = 'Missing';
        } else if (valid.indexOf(filename) !== -1) {
            m.RawFileStatus = 'Processing';
        }
    }

    return {
        valid,
        notInMetadata,
        missing
    };
};

module.exports = Metadata = mongoose.model('Metadata', metadataSchema);
