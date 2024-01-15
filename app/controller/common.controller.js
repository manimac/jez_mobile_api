const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const bcrypt = require('bcrypt-nodejs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const async = require('async');
const moment = require('moment');
// const fbadmin = require('../../config/firebase');
// import { fbadmin } from '../../config/firebase';
const appUtil = require('../apputil');
const MODELS = require("../models");
const userModel = MODELS.users;
const HomeModel = MODELS.home;
const FaqModel = MODELS.faq;
const AboutModel = MODELS.about;
const TermAndCondModel = MODELS.termandcondition;
const ContactModel = MODELS.contactus;
const EnquiryModel = MODELS.enquiry;
const LocationModel = MODELS.location;
const FilterModel = MODELS.filter;
const TeamModel = MODELS.team;
const WithdrawRequestModel = MODELS.withdrawrequest;
const FilterLocationModel = MODELS.filterlocation;
const OrderModel = MODELS.order;
const CouponModel = MODELS.coupon;
const AdvertisementModel = MODELS.advertisement;
const CertificateModel = MODELS.certificate;
const CategoryModel = MODELS.category;
const StaffOrTransportRequestModel = MODELS.staffOrTransportRequest;
const EmployeeCategoryModel = MODELS.employeecategory;
RandExp = require('randexp');
const request = require('request');

// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var dir = './public/uploads/home'
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)) // Appending the extension
    }
})

exports.getTermAndCondition = function (req, res) {
    TermAndCondModel.findOne({
        // where: {
        //     status: 1
        // }
    }).then(function (resp) {
        res.send(resp);
    }, (err) => {
        res.status(500).send(err);
    })
}

exports.getFilterOptions = async function (req, res) {
    try {
        const [categoryResp, staffOrTransportResp] = await Promise.all([
            CategoryModel.findAll({}),
            StaffOrTransportRequestModel.findAll({where: req.body, attributes: ['title', 'id', 'category_id']})
        ]);

        let userCategories; // Declare userCategories outside the if block

        if (req.body.employee_id) {
            userCategories = await EmployeeCategoryModel.findAll({
                where: { employee_id: req.body.employee_id },
                include: [CategoryModel]
            });
        }

        if (categoryResp && staffOrTransportResp) {
            categoryResp.forEach(category => {
                category.staffing = staffOrTransportResp
                    .filter(item => item.category_id === category.id)
                    .map(item => ({ title: item.title, id: item.id }));
            });
        }

        res.send({
            category: categoryResp || [],
            staffTransport: staffOrTransportResp || [],
            userCategories: userCategories || []
        });
    } catch (err) {
        res.status(500).send(err);
    }
};


exports.withdrawRequests = function (req, res) {
    let user_id = appUtil.getUser(req.headers.authorization).id || null;
    let where = {};
    if (req.body.frontend) {
        where.user_id = user_id;
    }
    WithdrawRequestModel.findAll({
        where: where,
        include: [userModel],
        // order: [
        //     ['updatedAt', 'DESC']
        // ]
    }).then(function (entries) {
        res.send(entries || null)
    }, function (err) {
        res.status(500).send(err);
    })
}


exports.resetPassword = async function (req, res) {
    // let email = Buffer.from(req.body.user, 'base64').toString('ascii')
    let email = req.body.email;
    let alreadyuser = await userModel.findOne({
        where: {
            [Op.or]: [{ 'email': email }, { 'phone': email }]
        }
    });
    if (alreadyuser) {
        user = alreadyuser.toJSON();
        var randomstring1 = new RandExp(/^[A-Z]/);
        var randomstring2 = new RandExp(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,10}$/);
        // res.status(200).send({ message: randomstring1.gen()+randomstring2.gen() });
        // var randomstring = Math.random().toString(36).slice(-8);
        var randomstring = randomstring1.gen() + randomstring2.gen();
        user.password = bcrypt.hashSync(randomstring, bcrypt.genSaltSync(8), null);
        alreadyuser.update(user).then(data => {
            appUtil.resetedPassword(alreadyuser, randomstring);
            res.status(200).send({ message: 'Password hasbeen reseted' });
        }, (err) => {
            res.status(500).send({ message: 'User Update Error' });
        });
    } else {
        res.status(500).send('User not found');
    }
}



