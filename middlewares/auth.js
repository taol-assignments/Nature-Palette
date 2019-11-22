const request = require('request-promise-native');
const config = require('../config');
const User = require('../models/User');
const Token = require('../models/Token');

exports.tokenParser = async function (req, res, next) {
    res.locals.user = req.user = null;

    if (!req.cookies || !req.cookies.token) {
        return next();
    }

    let token = await Token.validate(req.cookies.token);

    if (token !== null) {
        res.locals.user = req.user = await User.findById(token.user).populate('userGroup');
    }

    next();
};

exports.ensureUserPrivilege = function (...privileges) {
    return async function (req, res, next) {
        if (!req.user) {
            res.status(403).json({
                msg: "Access denied."
            }).end();

            return;
        }

        for (let p of privileges) {
            if (!req.user.userGroup[p]) {
                res.status(403).json({
                    msg: "Access denied."
                }).end();

                return;
            }
        }

        next();
    }
};

exports.validateRecaptchaToken = async function (req, res, next) {
    const token = req.get('X-reCAPTCHA-Token');
    if (typeof token !== 'string') {
        res.json({
            msg: "Missing reCAPTCHA token."
        }).status(400).end();

        return;
    }

    const result = JSON.parse(await request.post({
        url: 'https://www.google.com/recaptcha/api/siteverify',
        formData: {
            secret: config.recaptcha.secretKey,
            response: token,
            remoteip: req.ip
        }
    }));

    if (result.success) {
        next();
    } else {
        res.json({
            msg: "reCAPTCHA test failed."
        }).status(403).end();
    }
};