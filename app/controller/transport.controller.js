const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const stripe = require('stripe')(process.env.stripe_sk);
const appUtil = require('../apputil');
const MODELS = require("../models");
const UserModel = MODELS.users;
const TransportMenuModel = MODELS.transportmenu;
const TransportModel = MODELS.transport;
const TransportRegisterModel = MODELS.transportregister;


// SET STORAGE
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        var dir = './public/uploads/transport'
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)) // Appending the extension
    }
})

/** transport menu */
exports.transportMenus = function(req, res) {
    let type = req.params.type || null;
    let where = {
        'status': 1
    };
    if (type) {
        where.type = type
    }
    TransportMenuModel.findAll({
        where,
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(function(entries) {
        res.send(entries || null)
    });
}
exports.createTransportMenu = function(req, res) {
    TransportMenuModel.create(req.body).then(function() {
        res.send(req.body);
    }, function(err) {
        res.status(500).send(err);
    })
}
exports.updateTransportMenu = function(req, res) {
    TransportMenuModel.findByPk(req.body.id).then(function(result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function(err) {
        res.status(500).send(err);
    })
}
exports.deleteTransportMenu = function(req, res) {
    TransportMenuModel.findByPk(req.params.id).then(function(result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function(err) {
        res.status(500).send(err);
    })
}

/** transport */
exports.transports = function(req, res) {
    var result = { count: 0, data: [] };
    var offset = req.body.offset || 0;
    var limit = req.body.limit || 1;
    //search 
    var bookedTransports = [];
    if (req.body.pickupdate && req.body.pickuptime && req.body.dropdate && req.body.droptime) {
        let where = {};
        where.totenmetdatum = {
            [Op.gte]: moment(req.body.pickupdate + ' ' + req.body.pickuptime).add(45, 'minutes').toDate()
        };
        // where.totenmetdtijd = {
        //     [Op.lte]: req.body.pickuptime
        // };
        where.status = 1;
        TransportRegisterModel.findAll({ where }).then((resp) => {
            bookedTransports = resp.map((x, i) => {
                return x.transport_id;
            });
            content();
        })
    } else if (req.body.frontend) {
        let where = {};
        where.totenmetdatum = {
            [Op.between]: [moment().add(45, 'minutes').toDate(), moment().toDate()]
        };
        where.status = 1;
        TransportRegisterModel.findAll({ where }).then((resp) => {
            bookedTransports = resp.map((x, i) => {
                return x.transport_id;
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
        if (req.body.brandids) {
            where.brand_id = {
                [Op.in]: req.body.brandids.split(',')
            }
        }
        if (req.body.modelids) {
            where.model_id = {
                [Op.in]: req.body.modelids.split(',')
            }
        }
        if (req.body.variantuids) {
            where.variant_id = {
                [Op.in]: req.body.variantuids.split(',')
            }
        }

        if (req.body.fromdate) {
            const from = moment(req.body.fromdate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            const to = req.body.todate && moment(req.body.todate).endOf('day').format('YYYY-MM-DD HH:mm:ss') || moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
            where.createdAt = {
                [Op.between]: [new Date(from), new Date(to)]
            }
        }

        TransportModel.findAndCountAll({
            where
        }).then((output) => {
            result.count = output.count;
            TransportModel.findAll({
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
                    if (bookedTransports.indexOf(temp.id) >= 0) {
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
exports.createTransport = function(req, res) {
    var upload = multer({ storage: storage }).single('image');
    upload(req, res, function(err) {
        req.body.image = res.req.file && res.req.file.filename;
        TransportModel.create(req.body).then(function() {
            res.send(req.body);
        }, function(err) {
            res.status(500).send(err);
        })

    });
}

exports.updateTransport = function(req, res) {
    var upload = multer({ storage: storage }).single('image');
    upload(req, res, function(err) {
        TransportModel.findByPk(req.body.id).then(function(result) {
            req.body.image = res.req.file && res.req.file.filename || result.image;
            result.update(req.body).then((resp) => {
                res.send(resp);
            })
        }, function(err) {
            res.status(500).send(err);
        })
    });
}

exports.deleteTransport = function(req, res) {
    TransportModel.findByPk(req.params.id).then(function(result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function(err) {
        res.status(500).send(err);
    })
}
exports.findTransport = function(req, res) {
    TransportModel.findOne({
        where: {
            route: req.params.route
        }
    }).then(function(result) {
        res.send(result);
    }, function(err) {
        res.status(500).send(err);
    })
}
exports.createTransportMenu = function(req, res) {
    TransportMenuModel.create(req.body).then(function() {
        res.send(req.body);
    }, function(err) {
        res.status(500).send(err);
    })
}
exports.updateTransportMenu = function(req, res) {
    TransportMenuModel.findByPk(req.body.id).then(function(result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function(err) {
        res.status(500).send(err);
    })
}
exports.deleteTransportMenu = function(req, res) {
    TransportMenuModel.findByPk(req.params.id).then(function(result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function(err) {
        res.status(500).send(err);
    })
}

/** transport */
exports.transports = function(req, res) {
    var result = { count: 0, data: [] };
    var offset = req.body.offset || 0;
    var limit = req.body.limit || 1;
    //search 
    var bookedTransports = [];
    if (req.body.pickupdate && req.body.pickuptime && req.body.dropdate && req.body.droptime) {
        let where = {};
        // where.totenmetdatum = {
        //     [Op.gte]: moment(req.body.pickupdate + ' ' + req.body.pickuptime).add(45, 'minutes').toDate()
        // };
        where.totenmetdatum = {
            [Op.between]: [moment(req.body.pickupdate + ' ' + req.body.pickuptime).add(45, 'minutes').toDate(), moment(req.body.dropdate + ' ' + req.body.droptime).toDate()]
        };
        // where.totenmetdtijd = {
        //     [Op.lte]: req.body.pickuptime
        // };
        where.status = 1;
        TransportRegisterModel.findAll({ where }).then((resp) => {
            bookedTransports = resp.map((x, i) => {
                return x.transport_id;
            });
            content();
        })
    } else if (req.body.front) {
        let where = {};
        where.totenmetdatum = {
            [Op.between]: [moment().add(45, 'minutes').toDate(), moment().toDate()]
        };
        where.status = 1;
        TransportRegisterModel.findAll({ where }).then((resp) => {
            bookedTransports = resp.map((x, i) => {
                return x.transport_id;
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
        if (req.body.brandids) {
            where.brand_id = {
                [Op.in]: req.body.brandids.split(',')
            }
        }
        if (req.body.modelids) {
            where.model_id = {
                [Op.in]: req.body.modelids.split(',')
            }
        }
        if (req.body.variantuids) {
            where.variant_id = {
                [Op.in]: req.body.variantuids.split(',')
            }
        }

        if (req.body.fromdate) {
            const from = moment(req.body.fromdate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            const to = req.body.todate && moment(req.body.todate).endOf('day').format('YYYY-MM-DD HH:mm:ss') || moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
            where.createdAt = {
                [Op.between]: [new Date(from), new Date(to)]
            }
        }

        TransportModel.findAndCountAll({
            where
        }).then((output) => {
            result.count = output.count;
            TransportModel.findAll({
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
                    if (bookedTransports.indexOf(temp.id) >= 0) {
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
exports.getTransportRegister = function(req, res) {
        let registeruser_id = appUtil.getUser(req.headers.authorization).id || null;
        TransportRegisterModel.findAll({
            where: {
                'registeruser_id': registeruser_id
            },
            include: [{
                    model: TransportModel,
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
    /** Transport register */
exports.createTransportRegister = function(req, res) {
    req.body.registeruser_id = req.body.registeruser_id || appUtil.getUser(req.headers.authorization).id;
    req.body.totenmetdatum = moment(req.body.totenmetdatum + ' ' + req.body.totenmetdtijd).format('YYYY-MM-DD HH:mm:ss');
    req.body.totenmetdtijd = moment(req.body.totenmetdatum).format('HH:mm');
    req.body.vanafdatum = moment(req.body.vanafdatum + ' ' + req.body.vanafdtijd).format('YYYY-MM-DD HH:mm:ss');
    req.body.vanafdtijd = moment(req.body.vanafdatum).format('HH:mm');
    req.body.amount = parseFloat(req.body.amount);
    req.body.paymentuser_id = appUtil.getUser(req.headers.authorization).id || null;
    stripeAmount = req.body.amount * 100;
    TransportRegisterModel.create(req.body).then(function() {
            res.send(req.body);
        }, function(err) {
            res.status(500).send(err);
        })
        // stripe.charges.create({
        //     amount: Math.round(stripeAmount),
        //     currency: 'EUR',
        //     description: `jesel_transport_${req.body.registeruser_id}`,
        //     source: req.body.stripetoken && req.body.stripetoken.id,
        // }, (err, charge) => {
        //     if (err) {
        //         console.log(err);
        //         res.send(err).status(500);
        //     }
        //     if (charge && charge.status == 'succeeded') {
        //         req.body.paymentchargeid = charge.id;
        //         TransportRegisterModel.create(req.body).then(function() {
        //             res.send(req.body);
        //         }, function(err) {
        //             res.status(500).send(err);
        //         })
        //     } else {
        //         res.status(500).send(charge);
        //     }
        // })
}
exports.updateTransportRegister = function(req, res) {
    TransportRegisterModel.findByPk(req.body.id).then(function(result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function(err) {
        res.status(500).send(err);
    })
}
exports.deleteTransportRegister = function(req, res) {
    TransportRegisterModel.findByPk(req.params.id).then(function(result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function(err) {
        res.status(500).send(err);
    })
}

exports.transportIdeal = async function(req, res) {
    stripeAmount = req.body.amount * 100;
    const encInput = Buffer.from(JSON.stringify(req.body)).toString('base64');
    const session = await stripe.checkout.sessions.create({
        line_items: [{
            price_data: {
                // To accept `ideal`, all line items must have currency: eur
                currency: 'EUR',
                product_data: {
                    name: 'Rent Transport - ' + req.body.name,
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

exports.transportRegisters = function(req, res) {
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

    TransportRegisterModel.findAndCountAll({
        where
    }).then((output) => {
        result.count = output.count;
        TransportRegisterModel.findAll({
            where,
            include: [{
                    model: TransportModel,
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