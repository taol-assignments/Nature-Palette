const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

require('mongoose').connect('mongodb://localhost/Palette', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const indexRouter = require('./routes/index');
const uploadRouter = require('./routes/upload');
const fileListRouter = require('./routes/fileList');
const registerRouter = require('./routes/register');
const tokenRouter = require('./routes/token');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/upload.html', uploadRouter);
app.use('/fileList.json', fileListRouter);
app.use('/register.html', registerRouter);
app.use('/token.html', tokenRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);

    let contentType = req.headers['content-type'];

    if (!contentType || contentType.indexOf('application/json') !== -1) {
        return res.json({
            msg: "Internal server error."
        });
    } else {
        // render the error page
        res.render('error');
    }

    next();
});

module.exports = app;
