const {Router} = require('express');
const router = Router();
const RefreshToken = require('../models/RefreshToken');

router.get('/', async(req, res)=>{
    try {
        await RefreshToken.deleteOne({refreshToken: req.cookies.refreshToken});
    } catch (error) {
        console.log(`Error in get logout.routes: ${error.message}`);
    } finally {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.redirect('/login');
    }
});

module.exports = router;