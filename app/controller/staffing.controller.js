const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const multer = require('multer');
const path = require('path');
const moment = require('moment');
const stripe = require('stripe')(process.env.stripe_sk);
const fs = require('fs');
const appUtil = require('../apputil');
const MODELS = require("../models");
const StaffingMenuModel = MODELS.staffingmenu;
const StaffingModel = MODELS.staffing;
const StaffingRegisterModel = MODELS.staffingregister;
const UserModel = MODELS.users;


// SET STORAGE
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        var dir = './public/uploads/staffing'
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)) // Appending the extension
    }
})

/** Staffing menu */
exports.staffingMenus = function(req, res) {
    let type = req.params.type || null;
    let where = {
        'status': 1
    };
    if (type) {
        where.type = type
    }
    StaffingMenuModel.findAll({
        where,
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(function(entries) {
        res.send(entries || null)
    });
}
exports.createStaffingMenu = function(req, res) {
    StaffingMenuModel.create(req.body).then(function() {
        res.send(req.body);
    }, function(err) {
        res.status(500).send(err);
    })
}
exports.updateStaffingMenu = function(req, res) {
    StaffingMenuModel.findByPk(req.body.id).then(function(result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function(err) {
        res.status(500).send(err);
    })
}
exports.deleteStaffingMenu = function(req, res) {
    StaffingMenuModel.findByPk(req.params.id).then(function(result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function(err) {
        res.status(500).send(err);
    })
}

/** Staffing */
exports.staffings = function(req, res) {
    var result = { count: 0, data: [] };
    var offset = req.body.offset || 0;
    var limit = req.body.limit || 1;
    //search 
    var bookedStaffs = [];
    if (req.body.pickupdate && req.body.pickuptime && req.body.dropdate && req.body.droptime) {
        let where = {};

        where.totenmetdatum = {
            [Op.between]: [moment(req.body.pickupdate + ' ' + req.body.pickuptime).add(45, 'minutes').toDate(), moment(req.body.dropdate + ' ' + req.body.droptime).toDate()]
        };

        where.status = 1;
        StaffingRegisterModel.findAll({ where }).then((resp) => {
            bookedStaffs = resp.map((x, i) => {
                return x.staffing_id;
            });
            content();
        })
    } else if (req.body.frontend) {
        let where = {};
        where.totenmetdatum = {
            [Op.between]: [moment().add(45, 'minutes').toDate(), moment().toDate()]
        };
        where.status = 1;
        StaffingRegisterModel.findAll({ where }).then((resp) => {
            bookedStaffs = resp.map((x, i) => {
                return x.staffing_id;
            });
            content();
        })
    } else {
        content();
    }

    function content() {
        let where = {};
        if (req.body.status) {
            where.status = req.body.status;
        }
        if (req.body.location) {
            where.filterlocation_id = req.body.location;
        }
        if (req.body.city) {
            where.filtercity_id = req.body.city;
        }
        if (req.body.beroepids) {
            where.beroep_id = {
                [Op.in]: req.body.beroepids.split(',')
            }
        }
        if (req.body.leeftijdids) {
            where.leeftijd_id = {
                [Op.in]: req.body.leeftijdids.split(',')
            }
        }
        if (req.body.ervaringids) {
            where.ervaring_id = {
                [Op.in]: req.body.ervaringids.split(',')
            }
        }
        if (req.body.landenids) {
            where.landen_id = {
                [Op.in]: req.body.landenids.split(',')
            }
        }
        if (req.body.fromdate) {
            const from = moment(req.body.fromdate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            const to = req.body.todate && moment(req.body.todate).endOf('day').format('YYYY-MM-DD HH:mm:ss') || moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
            where.createdAt = {
                [Op.between]: [new Date(from), new Date(to)]
            }
        }
        if (req.body.showindex) {
            where.showinindex = 1;
        }
        StaffingModel.findAndCountAll({
            where
        }).then((output) => {
            result.count = output.count;
            StaffingModel.findAll({
                where,
                order: [
                    ['createdAt', 'DESC']
                ],
                offset: offset,
                limit: limit
            }).then((registered) => {
                let revised = registered.map((x, i) => {
                    let temp = x && x.toJSON();
                    temp.sno = offset + (i + 1);
                    if (bookedStaffs.indexOf(temp.id) >= 0) {
                        temp.disabled = true;
                    }
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
}
exports.createStaffing = function(req, res) {
    var upload = multer({ storage: storage }).single('photo');
    upload(req, res, function(err) {
        req.body.photo = res.req.file && res.req.file.filename;
        StaffingModel.create(req.body).then(function() {
            res.send(req.body);
        }, function(err) {
            res.status(500).send(err);
        })

    });
}

exports.updateStaffing = function(req, res) {
    var upload = multer({ storage: storage }).single('photo');
    upload(req, res, function(err) {
        StaffingModel.findByPk(req.body.id).then(function(result) {
            req.body.photo = res.req.file && res.req.file.filename || result.photo;
            result.update(req.body).then((resp) => {
                res.send(resp);
            })
        }, function(err) {
            res.status(500).send(err);
        })
    });
}

exports.deleteStaffing = function(req, res) {
    StaffingModel.findByPk(req.params.id).then(function(result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function(err) {
        res.status(500).send(err);
    })
}

exports.getStaffing = function(req, res) {
    StaffingModel.findOne({
        where: { route: req.params.route },
    }).then(function(resp) {
        res.send(resp);
    }, function(err) {
        res.status(500).send(err);
    })
}

/** Staffing register */
exports.getStaffingRegister = function(req, res) {
    let registeruser_id = appUtil.getUser(req.headers.authorization).id || null;
    StaffingRegisterModel.findAll({
        where: {
            'registeruser_id': registeruser_id
        },
        include: [{
                model: StaffingModel,
                attributes: ['id', 'name']
            },
            {
                model: UserModel,
                as: 'registeruser',
                attributes: ['id', 'firstname', 'lastname']
            },
            {
                model: UserModel,
                as: 'paymentuser',
                attributes: ['id', 'firstname', 'lastname']
            }
        ],
    }).then(function(resp) {
        res.send(resp);
    }, function(err) {
        res.status(500).send(err);
    })
}
exports.staffingIdeal = async function(req, res) {
    stripeAmount = req.body.amount * 100;
    const encInput = Buffer.from(JSON.stringify(req.body)).toString('base64');
    const session = await stripe.checkout.sessions.create({
        line_items: [{
            price_data: {
                // To accept `ideal`, all line items must have currency: eur
                currency: 'EUR',
                product_data: {
                    name: 'Rent Staffing - ' + req.body.name,
                    metadata: {
                        'id': req.body.order_id,
                        'name': req.body.name
                    }
                },
                unit_amount: Math.round(stripeAmount),
            },
            quantity: 1,
        }],
        payment_method_types: [
            'card',
            'ideal',
        ],
        mode: 'payment',
        success_url: `https://serverboot.in/#/payment-success`,
        cancel_url: `https://serverboot.in/#/payment-failure`,
    });

    res.json({ url: session.url, paymentchargeid: session.payment_intent }) // <-- this is the changed line
}
exports.createStaffingRegister = function(req, res) {
    req.body.registeruser_id = req.body.registeruser_id || appUtil.getUser(req.headers.authorization).id;
    req.body.totenmetdatum = moment(req.body.totenmetdatum + ' ' + req.body.totenmetdtijd).format('YYYY-MM-DD HH:mm:ss');
    req.body.totenmetdtijd = moment(req.body.totenmetdatum).format('HH:mm');
    req.body.vanafdatum = moment(req.body.vanafdatum + ' ' + req.body.vanafdtijd).format('YYYY-MM-DD HH:mm:ss');
    req.body.vanafdtijd = moment(req.body.vanafdatum).format('HH:mm');
    req.body.amount = parseFloat(req.body.amount);
    req.body.paymentuser_id = appUtil.getUser(req.headers.authorization).id || null;
    stripeAmount = req.body.amount * 100;
    StaffingRegisterModel.create(req.body).then(function() {
            res.send(req.body);
        }, function(err) {
            res.status(500).send(err);
        })
        // stripe.charges.create({
        //     amount: Math.round(stripeAmount),
        //     currency: 'EUR',
        //     description: `jesel_staffing_${req.body.registeruser_id}`,
        //     source: req.body.stripetoken && req.body.stripetoken.id,
        // }, (err, charge) => {
        //     if (err) {
        //         console.log(err);
        //         res.send(err).status(500);
        //     }
        //     if (charge && charge.status == 'succeeded') {
        //         req.body.paymentchargeid = charge.id;
        //         StaffingRegisterModel.create(req.body).then(function() {
        //             res.send(req.body);
        //         }, function(err) {
        //             res.status(500).send(err);
        //         })
        //     } else {
        //         res.status(500).send(charge);
        //     }
        // })
}
exports.updateStaffingRegister = function(req, res) {
    StaffingRegisterModel.findByPk(req.body.id).then(function(result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function(err) {
        res.status(500).send(err);
    })
}
exports.deleteStaffingRegister = function(req, res) {
    StaffingRegisterModel.findByPk(req.params.id).then(function(result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function(err) {
        res.status(500).send(err);
    })
}

exports.staffingRegisters = function(req, res) {
    let result = { count: 0, data: [] };
    let offset = req.body.offset || 0;
    let limit = req.body.limit || 1;
    let where = {};

    if (req.body.status) {
        where.status = req.body.status;
    }

    if (req.body.fromdate) {
        const from = moment(req.body.fromdate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
        const to = req.body.todate && moment(req.body.todate).endOf('day').format('YYYY-MM-DD HH:mm:ss') || moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
        where.createdAt = {
            [Op.between]: [new Date(from), new Date(to)]
        }
    }

    StaffingRegisterModel.findAndCountAll({
        where
    }).then((output) => {
        result.count = output.count;
        StaffingRegisterModel.findAll({
            where,
            include: [{
                    model: StaffingModel,
                    attributes: ['id', 'name']
                },
                {
                    model: UserModel,
                    as: 'registeruser',
                    attributes: ['id', 'firstname', 'lastname']
                },
                {
                    model: UserModel,
                    as: 'paymentuser',
                    attributes: ['id', 'firstname', 'lastname']
                }
            ],
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