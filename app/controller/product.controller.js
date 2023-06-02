const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const async = require('async');
const moment = require('moment');
const appUtil = require('../apputil');
const MODELS = require("../models");
const ProductModel = MODELS.product;
const ProductImageModel = MODELS.productimage;
const UserModel = MODELS.users;
const ExtraModel = MODELS.extra;
const OrderModel = MODELS.order;
const OrderHistoryModel = MODELS.orderhistory;
const WithdrawRequestModel = MODELS.withdrawrequest;
const FilterModel = MODELS.filter;
const SpecificationModel = MODELS.specification;

exports.products = function (req, res) {
    var result = { count: 0, data: [] };
    var offset = req.body.offset || 0;
    var limit = req.body.limit || 1000000;
    //search 
    var bookedVehicle = [];
    const search = req.body.search || {};
    if (search && search.checkindate && search.checkintime && search.checkoutdate && search.checkouttime) {
        let where = {};
        search.checkindatetime = moment(search.checkindate + ' ' + search.checkintime, 'DD-MM-YYYY HH:mm');
        search.checkoutdatetime = moment(search.checkoutdate + ' ' + search.checkouttime, 'DD-MM-YYYY HH:mm');

        let checkindatetimeex = search.checkindatetime.clone();
        let checkoutdatetimeex = search.checkoutdatetime.clone();
        search.checkindatetimeex = checkindatetimeex.subtract(60, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        search.checkoutdatetimeex = checkoutdatetimeex.add(60, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        // where[Op.or] = [{
        //     checkindate: {
        //         [Op.between]: [search.checkindatetimeex, search.checkoutdatetimeex]
        //     }
        // }, {
        //     checkoutdate: {
        //         [Op.between]: [search.checkindatetimeex, search.checkoutdatetimeex]
        //     }
        // }]

        where[Op.or] = [{
            [Op.and]: [Sequelize.where(Sequelize.col('checkindate'), '<=', search.checkindatetimeex),
            Sequelize.where(Sequelize.col('checkoutdate'), '>=', search.checkindatetimeex)
            ]
        },
        {
            [Op.and]: [Sequelize.where(Sequelize.col('checkindate'), '<=', search.checkoutdatetimeex),
            Sequelize.where(Sequelize.col('checkoutdate'), '>=', search.checkoutdatetimeex)
            ]
        }
        ]

        where.status = 1;
        where.type = [req.body.type, 'maintenance'];
        where.filterlocation_id = search.locationid;
        if (appUtil.getUser(req.headers.authorization).id) {
            where.user_id = {
                [Op.not]: appUtil.getUser(req.headers.authorization).id
            }
        }

        OrderHistoryModel.findAll({ where: where }).then((resp) => {
            bookedVehicle = resp.map((x, i) => {
                return x.product_id;
            });
            if (appUtil.getUser(req.headers.authorization).id) {
                let userWhere = {};
                userWhere.status = 1;
                userWhere.type = [req.body.type, 'maintenance'];
                userWhere.filterlocation_id = search.locationid;
                userWhere.user_id = appUtil.getUser(req.headers.authorization).id;

                search.checkindatetime = moment(search.checkindate + ' ' + search.checkintime, 'DD-MM-YYYY HH:mm');
                search.checkoutdatetime = moment(search.checkoutdate + ' ' + search.checkouttime, 'DD-MM-YYYY HH:mm');

                let checkindatetimeex = search.checkindatetime.clone();
                let checkoutdatetimeex = search.checkoutdatetime.clone();
                search.checkindatetimeex = checkindatetimeex.add(10, 'seconds').format('YYYY-MM-DD HH:mm:ss');
                search.checkoutdatetimeex = checkoutdatetimeex.format('YYYY-MM-DD HH:mm:ss');

                // userWhere[Op.or] = [{
                //     checkindate: {
                //         [Op.between]: [search.checkindatetimeex, search.checkoutdatetimeex]
                //     }
                // }, {
                //     checkoutdate: {
                //         [Op.between]: [search.checkindatetimeex, search.checkoutdatetimeex]
                //     }
                // }]

                userWhere[Op.or] = [{
                    [Op.and]: [Sequelize.where(Sequelize.col('checkindate'), '<=', search.checkindatetimeex),
                    Sequelize.where(Sequelize.col('checkoutdate'), '>=', search.checkindatetimeex)
                    ]
                },
                {
                    [Op.and]: [Sequelize.where(Sequelize.col('checkindate'), '<=', search.checkoutdatetimeex),
                    Sequelize.where(Sequelize.col('checkoutdate'), '>=', search.checkoutdatetimeex)
                    ]
                }
                ]

                OrderHistoryModel.findAll({ where: userWhere }).then((resp) => {
                    let userBookedVehicle = resp.map((x, i) => {
                        return x.product_id;
                    });
                    bookedVehicle = bookedVehicle.concat(userBookedVehicle.filter(bo => bookedVehicle.every(ao => ao != bo)));
                    content();
                })
            } else {
                content();
            }
        })
    } else {
        content();
    }

    function content() {
        let where = {};
        if (req.body.status) {
            where.status = req.body.status;
        }
        if (req.body.type) {
            where.type = req.body.type;
        }
        if (search.locationid) {
            where.location_id = search.locationid;
        }
        let filter = [];
        if (req.body.vehicle) {
            filter.push({
                'vehicle': {
                    [Op.in]: req.body.vehicle.split(',')
                }
            })
        }
        if (req.body.fuel) {
            filter.push({
                'fuel': {
                    [Op.in]: req.body.fuel.split(',')
                }
            })
        }
        if (req.body.transmission) {
            filter.push({
                'transmission': {
                    [Op.in]: req.body.transmission.split(',')
                }
            })
        }
        if (req.body.parkingspace) {
            filter.push({
                'parkingspace': {
                    [Op.in]: req.body.parkingspace.split(',')
                }
            })
        }
        if (req.body.storagespace) {
            filter.push({
                'storagespace': {
                    [Op.in]: req.body.storagespace.split(',')
                }
            })
        }
        if (req.body.beroep) {
            filter.push({
                'beroep': {
                    [Op.in]: req.body.beroep.split(',')
                }
            })
        }
        if (req.body.leeftijd) {
            filter.push({
                'leeftijd': {
                    [Op.in]: req.body.leeftijd.split(',')
                }
            })
        }
        if (req.body.ervaring) {
            filter.push({
                'ervaring': {
                    [Op.in]: req.body.ervaring.split(',')
                }
            })
        }
        if (req.body.nationality) {
            filter.push({
                'nationality': {
                    [Op.in]: req.body.nationality.split(',')
                }
            })
        }
        if (req.body.voertuig) {
            filter.push({
                'voertuig': {
                    [Op.in]: req.body.voertuig.split(',')
                }
            })
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
        if (filter.length) {
            where[Op.and] = filter
        }

        ProductModel.findAndCountAll({
            where
        }).then((output) => {
            result.count = output.count;
            ProductModel.findAll({
                where,
                include: [{
                    model: ProductImageModel,
                    attributes: ['id', 'path', 'image']
                }, {
                    model: ExtraModel,
                    attributes: ['id', 'type', 'description', 'price', 'isGroup']
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
                revised = revised.filter(element => (!element.disabled))
                result.data = revised;
                result.count = revised.length;
                res.send(result);
            }).catch((err) => {
                res.status(500).send(err)
            })
        }).catch((err) => {
            res.status(500).send(err)
        })
    }

}

exports.getProductFind = function (req, res) {
    ProductModel.findOne({
        where: { id: req.params.id },
        include: [{
            model: ProductImageModel,
            attributes: ['id', 'path', 'image']
        }],
    }).then(function (resp) {
        res.send(resp);
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.getSimilarProducts = function (req, res) {
    ProductModel.findAll({
        where: {
            type: req.params.type,
            id: {
                [Op.not]: req.params.id
            }
        },
        limit: 3
    }).then(function (resp) {
        res.send(resp);
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.extras = function (req, res) {
    ExtraModel.findAll({
        where: {
            'status': 1
        },
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(function (entries) {
        res.send(entries || null)
    });
}

exports.filters = function (req, res) {
    let type = req.params.type || null;
    let category = req.params.category || null;
    let where = {
        'status': 1
    };
    if (type) {
        where.type = type;
    }
    if (category) {
        where.category = category;
    }
    FilterModel.findAll({
        where,
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(function (entries) {
        res.send(entries || null)
    });
}

exports.specifications = function (req, res) {
    SpecificationModel.findAll({
        where: {
            'status': 1
        },
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(function (entries) {
        res.send(entries || null)
    });
}

exports.createSpecifications = function (req, res) {
    SpecificationModel.create(req.body).then(function (entries) {
        res.send(entries || null)
    });
}

exports.updateSpecifications = function (req, res) {
    SpecificationModel.findByPk(req.body.id).then(function (result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.deleteSpecifications = function(req, res) {
    SpecificationModel.findByPk(req.params.id).then(function(result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function(err) {
        res.status(500).send(err);
    })
}