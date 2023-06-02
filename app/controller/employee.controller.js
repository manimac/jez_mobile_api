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

exports.getEmployee = function (req, res) {
    const USER = appUtil.getUser(req.headers.authorization);
    let user_id = USER.id;
    if (req.body.user_id) {
        user_id = req.body.user_id;
    }
    if (USER) {
        EmployeeModel.findOne({ where: { user_id: user_id, status: 1 } }).then((resp) => {
            res.send(resp);
        }).catch((err) => {
            res.status(500).send(err);
        })
    } else {
        res.status(500).send("Required Login");
    }
}

exports.createEmployee = function (req, res) {
    var upload = multer({ storage: storage }).fields([{
        name: 'profileimage',
        maxCount: 2
    }]);
    upload(req, res, function (err) {
        req.body.profileimage = res.req.files && (res.req.files.profileimage && res.req.files.profileimage[0].filename || null);
        EmployeeModel.create(req.body).then(function () {
            res.send(req.body);
        }, function (err) {
            res.status(500).send(err);
        })

    });
}

exports.updateEmployee = function (req, res) {
    var upload = multer({ storage: storage }).fields([{
        name: 'profileimage',
        maxCount: 2
    }]);
    upload(req, res, function (err) {
        EmployeeModel.findByPk(req.body.id).then(function (result) {
            req.body.profileimage = res.req.files && (res.req.files.profileimage && res.req.files.profileimage[0].filename || result.profileimage);
            result.update(req.body).then((resp) => {
                res.send(resp);
            })
        }, function (err) {
            res.status(500).send(err);
        })
    });
}

exports.stripePaymentSheet = async (req, res, next) => {
    try {
        const data = req.body;
        console.log(req.body);
        const params = {
            email: data.email,
            name: data.name,
        };
        const customer = await stripe.customers.create(params);
        console.log(customer.id);

        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customer.id },
            { apiVersion: '2020-08-27' }
        );
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: parseInt(data.amount),
            currency: data.currency,
            customer: customer.id,
            automatic_payment_methods: {
                enabled: true,
            },
        });
        const response = {
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id,
        };
        res.status(200).send(response);
    } catch (e) {
        console.log(e.message || e);
        next(e);
    }
}