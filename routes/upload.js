const express = require('express');
const multer = require('multer');
const AdmZip = require('adm-zip');

let router = express.Router();

router.post('/', multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, __dirname + "/../uploads/" + file.fieldname)
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + "-" + file.originalname)
        }
    })
}).fields([{
    name: 'uploadMetadata', maxCount: 1
}, {
    name: 'uploadRawFile', maxCount: 1
}]), function (req, res, next) {

    let rawFile = req.files['uploadRawFile'][0];
    let zip = new AdmZip(rawFile.path);
    // extracts everything
    zip.extractAllTo(__dirname + "/../uploads/extractedFile", true);

    let paraList = req.body;
    let firstName = paraList.firstName;
    let lastName = paraList.lastName;
    let email = paraList.email;
    let institution = paraList.institution;
    let dataType = paraList.datatype;
    let dataFrom = paraList.dataFrom;
    let published = paraList.published;
    let date = paraList.date;
    let embargo = paraList.embargo;
    let metadataFile = req.files['uploadMetadata'][0];
    let metadataName = metadataFile.originalname;
    let rawName = rawFile.originalname;
});

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('upload');
});

router.get('/instruction.html', function (req, res, next) {
    res.render('uploadInstruction');
});

router.get('/submission.html', function (req, res, next) {
    res.render('uploadSubmission');
});

module.exports = router;
