const fs = require('fs');
const express = require('express');
const multer = require('multer');

let router = express.Router();

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + "/../uploads/" + file.fieldname)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname)
    }
});
let upload = multer({storage: storage});
let cpUpload = upload.fields([{ name: 'uploadMetadata', maxCount: 1 }, { name: 'uploadRawFile', maxCount: 1 }]);

router.post('/', cpUpload, function (req, res, next) {
    let paraList = req.body;
    let firstName = paraList.firstName;
    let lastName = paraList.lastName;
    let email = paraList.email;
    let institution = paraList.institution;
    let dataType = paraList.datatype;
    let dataFrom = paraList.dataFrom;
    let published = paraList.published;
    let date = paraList.date;
    let embarGo = paraList.embargo;
    let metadataFile = req.files['uploadMetadata'][0];
    let rawFile = req.files['uploadRawFile'][0];
    let metadataName = metadataFile.originalname;
    let rawName = rawFile.originalname;
    console.log("firstName:" + firstName + "lastName:" + lastName + "email:" + email);
    console.log("institution:" + institution + "dataType:" + dataType + "dataFrom:" + dataFrom);
    console.log("published:" + published);
    console.log("embargo:" + embarGo + "date:" + date);
    console.log("embarGo:" + embarGo);
    console.log("metadataName:" + metadataName + "rawName:" + rawName);
    /* fs.readFile(__dirname + '/../fileList.json', (err, buf) => {
        let list;

        if (err) {
            if (err.code === "ENOENT") {
                list = [];
            } else {
                throw err;
            }
        } else {
            list = JSON.parse(buf.toString());
        }

        list.push({
            filename: req.file.originalname,
            description: req.body.description
        });

        fs.writeFile(__dirname + '/../fileList.json', JSON.stringify(list), (err) => {
            if (err) {
                throw err;
            }

            res.redirect('/upload.html');
            res.end();
        })
    });*/
});

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('upload');
});

router.get('/instruction', function (req, res, next) {
    res.render('uploadInstruction');
});

router.get('/submission', function (req, res, next) {
    res.render('uploadSubmission');
});

module.exports = router;
