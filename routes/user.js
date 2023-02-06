var express = require('express');
var router = express.Router();
var passport = require('passport');
const user = require('../app/controller/user.controller');

router.get('/verification/:userid/:token',user.verifyUser);

const authMiddware = passport.authenticate('jwt', { session: false });

router.use(authMiddware);
/** User Details */
router.post('/detail/add', user.createUserDetail);
router.post('/test', function(req, res, next) {
    console.log(req.get('Authorization'));
    res.send('huh?');
});


module.exports = router;

