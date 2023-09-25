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
const EmployeeCategoryModel = MODELS.employeecategory;
const EmployeeExperienceModel = MODELS.employeeexperiense;
const StaffOrTransportRequestModel = MODELS.staffOrTransportRequest;
const StaffOrTransportInterestModel = MODELS.staffOrTransportInterest;



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
        EmployeeModel.findOne({ where: { user_id: user_id, status: 1 } }).then((resp) => {
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
      const checkindate = search.checkindate.split('-').reverse().join('-');
      const checkoutdate = search.checkoutdate.split('-').reverse().join('-');
  
      const employeeCategories = await EmployeeCategoryModel.findAll({
        where: { employee_id, status },
      });
  
      const interests = await StaffOrTransportInterestModel.findAll({
        where: { employee_id, status },
      });
  
      if (employeeCategories.length === 0) {
        return res.json([]);
      }
  
      const assignmentPromises = employeeCategories.map(async (category) => {
        const where = {
          category_id: category.category_id,
          status: 1,
        };
  
        if (search && search.checkindate && search.checkintime && search.checkoutdate && search.checkouttime) {
          where.from = {
            [Op.and]: [
              Sequelize.where(Sequelize.col('from'), '>=', checkindate),
              Sequelize.where(Sequelize.col('from'), '<=', checkoutdate),
            ],
          };
        }
  
        const excludedIds = interests.map((interest) => interest.staffortransportrequest_id);
  
        if (excludedIds.length > 0) {
          where.id = {
            [Op.notIn]: excludedIds,
          };
        }
  
        const staffOrTransportRequests = await StaffOrTransportRequestModel.findAll({
          where,
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


exports.successAssignments = async (req, res) => {
    try {
        where = {};

        const search = req.body.search || {};
        if (search && search.checkindate && search.checkintime && search.checkoutdate && search.checkouttime) {
            search.checkindatetime = moment(search.checkindate + ' ' + search.checkintime, 'DD-MM-YYYY HH:mm');
            search.checkoutdatetime = moment(search.checkoutdate + ' ' + search.checkouttime, 'DD-MM-YYYY HH:mm');
            let checkindate = search.checkindate.split("-").reverse().join("-");
            let checkoutdate = search.checkoutdate.split("-").reverse().join("-");
            where[Op.and] = [
                {
                    [Op.and]: [Sequelize.where(Sequelize.col('from'), '>=', checkindate)]
                },
                {
                    [Op.and]: [Sequelize.where(Sequelize.col('from'), '<=', checkoutdate)]
                }
            ]
        }
        where.employee_id = req.body.employee_id;
        where.status = 3;
        const staffOrTransportRequests = await StaffOrTransportRequestModel.findAll({
            where: where,
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
  
      if (search && search.checkindate && search.checkintime && search.checkoutdate && search.checkouttime) {
        search.checkindatetime = moment(`${search.checkindate} ${search.checkintime}`, 'DD-MM-YYYY HH:mm');
        search.checkoutdatetime = moment(`${search.checkoutdate} ${search.checkouttime}`, 'DD-MM-YYYY HH:mm');
        let checkindate = search.checkindate.split("-").reverse().join("-");
        let checkoutdate = search.checkoutdate.split("-").reverse().join("-");
        where.from = {
          [Op.and]: [
            Sequelize.where(Sequelize.col('from'), '>=', checkindate),
            Sequelize.where(Sequelize.col('from'), '<=', checkoutdate),
          ],
        };
      }
  
      const staffOrTransportRequests = await StaffOrTransportRequestModel.findAll({
        where,
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
                id: staffortransport.staffortransportrequest_id ,
                status: 1,
            };

            if (search && search.checkindate && search.checkintime && search.checkoutdate && search.checkouttime) {
                let checkindate = search.checkindate.split("-").reverse().join("-");
                let checkoutdate = search.checkoutdate.split("-").reverse().join("-");
                where.from = {
                    [Op.and]: [
                        Sequelize.where(Sequelize.col('from'), '>=', checkindate),
                        Sequelize.where(Sequelize.col('from'), '<=', checkoutdate),
                    ],
                };
            }

            const staffOrTransportRequests = await StaffOrTransportRequestModel.findAll({
                where,
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