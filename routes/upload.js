const fs = require('fs');
const express = require('express');
const multer = require('multer');

let router = express.Router();

router.post('/', multer({
    dest: __dirname + "/../uploads"
}).single("upload"), function (req, res, next) {
    fs.readFile(__dirname + '/../fileList.json', (err, buf) => {
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
    });
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
