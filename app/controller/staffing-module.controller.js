const Sequelize = require('sequelize');
const DataTypes  = require('sequelize');
const Op = Sequelize.Op;
const multer = require('multer');
const path = require('path');
const moment = require('moment');
const stripe = require('stripe')(process.env.stripe_sk);
const fs = require('fs');
const appUtil = require('../apputil');
const MODELS = require("../models");
const util = require('util');
const StaffOrTransportRequestModel = MODELS.staffOrTransportRequest;
const StaffOrTransportInterestModel = MODELS.staffOrTransportInterest;
const staffOrTransportWorkingHistoryModel = MODELS.staffOrTransportWorkingHistory;
const CategoryModel = MODELS.category;
const EmployeeCategoryModel = MODELS.employeecategory;
const FunctionsModel = MODELS.function;
const EmployeeFunctionsModel = MODELS.employeefunctions;
const EmployeeModel = MODELS.employee;
const EmployeeExperienceModel = MODELS.employeeexperiense;
const UserTokenModel = MODELS.usertoken;
const UserNotificationModel = MODELS.usernotification;
const request = require('request');
var schedule = require('node-schedule');


// SET STORAGE
const assignmentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        var dir = './public/uploads/employer';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Appending the extension
    }
});

const uploadAsync = util.promisify(multer({ storage: assignmentStorage }).single('image'));

// var StaffOrTransportRequestModels = Sequelize.define('StaffOrTransportRequest', {
//     workstartdate: {
//         type: DataTypes.DATEONLY, // Use DATEONLY for date without time
//         allowNull: false,
//     },
//     worktime: {
//         type: DataTypes.TIME, // Use TIME for time without date
//         allowNull: false,
//     },
//     // ... other attributes
// });

// StaffOrTransportRequestModel.beforeCreate(async (instance, options) => {
//     // Combine workstartdate and worktime to create the complete datetime
//     const workStartDateTime = new Date(`${instance.workstartdate}T${instance.worktime}`);
    
//     // Schedule the job to execute 1 hour before workstartdate
//     const jobDate = new Date(workStartDateTime);
//     jobDate.setMinutes(jobDate.getMinutes() - 2);

//     schedule.scheduleJob(jobDate, async () => {
//         const interestCompleted = await StaffOrTransportInterestModel.findAll({
//             where: {
//                 status: 2,
//                 notified: {
//                     [Op.not]: 1,
//                 },
//                 staffortransportrequest_id: requestId
//             },
//         });
//         await yourMethodToExecute(instance.userId, instance.requestType);
//     });
// });

function rememberNotification(request, usernotification) {
    if (usernotification && usernotification.rememberassignments && request.workstartdate && request.worktime) {
        // request.workstartdate = request.workstartdate.split("-").reverse().join("-");
        const workStartDateTime = new Date(`${request.workstartdate}T${request.worktime}`);
        
        // Mapping of rememberassignmentsoption to hours or days
        const optionMapping = {
            '1 hour': 1,
            '2 hours': 2,
            '3 hours': 3,
            '4 hours': 4,
            '5 hours': 5,
            '6 hours': 6,
            '7 hours': 7,
            '8 hours': 8,
            '9 hours': 9,
            '10 hours': 10,
            '1 Day': 24,
            '2 Days': 48,
            '3 Days': 72,
            '4 Days': 96,
            '5 Days': 120,
            '6 Days': 144,
            '7 Days': 168,
            '1 week': 168,
            '2 weeks': 336,
        };

        const optionValue = optionMapping[usernotification.rememberassignmentsoption];

        if (optionValue !== undefined) {
            const jobDate = new Date(workStartDateTime);
            jobDate.setHours(jobDate.getHours() - optionValue);

            schedule.scheduleJob(jobDate, async () => {
                await yourMethodToExecute(usernotification.user_id, request.type, usernotification.rememberassignmentsoption);
            });
        }
    }
}


