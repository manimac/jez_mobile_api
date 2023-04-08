const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const multer = require('multer');
const path = require('path');
const moment = require('moment');
const stripe = require('stripe')(process.env.stripe_sk);
const fs = require('fs');
const appUtil = require('../apputil');
const MODELS = require("../models");
const EmployeeModel = MODELS.employee;


// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var dir = './public/uploads/employee'
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)) // Appending the extension
    }
})

/** Employee */

exports.createEmployee = function (req, res) {
    var upload = multer({ storage: storage }).single('profileimage');
    upload(req, res, function (err) {
        req.body.profileimage = res.req.file && res.req.file.filename;
        EmployeeModel.create(req.body).then(function () {
            res.send(req.body);
        }, function (err) {
            res.status(500).send(err);
        })

    });
}

exports.updateEmployee = function (req, res) {
    var upload = multer({ storage: storage }).single('profileimage');
    upload(req, res, function (err) {
        EmployeeModel.findByPk(req.body.id).then(function (result) {
            req.body.profileimage = res.req.file && res.req.file.filename || result.profileimage;
            result.update(req.body).then((resp) => {
                res.send(resp);
            })
        }, function (err) {
            res.status(500).send(err);
        })
    });
}