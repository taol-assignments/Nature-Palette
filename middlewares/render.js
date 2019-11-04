module.exports = function (req, res, next) {
    let _render = res.render;

    res.render = function (view, options, fn) {
        if (typeof options === "function") {
            _render.call(this, view, {
                user: req.user
            }, options);
        } else if (typeof options === "object") {
            _render.call(this, view, {
                ...options,
                user: req.user
            }, fn);
        } else {
            _render.call(this, view, {
                user: req.user
            }, fn);
        }
    };

    next();
};