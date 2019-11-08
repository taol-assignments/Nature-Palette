const config = require('../config');

module.exports = function (req, res, next) {
    let _render = res.render;

    res.render = function (view, options, fn) {
        if (typeof options === "function") {
            _render.call(this, view, {
                user: req.user,
                config: config
            }, options);
        } else if (typeof options === "object") {
            _render.call(this, view, {
                ...options,
                user: req.user,
                config: config
            }, fn);
        } else {
            _render.call(this, view, {
                user: req.user,
                config: config
            }, fn);
        }

        return res;
    };

    next();
};