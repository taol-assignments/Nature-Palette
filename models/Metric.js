const {spawn} = require('child_process');
const mongoose = require('mongoose');
const config = require('../config');
const ObjectId = mongoose.Schema.Types.ObjectId;

let metricSchema = new mongoose.Schema({
    Submission: {
        type: ObjectId,
        ref: 'Submission',
        require: true
    },
    Filename: {
        type: String,
        require: true
    },
    B1: {
        type: Number,
        require: true
    },
    B2: {
        type: Number,
        require: true
    },
    B3: {
        type: Number,
        require: true
    },
    S1U: {
        type: Number,
        require: true
    },
    S1V: {
        type: Number,
        require: true
    },
    S1B: {
        type: Number,
        require: true
    },
    S1G: {
        type: Number,
        require: true
    },
    S1Y: {
        type: Number,
        require: true
    },
    S1R: {
        type: Number,
        require: true
    },
    S2: {
        type: Number,
        require: true
    },
    S3: {
        type: Number,
        require: true
    },
    S4: {
        type: Number,
        require: true
    },
    S5: {
        type: Number,
        require: true
    },
    S6: {
        type: Number,
        require: true
    },
    S7: {
        type: Number,
        require: true
    },
    S8: {
        type: Number,
        require: true
    },
    S9: {
        type: Number,
        require: true
    },
    S10: {
        type: Number,
        require: true
    },
    H1: {
        type: Number,
        require: true
    },
    H2: {
        type: Number,
        require: true
    },
    H3: {
        type: Number,
        require: true
    },
    H4: {
        type: Number,
        require: true
    },
    H5: {
        type: Number,
        require: true
    }
});

let Metric;

metricSchema.statics.fromRawFile = async function (submission) {
    let childProcess = spawn(config.rLanguageExecutable, [
        '--vanilla',
        __dirname + '/../lib/MetricCalculation.R',
        __dirname + '/../uploads/' + submission._id + '/Unprocessed'
    ]);

    let result = JSON.parse(await new Promise((resolve, reject) => {
        let err = '';
        let json = '';

        childProcess.stdout.on('data', data => {
            json += data;
        });

        childProcess.stderr.on('data', data => {
            err += data;
        });

        childProcess.on('close', code => {
            if (code !== 0) {
                console.warn(`Rscript process finished with exit code ${code}. stderr output: ${err}`);
            }

            try {
                resolve(json.substr(json.indexOf('{')));
            } catch (e) {
                reject(e);
            }
        })
    }));

    let metrics = [];
    for (let i = 0; i < result.metrics.H5.length; i++) {
        let m = {
            Submission: submission,
            Filename: result.files[i]
        };
        for (let k in result.metrics) {
            m[k] = result.metrics[k][i];
        }

        metrics.push(new Metric(m));
    }

    return {
        ...result,
        metrics: metrics,
    };
};

module.exports = Metric = mongoose.model('Metric', metricSchema);
