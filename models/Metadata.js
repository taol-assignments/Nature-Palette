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
        require: function () {
            return typeof this.UniqueID === 'undefined';
        }
    },
    class: {
        type: String,
        require: false
    },
    collectionCode: {
        type: String,
        require: false,
    },
    country: {
        type: String,
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
        require: false
    },
    genus: {
        type: String,
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
        require: false
    },
    institutionCode: {
        type: String,
        require: function () {
            return typeof this.UniqueID === 'undefined';
        }
    },
    lifeStage: {
        type: String,
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
        require: false
    },
    sex: {
        type: String,
        require: false
    },
    specificEpithet: {
        type: String,
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
            submission: submission
        };

        for (let i in row) {
            doc[cols[i]] = row[i];
        }

        return new Metadata(doc);
    });
};

module.exports = Metadata = mongoose.model('Metadata', metadataSchema);
