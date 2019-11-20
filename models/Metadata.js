const _ = require('lodash');
const peg = require('pegjs');
const helpers = require('../lib/helpers');
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

let Metadata;

let metadataSchema = new mongoose.Schema({
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
        require: true
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
    }
});

const fieldParser = peg.generate(
    "column = 'Comments' /" +
    "'FileName' /" +
    "'LightAngle1' /" +
    "'LightAngle2' /" +
    "'Patch' /" +
    "'ProbeAngle1' /" +
    "'ProbeAngle2' /" +
    "'Replicate' /" +
    "'UniqueID' /" +
    "'catalogueNumber' /" +
    "'class' /" +
    "'collectionCode' /" +
    "'country' /" +
    "'decimalLatitude' /" +
    "'decimalLongitude' /" +
    "'eventDate' /" +
    "'family' /" +
    "'genus' /" +
    "'geodeticDatum' /" +
    "'infraspecificEpithet' /" +
    "'institutionCode' /" +
    "'lifeStage' /" +
    "'locality' /" +
    "'measurementDeterminedDate' /" +
    "'order' /" +
    "'sex' /" +
    "'specificEpithet' /" +
    "'verbatimElevation'\n" +
    "start = first:column others:(' '* ',' ' '* c:column {return c;})+ {" +
    "   return [first].concat(others);" +
    "}", {
        allowedStartRules: ['start']
    });

const rowParser = peg.generate(
    "elem = (!('\\n' / '\\r\\n')+ [^,])* {return text();}\n" +
    "row = first:elem others:(',' e:elem{return e})+ {" +
    "   return [first].concat(others)" +
    "}\n" +
    "rows = first:row others:(('\\n' / '\\r\\n')+ r:row {return r;})* ('\\n' / '\\r\\n')* {" +
    "   return [first].concat(others);" +
    "}", {
        allowedStartRules: ['rows']
    });

metadataSchema.statics.parse = function (submission, csv) {
    let end = csv.indexOf('\r\n');
    let offset = 2;

    if (end === -1) {
        end = csv.indexOf('\n');
        offset = 1;
    }

    try {
        if (end === -1) {
            throw new Error('Empty metadata file.');
        }

        let cols = fieldParser.parse(csv.substr(0, end));

        let duplicates = helpers.findDuplicates(cols);
        if (duplicates.length > 0) {
            throw new Error("Found duplicated columns: " + duplicates.join(', '));
        }

        let content = rowParser.parse(csv.substr(end + offset));

        return content.map(row => {
            if (row.length !== cols.length) {
                throw new Error(`Number of columns mismatched in row ${content.indexOf(row) + 1}.` +
                    `Expect ${cols.length} columns per row.`);
            }

            let doc = {
                Submission: submission
            };

            for (let i in row) {
                if (row[i]) {
                    doc[cols[i]] = row[i];
                }
            }

            return new Metadata(doc);
        });
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

module.exports = Metadata = mongoose.model('Metadata', metadataSchema);
