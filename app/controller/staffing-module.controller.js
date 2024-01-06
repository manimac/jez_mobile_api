const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const multer = require('multer');
const path = require('path');
const moment = require('moment');
const stripe = require('stripe')(process.env.stripe_sk);
const fs = require('fs');
const appUtil = require('../apputil');
const MODELS = require("../models");
const StaffOrTransportRequestModel = MODELS.staffOrTransportRequest;
const StaffOrTransportInterestModel = MODELS.staffOrTransportInterest;
const staffOrTransportWorkingHistoryModel = MODELS.staffOrTransportWorkingHistory;
const CategoryModel = MODELS.category;
const EmployeeModel = MODELS.employee;
const EmployeeExperienceModel = MODELS.employeeexperiense;


// SET STORAGE
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

exports.createStaffOrTransportRequest = function (req, res) {
    var upload = multer({ storage: assignmentStorage }).single('image');
    upload(req, res, function (err) {
        req.body.image = res.req.file && res.req.file.filename || req.body.image;
        StaffOrTransportRequestModel.create(req.body).then(function (resp) {
            resp.update(req.body).then(function (result) {
                res.send(result);
            });
        })

    });
}

exports.updateStaffOrTransportRequest = function (req, res) {
    var upload = multer({ storage: assignmentStorage }).single('image');
    upload(req, res, function (err) {
        let returns = null;
        req.body.image = res.req.file && res.req.file.filename || req.body.userimage;
        StaffOrTransportRequestModel.findByPk(req.body.id).then(function (resp) {
            resp.update(req.body).then(function (result) {
                res.send(result);
            });
        })
    });
}

exports.deleteStaffOrTransportRequest = function (req, res) {
    StaffOrTransportRequestModel.findByPk(req.params.id).then(function (result) {
        result.destroy().then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.staffOrTransportRequests = function (req, res) {
    const USER = appUtil.getUser(req.headers.authorization);
    let where = {};
    where.employer_id = USER.id;
    if (req.body.status) {
        where.status = req.body.status;
    }
    StaffOrTransportRequestModel.findAll(
        {
            where: where,
            order: [
                ['updatedAt', 'DESC']
            ],
            include: [CategoryModel]
        },
    ).then((resp) => {
        res.send(resp);
    }, function (err) {
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

exports.assignmentUpdate = async function (req, res) {
    try {
        const { status, employee_id, requestId, interestId, order } = req.body;
        if (!requestId || !interestId) {
            return res.status(400).json({ error: 'Invalid request data' });
        }
        const requestResult = await StaffOrTransportRequestModel.findByPk(requestId);
        const interestResult = await StaffOrTransportInterestModel.findByPk(interestId);        
        
        
        if (!requestResult || !interestResult) {
            return res.status(404).json({ error: 'Request or interest not found' });
        }

        let staffneeded = parseInt(requestResult.staffneeded) || 0;
        let staffaccepted = parseInt(requestResult.staffaccepted) || 0;

        if (status == 3) {
            const interestCompletedCount = await StaffOrTransportInterestModel.count({
                where: {
                    status: 3,
                    staffortransportrequest_id: requestId
                },
            });
            if (staffneeded == parseInt(interestCompletedCount)) {
                await interestResult.update({ status });
                await requestResult.update({ status });
            } else {
                await interestResult.update({ status });
            }
        } else if (status == 2) {
            if (staffneeded > staffaccepted) {
                await interestResult.update({ status });
                const workstartdate = order.workstartdate.split('-').reverse().join('-');
                const workenddate = order.workenddate.split('-').reverse().join('-');
                const startDate = new Date(workstartdate);
                const endDate = new Date(workenddate);
                const dateArray = getDates(startDate, endDate);

                if (Array.isArray(dateArray) && dateArray.length > 0) {
                    await staffOrTransportWorkingHistoryModel.destroy({ where: { staffortransportrequest_id: order.id, employee_id } });
                    for (const date of dateArray) {
                        const obj = {
                            date,
                            hoursWorked: "",
                            breakhours: "",
                            comments: "",
                            employer_id: order.employer_id,
                            employee_id,
                            staffortransportrequest_id: order.id,
                        };
                        await staffOrTransportWorkingHistoryModel.create(obj);
                    }
                }
                staffaccepted += 1;
                if (staffneeded == staffaccepted) {
                    await requestResult.update({ status, staffaccepted });
                } else {
                    await requestResult.update({ staffaccepted });
                }
            } else {
                return res.status(400).json({ message: 'Already employees assigned to this assignment' });
            }
        } else {
            await interestResult.update({ status });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Error updating assignment:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// exports.assignmentUpdate = async function (req, res) {
//     try {
//         const reqStatus = req.body.status;
//         const interestResult = await StaffOrTransportInterestModel.findByPk(req.body.interestId);
//         await interestResult.update({ status: reqStatus });
//         if (reqStatus == 2 || reqStatus == 3) {
//             const requestResult = await StaffOrTransportRequestModel.findByPk(req.body.requestId);
//             await requestResult.update({ status: reqStatus, employee_id: req.body.employee_id });
//             const workstartdate = req.body.order.workstartdate.split('-').reverse().join('-');
//             const workenddate = req.body.order.workenddate.split('-').reverse().join('-');
//             const startDate = new Date(workstartdate);
//             const endDate = new Date(workenddate);
//             const dateArray = getDates(startDate, endDate);
//             if(reqStatus == 2){
//                 if (Array.isArray(dateArray) && dateArray.length > 0) {
//                     await staffOrTransportWorkingHistoryModel.destroy({ where: { staffortransportrequest_id: req.body.order.id, employee_id: req.body.employee_id } });
//                     for (const date of dateArray) {
//                         const obj = {
//                             date,
//                             hoursWorked: "",
//                             breakhours: "",
//                             comments: "",
//                             employer_id: req.body.order.employer_id,
//                             employee_id: req.body.employee_id,
//                             staffortransportrequest_id: req.body.order.id,
//                         };    
//                         await staffOrTransportWorkingHistoryModel.create(obj);
//                     }
//                 }
//             }
//             res.send({ success: true });
//         } else {
//             res.send({ success: true });
//         }
//     } catch (err) {
//         res.status(500).send(err);
//     }
// };

exports.statusStaffOrTransportInterest = function (req, res) {
    const USER = appUtil.getUser(req.headers.authorization);
    let where = {};
    where.status = req.body.status;
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
                        },
                        {
                            model: staffOrTransportWorkingHistoryModel
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

exports.makeStaffOrTransportInterest = function (req, res) {
    StaffOrTransportInterestModel.create(req.body).then((resp) => {
        res.send(resp);
    }, function (err) {
        res.status(500).send(err);
    })
}

exports.updateStaffOrTransportInterest = function (req, res) {
    StaffOrTransportInterestModel.findByPk(req.body.id).then(function (result) {
        result.update(req.body).then((resp) => {
            res.send(resp);
        })
    }, function (err) {
        res.status(500).send(err);
    })
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
                        },
                        {
                            model: staffOrTransportWorkingHistoryModel
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
                        },
                        {
                            model: staffOrTransportWorkingHistoryModel
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
                        },
                        {
                            model: staffOrTransportWorkingHistoryModel
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
                        },
                        {
                            model: staffOrTransportWorkingHistoryModel
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