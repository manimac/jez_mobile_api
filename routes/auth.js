var express = require('express');
var router = express.Router();
var passport = require('passport');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const appUtil = require('../app/apputil');

// SET STORAGE
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        var dir = './public/uploads/user'
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)) // Appending the extension
    }
})

router.post('/signup-user', function(req, res, next) {
    // var upload = multer({ storage: storage }).single('userimage');
    // upload(req, res, function (err) {
    //     req.body.userimage = res.req.file && res.req.file.filename || '';
    passport.authenticate('local-signup-user', function(err, user, info) {
        if (err) {
            return res.status(500).send({ message: err.message });
        }
        if (!user) {
            return res.status(401).send();
        }
        return res.json({ status: 1, userid: user.id, message: 'User Created' });
        // return res.json(user);
    })(req, res, next);
    // })
});
router.post('/login', function(req, res, next) {
    passport.authenticate('local-login-app', function(err, user, info) {
        if (err) {
            console.log(err);
            return next(err);
        }
        if (!user) {
            // *** Display message without using flash option
            // re-render the login form with a message
            // return res.status(400).send({ message: "Invalid Credentials" });
            return res.status(500).send('Please enter a correct OTP');
        }
        if (user) {
            user = user.toJSON();
            if (user.is_verified == 0) {
                return res.status(500).send('Verifeer uw account om in te loggen');
                // return res.status(400).send({ message: "Verifeer uw account om in te loggen" });
            }
            delete user.password;
            delete user.status;
            delete user.verification_token;
            delete user.is_verified;
            delete user.createdAt;
            delete user.updatedAt;
            const token = jwt.sign(user, appUtil.jwtSecret);
            user.token = token;
            return res.json(user);
        }
    })(req, res, next);
});


router.post('/login-admin', function(req, res, next) {
    passport.authenticate('local-login-admin', function(err, user, info) {
        if (err) {
            console.log(err);
            return next(err)
        }
        if (!user) {
            // *** Display message without using flash option
            // re-render the login form with a message
            return res.status(401).send();
        }
        user = user.toJSON();
        delete user.password;
        delete user.status;
        delete user.verification_token;
        delete user.is_verified;
        delete user.createdAt;
        delete user.updatedAt;
        const token = jwt.sign(user, appUtil.jwtSecret);
        user.token = token;
        return res.json(user);
    })(req, res, next);
});

router.post('/employer/signup', function(req, res, next) {
    // var upload = multer({ storage: storage }).single('userimage');
    // upload(req, res, function (err) {
    //     req.body.userimage = res.req.file && res.req.file.filename || '';
    passport.authenticate('local-signup-employer', function(err, user, info) {
        if (err) {
            return res.status(500).send({ message: err.message });
        }
        if (!user) {
            return res.status(401).send();
        }
        return res.json({ status: 1, userid: user.id, message: 'Employer Created' });
        // return res.json(user);
    })(req, res, next);
    // })
});
router.post('/employer/login', function(req, res, next) {
    passport.authenticate('local-login-employer', function(err, user, info) {
        if (err) {
            console.log(err);
            return next(err)
        }
        if (!user) {
            // *** Display message without using flash option
            // re-render the login form with a message
            if(err){
                return res.status(401).send(err);
            }
            else{
                return res.status(401).send();
            }
        }
        if(user && user.status == 0){
            const err = { status: 0, message: 'Please wait for some time. Verification is in progress.' };
            return res.status(401).send(err);
        }
        user = user.toJSON();
        delete user.password;
        delete user.status;
        delete user.verification_token;
        delete user.is_verified;
        delete user.createdAt;
        delete user.updatedAt;
        const token = jwt.sign(user, appUtil.jwtSecret);
        user.token = token;
        return res.json(user);
    })(req, res, next);
});

router.get('/profile', isLoggedIn, (req, res) => {
    res.status(200).json(req.user);
});
router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    res.status(200).json({
        'message': 'successfully logout'
    });
});

module.exports = router;

//route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.status(400).json({
        'message': 'access denied'
    });
}