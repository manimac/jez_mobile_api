// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

var appUtil = require('../app/apputil');
const MODELS = require("../app/models");
const User = MODELS.users;



// expose this function to our app using module.exports
module.exports = function (passport) {
    // API login setup
    // var opts = {};
    // opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
    // opts.secretOrKey = "possecret";

    let jwtOptions = {
        jwtFromRequest: ExtractJwt.fromHeader('authorization'),
        // jwtFromRequest: ExtractJwt.frofromAuthHeaderAsBearerTokenmHeader(),
        // jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
        // jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
        secretOrKey: appUtil.jwtSecret
    }

    passport.use(new JwtStrategy(jwtOptions, function (jwt_payload, done) {
        User.findByPk(jwt_payload.id).then(function (user) {
            return done(null, user);
        }, function (err) {
            return done(err, null);
        })
        // User.findByPk(jwt_payload.id , function (err, user) {
        //     if (err) {
        //         return done(err, false);
        //     }
        //     if (user) {
        //         return done(null, user);
        //     } else {
        //         return done(null, false);
        //     }
        // });
    }));
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findByPk(id).then(function (user) {
            done(null, user);
        }).catch(function (err) {
            done(err, null);
        });
    });


    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup-user', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    }, async function (req, email, password, done) {
        if (req.body.employee) {
            password = Math.random().toString().slice(2, 11);
        }

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        if (!req.body.phone) {
            const err = { status: 0, message: 'Voer uw 10 cijferig telefoonnummer in' };
            return done(err, false);
        }
        const alreadyuser = await User.findOne({
            where: {
                [Op.or]: [{ 'email': email }, { 'phone': req.body.phone }]
            }
        });
        if (alreadyuser) {
            const err = { status: 0, message: 'E-mail/ telefoonnummer bestaat al' };
            return done(err, false);
        } else {


            let USER = {
                email: email,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                insertion: req.body.insertion,
                phone: req.body.phone,
                newsletter: req.body.newsletter,
                team_id: req.body.team_id || null,
                termsandcondition: req.body.termsandcondition,
                password: bcrypt.hashSync(password, bcrypt.genSaltSync(8), null),
                verification_token: appUtil.makeRandomText(25),
                userimage: req.body.userimage || '',
                deviceId: req.body.deviceId || '',
                userimage: req.body.userimage || '',
            }
            if (req.body.employee) {
                USER.reset_password = 0;
            }
            User.create(USER).then(data => {
                const baseUrl = process.env.baseUrl;
                data.baseUrl = baseUrl;
                if (req.body.employee) {
                    appUtil.sendVerificationMail(data, password);
                } else {
                    appUtil.sendVerificationMail(data);
                }
                req.body.user_id = data.id
                // appUtil.makeUserDetail(req.body).then(function(resp) {
                return done(null, data);
                // }, (err) => {
                //     return done(err, null);
                // })

            }).catch(err => {
                return done(err, null);
            });
        }

    }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login-app', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'otp',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
        function (req, email, password, done) { // callback with email and password from our form

            User.findOne({
                where: {
                    [Op.or]: [{ 'email': email }, { 'phone': email }],
                }
            }).then(function (rows) {
                if (!rows) {
                    return done(null, false); // req.flash is the way to set flashdata using connect-flash
                }

                // // if the user is found but the password is wrong
                // if (!bcrypt.compareSync(password, rows.password))
                //     return done(null, false); // create the loginMessage and save it to session as flashdata

                /** Need to place out OTP Check logic */
                if (rows.otp != password)
                    return done(null, false);
                else // all is well, return successful user
                    return done(null, rows);

            }).catch(function (err) {
                return done(err, null);
            });
        }));

    passport.use('local-login-admin', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
        function (req, email, password, done) { // callback with email and password from our form

            User.findOne({
                where: {
                    [Op.or]: [{ 'email': email }, { 'phone': email }]
                }
            }).then(function (rows) {
                if (!rows) {
                    return done(null, false); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows.password))
                    return done(null, false); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                if (rows && rows.is_admin) {
                    return done(null, rows);
                } else {
                    return done(null, false);
                }


            }).then(function (err) {
                return done(err, null);
            });
        }));

};