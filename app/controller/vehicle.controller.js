const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const async = require('async');
const moment = require('moment');
const stripe = require('stripe')(process.env.stripe_sk);
const appUtil = require('../apputil');
const MODELS = require("../models");
const SoortModel = MODELS.soort;
const BrandstofModel = MODELS.brandstof;
const TransmissieModel = MODELS.transmissie;
const VehicleModel = MODELS.vehicle;
const VehicleImageModel = MODELS.vehicleimage;
const VehicleRegisterModel = MODELS.vehicleregister;
const UserModel = MODELS.users;

// SET STORAGE
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        var dir = './public/uploads/vehicle'
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)) // Appending the extension
    }
})

/** Soort */
exports.soorts = function(req, res) {
    SoortModel.findAll({
        where: {
            'status': 1
        },
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(function(entries) {
        res.send(entries || null)
    });
}
exports.createSoort = function(req, res) {
    SoortModel.create(req.body).then(function() {
        res.send(req.body);
    }, function(err) {
        res.status(500).send(err);
    })
}
exports.updateSoort = function(req, res) {
    SoortModel.findByPk(req.body.id).then(function(result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function(err) {
        res.status(500).send(err);
    })
}
exports.deleteSoort = function(req, res) {
    SoortModel.findByPk(req.params.id).then(function(result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function(err) {
        res.status(500).send(err);
    })
}

/** Brandstof */
exports.brandstofs = function(req, res) {
    BrandstofModel.findAll({
        where: {
            'status': 1
        },
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(function(entries) {
        res.send(entries || null)
    });
}
exports.createBrandstof = function(req, res) {
    BrandstofModel.create(req.body).then(function() {
        res.send(req.body);
    }, function(err) {
        res.status(500).send(err);
    })
}
exports.updateBrandstof = function(req, res) {
    BrandstofModel.findByPk(req.body.id).then(function(result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function(err) {
        res.status(500).send(err);
    })
}
exports.deleteBrandstof = function(req, res) {
    BrandstofModel.findByPk(req.params.id).then(function(result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function(err) {
        res.status(500).send(err);
    })
}

/** Transmissie */
exports.transmissies = function(req, res) {
    TransmissieModel.findAll({
        where: {
            'status': 1
        },
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(function(entries) {
        res.send(entries || null)
    });
}
exports.createTransmissie = function(req, res) {
    TransmissieModel.create(req.body).then(function() {
        res.send(req.body);
    }, function(err) {
        res.status(500).send(err);
    })
}
exports.updateTransmissie = function(req, res) {
    TransmissieModel.findByPk(req.body.id).then(function(result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function(err) {
        res.status(500).send(err);
    })
}
exports.deleteTransmissie = function(req, res) {
    TransmissieModel.findByPk(req.params.id).then(function(result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function(err) {
        res.status(500).send(err);
    })
}

/** Vehicle */
exports.vehicles = function(req, res) {
    var result = { count: 0, data: [] };
    var offset = req.body.offset || 0;
    var limit = req.body.limit || 1;
    //search 
    var bookedVehicle = [];
    if (req.body.pickupdate && req.body.pickuptime && req.body.dropdate && req.body.droptime) {
        let where = {};

        where.totenmetdatum = {
            [Op.between]: [moment(req.body.pickupdate + ' ' + req.body.pickuptime).add(45, 'minutes').toDate(), moment(req.body.dropdate + ' ' + req.body.droptime).toDate()]
        };

        where.status = 1;
        VehicleRegisterModel.findAll({ where }).then((resp) => {
            bookedStaffs = resp.map((x, i) => {
                return x.vehicle_id;
            });
            content();
        })
    } else if (req.body.frontend) {
        let where = {};
        where.totenmetdatum = {
            [Op.between]: [moment().add(45, 'minutes').toDate(), moment().toDate()]
        };
        where.status = 1;
        VehicleRegisterModel.findAll({ where }).then((resp) => {
            bookedVehicle = resp.map((x, i) => {
                return x.vehicle_id;
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
        if (req.body.soortids) {
            where.soort_id = {
                [Op.in]: req.body.soortids.split(',')
            }
        }
        if (req.body.brandstofids) {
            where.brandstof_id = {
                [Op.in]: req.body.brandstofids.split(',')
            }
        }
        if (req.body.transmissieids) {
            where.transmissie_id = {
                [Op.in]: req.body.transmissieids.split(',')
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

        VehicleModel.findAndCountAll({
            where
        }).then((output) => {
            result.count = output.count;
            VehicleModel.findAll({
                where,
                include: [{
                    model: VehicleImageModel,
                    attributes: ['id', 'path', 'image']
                }],
                order: [
                    ['createdAt', 'DESC']
                ],
                offset: offset,
                limit: limit
            }).then((registered) => {
                let revised = registered.map((x, i) => {
                    let temp = x && x.toJSON();
                    temp.sno = offset + (i + 1);
                    if (bookedVehicle.indexOf(temp.id) >= 0) {
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
exports.createVehicle = function(req, res) {
    VehicleModel.create(req.body).then(function() {
        res.send(req.body);
    }, function(err) {
        res.status(500).send(err);
    })
}
exports.updateVehicle = function(req, res) {
    VehicleModel.findByPk(req.body.id).then(function(result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function(err) {
        res.status(500).send(err);
    })
}
exports.deleteVehicle = function(req, res) {
    VehicleModel.findByPk(req.params.id).then(function(result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function(err) {
        res.status(500).send(err);
    })
}
exports.getVehicle = function(req, res) {
    VehicleModel.findOne({
        where: { route: req.params.route },
        include: [{
            model: VehicleImageModel,
            attributes: ['id', 'path', 'image']
        }],
    }).then(function(resp) {
        res.send(resp);
    }, function(err) {
        res.status(500).send(err);
    })
}

exports.uploadVehicleImage = function(req, res) {
    var upload = multer({ storage: storage }).array('image', 10);
    upload(req, res, function(err) {
        console.log(res.req.files);
        async.eachSeries(res.req.files, function(file, callback) {
                req.body.image = file && file.filename;
                if (req.body.image) {
                    VehicleImageModel.create(req.body).then(function() {
                        callback();
                    }, function(err) {
                        res.status(500).send(err);
                    })
                } else {
                    callback();
                }
            }, (err) => {
                res.send({ message: 'Success' });
            })
            // req.body.image = res.req.file && res.req.file.filename;
            // if (req.body.image) {
            //     VehicleImageModel.create(req.body).then(function () {
            //         res.send(req.body);
            //     }, function (err) {
            //         res.status(500).send(err);
            //     })
            // } else {
            //     res.send(req.body);
            // }
    });
}

// Vehicle Registers
exports.getVehicleRegister = function(req, res) {
        let registeruser_id = appUtil.getUser(req.headers.authorization).id || null;
        VehicleRegisterModel.findAll({
            where: {
                'registeruser_id': registeruser_id
            },
            include: [{
                    model: VehicleModel,
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
    /** vehicle register */
exports.createVehicleRegister = function(req, res) {
    req.body.registeruser_id = req.body.registeruser_id || appUtil.getUser(req.headers.authorization).id;
    req.body.totenmetdatum = moment(req.body.totenmetdatum + ' ' + req.body.totenmetdtijd).format('YYYY-MM-DD HH:mm:ss');
    req.body.totenmetdtijd = moment(req.body.totenmetdatum).format('HH:mm');
    req.body.vanafdatum = moment(req.body.vanafdatum + ' ' + req.body.vanafdtijd).format('YYYY-MM-DD HH:mm:ss');
    req.body.vanafdtijd = moment(req.body.vanafdatum).format('HH:mm');
    req.body.amount = parseFloat(req.body.amount);
    req.body.paymentuser_id = appUtil.getUser(req.headers.authorization).id || null;
    stripeAmount = req.body.amount * 100;
    VehicleRegisterModel.create(req.body).then(function() {
            res.send(req.body);
        }, function(err) {
            res.status(500).send(err);
        })
        // stripe.charges.create({
        //     amount: Math.round(stripeAmount),
        //     currency: 'EUR',
        //     // payment_method_types: ['ideal'], // Added for iDeal Payments
        //     description: `jesel_rent_${req.body.registeruser_id}`,
        //     source: req.body.stripetoken && req.body.stripetoken.id,
        // }, (err, charge) => {
        //     if (err) {
        //         console.log(err);
        //         res.send(err).status(500);
        //     }
        //     if (charge && charge.status == 'succeeded') {
        //         req.body.paymentchargeid = charge.id;
        //         VehicleRegisterModel.create(req.body).then(function() {
        //             res.send(req.body);
        //         }, function(err) {
        //             res.status(500).send(err);
        //         })
        //     } else {
        //         res.status(500).send(charge);
        //     }
        // })
}
exports.vehicleIdeal = async function(req, res) {
    // const session = await stripe.checkout.sessions.create({
    //     payment_method_types: ['card', 'ideal'],
    //     line_items: [{
    //         price_data: {
    //             // To accept `ideal`, all line items must have currency: eur
    //             currency: 'eur',
    //             product_data: {
    //                 name: 'T-shirt',
    //             },
    //             unit_amount: 200,
    //         },
    //         quantity: 1,
    //     }],
    //     mode: 'payment',
    //     success_url: 'https://example.com/success',
    //     cancel_url: 'https://example.com/cancel',
    // });
    stripeAmount = req.body.amount * 100;
    const encInput = Buffer.from(JSON.stringify(req.body)).toString('base64');
    const session = await stripe.checkout.sessions.create({
        line_items: [{
            price_data: {
                // To accept `ideal`, all line items must have currency: eur
                currency: 'EUR',
                product_data: {
                    name: 'Rent - ' + req.body.name,
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
exports.updateVehicleRegister = function(req, res) {
    VehicleRegisterModel.findByPk(req.body.id).then(function(result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function(err) {
        res.status(500).send(err);
    })
}
exports.deleteVehicleRegister = function(req, res) {
    VehicleRegisterModel.findByPk(req.params.id).then(function(result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function(err) {
        res.status(500).send(err);
    })
}

exports.vehicleRegisters = function(req, res) {
    let result = { count: 0, data: [] };
    let offset = req.body.offset || 0;
    let limit = req.body.limit || 1;
    let where = {};

    if (req.body.status) {
        where.status = req.body.status;
    }
    if (req.body.registeruser_id) {
        where.registeruser_id = registeruser_id;
    }
    if (req.body.fromdate) {
        const from = moment(req.body.fromdate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
        const to = req.body.todate && moment(req.body.todate).endOf('day').format('YYYY-MM-DD HH:mm:ss') || moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
        where.createdAt = {
            [Op.between]: [new Date(from), new Date(to)]
        }
    }

    VehicleRegisterModel.findAndCountAll({
        where
    }).then((output) => {
        result.count = output.count;
        VehicleRegisterModel.findAll({
            where,
            include: [{
                    model: VehicleModel,
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