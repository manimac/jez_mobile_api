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
const FilterModel = MODELS.filter;
const ProductModel = MODELS.product;
const ProductImageModel = MODELS.productimage;
const UserModel = MODELS.users;
const ExtraModel = MODELS.extra;
const OrderModel = MODELS.order;
const OrderHistoryModel = MODELS.orderhistory;
const StaffOrTransportRequestModel = MODELS.staffOrTransportRequest;
const StaffOrTransportInterestModel = MODELS.staffOrTransportInterest;
const WithdrawRequestModel = MODELS.withdrawrequest;
const ScreenshotModel = MODELS.screenshot;
const ProductSpecificationModel = MODELS.productspecification;
const CategoryModel = MODELS.category;
const OrderSharingModel = MODELS.orderSharing;

// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var dir = './public/uploads/product'
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)) // Appending the extension
    }
})

var screenShotStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        var dir = './public/uploads/screenshot'
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)) // Appending the extension
    }
})

var assignmentStorage = multer.diskStorage({
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


exports.oldproducts = function (req, res) {
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


        //     search.checkindatetime = moment(search.checkindate + ' ' + search.checkintime).format('YYYY-MM-DD HH:mm:ss');
        // moment(search.checkindate).format('YYYY-MM-DD') +' '+ moment(search.checkintime, 'HH:mm').format('HH:mm:ss')

        //     let current = moment().utc().format('YYYY-MM-DD') + ' ' + moment().utc().format('HH:mm:ss');
        // let oneHrAfter = moment().utc().format('YYYY-MM-DD') + ' ' + moment().add('1', 'hours').utc().format('HH:mm:ss');


        // where.checkoutdate = {
        //     [Op.between]: [search.checkindatetimeex.toDate(), search.checkoutdatetimeex.toDate()]
        // };

        // where[Op.or] = [{
        //     checkindate: {
        //         [Op.between]: ['2022-10-10 01:00:00', '2022-10-10 04:30:00']
        //     }
        // }, {
        //     checkoutdate: {
        //         [Op.between]: ['2022-10-10 01:00:00', '2022-10-10 04:30:00']
        //     }
        // }]
        where[Op.or] = [{
            checkindate: {
                [Op.between]: [search.checkindatetimeex, search.checkoutdatetimeex]
            }
        }, {
            checkoutdate: {
                [Op.between]: [search.checkindatetimeex, search.checkoutdatetimeex]
            }
        }]

        where.status = 1;
        where.type = req.body.type;
        where.filterlocation_id = search.locationid;
        OrderHistoryModel.findAll({ where: where }).then((resp) => {
            bookedVehicle = resp.map((x, i) => {
                return x.product_id;
            });
            content();
        })

    }
    // else if (req.body.frontend) {
    //     let where = {};
    //     where.checkoutdate = {
    //         [Op.between]: [moment().add(45, 'minutes').toDate(), moment().toDate()]
    //     };
    //     where.status = 1;
    //     where.type = req.body.type;
    //     where.filterlocation_id = req.body.filterlocation_id;
    //     OrderHistoryModel.findAll({ where }).then((resp) => {
    //         bookedVehicle = resp.map((x, i) => {
    //             return x.product_id;
    //         });
    //         content();
    //     })
    // } 
    else {
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


/** Products */

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

        where[Op.or] = [
            {
                [Op.and]: [Sequelize.where(Sequelize.col('checkindate'), '<=', search.checkindatetimeex),
                Sequelize.where(Sequelize.col('checkoutdate'), '>=', search.checkindatetimeex)]
            },
            {
                [Op.and]: [Sequelize.where(Sequelize.col('checkindate'), '<=', search.checkoutdatetimeex),
                Sequelize.where(Sequelize.col('checkoutdate'), '>=', search.checkoutdatetimeex)]
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

                userWhere[Op.or] = [
                    {
                        [Op.and]: [Sequelize.where(Sequelize.col('checkindate'), '<=', search.checkindatetimeex),
                        Sequelize.where(Sequelize.col('checkoutdate'), '>=', search.checkindatetimeex)]
                    },
                    {
                        [Op.and]: [Sequelize.where(Sequelize.col('checkindate'), '<=', search.checkoutdatetimeex),
                        Sequelize.where(Sequelize.col('checkoutdate'), '>=', search.checkoutdatetimeex)]
                    }
                ]

                OrderHistoryModel.findAll({ where: userWhere }).then((resp) => {
                    let userBookedVehicle = resp.map((x, i) => {
                        return x.product_id;
                    });
                    bookedVehicle = bookedVehicle.concat(userBookedVehicle.filter(bo => bookedVehicle.every(ao => ao != bo)));
                    content();
                })
            }
            else {
                content();
            }
        })
    }
    else {
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
        if (!req.body.fromadmin) {
            where.status = 1;
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

exports.createProduct = function (req, res) {
    // var upload = multer({ storage: storage }).single('thumbnail');
    var upload = multer({ storage: storage }).fields([{
        name: 'thumbnail',
        maxCount: 1
    }, {
        name: 'images',
        maxCount: 10
    }, {
        name: 'image1',
        maxCount: 1
    }, {
        name: 'image2',
        maxCount: 1
    }, {
        name: 'image3',
        maxCount: 1
    }, {
        name: 'image4',
        maxCount: 1
    }]);
    upload(req, res, function (err) {
        req.body.thumbnail = res.req.files && (res.req.files.thumbnail && res.req.files.thumbnail[0].filename);
        req.body.image1 = res.req.files && (res.req.files.image1 && res.req.files.image1[0].filename);
        req.body.image2 = res.req.files && (res.req.files.image2 && res.req.files.image2[0].filename);
        req.body.image3 = res.req.files && (res.req.files.image3 && res.req.files.image3[0].filename);
        req.body.image4 = res.req.files && (res.req.files.image4 && res.req.files.image4[0].filename);
        req.body.status = 1;
        ProductModel.create(req.body).then(async function (product) {
            if (res.req.files && res.req.files.images) {
                product.images = [];
                async.eachSeries(res.req.files.images, function (image, callback) {
                    let productImage = { product_id: product.id, image: image.filename };
                    ProductImageModel.create(productImage).then(function (resp) {
                        product.images.push(resp);
                        callback();
                    }, function (err) {
                        res.send(err);
                    })
                }, async function (err) {
                    try {
                        let specifications = req.body.specifications && JSON.parse(req.body.specifications) || [];
                        for (const spec of specifications) {
                            const productSpec = { product_id: product.id, specification_id: spec.id };
                            const resp = await ProductSpecificationModel.create(productSpec);
                        }
                    } catch (err) {
                        throw err;
                    }
                    res.send(product);
                })
            } else {
                try {
                    let specifications = req.body.specifications && JSON.parse(req.body.specifications) || [];
                    for (const spec of specifications) {
                        const productSpec = { product_id: result.id, specification_id: spec.id };
                        const resp = await ProductSpecificationModel.create(productSpec);
                    }
                } catch (err) {
                    throw err;
                }
                res.send(product);
            }

        }, function (err) {
            res.status(500).send(err);
        })
    })
}
exports.updateProduct = function (req, res) {
    // var upload = multer({ storage: storage }).single('thumbnail');
    var upload = multer({ storage: storage }).fields([{
        name: 'thumbnail',
        maxCount: 1
    }, {
        name: 'images',
        maxCount: 10
    }, {
        name: 'image1',
        maxCount: 1
    }, {
        name: 'image2',
        maxCount: 1
    }, {
        name: 'image3',
        maxCount: 1
    }, {
        name: 'image4',
        maxCount: 1
    }]);
    upload(req, res, function (err) {
        ProductModel.findByPk(req.body.id).then(function (result) {
            req.body.thumbnail = res.req.files && (res.req.files.thumbnail && res.req.files.thumbnail[0].filename) || result.thumbnail;
            req.body.image1 = res.req.files && (res.req.files.image1 && res.req.files.image1[0].filename);
            req.body.image2 = res.req.files && (res.req.files.image2 && res.req.files.image2[0].filename);
            req.body.image3 = res.req.files && (res.req.files.image3 && res.req.files.image3[0].filename);
            req.body.image4 = res.req.files && (res.req.files.image4 && res.req.files.image4[0].filename);
            result.update(req.body).then((resp) => {
                result.images = [];
                async.eachSeries(res.req.files.images, function (image, callback) {
                    let productImage = { product_id: result.id, image: image.filename };
                    ProductImageModel.create(productImage).then(function (resp) {
                        result.images.push(resp);
                        callback();
                    }, function (err) {
                        res.send(err);
                    })
                }, async function (err) {
                    try {
                        let specifications = req.body.specifications && JSON.parse(req.body.specifications) || [];
                        await ProductSpecificationModel.destroy({ where: { product_id: result.id } });
                        for (const spec of specifications) {
                            const productSpec = { product_id: result.id, specification_id: spec.id };
                            const resp = await ProductSpecificationModel.create(productSpec);
                        }
                    } catch (err) {
                        throw err;
                    }
                    res.send(resp);
                })
            })
        }, function (err) {
            res.status(500).send(err);
        })
    })
}
exports.deleteProduct = function (req, res) {
    ProductModel.findByPk(req.params.id).then(function (result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}
exports.deleteOrder = function (req, res) {
    OrderHistoryModel.destroy({ where: { order_id: req.params.id } }).then(function (result) {
        OrderModel.findByPk(req.params.id).then(function (result) {
            result.destroy().then((resp) => {
                res.send(resp);
            })
        }, function (err) {
            res.status(500).send(err);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.deleteProductImage = function (req, res) {
    ProductImageModel.findByPk(req.params.id).then(function (result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.getProduct = function (req, res) {
    ProductModel.findOne({
        where: { route: req.params.route },
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

exports.uploadVehicleImage = function (req, res) {
    var upload = multer({ storage: storage }).array('image', 10);
    upload(req, res, function (err) {
        console.log(res.req.files);
        async.eachSeries(res.req.files, function (file, callback) {
            req.body.image = file && file.filename;
            if (req.body.image) {
                VehicleImageModel.create(req.body).then(function () {
                    callback();
                }, (err) => {
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
exports.getVehicleRegister = function (req, res) {
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
    }).then(function (resp) {
        res.send(resp);
    }, function (err) {
        res.status(500).send(err);
    })
}
/** vehicle register */
exports.createVehicleRegister = function (req, res) {
    req.body.registeruser_id = req.body.registeruser_id || appUtil.getUser(req.headers.authorization).id;
    req.body.totenmetdatum = moment(req.body.totenmetdatum + ' ' + req.body.totenmetdtijd).format('YYYY-MM-DD HH:mm:ss');
    req.body.totenmetdtijd = moment(req.body.totenmetdatum).format('HH:mm');
    req.body.vanafdatum = moment(req.body.vanafdatum + ' ' + req.body.vanafdtijd).format('YYYY-MM-DD HH:mm:ss');
    req.body.vanafdtijd = moment(req.body.vanafdatum).format('HH:mm');
    req.body.amount = parseFloat(req.body.amount);
    req.body.paymentuser_id = appUtil.getUser(req.headers.authorization).id || null;
    stripeAmount = req.body.amount * 100;
    VehicleRegisterModel.create(req.body).then(function () {
        res.send(req.body);
    }, function (err) {
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

exports.updateVehicleRegister = function (req, res) {
    VehicleRegisterModel.findByPk(req.body.id).then(function (result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}
exports.deleteVehicleRegister = function (req, res) {
    VehicleRegisterModel.findByPk(req.params.id).then(function (result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.vehicleRegisters = function (req, res) {
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

/** Extra */
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
exports.createExtra = function (req, res) {
    ExtraModel.create(req.body).then(function () {
        res.send(req.body);
    }, function (err) {
        res.status(500).send(err);
    })
}
exports.updateExtra = function (req, res) {
    ExtraModel.findByPk(req.body.id).then(function (result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}
exports.deleteExtra = function (req, res) {
    ExtraModel.findByPk(req.params.id).then(function (result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.findExtraByType = function (req, res) {
    ExtraModel.findAll({
        where: {
            'status': 1,
            'type': req.params.type
        },
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(function (entries) {
        res.send(entries || null)
    });
}

exports.makeOrder = function (req, res) {
    delete req.body.id;
    const USER = appUtil.getUser(req.headers.authorization);
    req.body.user_id = (req.body.freebooking) == 1 ? req.body.user_id : USER.id || null;
    let checkOutDates = [];
    async.eachSeries(req.body.products, function (product, pCallback) {
        const search = product.search;
        checkOutDates.push(moment(search.checkoutdate + ' ' + search.checkouttime, 'DD-MM-YYYY HH:mm'));
        pCallback();
    });
    if (checkOutDates && checkOutDates.length) {
        let maxCheckoutDate = moment.max(checkOutDates);
        req.body.maxcheckoutdate = maxCheckoutDate.format('YYYY-MM-DD HH:mm:ss');
        req.body.maxcheckoutdateutc = moment(req.body.maxcheckoutdate).utc().format('YYYY-MM-DD') + ' ' + moment(req.body.maxcheckoutdate).utc().format('HH:mm:ss');
        // const d = new Date(req.body.maxcheckoutdate)
        // let current = moment(req.body.maxcheckoutdate).utc().format('YYYY-MM-DD') + ' ' + moment(req.body.maxcheckoutdate).utc().format('HH:mm:ss');
        // let oneHrAfter = moment().format('YYYY-MM-DD') + ' ' + moment().add('1', 'hours').format('HH:mm:ss');
        // let test = moment('11-10-2021 20:35', 'MM-DD-YYYY HH:mm').format('YYYY-MM-DD') + ' ' + moment('11-10-2021 20:35', 'MM-DD-YYYY HH:mm').format('HH:mm:ss');
        // let test2 = new Date((req.body.maxcheckoutdate)).toLocaleString("en-US", { timeZone: "Europe/London" });
        // let test3 = new Date(maxCheckoutDate).toUTCString()
        // let test5 = moment('2022-10-11').utc().format('YYYY-MM-DD') + ' ' + moment('22:30','HH:mm').utc().format('HH:mm:ss');;
        // res.send({
        //     maxCheckoutDate: maxCheckoutDate, bodymaxcheckoutdate: req.body.maxcheckoutdate, current: current
        // });
        // res.send(moment(maxCheckoutDate).utc().format('YYYY-MM-DD') +' '+ moment(maxCheckoutDate, 'DD-MM-YYYY HH:mm').utc(maxCheckoutDate).format('HH:mm:ss'));
        // res.send({test: moment(maxCheckoutDate).utc().format('YYYY-MM-DD'), test2: moment(req.body.maxcheckoutdate, 'DD-MM-YYYY HH:mm').utc().format('HH:mm:ss'), test3: req.body.maxcheckoutdate, test4: moment('2020-05-20 22:12:44').tz(moment.tz.guess()).format('YYYY-MM-DD hh:mm:ss A'), test5: moment.utc(req.body.maxcheckoutdate), test6: moment.utc(maxCheckoutDate), test7: moment.utc(d)})
    }
    if (req.body.type == 'wallet' || !req.body.maxcheckoutdate) {
        req.body.maxcheckoutdate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
    OrderModel.create(req.body).then((resp) => {
        // Push order history
        resp = resp.toJSON();
        resp.user = USER;
        resp.Orderhistories = [];
        // if (resp.status == 1) {
        //     appUtil.sendOrderConfirmationMail(resp, req.body.type);
        // }
        async.eachSeries(req.body.products, function (product, pCallback) {
            if (product.type == 'rent' || product.type == 'Rent' || product.type == 'RENT' || 'maintenance') {
                let orderhistory = product;
                orderhistory.order_id = resp.id;
                orderhistory.product_id = product.id;
                orderhistory.name = product.name;
                orderhistory.price = product.priceperhr;
                orderhistory.advancepaid = product.advancePayment;
                if (req.body.freebooking == 1) {
                    orderhistory.user_id = req.body.user_id;
                }
                else {
                    orderhistory.user_id = USER.id || null;
                }

                if (product.search) {
                    const search = product.search;
                    orderhistory.filterlocation_id = search.locationid;
                    // orderhistory.checkindate = moment(search.checkindate + ' ' + search.checkintime, 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss');
                    orderhistory.checkindate = moment(search.checkindate, 'DD-MM-YYYY').format('YYYY-MM-DD') + ' ' + moment(search.checkintime, 'HH:mm').format('HH:mm:ss');
                    orderhistory.checkintime = moment(search.checkintime, 'HH:mm').format('HH:mm');
                    // orderhistory.checkoutdate = moment(search.checkoutdate + ' ' + search.checkouttime, 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss');
                    orderhistory.checkoutdate = moment(search.checkoutdate, 'DD-MM-YYYY').format('YYYY-MM-DD') + ' ' + moment(search.checkouttime, 'HH:mm').format('HH:mm:ss');
                    orderhistory.checkouttime = moment(search.checkouttime, 'HH:mm').format('HH:mm');
                    // orderhistory.maxcanceldate = moment(product.maxcanceldate + ' ' + search.checkintime, 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss');

                    if (product.maxcanceldate) {
                        orderhistory.maxcanceldate = moment(product.maxcanceldate, 'DD-MM-YYYY').format('YYYY-MM-DD') + ' ' + moment(search.checkintime, 'HH:mm').format('HH:mm:ss');
                    }

                    // let maxCheckoutDate = orderhistory.checkoutdate;
                    orderhistory.maxcheckoutdateutc = search.maxcheckoutdateutc;
                }
                delete orderhistory.id;
                OrderHistoryModel.create(orderhistory).then(async (history) => {
                    resp.Orderhistories.push(history);
                    var obj = {
                        orderhistory_id: history.id,
                        user_id: USER.id || null,
                        owner: 1,
                    }
                    await OrderSharingModel.create(obj);
                    async.eachSeries(product['Extras'], function (extra, eCallback) {
                        if (extra.checked) {
                            let orderhistory = extra;
                            orderhistory.order_id = resp.id;
                            orderhistory.product_id = history.product_id;
                            orderhistory.advancepaid = product.advancePayment;
                            orderhistory.price = extra.price;
                            orderhistory.extra_id = extra.id;
                            orderhistory.name = extra.description;
                            if (product.search) {
                                const search = product.search;
                                orderhistory.filterlocation_id = search.locationid;
                                orderhistory.checkindate = moment(search.checkindate + ' ' + search.checkintime, 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss');
                                orderhistory.checkintime = moment(search.checkintime, 'HH:mm').format('HH:mm');
                                orderhistory.checkoutdate = moment(search.checkoutdate + ' ' + search.checkouttime, 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss');
                                orderhistory.checkouttime = moment(search.checkouttime, 'HH:mm').format('HH:mm');
                                orderhistory.maxcanceldate = moment(extra.maxcanceldate + ' ' + search.checkintime, 'DD-MM-YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss');
                            }

                            delete orderhistory.id;
                            OrderHistoryModel.create(orderhistory).then((hhistory) => {
                                eCallback();
                            }, (err) => {
                                res.send(err);
                            })
                        } else {
                            eCallback();
                        }
                    }, function (err) {
                        pCallback();
                    })
                }, (err) => {
                    res.send(err);
                })
            } else {
                product.order_id = resp.id;
                product.user_id = USER && USER.id;
                product.workdate = moment(product.workdate, 'DD-MM-YYYY').format('YYYY-MM-DD');
                makeStaffOrTransportRequest(product).then((resp) => {
                    pCallback();
                }, function (err) {
                    res.status(500).send(err);
                })
            }
        }, function (err) {
            if (err) res.send(err);
            res.send(resp);
        })

    })
}



// exports.createStaffOrTransportRequest = function (req, res) {
//     makeStaffOrTransportRequest(req.body).then((resp) => {
//         res.send(resp);
//     }, function (err) {
//         res.status(500).send(err);
//     })
// }

exports.createStaffOrTransportRequest = function (req, res) {
    var upload = multer({ storage: assignmentStorage }).single('image');
    upload(req, res, function (err) {
        let returns = null;
        req.body.image = res.req.file && res.req.file.filename || req.body.image;
        StaffOrTransportRequestModel.create(req.body).then(function (resp) {
            resp.update(req.body).then(function (result) {
                res.send(result);
            });
        })

    });
}

function makeStaffOrTransportRequest(body) {
    return new Promise((resolve, reject) => {
        StaffOrTransportRequestModel.create(body).then((resp) => {
            resolve(resp);
        }, function (err) {
            reject(err);
        })
    })
}

// exports.updateStaffOrTransportRequest = function (req, res) {
//     StaffOrTransportRequestModel.findByPk(req.body.id).then(function (result) {
//         result.update(req.body).then((resp) => {
//             res.send(resp);
//         })
//     }, function (err) {
//         res.status(500).send(err);
//     })
// }



exports.checkAvailability = function (req, res) {

    // var bookedVehicle = [];
    const search = req.body
    let where = {};
    const checkindatetime = moment(search.checkindate + ' ' + search.checkintime, 'DD-MM-YYYY HH:mm');
    const checkoutdatetime = moment(search.checkoutdate + ' ' + search.checkouttime, 'DD-MM-YYYY HH:mm');
    search.checkindatetimeex = checkindatetime.clone();
    search.checkoutdatetimeex = checkoutdatetime.clone();
    search.checkindatetimeex = search.checkindatetimeex.subtract(60, 'minutes').format('YYYY-MM-DD HH:mm:ss');
    search.checkoutdatetimeex = search.checkoutdatetimeex.add(60, 'minutes').format('YYYY-MM-DD HH:mm:ss');

    search.defaultcheckindatetimeex = checkindatetime.clone();
    search.defaultcheckoutdatetimeex = checkoutdatetime.clone();
    search.defaultcheckindatetimeex = search.defaultcheckindatetimeex.add(10, 'seconds').format('YYYY-MM-DD HH:mm:ss');
    search.defaultcheckoutdatetimeex = search.defaultcheckoutdatetimeex.format('YYYY-MM-DD HH:mm:ss');
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
        Sequelize.where(Sequelize.col('checkoutdate'), '>=', search.checkindatetimeex)]
    },
    {
        [Op.and]: [Sequelize.where(Sequelize.col('checkindate'), '<=', search.checkoutdatetimeex),
        Sequelize.where(Sequelize.col('checkoutdate'), '>=', search.checkoutdatetimeex)]
    }]

    where.status = 1;
    where.type = req.body.type;
    where.product_id = search.product_id;
    OrderHistoryModel.findOne({
        where,
        include: [OrderModel],
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then((resp) => {
        // bookedVehicle = resp.map((x, i) => {
        //     return x.product_id;
        // });
        let user_id = appUtil.getUser(req.headers.authorization).id || null;
        if (resp) {
            if (resp.Order && resp.Order.user_id != user_id) {
                res.send({ booked: true });
            } else {
                let hWhere = {};

                hWhere[Op.or] = [{
                    [Op.and]: [Sequelize.where(Sequelize.col('checkindate'), '<=', search.defaultcheckindatetimeex),
                    Sequelize.where(Sequelize.col('checkoutdate'), '>=', search.defaultcheckindatetimeex)]
                },
                {
                    [Op.and]: [Sequelize.where(Sequelize.col('checkindate'), '<=', search.defaultcheckoutdatetimeex),
                    Sequelize.where(Sequelize.col('checkoutdate'), '>=', search.defaultcheckoutdatetimeex)]
                }];

                // hWhere.checkoutdate = {
                //     [Op.between]: [search.checkindatetime.toDate(), search.checkoutdatetime.toDate()]
                // };
                hWhere.status = 1;
                hWhere.type = req.body.type;
                hWhere.product_id = search.product_id;
                OrderHistoryModel.findOne({
                    where: hWhere,
                    include: [{
                        model: OrderModel,
                        where: {
                            user_id: user_id
                        },
                        required: true
                    }],
                    order: [
                        ['updatedAt', 'DESC']
                    ]
                }).then((sResp) => {
                    console.log('-----------------------------------');
                    if (sResp)
                        res.send({ booked: true });
                    else {
                        /** Check maintenance */
                        hWhere.type = 'maintenance';
                        OrderHistoryModel.findOne({
                            where: hWhere,
                        }).then((mResp) => {
                            if (mResp) {
                                res.send({ booked: true });
                            } else {
                                res.send({ booked: false });
                            }
                        });

                    }
                });
            }

            // let bookedCheckoutdate = moment(resp.checkoutdate);
            // let bookedCheckoutdate = resp.checkoutdate;
            // var isafter = search.checkoutdatetime.isAfter(bookedCheckoutdate); // true
            // if (isafter) {
            //     let differenceHrs = search.checkoutdatetime.diff(bookedCheckoutdate, 'hours');
            //     if (differenceHrs < 1) {
            //         if (resp.Order && resp.Order.user_id != user_id)
            //             res.send({ booked: true });
            //         else
            //             res.send({ booked: false });
            //     } else
            //         res.send({ booked: false });
            // } else {
            //     res.send({ booked: true });
            // }
        } else {
            /** Check maintenance */
            let hWhere = {};
            // hWhere[Op.or] = [{
            //     checkindate: {
            //         [Op.between]: [search.defaultcheckindatetimeex, search.defaultcheckoutdatetimeex]
            //     }
            // }, {
            //     checkoutdate: {
            //         [Op.between]: [search.defaultcheckindatetimeex, search.defaultcheckoutdatetimeex]
            //     }
            // }];
            hWhere[Op.or] = [{
                [Op.and]: [Sequelize.where(Sequelize.col('checkindate'), '<=', search.defaultcheckindatetimeex),
                Sequelize.where(Sequelize.col('checkoutdate'), '>=', search.defaultcheckindatetimeex)]
            },
            {
                [Op.and]: [Sequelize.where(Sequelize.col('checkindate'), '<=', search.defaultcheckoutdatetimeex),
                Sequelize.where(Sequelize.col('checkoutdate'), '>=', search.defaultcheckoutdatetimeex)]
            }];
            hWhere.status = 1;
            //hWhere.type = req.body.type;
            hWhere.product_id = search.product_id;
            hWhere.type = [req.body.type, 'maintenance'];
            OrderHistoryModel.findOne({
                where: hWhere,
            }).then((mResp) => {
                if (mResp) {
                    res.send({ booked: true });
                } else {
                    res.send({ booked: false });
                }
            });
        }
    })

}

exports.returnAvailableProducts = function (req, res) {

    // var bookedVehicle = [];
    const search = req.body
    let where = {};
    const checkindatetime = moment(search.checkindate + ' ' + search.checkintime, 'DD-MM-YYYY HH:mm');
    const checkoutdatetime = moment(search.checkoutdate + ' ' + search.checkouttime, 'DD-MM-YYYY HH:mm');
    search.checkindatetimeex = checkindatetime.clone();
    search.checkoutdatetimeex = checkoutdatetime.clone();
    search.checkindatetimeex = search.checkindatetimeex.subtract(60, 'minutes').format('YYYY-MM-DD HH:mm:ss');
    search.checkoutdatetimeex = search.checkoutdatetimeex.add(60, 'minutes').format('YYYY-MM-DD HH:mm:ss');

    search.defaultcheckindatetimeex = checkindatetime.clone();
    search.defaultcheckoutdatetimeex = checkoutdatetime.clone();
    search.defaultcheckindatetimeex = search.defaultcheckindatetimeex.add(10, 'seconds').format('YYYY-MM-DD HH:mm:ss');
    search.defaultcheckoutdatetimeex = search.defaultcheckoutdatetimeex.format('YYYY-MM-DD HH:mm:ss');


    where[Op.or] = [{
        [Op.and]: [Sequelize.where(Sequelize.col('checkindate'), '<=', search.checkindatetimeex),
        Sequelize.where(Sequelize.col('checkoutdate'), '>=', search.checkindatetimeex)]
    },
    {
        [Op.and]: [Sequelize.where(Sequelize.col('checkindate'), '<=', search.checkoutdatetimeex),
        Sequelize.where(Sequelize.col('checkoutdate'), '>=', search.checkoutdatetimeex)]
    }]
    let user_id = appUtil.getUser(req.headers.authorization).id || null;
    where.status = 1;
    where.type = req.body.type;
    
    where.product_id = search.product_id;
    where.user_id != user_id;
    OrderHistoryModel.findAll({
        where,
        include: [OrderModel, UserModel],
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then((resp) => {

        if (resp && Array.isArray(resp) && resp.length>0) {
            if (resp.length) {
                res.send(resp);
            } else {
                let hWhere = {};

                hWhere[Op.or] = [{
                    [Op.and]: [Sequelize.where(Sequelize.col('checkindate'), '<=', search.defaultcheckindatetimeex),
                    Sequelize.where(Sequelize.col('checkoutdate'), '>=', search.defaultcheckindatetimeex)]
                },
                {
                    [Op.and]: [Sequelize.where(Sequelize.col('checkindate'), '<=', search.defaultcheckoutdatetimeex),
                    Sequelize.where(Sequelize.col('checkoutdate'), '>=', search.defaultcheckoutdatetimeex)]
                }];
                hWhere.status = 1;
                hWhere.type = req.body.type;
                hWhere.product_id = search.product_id;
                OrderHistoryModel.findAll({
                    where: hWhere,
                    include: [{
                        model: OrderModel,
                        where: {
                            user_id: user_id
                        },
                        required: true
                    }],
                    order: [
                        ['updatedAt', 'DESC']
                    ]
                }).then((sResp) => {
                    console.log('-----------------------------------');
                    if (sResp && sResp.length)
                        res.send(sResp);
                    else {
                        hWhere.type = 'maintenance';
                        OrderHistoryModel.findAll({
                            where: hWhere,
                        }).then((mResp) => {
                            if (mResp && mResp.length) {
                                res.send(mResp);
                            } else {
                                res.send([]);
                            }
                        });

                    }
                });
            }
        } else {
            let hWhere = {};
            hWhere[Op.or] = [{
                [Op.and]: [Sequelize.where(Sequelize.col('checkindate'), '<=', search.defaultcheckindatetimeex),
                Sequelize.where(Sequelize.col('checkoutdate'), '>=', search.defaultcheckindatetimeex)]
            },
            {
                [Op.and]: [Sequelize.where(Sequelize.col('checkindate'), '<=', search.defaultcheckoutdatetimeex),
                Sequelize.where(Sequelize.col('checkoutdate'), '>=', search.defaultcheckoutdatetimeex)]
            }];
            hWhere.status = 1;
            hWhere.product_id = search.product_id;
            hWhere.type = [req.body.type, 'maintenance'];
            OrderHistoryModel.findAll({
                where: hWhere,
            }).then((mResp) => {
                if (mResp && mResp.length) {
                    res.send(mResp);
                } else {
                    res.send([]);
                }
            });
        }
    })

}


exports.checkAvailabilityProducts = function (req, res) {

    // var bookedVehicle = [];
    const search = req.body;
    const checkindatetime = moment(search.checkindate + ' ' + search.checkintime, 'DD-MM-YYYY HH:mm');
    const checkoutdatetime = moment(search.checkoutdate + ' ' + search.checkouttime, 'DD-MM-YYYY HH:mm');


    search.defaultcheckindatetimeex = checkindatetime.clone();
    search.defaultcheckoutdatetimeex = checkoutdatetime.clone();
    search.defaultcheckindatetimeex = search.defaultcheckindatetimeex.subtract(60, 'minutes').format('YYYY-MM-DD HH:mm:ss');
    search.defaultcheckoutdatetimeex = search.defaultcheckoutdatetimeex.add(60, 'minutes').format('YYYY-MM-DD HH:mm:ss');

    // search.defaultcheckindatetimeex = search.defaultcheckindatetimeex.format('YYYY-MM-DD HH:mm:ss');
    // search.defaultcheckoutdatetimeex = search.defaultcheckoutdatetimeex.format('YYYY-MM-DD HH:mm:ss');

    let hWhere = {};
    hWhere[Op.or] = [{
        checkindate: {
            [Op.between]: [search.defaultcheckindatetimeex, search.defaultcheckoutdatetimeex]
        }
    }, {
        checkoutdate: {
            [Op.between]: [search.defaultcheckindatetimeex, search.defaultcheckoutdatetimeex]
        }
    }];
    hWhere.status = 1;
    hWhere.type = req.body.type;
    hWhere.product_id = search.product_id;
    hWhere.filterlocation_id = search.locationid;
    let user_id = appUtil.getUser(req.headers.authorization).id || null;
    OrderHistoryModel.findOne({
        where: hWhere,
        include: [{
            model: OrderModel,
            where: {
                user_id: user_id
            },
            required: true
        }],
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then((sResp) => {
        console.log('-----------------------------------');
        if (sResp)
            res.send({ booked: true });
        else {
            /** Check maintenance */
            hWhere.type = 'maintenance';
            OrderHistoryModel.findOne({
                where: hWhere,
            }).then((mResp) => {
                if (mResp) {
                    res.send({ booked: true });
                } else {
                    res.send({ booked: false });
                }
            });

        }
    });

}

exports.returnBookedTimes = function (req, res) {

    // var bookedVehicle = [];
    const search = req.body
    let where = {};
    search.checkindatetime = moment(search.checkindate + ' ' + search.checkintime, 'DD-MM-YYYY HH:mm');
    search.checkoutdatetime = moment(search.checkoutdate + ' ' + search.checkouttime, 'DD-MM-YYYY HH:mm');
    where.checkoutdate = {
        // [Op.between]: [moment(req.body.pickupdate + ' ' + req.body.pickuptime).add(45, 'minutes').toDate(), moment(req.body.dropdate + ' ' + req.body.droptime).toDate()]
        [Op.between]: [search.checkindatetime.toDate(), search.checkoutdatetime.toDate()]
    };

    where.status = 1;
    where.type = req.body.type;
    where.product_id = search.product_id;
    where.filterlocation_id = search.locationid;
    OrderHistoryModel.findOne({
        where,
        order: [
            ['updatedAt', 'DESC']
        ],
        attributes: ['checkouttime']
    }).then((resp) => {
        // bookedVehicle = resp.map((x, i) => {
        //     return x.product_id;
        // });
        if (resp && resp.length) {
            res.send(resp);
        } else {
            res.send({});
        }
    })

}

exports.getOrder = function (req, res) {
    let where = { id: req.body.id, status: 3 };
    OrderModel.findOne({
        where,
        include: [OrderHistoryModel, UserModel],
    }).then((ordered) => {
        res.send(ordered);
    })
}

exports.updateOrder = function (req, res) {
    OrderModel.findByPk(req.body.id).then(function (result) {
        result.update(req.body).then((resp) => {
            resp = resp.toJSON();
            const USER = appUtil.getUser(req.headers.authorization);
            resp.user = USER;
            if (resp.status == 1)
                // appUtil.sendOrderConfirmationMail(resp, resp.type);
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.findOrder = async function (req, res) {
    try {
        const order = await OrderModel.findByPk(req.body.id);

        if (order) {
            res.send(order);
        } else {
            res.status(500).send("Order not found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

exports.findOrderHistory = async function (req, res) {
    try {
        const order = await OrderHistoryModel.findOne({
            where: { id: req.body.id, extra_id: null },
            include: [
                { model: UserModel },
                { model: ProductModel }
            ]
        });

        if (order && order.endbooking) {
            res.status(404).send("Already booking completed");
        } else if (order) {
            res.send(order);
        } else {
            res.status(404).send("Order not found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};



exports.orders = function (req, res) {
    let result = { count: 0, data: [] };
    let offset = req.body.offset || 0;
    let limit = req.body.limit || 1000;
    let where = {};

    if (req.body.status) {
        where.status = req.body.status;
    }
    if (req.body.frontend) {
        if (req.body.team_id) {
            where.team_id = req.body.team_id;
        } else
            where.user_id = appUtil.getUser(req.headers.authorization).id || null;

    }
    OrderModel.findAndCountAll({
        where: where
    }).then((output) => {
        result.count = output.count;
        OrderModel.findAll({
            where: where,
            include: [
                {
                    model: OrderHistoryModel,
                    include: [{
                        model: ScreenshotModel
                    }]
                }, UserModel
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

exports.ordersForApp = function (req, res) {
    let result = { count: 0, data: [] };
    let offset = req.body.offset || 0;
    let limit = req.body.limit || 1000;
    let orderHistoryWhere = { status: 1 };
    let where = {};
    let endbooking = null;
    if (req.body.past) {
        endbooking = 1;
        orderHistoryWhere.status = [0, 1];
    }
    orderHistoryWhere.endbooking = endbooking;
    if (req.body.status) {
        orderHistoryWhere.status = req.body.status;
    }
    if (req.body.id) {
        orderHistoryWhere.id = req.body.id;
    }
    // if (req.body.team_id)
    //     where.team_id = req.body.team_id;
    // else
        // orderHistoryWhere.user_id = appUtil.getUser(req.headers.authorization).id || null;

    sharingwhere = {
        user_id: appUtil.getUser(req.headers.authorization).id || null
    }
    OrderHistoryModel.findAndCountAll({
        where: orderHistoryWhere,
        include: [{
            model: OrderSharingModel,
            where: sharingwhere,
        }]
    }).then((output) => {
        result.count = output.count;
        OrderHistoryModel.findAll({
            where: orderHistoryWhere,
            include: [{
                model: OrderModel,
                where: where,
                required: true,
                include: [{
                    model: OrderHistoryModel,
                    where: {
                        extra_id: {
                            [Op.not]: null
                        }
                    },
                    required: false
                }]
            },
            {
                model: OrderSharingModel,
                where: sharingwhere,
                include: [UserModel]
            }, {
                model: UserModel,
                required: false
            }, {
                model: ScreenshotModel,
                required: false
            }, {
                model: ProductModel,
                required: false
            }],
            order: [
                ['createdAt', 'DESC']
            ],
            offset: offset,
            limit: limit
        }).then(async (registered) => {
            const revised = await Promise.all(registered.map(async (x, i) => {
                let temp = x && x.toJSON();
                temp.sno = offset + (i + 1);
            
                let sharingCount = await OrderSharingModel.findAndCountAll({ where: {orderhistory_id: temp.id, owner: 0} });
                temp.sharingCount = sharingCount ? sharingCount.count : 0;
            
                return temp;
            }));

            // let revised = registered.map(async (x, i) => {
            //     let temp = x && x.toJSON();
            //     temp.sno = offset + (i + 1);

            //     let sharingCount = await OrderSharingModel.findAndCountAll({ where: {orderhistory_id: temp.id, owner: 0} });
            //     temp.sharingCount = sharingCount ? sharingCount.count : 0;

            //     return temp;
            // })
            result.data = revised;
            res.send(result);
        }).catch((err) => {
            res.status(500).send(err)
        })
    }).catch((err) => {
        res.status(500).send(err)
    })
}

exports.myWallet = function (req, res) {
    let user_id = appUtil.getUser(req.headers.authorization).id || null;
    let team_id = req.body.team_id || null;
    let whereObj = {
        maxcheckoutdate: {
            [Op.lte]: Sequelize.literal("NOW()")
            // [Op.lte]: moment().toDate()
        },
        status: 1,
        // type: {
        //     [Op.ne]: 'wallet'
        // }
    };
    if (team_id) {
        whereObj[Op.or] = [{
            user_id: user_id
        }, {
            team_id: team_id
        }]
    } else {
        whereObj.user_id = user_id;
    }

    OrderModel.findAll({
        where: whereObj,
        include: [OrderHistoryModel],
    }).then(async (orders) => {
        let totalAmountPaid = orders && orders.reduce(function (a, b) {
            return a + parseFloat(b.amountpaid);
        }, 0);
        /** Remove cancel amount - which immedietly added in wallet */
        let cancelAmountWithInCheckoutDate = 0;
        async.eachSeries(orders, function (order, oCallback) {
            async.eachSeries(order.Orderhistories, function (history, hCallback) {
                if (history.status == 0) {
                    cancelAmountWithInCheckoutDate += parseFloat(history.advancepaid);
                }
                hCallback();
            }, (err) => {
                oCallback();
            })

        });
        let totalWallet = totalAmountPaid - cancelAmountWithInCheckoutDate;

        let whereUser = {};
        if (team_id) {
            // whereUser.team_id = team_id;
            whereUser.teamowner = 1;
            whereUser[Op.or] = [{
                user_id: user_id
            }, {
                team_id: team_id
            }]
        } else {
            whereUser.id = user_id;
        }
        // let user = await UserModel.findOne({ where: whereUser });
        // let totalWallet = Number(totalAmountPaid) + Number(user.wallet);

        let whereWallet = {
            status: 1
        }
        if (team_id) {
            // whereWallet.team_id = team_id
            whereWallet[Op.or] = [{
                user_id: user_id
            }, {
                team_id: team_id
            }]
        } else {
            whereWallet.user_id = user_id;
        }
        let fromWallet = await OrderModel.findAll({
            where: whereWallet,
            include: [OrderHistoryModel],
        });
        /** Interest calculation */
        var currentInterest = 0;
        async.eachSeries(fromWallet, function (element, wCallback) {
            let fromDate = new Date(element.createdAt);
            let toDate = new Date();
            let diffTime = Math.abs(toDate - fromDate);
            let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            // let today = new Date();
            if (diffDays && element.amountpaid) {
                let months = (diffDays / 30);
                let interestAmount = (((element.amountpaid / 100) * (parseInt(months) * 4.79)) / 12).toFixed(2);
                currentInterest += parseFloat(interestAmount);
            }
            wCallback();
        })
        //commented on April 16 2023
        // totalWallet += currentInterest;

        let whereeWallet = {
            status: 1,
            maxcheckoutdate: {
                [Op.gte]: Sequelize.literal("NOW()")
                // [Op.lte]: moment().toDate()
            },
        }
        if (team_id) {
            whereeWallet[Op.or] = [{
                user_id: user_id
            }, {
                team_id: team_id
            }]
        } else {
            whereeWallet.user_id = user_id;
        }
        let fromeWallet = await OrderModel.findAll({
            where: whereeWallet,
            include: [OrderHistoryModel],
        });
        /** Wallet amount */
        let totalWalletPaid = fromeWallet && fromeWallet.reduce(function (a, b) {
            return a + (parseFloat(b['fromwallet']) || 0);
        }, 0);
        let currentWalletAmount = totalWallet - (totalWalletPaid || 0);
        /** Cancel amount add */
        let cancelAmount = 0;
        async.eachSeries(fromWallet, function (order, oCallback) {
            async.eachSeries(order.Orderhistories, function (history, hCallback) {
                if (history.status == 0) {
                    cancelAmount += parseFloat(history.advancepaid);
                }
                hCallback();
            }, (err) => {
                oCallback();
            })

        });
        currentWalletAmount += cancelAmount;
        /** Withdrawrequests */
        let whereWithdraw = {}
        whereWithdraw.status = {
            [Op.ne]: 2
        };
        if (team_id) {
            // whereWithdraw.team_id = team_id;
            whereWithdraw[Op.or] = [{
                user_id: user_id
            }, {
                team_id: team_id
            }]
        } else {
            whereWithdraw.user_id = user_id;
        }
        let allWithdrawRequests = await WithdrawRequestModel.findAll({ where: whereWithdraw });
        let withdrawAmount = allWithdrawRequests && allWithdrawRequests.reduce(function (a, b) {
            return a + parseFloat(b['amount']);
        }, 0);
        currentWalletAmount = currentWalletAmount - withdrawAmount;

        res.send({ wallet: currentWalletAmount && currentWalletAmount.toFixed(2) || 0, interest: currentInterest && currentInterest.toFixed(2) });
        // res.send(orders);
    }).catch((err) => {
        res.status(500).send(err)
    })
}

exports.cancelOrderHistory = function (req, res) {
    OrderHistoryModel.findOne({
        where: {
            id: req.body.id
        }
    }).then(function (resp) {
        var obj = {
            endbooking: 1,
            status: req.body.status,
            canceleddate: moment().format('YYYY-MM-DD HH:mm:ss')
        }
        resp.update(obj).then(function (result) {
            if (result.Order && result.Order.User) {
                appUtil.cancelNotification(result.Order.User, result);
            }
            res.send(result);
        })
    });
}

exports.oldfindOrderExpireNotification = function (req, res) {
    let where = {};
    where.maxcheckoutdateutc = {
        [Op.lt]: Sequelize.literal("DATE_ADD(NOW(), INTERVAL 1 HOUR)"),
        [Op.gte]: Sequelize.literal("NOW()")
    };
    where.status = 1;
    where.mail = 0;
    OrderModel.findAll({
        where: where,
        include: [UserModel]
    }).then(function (resp) {
        async.eachSeries(resp, function (order, oCallback) {
            if (order.User) {
                appUtil.expireNotification(order);
                OrderModel.findByPk(order.id).then(function (resp1) {
                    resp1.update({ mail: 1 }).then(function (result) {

                    });
                })
            }

            oCallback();
        }, (err) => {
            return true;
        })
        return true;
    });
}

exports.findOrderExpireNotification = function (req, res) {
    let where = {};
    where.maxcheckoutdateutc = {
        [Op.lt]: Sequelize.literal("DATE_ADD(NOW(), INTERVAL 1 HOUR)"),
        [Op.gte]: Sequelize.literal("NOW()")
    };
    where.status = 1;
    where.mail = 0;
    OrderHistoryModel.findAll({
        where: where,
        include: [UserModel]
    }).then(function (resp) {
        async.eachSeries(resp, function (order, oCallback) {
            if (order.User) {
                appUtil.expireNotification(order);
                OrderHistoryModel.findByPk(order.id).then(function (resp1) {
                    resp1.update({ mail: 1 }).then(function (result) {

                    });
                })
            }

            oCallback();
        }, (err) => {
            return true;
        })
        return true;
    });
}

exports.findOrderExpireNotificationTemp = function (req, res) {
    let where = {};
    where.maxcheckoutdateutc = {
        [Op.lt]: Sequelize.literal("DATE_ADD(NOW(), INTERVAL 1 HOUR)"),
        [Op.gte]: Sequelize.literal("NOW()")
    };
    where.status = 1;
    where.mail = 0;
    OrderHistoryModel.findAll({
        where: where,
        include: [UserModel]
    }).then(function (resp) {
        // async.eachSeries(resp, function (order, oCallback) {
        //     if (order.User) {
        //         appUtil.expireNotification(order);
        //         OrderHistoryModel.findByPk(order.id).then(function (resp1) {
        //             resp1.update({ mail: 1 }).then(function (result) {

        //             });
        //         })
        //     }

        //     oCallback();
        // }, (err) => {
        //     // return true;
        //     res.send(err);
        // })
        res.send(resp);
    });
}

exports.updateDriverLicense = function (req, res) {
    var upload = multer({ storage: storage }).single('image');
    upload(req, res, function (err) {
        req.body.driverlicense = res.req.file && res.req.file.filename || req.body.driverlicense;
        OrderModel.findByPk(req.body.id).then(function (resp) {
            resp.update(req.body).then(function (result) {
                res.send(result);
            });
        })

    });
}

exports.userorders = function (req, res) {
    let result = { count: 0, data: [] };
    let offset = 0;
    let limit = 10000000;
    let where = {};
    where.user_id = req.params.id || null;
    where.status = 1;
    OrderModel.findAndCountAll({
        where: where
    }).then((output) => {
        result.count = output.count;
        OrderModel.findAll({
            where: where,
            include: [OrderHistoryModel, UserModel],
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

exports.userwallet = function (req, res) {
    let user_id = req.params.id || null;
    let whereObj = {
        maxcheckoutdate: {
            [Op.lte]: moment().toDate()
        },
        status: 1,
        // type: {
        //     [Op.ne]: 'wallet'
        // }
    };
    whereObj.user_id = user_id;
    OrderModel.findAll({
        where: whereObj,
        include: [OrderHistoryModel],
    }).then(async (orders) => {
        let totalAmountPaid = orders && orders.reduce(function (a, b) {
            return a + parseFloat(b.amountpaid);
        }, 0);
        /** Remove cancel amount - which immedietly added in wallet */
        let cancelAmountWithInCheckoutDate = 0;
        async.eachSeries(orders, function (order, oCallback) {
            async.eachSeries(order.Orderhistories, function (history, hCallback) {
                if (history.status == 0) {
                    cancelAmountWithInCheckoutDate += parseFloat(history.advancepaid);
                }
                hCallback();
            }, (err) => {
                oCallback();
            })

        });
        let totalWallet = totalAmountPaid - cancelAmountWithInCheckoutDate;

        let whereUser = {};
        whereUser.id = user_id;
        // let user = await UserModel.findOne({ where: whereUser });
        // let totalWallet = Number(totalAmountPaid) + Number(user.wallet);

        let whereWallet = {
            status: 1
        }
        whereWallet.user_id = user_id;
        let fromWallet = await OrderModel.findAll({
            where: whereWallet,
            include: [OrderHistoryModel],
        });
        /** Interest calculation */
        var currentInterest = 0;
        async.eachSeries(fromWallet, function (element, wCallback) {
            let fromDate = new Date(element.createdAt);
            let toDate = new Date();
            let diffTime = Math.abs(toDate - fromDate);
            let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            // let today = new Date();
            if (diffDays && element.amountpaid) {
                let months = (diffDays / 30);
                let interestAmount = (((element.amountpaid / 100) * (parseInt(months) * 4.79)) / 12).toFixed(2);
                currentInterest += parseFloat(interestAmount);
            }
            wCallback();
        })
        totalWallet += currentInterest;
        /** Wallet amount */
        // let totalWalletPaid = fromWallet && fromWallet.reduce(function (a, b) {
        //     // return a + parseFloat(b['fromwallet']);
        //     return a + (parseFloat(b['fromwallet']) || 0);
        // }, 0);




        let whereeWallet = {
            status: 1,
            user_id: user_id,
            maxcheckoutdate: {
                [Op.gte]: Sequelize.literal("NOW()")
                // [Op.lte]: moment().toDate()
            },
        }
        let fromeWallet = await OrderModel.findAll({
            where: whereeWallet,
            include: [OrderHistoryModel],
        });
        /** Wallet amount */
        let totalWalletPaid = fromeWallet && fromeWallet.reduce(function (a, b) {
            return a + (parseFloat(b['fromwallet']) || 0);
        }, 0);


        let currentWalletAmount = totalWallet - (totalWalletPaid || 0);
        /** Cancel amount add */
        let cancelAmount = 0;
        async.eachSeries(fromWallet, function (order, oCallback) {
            async.eachSeries(order.Orderhistories, function (history, hCallback) {
                if (history.status == 0) {
                    cancelAmount += parseFloat(history.advancepaid);
                }
                hCallback();
            }, (err) => {
                oCallback();
            })

        });
        currentWalletAmount += cancelAmount;
        /** Withdrawrequests */
        let whereWithdraw = {}
        whereWithdraw.status = {
            [Op.ne]: 2
        };
        whereWithdraw.user_id = user_id;
        let allWithdrawRequests = await WithdrawRequestModel.findAll({ where: whereWithdraw });
        let withdrawAmount = allWithdrawRequests && allWithdrawRequests.reduce(function (a, b) {
            return a + parseFloat(b['amount']);
        }, 0);
        currentWalletAmount = currentWalletAmount - withdrawAmount;

        res.send({ wallet: currentWalletAmount && currentWalletAmount.toFixed(2) || 0, interest: currentInterest && currentInterest.toFixed(2) });
        // res.send(orders);
    }).catch((err) => {
        res.status(500).send(err)
    })
}

exports.findExpiredOrderForInvoice = function (req, res) {
    let where = {};
    where.maxcheckoutdateutc = {
        [Op.lt]: Sequelize.literal("NOW()"),
        [Op.gte]: Sequelize.literal("DATE_SUB(NOW(), INTERVAL 1 HOUR)")
    };
    where.status = 1;
    where.invoice = 0;
    OrderHistoryModel.findAll({
        // attributes: [
        //     "*", Sequelize.literal("TIMESTAMPDIFF(MINUTE, checkindate, checkoutdate) AS minutes_diff"),
        //     // [Sequelize.fn('TIMESTAMPDIFF', Sequelize.col('checkindate'), Sequelize.col('checkoutdate'), 'MINUTE'), 'minutes_diff']
        // ],
        where: where,
        include: [UserModel, OrderModel],
        // raw: true
    }).then(function (resp) {
        async.eachSeries(resp, function (order, oCallback) {
            let invoiceResp = { user: {}, product: {} };
            async function core() {
                if (order.User && order.Order && order.Order.status == 1) {
                    let firstOrder;
                    try {
                        firstOrder = await OrderHistoryModel.findOne({
                            where: {
                                user_id: order.User.id,
                                invoice: 1
                            }
                        });
                    } catch (e) {
                        console.error('findExpiredOrderForInvoice Await exception: ', e);
                    }
                    let extrasOrder;
                    try {
                        extrasOrder = await OrderHistoryModel.findAll({
                            where: {
                                order_id: order.order_id,
                                extra_id: { [Op.ne]: null }
                            }
                        });
                    } catch (e) {
                        console.error('extrasOrder Await exception: ', e);
                    }
                    let user = {}
                    user.name = order.User.firstname + ' ' + (order.User.lastname || '');
                    user.email = order.User.email;
                    user.phone = order.User.phone || '';
                    user.address = {
                        line1: order.User.vesiginghuisnr || '',
                        line2: order.User.vesigingstraat || '',
                        city: order.User.vesigingplaats || '',
                        state: '',
                        country: order.User.vesigingland || '',
                        postal_code: order.User.vesigingpostcode || '',
                    };
                    // user.shipping = user;
                    user.shipping = {
                        name: order.User.firstname + ' ' + (order.User.lastname || ''),
                        phone: order.User.phone || '',
                        address: {
                            line1: order.User.factuurhuisnr || '',
                            line2: order.User.factuurstraat || '',
                            city: order.User.factuurplaats || '',
                            state: '',
                            country: order.User.factuurland || '',
                            postal_code: order.User.factuurpostcode || '',
                        }
                    };

                    invoiceResp.user = user;
                    let minutes_diff = order.minutes_diff;
                    let discount = null;
                    if (!firstOrder || (firstOrder && !firstOrder.id)) {
                        // minutes_diff = minutes_diff - 60; // Reduce 1 hr for first order
                        discount = {
                            description: "1 uur korting",
                            price: ((order.price * (1)) * 100).toFixed(2)
                        }
                    }
                    let checkin = new Date(order.checkindate);
                    let checkinDateNew = checkin.toDateString() + " " + checkin.toLocaleTimeString();;
                    let checkout = new Date(order.checkoutdate);
                    let checkoutDateNew = checkout.toDateString() + " " + checkout.toLocaleTimeString();;
                    let product = {
                        description: order.name + " ( " + checkinDateNew + " - " + checkoutDateNew + " )" || '',
                        price: ((order.price * (minutes_diff / 60)) * 100).toFixed(2)
                    };
                    invoiceResp.product = product;
                    invoiceResp.discount = discount;
                    invoiceResp.extrasOrder = extrasOrder;
                    appUtil.sendInvoice(invoiceResp).then(function (resp) {
                        let invId = resp.msg;
                        OrderHistoryModel.findByPk(order.id).then(function (resp1) {
                            resp1.update({ invoice: 1, invoiceid: invId }).then(function (result) {
                                oCallback();
                            });
                        })
                    });
                }
                else {
                    oCallback();
                }
                console.log(invoiceResp);

            }
            core();
        }, (err) => {
            return true;
        })
    });
}

//Invoice
exports.invoiceslist = function (req, res) {
    let where = { invoice: 1, user_id: req.params.id, invoiceid: { [Op.ne]: null } }
    OrderHistoryModel.findAll({
        where,
        order: [
            ['createdAt', 'DESC']
        ],
    }).then(function (result) {
        res.send(result);
    }, function (err) {
        res.status(500).send(err);
    })
}


exports.userfindinvoice = async function (req, res) {
    const invoice = await stripe.invoices.retrieve(
        req.params.id
    );
    res.send(invoice);
}

/** Screenshots  */
// exports.upsertScreenshots = function (req, res) {
//     // var upload = multer({ storage: storage }).single('thumbnail');
//     var upload = multer({ storage: screenShotStorage }).fields([{
//         name: 'initialimage1',
//         maxCount: 1
//     }, {
//         name: 'initialimage2',
//         maxCount: 1
//     }, {
//         name: 'initialimage3',
//         maxCount: 1
//     }, {
//         name: 'initialimage4',
//         maxCount: 1
//     }, {
//         name: 'completedimage1',
//         maxCount: 1
//     }, {
//         name: 'completedimage2',
//         maxCount: 1
//     }, {
//         name: 'completedimage3',
//         maxCount: 1
//     }, {
//         name: 'completedimage4',
//         maxCount: 1
//     }, {
//         name: 'additionstartimage',
//         maxCount: 1
//     }, {
//         name: 'additionendimage',
//         maxCount: 1
//     }
//     ]);
//     upload(req, res, function (err) {
//         if (err) {
//             res.status(500).send(err)
//         }
//         ScreenshotModel.findOne({
//             where: { orderhistory_id: req.body.orderhistory_id, status: 1 },
//         }).then(function (resp) {
//             if (resp) {
//                 req.body.initialimage1 = res.req.files && (res.req.files.initialimage1 && res.req.files.initialimage1[0].filename) || resp.initialimage1;
//                 req.body.initialimage2 = res.req.files && (res.req.files.initialimage2 && res.req.files.initialimage2[0].filename) || resp.initialimage2;
//                 req.body.initialimage3 = res.req.files && (res.req.files.initialimage3 && res.req.files.initialimage3[0].filename) || resp.initialimage3;
//                 req.body.initialimage4 = res.req.files && (res.req.files.initialimage4 && res.req.files.initialimage4[0].filename) || resp.initialimage4;
//                 req.body.completedimage1 = res.req.files && (res.req.files.completedimage1 && res.req.files.completedimage1[0].filename) || resp.completedimage1;
//                 req.body.completedimage2 = res.req.files && (res.req.files.completedimage2 && res.req.files.completedimage2[0].filename) || resp.completedimage2;
//                 req.body.completedimage3 = res.req.files && (res.req.files.completedimage3 && res.req.files.completedimage3[0].filename) || resp.completedimage3;
//                 req.body.completedimage4 = res.req.files && (res.req.files.completedimage4 && res.req.files.completedimage4[0].filename) || resp.completedimage4;
//                 req.body.additionstartimage = res.req.files && (res.req.files.additionstartimage && res.req.files.additionstartimage[0].filename) || resp.additionstartimage;
//                 req.body.additionendimage = res.req.files && (res.req.files.additionendimage && res.req.files.additionendimage[0].filename) || resp.additionendimage;
//                 resp.update(req.body).then(function (result) {
//                     res.send(result);
//                 }).catch((err) => {
//                     res.status(500).send(err)
//                 })
//             } else {
//                 req.body.initialimage1 = res.req.files && (res.req.files.initialimage1 && res.req.files.initialimage1[0].filename) || null;
//                 req.body.initialimage2 = res.req.files && (res.req.files.initialimage2 && res.req.files.initialimage2[0].filename) || null;
//                 req.body.initialimage3 = res.req.files && (res.req.files.initialimage3 && res.req.files.initialimage3[0].filename) || null;
//                 req.body.initialimage4 = res.req.files && (res.req.files.initialimage4 && res.req.files.initialimage4[0].filename) || null;
//                 req.body.completedimage1 = res.req.files && (res.req.files.completedimage1 && res.req.files.completedimage1[0].filename) || null;
//                 req.body.completedimage2 = res.req.files && (res.req.files.completedimage2 && res.req.files.completedimage2[0].filename) || null;
//                 req.body.completedimage3 = res.req.files && (res.req.files.completedimage3 && res.req.files.completedimage3[0].filename) || null;
//                 req.body.completedimage4 = res.req.files && (res.req.files.completedimage4 && res.req.files.completedimage4[0].filename) || null;
//                 req.body.additionstartimage = res.req.files && (res.req.files.additionstartimage && res.req.files.additionstartimage[0].filename) || null;
//                 req.body.additionendimage = res.req.files && (res.req.files.additionendimage && res.req.files.additionendimage[0].filename) || null;
//                 ScreenshotModel.create(req.body).then(function (respp) {
//                     res.send(respp);
//                 }).catch((err) => {
//                     res.status(500).send(err)
//                 })
//             }
//         });
//     })
// }

exports.getscreenshot = async function (req, res) {
    try {
        const screenshots = await ScreenshotModel.findOne({
            where: { orderhistory_id: req.body.orderhistory_id },
        });
        res.send(screenshots);
    } catch (err) {
        console.error('Error fetching screenshots:', err);
        res.status(500).send('Internal Server Error');
    }
};


exports.upsertScreenshots = function (req, res) {
    ScreenshotModel.findOne({
        where: { orderhistory_id: req.body.orderhistory_id, status: 1 },
    }).then(function (resp) {
        if (resp) {
            updateImages(req, res, resp);
        } else {
            createImages(req, res);
        }
    });
}

function updateImages(req, res, resp) {
    const updateFields = ['initialimage1', 'initialimage2', 'initialimage3', 'initialimage4', 'completedimage1', 'completedimage2', 'completedimage3', 'completedimage4', 'additionstartimage', 'additionendimage', 'reportimage1', 'reportimage2', 'reportimage3', 'reportimage4'];

    updateFields.forEach((fieldName) => {
        let base64Data = req.body[fieldName];
        if (base64Data) {
            base64Data = base64Data.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            let format = fieldName + "Format";
            const filename = `${fieldName}-${Date.now()}.${req.body[format]}`; // Adjust the extension as needed

            fs.writeFileSync(`./public/uploads/screenshot/${filename}`, buffer);

            req.body[fieldName] = filename;
        }
    });

    resp.update(req.body).then(function (result) {
        res.send(result);
    }).catch((err) => {
        res.status(500).send(err);
    });
}

function createImages(req, res) {
    const createFields = ['initialimage1', 'initialimage2', 'initialimage3', 'initialimage4', 'completedimage1', 'completedimage2', 'completedimage3', 'completedimage4', 'additionstartimage', 'additionendimage'];

    createFields.forEach((fieldName) => {
        let base64Data = req.body[fieldName];
        if (base64Data) {
            base64Data = base64Data.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            let format = fieldName + "Format";
            const filename = `${fieldName}-${Date.now()}.${req.body[format]}`; // Adjust the extension as needed

            fs.writeFileSync(`./public/uploads/screenshot/${filename}`, buffer);

            req.body[fieldName] = filename;
        }
    });

    ScreenshotModel.create(req.body).then(function (respp) {
        res.send(respp);
    }).catch((err) => {
        res.status(500).send(err);
    });
};
exports.orderHistoryUpdate = function (req, res) {
    OrderHistoryModel.findByPk(req.body.id).then(function (resp1) {
        resp1.update(req.body).then(function (result) {
            res.send(result);
        }).catch((err) => {
            res.status(500).send(err)
        })
    })
}

// exports.productIdeal = async function (req, res) {
//     stripeAmount = req.body.total * 100;
//     let pName = req.body.pname;

//     const session = await stripe.checkout.sessions.create({
//         line_items: [{
//             price_data: {
//                 // To accept `ideal`, all line items must have currency: eur
//                 currency: 'EUR',
//                 product_data: {
//                     name: pName,
//                     metadata: {
//                         'id': '',
//                         'name': pName
//                     }
//                 },
//                 unit_amount: Math.round(stripeAmount),
//             },
//             quantity: 1,
//         }],
//         payment_method_types: [
//             'card',
//             'ideal',
//         ],
//         mode: 'payment',
//         invoice_creation: { enabled: true },
//         success_url: `${process.env.appUrl}payment-success`,
//         cancel_url: `${process.env.appUrl}payment-failure`,
//     });

//     res.json({ url: session.url, paymentchargeid: session.payment_intent }) // <-- this is the changed line

//     // const encInput = Buffer.from(JSON.stringify(req.body)).toString('base64');

// }

exports.productIdeal = async function (req, res) {
    try {
        stripeAmount = req.body.total * 100;
        let pName = req.body.pname;

        const session = await stripe.checkout.sessions.create({
            line_items: [{
                price_data: {
                    currency: 'EUR',
                    product_data: {
                        name: pName,
                        metadata: {
                            'id': '',
                            'name': pName
                        }
                    },
                    unit_amount: Math.round(stripeAmount),
                },
                quantity: 1,
            }],
            payment_method_types: ['card', 'ideal'],
            mode: 'payment',
            success_url: `${process.env.appUrl}payment-mobile-success`,
            cancel_url: `${process.env.appUrl}payment-mobile-failure`,
        });

        const isOrder = await OrderModel.findOne({
            where: {
                id: req.body.id
            }
        });

        if (isOrder) {
            const updatedOrder = isOrder.toJSON();
            updatedOrder.intentid = session.payment_intent;
            await OrderModel.update(updatedOrder, { where: { id: req.body.id } });
            res.json({ url: session.url, paymentchargeid: session.payment_intent, sessionId: session.id });
        } else {
            res.status(500).send('Order not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


exports.paymentWebhook = async function (req, res) {
    const event = req.body;
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            var isOrder = await OrderModel.findOne({
                where: {
                    intentid: paymentIntent.id
                },
                include: [UserModel]
            });
            if (isOrder) {
                const updatedOrder = isOrder.toJSON();
                updatedOrder.status = 1;
                await OrderModel.update(updatedOrder, { where: { intentid: paymentIntent.id } });
                const allHistories = await OrderHistoryModel.findAll({ where: { order_id: isOrder.id, extra_id: null} });

                // Loop through histories and send order confirmation emails
                if (allHistories && Array.isArray(allHistories) && allHistories.length > 0) {
                    for (let i = 0; i < allHistories.length; i++) {
                        allHistories[i].user = isOrder.User;
                        appUtil.sendOrderConfirmationMail(allHistories[i], isOrder.type);
                    }
                }

            } else {
                res.status(500).send('Order not found');
            }
            break;
        case 'payment_method.canceled':
            const paymentMethod = event.data.object;
            isOrder = await OrderModel.findOne({
                where: {
                    intentid: paymentMethod.id
                }
            });
            if (isOrder) {
                const updatedOrder = isOrder.toJSON();
                updatedOrder.status = 2;
                await OrderModel.update(updatedOrder, { where: { intentid: paymentMethod.id } });
            } else {
                res.status(500).send('Order not found');
            }
            break;
        case 'payment_method.payment_failed':
            const paymentFailed = event.data.object;
            isOrder = await OrderModel.findOne({
                where: {
                    intentid: paymentFailed.id
                }
            });
            if (isOrder) {
                const updatedOrder = isOrder.toJSON();
                updatedOrder.status = 2;
                await OrderModel.update(updatedOrder, { where: { intentid: paymentFailed.id } });
            } else {
                res.status(500).send('Order not found');
            }
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    res.json({ received: true }); // Corrected from 'response.json' to 'res.json'
}



//invitations
exports.invitations = function (req, res) {
    let where = { orderhistory_id: req.body.id, owner: { [Op.ne]: 1 } }
    OrderSharingModel.findAll({
        where,
        include: [
            UserModel,
        ],
        order: [
            ['createdAt', 'DESC']
        ],
    }).then(function (result) {
        res.send(result);
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.createinvitation = async function (req, res) {
    try {
        let user = await UserModel.findOne({
            where: { email: req.body.email }
        });
        if (user) {
            let userOrder = await OrderSharingModel.findOne({
                where: { user_id: user.id, orderhistory_id: req.body.id }
            });
            if (userOrder) {
                res.status(500).send('Already user can added to this booking');
            } else {
                var obj = {
                    user_id: user.id,
                    orderhistory_id: req.body.id,
                    owner: 0
                }
                let createdEntry = await OrderSharingModel.create(obj);
                res.send(createdEntry || null);
            }
        } else {
            res.status(500).send('Email not found');
        }
    } catch (err) {
        res.status(500).send(err.message || 'Internal Server Error');
    }
};

exports.removeinvitation = async function (req, res) {
    try {
        let result = await OrderSharingModel.destroy({ where: { user_id: req.body.userid, orderhistory_id: req.body.orderhistory_id } });
        res.status(200).send({ user: result });
    } catch (err) {
        res.status(500).send(err.message || 'Internal Server Error');
    }
};

exports.updateRead = function (req, res) {
    OrderModel.findByPk(req.body.id).then(function (result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.updateUserRead = function (req, res) {
    UserModel.findByPk(req.body.id).then(function (result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.updateWithdrawRead = function (req, res) {
    WithdrawRequestModel.findByPk(req.body.id).then(function (result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.getunReadOrders = function (req, res) {
    let where = {isreaded: 0, status: 1}
    OrderModel.findAndCountAll({
        where
    }).then(function (result) {
        res.send(result);
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.getunReadUsers = function (req, res) {
    let where = {isreaded: 0}
    UserModel.findAndCountAll({
        where
    }).then(function (result) {
        res.send(result);
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.getunReadWithdraw = function (req, res) {
    let where = {isreaded: 0}
    WithdrawRequestModel.findAndCountAll({
        where
    }).then(function (result) {
        res.send(result);
    }, function (err) {
        res.status(500).send(err);
    })
}