exports.resetPasswordAdmin = async function (req, res) {
    let email = req.body.email;
    let id = req.body.id;
    let alreadyuser = await userModel.findOne({
        where: {
            'email': email,
            'id': id
        }
    });
    if (alreadyuser) {
        user = alreadyuser.toJSON();
        user.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
        alreadyuser.update(user).then(data => {
            appUtil.resetedPassword(alreadyuser, req.body.password);
            res.status(200).send({ message: 'Password hasbeen reseted' });
        }, (err) => {
            res.status(500).send({ message: 'User Update Error' });
        });
    } else {
        res.status(500).send('User not found');
    }
}


/** Filters */
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
exports.filtersByGroup = function (req, res) {
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
        ],
        group: ['category']
    }).then(function (entries) {
        res.send(entries || null)
    });
}
exports.filtersOptions = function (req, res) {
    FilterModel.findAll({
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(function (entries) {
        res.send(entries || null)
    });
}
exports.createFilter = function (req, res) {
    FilterModel.create(req.body).then(function () {
        res.send(req.body);
    }, function (err) {
        res.status(500).send(err);
    })
}
exports.updateFilter = function (req, res) {
    FilterModel.findByPk(req.body.id).then(function (result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}
exports.deleteFilter = function (req, res) {
    FilterModel.findByPk(req.params.id).then(function (result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}

/** FAQ */
exports.faqs = function (req, res) {
    FaqModel.findAll({
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
exports.createFaq = function (req, res) {
    FaqModel.create(req.body).then(function () {
        res.send(req.body);
    }, function (err) {
        res.status(500).send(err);
    })
}
exports.updateFaq = function (req, res) {
    FaqModel.findByPk(req.body.id).then(function (result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}
exports.deleteFaq = function (req, res) {
    FaqModel.findByPk(req.params.id).then(function (result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}

/** Contact Us */
exports.contactus = function (req, res) {
    ContactModel.findAll({
        where: {
            //'status': 1
        },
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(function (entries) {
        res.send(entries || null)
    });
}
exports.createContact = function (req, res) {
    ContactModel.create(req.body).then(function () {
        res.send(req.body);
    }, function (err) {
        res.status(500).send(err);
    })
}
exports.updateContact = function (req, res) {
    ContactModel.findByPk(req.body.id).then(function (result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}
exports.deleteContact = function (req, res) {
    ContactModel.findByPk(req.params.id).then(function (result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}

/** Enquiry  */
exports.enquiries = function (req, res) {
    EnquiryModel.findAll({
        where: {
            //'status': 1
        },
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(function (entries) {
        res.send(entries || null)
    });
}
exports.createEnquiry = function (req, res) {
    EnquiryModel.create(req.body).then(function () {
        res.send(req.body);
    }, function (err) {
        res.status(500).send(err);
    })
}
exports.updateEnquiry = function (req, res) {
    EnquiryModel.findByPk(req.body.id).then(function (result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}
exports.deleteEnquiry = function (req, res) {
    EnquiryModel.findByPk(req.params.id).then(function (result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.getHome = function (req, res) {
    HomeModel.findOne().then(function (resp) {
        res.send(resp);
    }, (err) => {
        res.status(500).send(err);
    })
}
exports.getAboutUs = function (req, res) {
    AboutModel.findOne({
        // where: {
        //     status: 1
        // }
    }).then(function (resp) {
        res.send(resp);
    }, (err) => {
        res.status(500).send(err);
    })
}

exports.getLocation = function (req, res) {
    LocationModel.findOne({
        // where: {
        //     status: 1
        // }
    }).then(function (resp) {
        res.send(resp);
    }, (err) => {
        res.status(500).send(err);
    })
}

exports.updateHome = function (req, res) {
    var upload = multer({ storage: storage }).single('logo');
    upload(req, res, function (err) {
        req.body.logo = res.req.file && res.req.file.filename || req.body.logo;
        HomeModel.findOne().then(function (resp) {
            if (resp) {
                req.body.updated_by = appUtil.getUser(req.headers.authorization).id || null;
                resp.update(req.body).then(function (result) {
                    res.send(result);
                })
            } else {
                req.body.created_by = appUtil.getUser(req.headers.authorization).id || null;
                req.body.updated_by = req.body.created_by;
                delete req.body.id;
                HomeModel.create(req.body).then(function (respp) {
                    res.send(respp);
                })
            }
        }, (err) => {
            res.status(500).send(err);
        })
    });
}

exports.updatePeekHour = function (req, res) {

    StaffingModel.findAll({
        where: {
            status: 1
        }
    }).then(function (resp) {
        async.eachSeries(resp, function (res, callback) {
            let peekpriceperhr = 0
            if (req.body.peekstaffing)
                peekpriceperhr = (res.priceperhr * req.body.peekstaffing) / 100;
            res.update({ peekpriceperhr: peekpriceperhr }).then(function (rep) {
                callback();
            })
        })
    });


    TransportModel.findAll({
        where: {
            status: 1
        }
    }).then(function (resp) {
        async.eachSeries(resp, function (res, callback) {
            let peekpriceperhr = 0;
            if (req.body.peekvehicle)
                peekpriceperhr = (res.priceperhr * req.body.peektransport) / 100;
            res.update({ peekpriceperhr: peekpriceperhr }).then(function (rep) {
                callback();
            })
        })
    });


    VehicleModel.findAll({
        where: {
            status: 1
        }
    }).then(function (resp) {
        async.eachSeries(resp, function (res, callback) {
            let peekpriceperhr = 0;
            if (req.body.peektransport)
                peekpriceperhr = (res.priceperhr * req.body.peekvehicle) / 100;
            res.update({ peekpriceperhr: peekpriceperhr }).then(function (rep) {
                callback();
            })
        })
    });

    // Update Home ve
    HomeModel.findOne({
        where: {
            status: 1
        }
    }).then(function (resp) {
        let home = { peekvehicle: (req.body.peekvehicle || 0), peekstaffing: (req.body.peekstaffing || 0), peektransport: (req.body.peektransport || 0) };
        resp.update(home).then(function (updateRes) {
            res.send({ success: 1 });
        })
    });
}

exports.updateAboutUs = function (req, res) {
    // var upload = multer({ storage: storage }).single('image');
    // upload(req, res, function(err) {
    //     req.body.image = res.req.file && res.req.file.filename || req.body.image;
    AboutModel.findOne({
        where: {
            id: 1
        }
    }).then(function (resp) {
        if (resp) {
            // req.body.updated_by = appUtil.getUser(req.headers.authorization).id || null;
            resp.update(req.body).then(function (result) {
                res.send(result);
            })
        } else {
            // req.body.created_by = appUtil.getUser(req.headers.authorization).id || null;
            // req.body.updated_by = req.body.created_by;
            delete req.body.id;
            AboutModel.create(req.body).then(function (respp) {
                res.send(respp);
            })
        }
    }, (err) => {
        res.status(500).send(err);
    })
    // });
}



exports.upsertTeam = function (req, res) {
    // var upload = multer({ storage: storage }).single('image');
    // upload(req, res, function(err) {
    //     req.body.image = res.req.file && res.req.file.filename || req.body.image;
    TeamModel.findOne({
        where: {
            id: 1
        }
    }).then(function (resp) {
        if (resp) {
            // req.body.updated_by = appUtil.getUser(req.headers.authorization).id || null;
            resp.update(req.body).then(function (result) {
                updateTeamIdInUser(result.user_id, result.id);
                updateTeamIdInOrder(result.user_id, result.id);
                res.send(result);
            })
        } else {
            req.body.user_id = appUtil.getUser(req.headers.authorization).id || null;
            req.body.isowner = 1;

            // req.body.updated_by = req.body.created_by;
            delete req.body.id;
            TeamModel.create(req.body).then(function (respp) {
                updateTeamIdInUser(respp.user_id, respp.id);
                updateTeamIdInOrder(respp.user_id, respp.id);
                res.send(respp);
            })
        }
    }, (err) => {
        res.status(500).send(err);
    })
    // });
}

function updateTeamIdInUser(user_id, team_id) {
    userModel.findOne({
        where: {
            id: user_id
        }
    }).then(function (resp) {
        resp.update({ team_id: team_id, teamowner: 1 }).then(function (result) {
            res.send(result);
        })
    })
}

function updateTeamIdInOrder(user_id, team_id) {
    OrderModel.findOne({
        where: {
            user_id: user_id
        }
    }).then(function (resp) {
        resp.update({ team_id: team_id }).then(function (result) {
            res.send(result);
        })
    })
}

exports.teams = function (req, res) {
    let user_id = appUtil.getUser(req.headers.authorization).id || null;
    TeamModel.findAll({
        where: {
            'status': 1,
            'user_id': user_id
        },
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(function (entries) {
        res.send(entries || null)
    });
}

exports.teamMembers = function (req, res) {
    if (req.body.team_id) {
        userModel.findAll({
            where: {
                'status': 1,
                'team_id': req.body.team_id,
                'teamowner': {
                    [Op.ne]: 1
                }
            }
        }).then(function (entries) {
            res.send(entries || null)
        });
    } else {
        res.send([]);
    }
}

exports.deleteTeam = function (req, res) {
    TeamModel.findByPk(req.params.id).then(function (result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.updateTermAndCond = function (req, res) {
    // var upload = multer({ storage: storage }).single('image');
    // upload(req, res, function(err) {
    //     req.body.image = res.req.file && res.req.file.filename || req.body.image;
    TermAndCondModel.findOne({
        where: {
            id: 1
        }
    }).then(function (resp) {
        if (resp) {
            // req.body.updated_by = appUtil.getUser(req.headers.authorization).id || null;
            resp.update(req.body).then(function (result) {
                res.send(result);
            })
        } else {
            // req.body.created_by = appUtil.getUser(req.headers.authorization).id || null;
            // req.body.updated_by = req.body.created_by;
            delete req.body.id;
            TermAndCondModel.create(req.body).then(function (respp) {
                res.send(respp);
            })
        }
    }, (err) => {
        res.status(500).send(err);
    })
    // });
}

exports.updateLocation = function (req, res) {
    var upload = multer({ storage: storage }).single('banner');
    upload(req, res, function (err) {
        req.body.banner = res.req.file && res.req.file.filename || req.body.banner;
        LocationModel.findOne().then(function (resp) {
            if (resp) {
                // req.body.updated_by = appUtil.getUser(req.headers.authorization).id || null;
                resp.update(req.body).then(function (result) {
                    res.send(result);
                })
            } else {
                // req.body.created_by = appUtil.getUser(req.headers.authorization).id || null;
                // req.body.updated_by = req.body.created_by;
                delete req.body.id;
                LocationModel.create(req.body).then(function (respp) {
                    res.send(respp);
                })
            }
        }, (err) => {
            res.status(500).send(err);
        })
    });
}


/** Filter Location */
exports.allFilterLocations = function (req, res) {
    FilterLocationModel.findAll({
        // where: {
        //     'status': 1
        // },
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(function (entries) {
        res.send(entries || null)
    });
}
exports.createFilterLocation = function (req, res) {
    FilterLocationModel.create(req.body).then(function () {
        res.send(req.body);
    }, function (err) {
        res.status(500).send(err);
    })
}
exports.updateFilterLocation = function (req, res) {
    FilterLocationModel.findByPk(req.body.id).then(function (result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}
exports.deleteFilterLocation = function (req, res) {
    FilterLocationModel.findByPk(req.params.id).then(function (result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}



exports.sendPaymentLink = function (req, res) {
    let user = { email: req.body.factuuremail };

    userModel.findOne({
        where: {
            'email': req.body.factuuremail
        }
    }).then(function (response) {
        let data = Buffer.from(req.body && req.body.id.toString()).toString('base64');
        response.data = data;
        appUtil.sendPaymentLink(response);
        res.send(user);
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.createWithdrawRequest = function (req, res) {
    req.body.status = '3'; // Withdraw request raised
    WithdrawRequestModel.create(req.body).then(function () {
        res.send(req.body);
    }, function (err) {
        res.status(500).send(err);
    })
}
exports.updateWithdrawRequest = function (req, res) {
    WithdrawRequestModel.findByPk(req.body.id).then(function (result) {
        result.update(req.body).then((resp) => {
            if (req.body.status == 1) {
                appUtil.withdrawRequest(req.body.user, "Accepted");
            } else if (req.body.status == 2) {
                appUtil.withdrawRequest(req.body.user, "Rejected");
            }
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}



exports.deleteWithdrawReques = function (req, res) {
    WithdrawRequestModel.findByPk(req.params.id).then(function (result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}

/** Coupon */
exports.coupons = function (req, res) {
    let result = { count: 0, data: [] };
    let offset = req.body.offset || 0;
    let limit = req.body.limit || 1000;
    let where = {};
    if (req.body.status) {
        where.status = req.body.status;
    }
    CouponModel.findAndCountAll({
        where: where
    }).then((output) => {
        result.count = output.count;
        CouponModel.findAll({
            where: where,
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

exports.createCoupon = function (req, res) {
    CouponModel.create(req.body).then(function () {
        res.send(req.body);
    }, function (err) {
        res.status(500).send(err);
    })
}
exports.updateCoupon = function (req, res) {
    CouponModel.findByPk(req.body.id).then(function (result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}
exports.deleteCoupon = function (req, res) {
    CouponModel.findByPk(req.params.id).then(function (result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.checkCouponUsed = function (req, res) {
    const user_id = appUtil.getUser(req.headers.authorization).id || null;
    let current = moment();
    let where = {};
    where.status = 1;
    where.code = req.body.code;
    CouponModel.findOne({ where: where }).then((coupon) => {
        if (coupon) {
            const startDate = moment(coupon.start).startOf('day');
            const endDate = moment(coupon.end).endOf('day');
            const isBetween = current.isBetween(startDate, endDate);
            if (isBetween) {
                let oWwhere = {
                    user_id: user_id,
                    coupon_id: coupon.id
                };
                OrderModel.findOne({ where: oWwhere }).then((resp) => {
                    if (resp)
                        res.status(500).send({ message: 'You have already used this coupon code' });
                    else
                        res.send({ message: 'Coupon valid', price: coupon.price, coupon_id: coupon.id });
                })
            } else {
                res.status(500).send({ message: 'Coupon expired' });
            }
        } else {
            res.status(500).send({ message: 'Coupon not found' });
        }
    })
}


/** Location */
exports.location = function (req, res) {
    LocationModel.findAll({
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(function (entries) {
        res.send(entries || null)
    });
}
exports.createlocation = function (req, res) {
    LocationModel.create(req.body).then(function () {
        res.send(req.body);
    }, function (err) {
        res.status(500).send(err);
    })
}
exports.updatelocation = function (req, res) {
    LocationModel.findByPk(req.body.id).then(function (result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}
exports.deletelocation = function (req, res) {
    LocationModel.findByPk(req.params.id).then(function (result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}


/** Advertisement */
exports.advertisement = function (req, res) {
    AdvertisementModel.findAll({
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(function (entries) {
        res.send(entries || null)
    });
}
exports.createadvertisement = function (req, res) {
    var upload = multer({ storage: storage }).single('image');
    upload(req, res, function (err) {
        let returns = null;
        req.body.image = res.req.file && res.req.file.filename || req.body.userimage;
        AdvertisementModel.create(req.body).then(function (resp) {
            resp.update(req.body).then(function (result) {
                res.send(result);
            });
        })

    });
}
exports.updateadvertisement = function (req, res) {
    var upload = multer({ storage: storage }).single('image');
    upload(req, res, function (err) {
        let returns = null;
        req.body.image = res.req.file && res.req.file.filename || req.body.userimage;
        AdvertisementModel.findByPk(req.body.id).then(function (resp) {
            resp.update(req.body).then(function (result) {
                res.send(result);
            });
        })

    });
}
exports.deleteadvertisement = function (req, res) {
    AdvertisementModel.findByPk(req.params.id).then(function (result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.userwithdraws = function (req, res) {
    let user_id = req.params.id || null;
    let where = {};
    where.user_id = user_id;
    WithdrawRequestModel.findAll({
        where: where,
        include: [userModel],
        // order: [
        //     ['updatedAt', 'DESC']
        // ]
    }).then(function (entries) {
        res.send(entries || null)
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.subscribe = function (req, res) {
    appUtil.subscribeEmail(req.body.email);
    res.status(200).send({ message: 'Subscribed' });
}

exports.getcertificate = function (req, res) {
    CertificateModel.findOne({}).then(function (resp) {
        res.send(resp);
    }, (err) => {
        res.status(500).send(err);
    })
}

exports.updatecertificate = function (req, res) {
    CertificateModel.findOne({
        where: {
            id: 1
        }
    }).then(function (resp) {
        if (resp) {
            resp.update(req.body).then(function (result) {
                res.send(result);
            })
        } else {
            delete req.body.id;
            AboutModel.create(req.body).then(function (respp) {
                res.send(respp);
            })
        }
    }, (err) => {
        res.status(500).send(err);
    })
}

exports.mapautocomplete = function (req, res) {    
    const cOptions = {
        url: 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + req.body.input + "&key=AIzaSyDRzC2926nlZ0VOWTn9QbHrfbBCDtj8IR8",
        method: 'GET'
    };
    request(cOptions, function (err, resp) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else
            res.send(resp);
    });
}

exports.getPlaceById = function (req, res) {    
    const cOptions = {
        url: 'https://maps.googleapis.com/maps/api/place/details/json?place_id=' + req.body.input + "&key=AIzaSyDRzC2926nlZ0VOWTn9QbHrfbBCDtj8IR8",
        method: 'GET'
    };
    request(cOptions, function (err, resp) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else
            res.send(resp);
    });
}