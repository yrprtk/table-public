const Users = require('../models/Users');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');
const config = require('../config.js');

module.exports = async(req, res, next) => {
    try {
        let {accessToken, refreshToken} = req.cookies; 
        if(accessToken){
            let payload = jwt.verify(accessToken, config.tokenKey);
            if(!(((Math.floor(Date.now() / 1000))-(payload.iat))>config.expAccessTokenMin*60)){
                // console.log("time have`");
                req.headers.user_id=payload._id;
                req.headers.user_email=payload.email;
                req.headers.user_role=payload.role;
                return next();
            }
        }
        if (refreshToken){
            let payload = jwt.verify(refreshToken, config.tokenKey);
            let token = await RefreshToken.findOne({refreshToken});
            if(!token){
                await RefreshToken.deleteMany({user_id: payload._id});
                throw new Error(`refresh token was previously used and removed from db (${refreshToken})`);
            };
            await RefreshToken.deleteOne({refreshToken});
            let user = await Users.findOne({_id: payload._id});
            if(!user){
                throw new Error(`user with this id (${payload._id}) not found`);
            };
            req.headers.user_id=user._id;
            req.headers.user_email=user.email;
            req.headers.user_role=user.role;
            let newAccessToken = jwt.sign({_id: user._id, role: user.role, email: user.email}, config.tokenKey);
            let newRefreshToken = jwt.sign({ _id: user._id} , config.tokenKey);
            await RefreshToken.create({refreshToken: newRefreshToken, user_id: user._id});
            res.cookie('accessToken', newAccessToken, { expires: new Date(Date.now() + (config.expAccessTokenMin+180)*60*1000), httpOnly: config.cookieHttpOnly, secure: config.cookieSecure, sameSite: config.cookieSameSite});
            res.cookie('refreshToken', newRefreshToken, { httpOnly: config.cookieHttpOnly, secure: config.cookieSecure, sameSite: config.cookieSameSite});
            return next();
        }else{
            throw new Error(`cookie dont have walid accessToken or refreshToken`);
        }
    } catch (error) {
        console.log(`Error in isAuth.middleware: ${error.message}`);
        res.redirect('/login');
    }
};