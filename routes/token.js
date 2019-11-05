const express = require('express');
const auth = require('../middlewares/auth');
const User = require('../models/User');
const Token = require('../models/Token');

let router = express.Router();

router.post('/', auth.validateRecaptchaToken, async function (req, res, next) {
    let user = await User.validate(req.body.email, req.body.password);

    if (user) {
        let token = await Token.create(user);

        token = token.toObject();
        delete token._id;
        delete token.__v;
        delete token.user;

        token.user = user.toObject();
        delete token.user._id;
        delete token.user.__v;
        delete token.user.password;

        res.cookie('token', token.nonce, {
            expires: token.expireAt,
            httpOnly: true
        }).status(201).json(token);

    } else {
        res.status(403).json({
            msg: "Invalid user name or password."
        })
    }
});

router.get('/', function(req, res){
    res.render('login');
});

router.delete('/', async function (req, res) {
    if (req.cookies.token) {
        await Token.delete(req.cookies.token);
    }

    res.clearCookie('token');
    res.status(204).end();
});

module.exports = router;
