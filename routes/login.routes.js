const {Router} = require('express');
const router = Router();
const Users = require('../models/Users');
const jwt = require('jsonwebtoken');
const config = require('../config.js');
const RefreshToken = require('../models/RefreshToken');

router.get('/', async(req, res)=>{
    if (!req.cookies.refreshToken){
        res.render('login.min.ejs', {message: req.flash('message')});
    } else{
        res.redirect('/');
    }
});

router.post('/', async(req, res)=>{
    try {
        let user = await Users.findOne({email: req.body.email});
        if (!user){ req.flash('message', 'Email not found'); return res.redirect('/login'); }
        if (user.password==req.body.password){
            let accessToken = jwt.sign({_id: user._id, role: user.role, email: user.email}, config.tokenKey);
            let refreshToken = jwt.sign({ _id: user._id} , config.tokenKey);
            await RefreshToken.create({refreshToken, user_id: user._id});
            res.cookie('accessToken', accessToken, { expires: new Date(Date.now() + (config.expAccessTokenMin+180)*60*1000), httpOnly: config.cookieHttpOnly, secure: config.cookieSecure, sameSite: config.cookieSameSite});
            res.cookie('refreshToken', refreshToken, { httpOnly: config.cookieHttpOnly, secure: config.cookieSecure, sameSite: config.cookieSameSite});
            return res.redirect('/');
        } else { req.flash('message', 'Wrong password'); return res.redirect('/login'); }
    } catch (error) {
        console.log(`Error in post login.routes: ${error.message}`);
        res.redirect('/login');
    }
});

module.exports = router;