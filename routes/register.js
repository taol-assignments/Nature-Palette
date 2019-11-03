let express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');

let router = express.Router();
mongoose.connect('mongodb://localhost/Palette', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

router.post('/', function (req, res, next) {
    let email = req.body['email'];
    let password = req.body['password'];
    try {
        let user = User.register(email, password);
    } catch (e) {

    }
});


module.exports = router;