const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const multer = require('multer');
const path = require('path');
const moment = require('moment');
const stripe = require('stripe')(process.env.stripe_sk);
const fs = require('fs');
const appUtil = require('../apputil');
const MODELS = require("../models");
const Model = MODELS.category;


// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var dir = './public/uploads/category'
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

exports.getCategory = function (req, res) {
    const USER = appUtil.getUser(req.headers.authorization);
    let where = {};
    if (req.body.employer_id) {
        where.employer_id = req.body.employer_id;
    }
    Model.findAll({ where: where }).then((resp) => {
        res.send(resp);
    }).catch((err) => {
        res.status(500).send(err);
    })
}

exports.createCategory = function (req, res) {
    var upload = multer({ storage: storage }).fields([{
        name: 'icon1',
        maxCount: 2
    }]);
    upload(req, res, function (err) {
        req.body.icon1 = res.req.files && (res.req.files.icon1 && res.req.files.icon1[0].filename || null);
        Model.create(req.body).then(function () {
            res.send(req.body);
        }, function (err) {
            res.status(500).send(err);
        })

    });
}

exports.updateCategory = function (req, res) {
    var upload = multer({ storage: storage }).fields([{
        name: 'icon1',
        maxCount: 2
    }]);
    upload(req, res, function (err) {
        Model.findByPk(req.body.id).then(function (result) {
            req.body.icon1 = res.req.files && (res.req.files.icon1 && res.req.files.icon1[0].filename || result.icon1);
            result.update(req.body).then((resp) => {
                res.send(resp);
            })
        }, function (err) {
            res.status(500).send(err);
        })
    });
}

exports.deleteCategory = function (req, res) {
    Model.findByPk(req.params.id).then(function (result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}