exports.createStaffOrTransportRequest = async function (req, res) {
    try {
        await uploadAsync(req, res);

        req.body.image = res.req.file && res.req.file.filename || req.body.image;

        const createdRequest = await StaffOrTransportRequestModel.create(req.body);
        await createdRequest.update(req.body);

        await notifyEmployeesByCategory(req.body.category_id, req.body.type);
        await notifyEmployeesByFunction(req.body.function_id, req.body.type);

        res.send(createdRequest);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

async function yourMethodToExecute(userId, requestType, type) {
    const userTokens = await UserTokenModel.findAll({ where: { user_id: userId } });

    for (const userToken of userTokens) {
        const notification = {
            token: userToken.token,
            type: requestType === 'staffing' ? 'Staffing' : 'Transport',
            msg: 'Remember for your order.Will start in ' + type,
        };

        await appUtil.sendmessage(notification);
    }
}

async function notifyEmployeesByCategory(categoryId, requestType) {
    const employeeCategories = await EmployeeCategoryModel.findAll({ where: { category_id: categoryId } });

    for (const category of employeeCategories) {
        const employee = await EmployeeModel.findOne({ where: { id: category.employee_id } });
        const userNotification = await UserNotificationModel.findOne({ where: { user_id: employee.user_id } });

        if (userNotification && userNotification.newassignmentscategory === 1) {
            await notifyUserTokens(employee.user_id, requestType);
        }
    }
}

async function notifyEmployeesByFunction(functionId, requestType) {
    const employeeFunctions = await EmployeeFunctionsModel.findAll({ where: { function_id: functionId } });

    for (const func of employeeFunctions) {
        const employee = await EmployeeModel.findOne({ where: { id: func.employee_id } });
        const userNotification = await UserNotificationModel.findOne({ where: { user_id: employee.user_id } });

        if (userNotification && userNotification.newassignmentsfunction === 1) {
            await notifyUserTokens(employee.user_id, requestType);
        }
    }
}

async function notifyUserTokens(userId, requestType) {
    const userTokens = await UserTokenModel.findAll({ where: { user_id: userId } });

    for (const userToken of userTokens) {
        const notification = {
            token: userToken.token,
            type: requestType === 'staffing' ? 'Staffing' : 'Transport',
            msg: 'We have a new order. Please look into this',
        };

        await appUtil.sendmessage(notification);
    }
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

exports.recentProcess = function (req, res) {
    let where = {};
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

        const userTokens = await UserTokenModel.findAll({ where: { user_id: interestResult.user_id } });
        const UserNotification = await UserNotificationModel.findOne({ where: { user_id: interestResult.user_id } });
        if (status == 3) {
            for (let i = 0; i < userTokens.length; i++) {
                let obj = {
                    token: userTokens[i].token,
                    type: requestResult.type == 'staffing' ? 'Staffing' : 'Transport',
                    msg: "Completed your order. please check in the completed assignments",
                };
                await appUtil.sendmessage(obj);
            }
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
                if (UserNotification && (UserNotification.acceptedassignments == 1)) {
                    for (let i = 0; i < userTokens.length; i++) {
                        let obj = {
                            token: userTokens[i].token,
                            type: requestResult.type == 'staffing' ? 'Staffing' : 'Transport',
                            msg: "Your order has been accepted.",
                        };
                        await appUtil.sendmessage(obj);
                    }
                    rememberNotification(requestResult, UserNotification)
                }
                
                await interestResult.update({ status });
                // const workstartdate = order.workstartdate.split('-').reverse().join('-');
                // const workenddate = order.workenddate.split('-').reverse().join('-');
                const startDate = new Date(order.workstartdate);
                const endDate = new Date(order.workenddate);
                const dateArray = getDates(startDate, endDate);

                if (Array.isArray(dateArray) && dateArray.length > 0) {
                    let exist = await staffOrTransportWorkingHistoryModel.findOne({ where: { staffortransportrequest_id: order.id, employee_id } });
                    if (!exist) {
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
                    // await staffOrTransportWorkingHistoryModel.destroy({ where: { staffortransportrequest_id: order.id, employee_id } });

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
            if (status == 0) {
                if (UserNotification && (UserNotification.rejectedassignments == 1)) {
                    for (let i = 0; i < userTokens.length; i++) {
                        let obj = {
                            token: userTokens[i].token,
                            type: requestResult.type == 'staffing' ? 'Staffing' : 'Transport',
                            msg: "Your order has been rejected.",
                        };
                        await appUtil.sendmessage(obj);
                    }
                }
            }
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
                            model: staffOrTransportWorkingHistoryModel,
                            order: [['id', 'ASC']]
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
    StaffOrTransportInterestModel.create(req.body).then(async (resp) => {
        await appUtil.interestUpdate();
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