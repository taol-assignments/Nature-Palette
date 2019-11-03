const express = require('express');
const User = require('../models/User');
const Token = require('../models/Token');

let router = express.Router();

router.post('/', async function (req, res, next) {
    let user = await User.validate(req.body.email, req.body.password);

    if (user) {
        let token = await Token.create(user);

        res.status(201).json(token);
    } else {
        res.status(403).json({
            msg: "Invalid user name or password."
        })
    }

    next();
});

router.get('/', function(req, res, next){
    res.render('login', {
        title: "Login - Nature's Palette"
    });
});

module.exports = router;
