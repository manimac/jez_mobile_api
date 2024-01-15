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
const UserModel = MODELS.users;
const EmployeeCategoryModel = MODELS.employeecategory;
const EmployeeExperienceModel = MODELS.employeeexperiense;
const StaffOrTransportRequestModel = MODELS.staffOrTransportRequest;
const StaffOrTransportInterestModel = MODELS.staffOrTransportInterest;
const staffOrTransportWorkingHistoryModel = MODELS.staffOrTransportWorkingHistory;
const CategoryModel = MODELS.category;


// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var dir = './public/uploads/employee'
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

exports.getEmployee = function (req, res) {
    const USER = appUtil.getUser(req.headers.authorization);
    let user_id = USER.id;
    if (req.body.user_id) {
        user_id = req.body.user_id;
    }
    if (USER) {
        EmployeeModel.findOne({ where: { user_id: user_id, status: 1, type: req.body.type } }).then((resp) => {
            res.send(resp);
        }).catch((err) => {
            res.status(500).send(err);
        })
    } else {
        res.status(500).send("Required Login");
    }
}

exports.createEmployee = function (req, res) {
    var upload = multer({ storage: storage }).fields([{
        name: 'profileimage',
        maxCount: 2
    }]);
    upload(req, res, function (err) {
        req.body.profileimage = res.req.files && (res.req.files.profileimage && res.req.files.profileimage[0].filename || null);
        EmployeeModel.create(req.body).then(function (response) {
            res.send(response);
        }, function (err) {
            res.status(500).send(err);
        })

    });
}

exports.updateEmployee = function (req, res) {
    var upload = multer({ storage: storage }).fields([{
        name: 'profileimage',
        maxCount: 2
    }]);
    upload(req, res, function (err) {
        EmployeeModel.findByPk(req.body.id).then(function (result) {
            req.body.profileimage = res.req.files && (res.req.files.profileimage && res.req.files.profileimage[0].filename || result.profileimage);
            result.update(req.body).then((resp) => {
                res.send(resp);
            })
        }, function (err) {
            res.status(500).send(err);
        })
    });
}

exports.stripePaymentSheet = async (req, res, next) => {
    try {
        const data = req.body;
        console.log(req.body);
        const params = {
            email: data.email,
            name: data.name,
        };
        const customer = await stripe.customers.create(params);
        console.log(customer.id);

        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customer.id },
            { apiVersion: '2020-08-27' }
        );

        const paymentIntent = await stripe.paymentIntents.create({
            amount: parseInt(data.amount),
            currency: data.currency,
            customer: customer.id,
            automatic_payment_methods: {
                enabled: true,
            },
        });
        const response = {
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id,
        };
        res.status(200).send(response);
    } catch (e) {
        console.log(e.message || e);
        next(e);
    }
}

