const User = require('../models/User');
const Token = require('../models/Token');

exports.tokenParser = async function (req, res, next) {
    req.user = null;

    if (!req.cookies || !req.cookies.token) {
        return next();
    }

    let token = await Token.validate(req.cookies.token);

    if (token !== null) {
        req.user = await User.findById(token.user).populate('userGroup');
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
            }

            return;
        }

        next();
    }
};