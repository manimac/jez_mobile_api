const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const multer = require('multer');
const path = require('path');
const moment = require('moment');
const stripe = require('stripe')(process.env.stripe_sk);
const fs = require('fs');
const appUtil = require('../apputil');
const MODELS = require("../models");
const Model = MODELS.functions;
const categoryModel = MODELS.category;

/** Employee */

exports.getFunction = function (req, res) {
    const USER = appUtil.getUser(req.headers.authorization);
    let where = {};
    if (req.body.employer_id) {
        where.employer_id = req.body.employer_id;
    }
    Model.findAll({ where: where, include:[categoryModel] }).then((resp) => {
        res.send(resp);
    }).catch((err) => {
        res.status(500).send(err);
    })
}

exports.createFunction = function (req, res) {
    Model.create(req.body).then(function () {
        res.send(req.body);
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.updateFunction = function (req, res) {
    Model.findByPk(req.body.id).then(function (result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.deleteFunction = function (req, res) {
    Model.findByPk(req.params.id).then(function (result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}