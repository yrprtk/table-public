const express = require('express');
const app = express();
const config = require('./config.js');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
app.use(cookieParser(config.cookieParserSecretKey));
app.use(session({cookie: {maxAge: 3600 *24}}));
app.use(flash());
app.use(express.urlencoded({extended: true}));
app.use('/static', express.static(__dirname + '/static'));
app.set('view engine', 'ejs');
app.set('etag', false)
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
})
app.use('/logout', require('./routes/logout.routes'));
app.use('/login', require('./routes/login.routes'));
app.use('/', require('./routes/projects.routes'));
app.use(function(req, res, next) {
    res.redirect('/');
});

(async function(){
    try {
        await mongoose.connect(config.dbURL, {useUnifiedTopology: true, useNewUrlParser: true});
        app.listen(config.port, () => console.log(`Server start in ${config.port} port`));
    } catch (error) {
        console.log(`Error in server: ${error.message}`);
        process.exit(1);
    }
}());