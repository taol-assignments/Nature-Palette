const User = require('../models/User');
const Token = require('../models/Token');

exports.ensureTokenValid = async function (req, res, next) {
    let authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(400).json({
            msg: "Missing token field."
        });

        res.end();
        return;
    }

    let split = authHeader.split(' ');

    if (split[0] !== 'Bearer') {
        res.status(400).json({
            msg: "Invalid HTTP Authorization header."
        });

        res.end();
        return;
    }

    let token = await Token.validate(split[1]);
    let user;

    if (token !== null) {
        req.user = user = await User.findById(token.userId);
    }

    if (token === null || user === null) {
        res.status(403).json({
            msg: "Invalid access token"
        });

        res.end();
    } else {
        next();
    }
};