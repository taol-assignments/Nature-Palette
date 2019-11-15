const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const config = require('./config');

require('mongoose').connect(
    `mongodb://${config.mongoDB.host}:${config.mongoDB.port}/${config.mongoDB.database}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

const auth = require('./middlewares/auth');
const render = require('./middlewares/render');

const indexRouter = require('./routes/index');
const uploadRouter = require('./routes/upload');
const registerRouter = require('./routes/register');
const tokenRouter = require('./routes/token');
const aboutRouter = require('./routes/about');
const helpRouter = require('./routes/help');
const searchRouter = require('./routes/search');
const addTermRouter = require('./routes/addTerm');

let app = express();

app.locals.moment = require('moment');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(auth.tokenParser);

app.use(render);

app.use('/', indexRouter);
app.use('/upload', uploadRouter);
app.use('/register.html', registerRouter);
app.use('/token.html', tokenRouter);
app.use('/about.html', aboutRouter);
app.use('/help.html', helpRouter);
app.use('/search', searchRouter);
app.use('/addTerm', addTermRouter);

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

    console.error(err);

    if (contentType && contentType.indexOf('application/json') !== -1) {
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