exports.createCategories = async (req, res) => {
    try {
        const categoriesToCreate = req.body.categories;
        const createdCategories = await EmployeeCategoryModel.bulkCreate(categoriesToCreate);

        res.status(201).json(createdCategories);
    } catch (error) {
        console.error('Error creating categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createExperience = async (req, res) => {
    try {
        await EmployeeExperienceModel.destroy({ where: { employee_id: req.body.employee_id } });

        const experienceListsToCreate = req.body.experienceLists;
        const createdExperienceLists = await EmployeeExperienceModel.bulkCreate(experienceListsToCreate);

        res.status(201).json(createdExperienceLists);
    } catch (error) {
        console.error('Error creating experiences:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getExperience = function (req, res) {
    EmployeeExperienceModel.findAll({ where: { employee_id: req.body.employee_id, status: 1 } }).then((resp) => {
        res.send(resp);
    }).catch((err) => {
        res.status(500).send(err);
    })
}; 

exports.getAssignments = async (req, res) => {
    try {
        const { employee_id, search } = req.body;
        const status = 1;
        const { checkindate, checkoutdate, type } = search;

        const interests = await StaffOrTransportInterestModel.findAll({
            where: { employee_id },
        });

        let staffOrTransportRequests;

        if (search.type === 'transport') {
            const excludedIds = interests.map(({ staffortransportrequest_id }) => staffortransportrequest_id);

            const where = {
                status,
                from: { [Op.and]: [Sequelize.where(Sequelize.col('workstartdate'), '>=', checkindate),
                                  Sequelize.where(Sequelize.col('workstartdate'), '<=', checkoutdate)] },
                type,
            };

            if (excludedIds.length > 0) {
                where.id = { [Op.notIn]: excludedIds };
            }

            staffOrTransportRequests = await StaffOrTransportRequestModel.findAll({ where });

        } else {
            const employeeCategories = await EmployeeCategoryModel.findAll({
                where: { employee_id },
            });

            if (employeeCategories.length === 0) {
                return res.json([]);
            }

            const categoryIds = employeeCategories.map(category => category.category_id);

            const categoryWhere = {
                category_id: categoryIds,
                status,
                from: { [Op.and]: [Sequelize.where(Sequelize.col('workstartdate'), '>=', checkindate),
                                  Sequelize.where(Sequelize.col('workstartdate'), '<=', checkoutdate)] },
                [Op.and]: [Sequelize.where(Sequelize.col('staffaccepted'), { [Op.lt]: Sequelize.col('staffneeded') })],
            };

            if (req.body.category_id) {
                categoryWhere.category_id = [req.body.category_id];
            }

            if (req.body.title) {
                categoryWhere.title = [req.body.title];
            }

            const categoryExcludedIds = interests.map(interest => interest.staffortransportrequest_id);

            if (categoryExcludedIds.length > 0) {
                categoryWhere.id = { [Op.notIn]: categoryExcludedIds };
            }

            categoryWhere.type = search.type;

            const categoryRequests = await StaffOrTransportRequestModel.findAll({
                where: categoryWhere,
                include: [CategoryModel],
            });

            staffOrTransportRequests = categoryRequests;
        }

        const assignments = staffOrTransportRequests.flat();
        res.json(assignments);

    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


exports.successAssignments = async (req, res) => {
    try {
        const { employee_id, search } = req.body;
        const status = [0,3];

        const where = { employee_id, status };        
        const staffOrTransportInterest = await StaffOrTransportInterestModel.findAll({
            where
        });
        if(staffOrTransportInterest.length==0){
            return res.json([]);
        }
        const requestIds = staffOrTransportInterest.map(Interest => Interest.staffortransportrequest_id);
        var requestWhere = {
            id: requestIds,
            type: search.type
        }
        if (search && search.checkindate && search.checkintime && search.checkoutdate && search.checkouttime) {
            search.checkindatetime = moment(`${search.checkindate} ${search.checkintime}`, 'DD-MM-YYYY HH:mm');
            search.checkoutdatetime = moment(`${search.checkoutdate} ${search.checkouttime}`, 'DD-MM-YYYY HH:mm');
            let checkindate = search.checkindate;
            let checkoutdate = search.checkoutdate;
            requestWhere.from = {
                [Op.and]: [
                    Sequelize.where(Sequelize.col('workstartdate'), '>=', checkindate),
                    Sequelize.where(Sequelize.col('workstartdate'), '<=', checkoutdate),
                ],
            };
        }
        const staffOrTransportRequests = await StaffOrTransportRequestModel.findAll({
            where: requestWhere,
            include: [staffOrTransportWorkingHistoryModel, CategoryModel, StaffOrTransportInterestModel]
        });

        res.json(staffOrTransportRequests);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.confirmAssignments = async (req, res) => {
    try {
        const { employee_id, search } = req.body;
        const status = 2;

        const where = { employee_id, status };        
        const staffOrTransportInterest = await StaffOrTransportInterestModel.findAll({
            where
        });
        if(staffOrTransportInterest.length==0){
            return res.json([]);
        }
        const requestIds = staffOrTransportInterest.map(Interest => Interest.staffortransportrequest_id);
        var requestWhere = {
            id: requestIds,
            type: search.type
        }
        if (search && search.checkindate && search.checkintime && search.checkoutdate && search.checkouttime) {
            search.checkindatetime = moment(`${search.checkindate} ${search.checkintime}`, 'DD-MM-YYYY HH:mm');
            search.checkoutdatetime = moment(`${search.checkoutdate} ${search.checkouttime}`, 'DD-MM-YYYY HH:mm');
            let checkindate = search.checkindate;
            let checkoutdate = search.checkoutdate;
            requestWhere.from = {
                [Op.and]: [
                    Sequelize.where(Sequelize.col('workstartdate'), '>=', checkindate),
                    Sequelize.where(Sequelize.col('workstartdate'), '<=', checkoutdate),
                ],
            };
        }
        const staffOrTransportRequests = await StaffOrTransportRequestModel.findAll({
            where: requestWhere,
            include: [staffOrTransportWorkingHistoryModel, CategoryModel, StaffOrTransportInterestModel]
        });

        res.json(staffOrTransportRequests);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.pendingAssignments = async (req, res) => {
    try {
        const search = req.body.search;
        let where = {};
        where.employee_id = req.body.employee_id;
        where.status = 1;
        const StaffOrTransportInterest = await StaffOrTransportInterestModel.findAll({
            where: where,
            include: [StaffOrTransportRequestModel]
        });

        const assignmentPromises = StaffOrTransportInterest.map(async (staffortransport) => {
            const where = {
                id: staffortransport.staffortransportrequest_id,
                status: 1,
            };

            if (search && search.checkindate && search.checkintime && search.checkoutdate && search.checkouttime) {
                let checkindate = search.checkindate;
                let checkoutdate = search.checkoutdate;
                where.from = {
                    [Op.and]: [
                        Sequelize.where(Sequelize.col('workstartdate'), '>=', checkindate),
                        Sequelize.where(Sequelize.col('workstartdate'), '<=', checkoutdate),
                    ],
                };
            }
            where.type = search.type;

            const staffOrTransportRequests = await StaffOrTransportRequestModel.findAll({
                where,
                include: [CategoryModel, StaffOrTransportInterestModel]
            });

            return staffOrTransportRequests;
        });
        const assignmentResults = await Promise.all(assignmentPromises);
        const assignments = assignmentResults.flat();

        res.json(assignments);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.userUpdate = async (req, res) => {
    try {
        var upload = multer({ storage: storage }).fields([{
            name: 'profileimage',
            maxCount: 2
        }]);
        upload(req, res, async function (err) {
            if (err) {
                throw err; 
            }

            const { id, userimage, username } = req.body;
            const updatedUser = await UserModel.findByPk(id);

            if (updatedUser && res.req && res.req.files && res.req.files.profileimage && Array.isArray(res.req.files.profileimage) && (res.req.files.profileimage.length>0)) {
                updatedUser.userimage = res.req.files.profileimage[0] ? res.req.files.profileimage[0].filename : userimage;
                await updatedUser.save();

                const employee = await EmployeeModel.findOne({
                    where: { user_id: id }
                });

                if (employee) {
                    employee.profileimage = res.req.files.profileimage[0] ? res.req.files.profileimage[0].filename : userimage;
                    await employee.save();
                }

                res.send(updatedUser);
            } else {
                res.status(404).send({ message: 'User not found' });
            }
        });
    } catch (err) {
        res.status(500).send(err.message || 'Internal Server Error');
    }
};

exports.removeCategories = async (req, res) => {
    try {
        var removeCategories = await EmployeeCategoryModel.destroy({ where: { employee_id: req.body.employee_id, category_id: req.body.category_id } });

        res.status(201).json(removeCategories);
    } catch (error) {
        console.error('Error removing categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        var addCategories = await EmployeeCategoryModel.create(req.body);

        res.status(201).json(addCategories);
    } catch (error) {
        console.error('Error removing categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};