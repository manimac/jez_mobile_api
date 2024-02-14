const Sequelize = require('sequelize');
const Op = Sequelize.Op;
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt-nodejs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const appUtil = require('../apputil');
const MODELS = require("../models");
const UserDetailModel = MODELS.userDetails;
const UserModel = MODELS.users;
const oldTrainingModel = MODELS.oldTraining;
const AchievementModel = MODELS.achievement;

// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var dir = './public/uploads/user'
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)) // Appending the extension
    }
})




exports.createUserDetail = function (req, res) {
    let authorization = req.headers.authorization,
        decoded;
    try {
        decoded = jwt.verify(authorization, appUtil.jwtSecret);
    } catch (e) {
        return res.status(401).send('unauthorized');
    }
    const UserDetail = {
        user_id: decoded.id,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        age: req.body.age,
        dateofbirth: req.body.dateofbirth
    }
    UserDetailModel.create(UserDetail).then(function () {
        res.send(req.body);
    }, function (err) {
        res.status(500).send(err);
    })

}

exports.verifyUser = function (req, res) {
    UserModel.findByPk(req.params.userid).then(function (user) {
        if (!user) {
            res.send('Invalid verification');
            // res.redirect(`${process.env.appUrl}/receipt/${collection.txnid}`);
        } else if (!user.is_verified) {
            if ((user.verification_token == req.params.token)) {
                user.update({ is_verified: 1 }).then(function (resp) {
                    res.writeHead(301, {
                        Location: process.env.appUrl
                    }).end();
                    //res.redirect(200, process.env.appUrl);
                    // res.send({ status: 1, message: 'User Verified' });
                }, function (updateErr) {
                    res.status(500).send(updateErr);
                })
            } else {
                res.send('Invalid verification');
                // res.redirect(`${process.env.appUrl}/receipt/${collection.txnid}`);
            }
        }
        else {
            res.send('User Already Verified');
        }
    }).catch(function (err) {
        res.status(500).send(err);
    });
}


exports.allUsers = function (req, res) {
    let result = { count: 0, data: [] };
    let offset = req.body.offset || 0;
    let limit = req.body.limit || 1000;
    let where = {};

    if (req.body.status) {
        where.status = req.body.status;
    }
    if (req.body.is_admin) {
        where.is_admin = 1;
    }
    if (req.body.fromdate) {
        const from = moment(req.body.fromdate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
        const to = req.body.todate && moment(req.body.todate).endOf('day').format('YYYY-MM-DD HH:mm:ss') || moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
        where.createdAt = {
            [Op.between]: [new Date(from), new Date(to)]
        }
    }

    UserModel.findAndCountAll({
        where
    }).then((output) => {
        result.count = output.count;
        UserModel.findAll({
            where,
            // include: [UserDetailModel],
            order: [
                ['createdAt', 'DESC']
            ],
            offset: offset,
            limit: limit
        }).then((registered) => {
            let revised = registered.map((x, i) => {
                let temp = x && x.toJSON();
                temp.sno = offset + (i + 1);
                return temp;
            })
            result.data = revised;
            res.send(result);
        }).catch((err) => {
            res.status(500).send(err)
        })
    }).catch((err) => {
        res.status(500).send(err)
    })
}

exports.getUser = function (req, res) {
    UserModel.findByPk(req.params.id).then(function (result) {
        res.send(result)
    }, function (err) {
        res.status(500).send(err);
    })
}
exports.userUpdate = function (req, res) {
    var upload = multer({ storage: storage }).single('userimage');
    upload(req, res, function (err) {
        let returns = null;
        req.body.userimage = res.req.file && res.req.file.filename || req.body.userimage;
        if (req.body.newpassword) {
            req.body.password = bcrypt.hashSync(req.body.newpassword, bcrypt.genSaltSync(8), null);
        }
        // if (req.body.username) {
        UserModel.findByPk(req.body.id).then(function (resp) {
            resp.update(req.body).then(function (result) {
                res.send(result);
            });
        })

    });

}

exports.resetPassword = async function (req, res) {
    // let email = Buffer.from(req.body.user, 'base64').toString('ascii')
    let email = req.body.email;
    let alreadyuser = await UserModel.findOne({
        where: {
            [Op.or]: [{ 'email': email }, { 'phone': email }]
        }
    });
    if (alreadyuser) {
        user = alreadyuser.toJSON();
        var randomstring1 = new RandExp(/^[A-Z]/);
        var randomstring2 = new RandExp(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,10}$/);
        // res.status(200).send({ message: randomstring1.gen()+randomstring2.gen() });
        // var randomstring = Math.random().toString(36).slice(-8);
        var randomstring = randomstring1.gen() + randomstring2.gen();
        user.password = bcrypt.hashSync(randomstring, bcrypt.genSaltSync(8), null);
        alreadyuser.update(user).then(data => {
            appUtil.resetedPassword(alreadyuser, randomstring);
            res.status(200).send({ message: 'Password hasbeen reseted' });
        }, (err) => {
            res.status(500).send({ message: 'User Update Error' });
        });
    } else {
        res.status(500).send('User not found');
    }
}

exports.forget = async function (req, res) {
    const alreadyuser = await UserModel.findOne({
        where: {
            [Op.or]: [{ 'email': req.body.email }, { 'phone': req.body.email }]
        }
    });
    if (alreadyuser) {
        let encodeEmail = Buffer.from(alreadyuser.email).toString('base64');
        res.status(200).send({ user: encodeEmail });
    } else {
        res.status(500).send('User not found');
    }
}

exports.appLogin = function (req, res) {
    appUtil.appLogin(req.body).then(function (resp) {
        if (resp && resp.status == 200) {
            res.status(200).json({ message: 'OTP Send to user email' });
        } else {
            res.status(500).send('User not found');
        }
    })
}
