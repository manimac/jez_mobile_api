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
const EmployerModel = MODELS.employer;
const EmployerUser = MODELS.employeruser;
const EmployeeCategoryModel = MODELS.employeecategory;
const EmployeeExperienceModel = MODELS.employeeexperiense;
const StaffOrTransportRequestModel = MODELS.staffOrTransportRequest;
const StaffOrTransportInterestModel = MODELS.staffOrTransportInterest;
const CategoryModel = MODELS.category;

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
exports.getEmployer = function (req, res) {
    const USER = appUtil.getUser(req.headers.authorization);
    let user_id = USER.id;
    if (req.body.user_id) {
        user_id = req.body.user_id;
    }
    if (USER) {
        EmployerModel.findOne({ where: { user_id: user_id, status: 1 } }).then((resp) => {
            res.send(resp);
        }).catch((err) => {
            res.status(500).send(err);
        })
    } else {
        res.status(500).send("Required Login");
    }
}

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

exports.updateEmployerUser = function (req, res) {
    var upload = multer({ storage: storage }).fields([{
        name: 'companylogo',
        maxCount: 3
    }, {
        name: 'coverphoto',
        maxCount: 3
    }]);
    upload(req, res, function (err) {
        EmployerUser.findByPk(req.body.id).then(function (result) {
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

exports.pendingStaffOrTransportInterest = function (req, res) {
    const USER = appUtil.getUser(req.headers.authorization);
    let where = {};
    where.status = 1;
    StaffOrTransportInterestModel.findAll(
        {
            where: where,
            order: [
                ['updatedAt', 'DESC']
            ],
            include: [
                {
                    model: StaffOrTransportRequestModel,
                    where: {
                        employer_id: USER.id,
                    },
                    include: [
                        {
                            model: CategoryModel
                        }
                    ]
                },
                {
                    model: EmployeeModel,
                    include: [
                        {
                            model: EmployeeExperienceModel
                        }
                    ]
                }                
            ]
        },
    ).then((resp) => {
        res.send(resp);
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.inprogressStaffOrTransportInterest = function (req, res) {
    const USER = appUtil.getUser(req.headers.authorization);
    let where = {};
    where.status = 2;
    StaffOrTransportInterestModel.findAll(
        {
            where: where,
            order: [
                ['updatedAt', 'DESC']
            ],
            include: [
                {
                    model: StaffOrTransportRequestModel,
                    where: {
                        employer_id: USER.id,
                    },
                    include: [
                        {
                            model: CategoryModel
                        }
                    ]
                },
                EmployeeModel
            ]
        },
    ).then((resp) => {
        res.send(resp);
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.rejectedStaffOrTransportInterest = function (req, res) {
    const USER = appUtil.getUser(req.headers.authorization);
    let where = {};
    where.status = 0;
    StaffOrTransportInterestModel.findAll(
        {
            where: where,
            order: [
                ['updatedAt', 'DESC']
            ],
            include: [
                {
                    model: StaffOrTransportRequestModel,
                    where: {
                        employer_id: USER.id,
                    },
                    include: [
                        {
                            model: CategoryModel
                        }
                    ]
                },
                EmployeeModel
            ]
        },
    ).then((resp) => {
        res.send(resp);
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.completedStaffOrTransportInterest = function (req, res) {
    const USER = appUtil.getUser(req.headers.authorization);
    let where = {};
    where.status = 3;
    StaffOrTransportInterestModel.findAll(
        {
            where: where,
            order: [
                ['updatedAt', 'DESC']
            ],
            include: [
                {
                    model: StaffOrTransportRequestModel,
                    where: {
                        employer_id: USER.id,
                    },
                    include: [
                        {
                            model: CategoryModel
                        }
                    ]
                },
                EmployeeModel
            ]
        },
    ).then((resp) => {
        res.send(resp);
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.assignmentUpdate = function (req, res) {
    let reqStatus = req.body.status;

    StaffOrTransportInterestModel.findByPk(req.body.interestId).then(function (result) {
        result.update({status: reqStatus}).then((resp) => {
            if(reqStatus == 2){
                StaffOrTransportRequestModel.findByPk(req.body.requestId).then(function (result) {
                    result.update({status: reqStatus, employee_id: req.body.employee_id}).then((resp) => {
                        res.send(resp);
                    })
                }, function (err) {
                    res.status(500).send(err);
                })
            }
        })
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.listEmployer = function (req, res) {
    const USER = appUtil.getUser(req.headers.authorization);
    if (USER) {
        EmployerUser.findAll({order: [
                ['updatedAt', 'DESC']
            ]}).then((resp) => {
            res.send(resp);
        }).catch((err) => {
            res.status(500).send(err);
        })
    } else {
        res.status(500).send("Required Login");
    }
}

exports.updateEmployerStatus = function (req, res) {
    EmployerUser.findByPk(req.body.id).then(function (result) {
        result.update({status: req.body.status}).then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}