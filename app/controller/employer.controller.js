const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const multer = require('multer');
const path = require('path');
const moment = require('moment');
const stripe = require('stripe')(process.env.stripe_sk);
const fs = require('fs');
const appUtil = require('../apputil');
const MODELS = require("../models");
const EmployerModel = MODELS.employer;


// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var dir = './public/uploads/employer'
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

exports.createEmployer = function (req, res) {
    var upload = multer({ storage: storage }).fields([{
        name: 'companylogo',
        maxCount: 3
    }, {
        name: 'coverphoto',
        maxCount: 3
    }]);
    upload(req, res, function (err) {
        req.body.companylogo = res.req.files && (res.req.files.companylogo && res.req.files.companylogo[0].filename);
        req.body.coverphoto = res.req.files && (res.req.files.coverphoto && res.req.files.coverphoto[0].filename);
        EmployerModel.create(req.body).then(function () {
            res.send(req.body);
        }, function (err) {
            res.status(500).send(err);
        })

    });
}

exports.updateEmployer = function (req, res) {
    var upload = multer({ storage: storage }).fields([{
        name: 'companylogo',
        maxCount: 3
    }, {
        name: 'coverphoto',
        maxCount: 3
    }]);
    upload(req, res, function (err) {
        EmployerModel.findByPk(req.body.id).then(function (result) {
            req.body.companylogo = res.req.files && (res.req.files.companylogo && res.req.files.companylogo[0].filename || result.companylogo);
            req.body.coverphoto = res.req.files && (res.req.files.coverphoto && res.req.files.coverphoto[0].filename || result.coverphoto);
            result.update(req.body).then((resp) => {
                res.send(resp);
            })
        }, function (err) {
            res.status(500).send(err);
        })
    });
}