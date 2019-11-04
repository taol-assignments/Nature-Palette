let express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');

let router = express.Router();

router.post('/', function (req, res, next) {
    let email = req.body.email;
    let password = req.body.password;

    try {
        let user = User.register(email, password);
    } catch (e) {
        console.error(e);
        throw e;
    }
    res.json({code:1});
    res.status(201).end();
});

router.get('/', function(req, res, next){
    res.render('register');
});


module.exports = router;