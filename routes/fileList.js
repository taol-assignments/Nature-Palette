const fs = require('fs');

let router = require('express').Router();

router.get('/', function (req, res, next) {
    fs.readFile(__dirname + '/../fileList.json', (err, buf) => {
        if (err) {
            if (err.code === "ENOENT") {
                res.json([]);
                return;
            } else {
                throw err;
            }
        }

        res.json(JSON.parse(buf.toString()));
    });
});

module.exports = router;