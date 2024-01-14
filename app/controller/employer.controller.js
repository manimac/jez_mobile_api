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
const staffOrTransportWorkingHistoryModel = MODELS.staffOrTransportWorkingHistory;

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

exports.getEmployerUser = function (req, res) {
    EmployerUser.findOne({ where: { id: req.body.id, status: 1 } }).then((resp) => {
        res.send(resp);
    }).catch((err) => {
        res.status(500).send(err);
    })
}

function getDates(startDate, endDate) {
    let dateArray = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        dateArray.push(formatDate(currentDate));
        currentDate = new Date(currentDate)
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// exports.assignmentUpdate = function (req, res) {
//     let reqStatus = req.body.status;

//     StaffOrTransportInterestModel.findByPk(req.body.interestId).then(function (result) {
//         result.update({ status: reqStatus }).then((resp) => {
//             if (reqStatus == 2) {
//                 StaffOrTransportRequestModel.findByPk(req.body.requestId).then(function (result) {
//                     result.update({ status: reqStatus, employee_id: req.body.employee_id }).then((resp) => {
//                         const startDate = new Date(req.order.workstartdate);
//                         const endDate = new Date(req.order.workenddate);
//                         const result = getDates(startDate, endDate);

//                         console.log(result);
//                         if (result && Array.isArray(result) && result.length > 0) {
//                             for (var i = 0; i < result.length; i++) {
//                                 let obj = {
//                                     date: result[i],
//                                     hoursWorked: "",
//                                     breakhours: "",
//                                     comments: "",
//                                     employer_id: req.order.employer_id,
//                                     employee_id: req.body.employee_id,
//                                     staffortransportrequest_id: req.order.id,
//                                 }
//                                 staffOrTransportWorkingHistoryModel.create(obj).then(function () {
//                                     res.send(resp);
//                                 }, function (err) {
//                                     res.status(500).send(err);
//                                 })
//                             }
//                         }
//                         else {
//                             res.send(resp);
//                         }


//                     })
//                 }, function (err) {
//                     res.status(500).send(err);
//                 })
//             }
//         })
//     }, function (err) {
//         res.status(500).send(err);
//     })
// }


exports.hoursUpdate = async function (req, res) {
    try {
        for (const task of req.body.task) {
            const result = await staffOrTransportWorkingHistoryModel.findByPk(task.id);
            await result.update({
                hoursWorked: task.hoursWorked,
                breakhours: task.breakhours,
                comments: task.comments,
            });
        }
        res.send({ success: true });
    } catch (err) {
        res.status(500).send(err);
    }
};

exports.hoursSingleUpdate = async function (req, res) {
    try {
        const result = await staffOrTransportWorkingHistoryModel.findByPk(req.body.id);
        await result.update(req.body);
        res.send({ success: true });
    } catch (err) {
        res.status(500).send(err);
    }
};

// exports.filterHoursemployee = async function (req, res) {
//     try {
//         const result = await staffOrTransportWorkingHistoryModel.findAll({task.id});
//         res.send({ success: true });
//     } catch (err) {
//         res.status(500).send(err);
//     }
// };

exports.listEmployer = function (req, res) {
    const USER = appUtil.getUser(req.headers.authorization);
    if (USER) {
        EmployerUser.findAll({
            order: [
                ['updatedAt', 'DESC']
            ]
        }).then((resp) => {
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
        result.update({ status: req.body.status }).then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}