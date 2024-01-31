const dbConfig = require("../../config/db").config;

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    operatorsAliases: '1',
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./user.model")(sequelize, Sequelize);
db.employeruser = require("./employeruser.model")(sequelize, Sequelize);
db.category = require("./category.model")(sequelize, Sequelize);
db.employeecategory = require("./employeecategory.model")(sequelize, Sequelize);
db.employeenotification = require("./employeenotification.model")(sequelize, Sequelize);
db.employeeexperiense = require("./employeeexperiense.model")(sequelize, Sequelize);
// db.userDetails = require("./userdetail.model")(sequelize, Sequelize);

db.home = require("./home.model")(sequelize, Sequelize);
db.filterlocation = require("./filterlocation.model")(sequelize, Sequelize);
// db.filtercity = require("./filtercity.model")(sequelize, Sequelize);
db.faq = require("./faq.model")(sequelize, Sequelize);
db.advertisement = require("./advertisement.model")(sequelize, Sequelize);
db.filter = require("./filter.model")(sequelize, Sequelize);
db.enquiry = require("./enquiry.model")(sequelize, Sequelize);
// db.soort = require("./soort.model")(sequelize, Sequelize);
// db.brandstof = require("./brandstof.model")(sequelize, Sequelize);
// db.transmissie = require("./transmissie.model")(sequelize, Sequelize);
db.product = require("./product.model")(sequelize, Sequelize);
db.productimage = require("./productimage.model")(sequelize, Sequelize);

// db.staffingmenu = require("./staffingmenu.model")(sequelize, Sequelize);
// db.staffing = require("./staffing.model")(sequelize, Sequelize);

db.about = require("./aboutus.model")(sequelize, Sequelize);
db.termandcondition = require("./termsandcondition.model")(sequelize, Sequelize);
db.contactus = require("./contactus.model")(sequelize, Sequelize);
db.location = require("./location.model")(sequelize, Sequelize);
db.extra = require("./extra.model")(sequelize, Sequelize);
db.order = require("./order.model")(sequelize, Sequelize);
db.orderhistory = require("./orderhistory.model")(sequelize, Sequelize);
db.team = require("./team.model")(sequelize, Sequelize);
db.withdrawrequest = require("./withdrawrequest.model")(sequelize, Sequelize);
db.coupon = require("./coupon.model")(sequelize, Sequelize);
db.certificate = require("./certificate.model")(sequelize, Sequelize);

db.employee = require("./employee.model")(sequelize, Sequelize);
db.employer = require("./employer.model")(sequelize, Sequelize);
db.staffOrTransportRequest = require("./staffrortransportequest.model")(sequelize, Sequelize);
db.staffOrTransportInterest = require("./staffortransportinterest.model")(sequelize, Sequelize);
db.screenshot = require("./screenshot.model")(sequelize, Sequelize);
db.specification = require("./specification.model")(sequelize, Sequelize);
db.productspecification = require("./productspecification.model")(sequelize, Sequelize);
db.category = require("./category.model")(sequelize, Sequelize);
db.staffOrTransportWorkingHistory = require("./staffrortransportworkinghistory.model")(sequelize, Sequelize);
db.orderSharing = require("./ordersharing.model")(sequelize, Sequelize);
db.usertoken = require("./usertoken.model")(sequelize, Sequelize);

// db.transportmenu = require("./transportmenu.model")(sequelize, Sequelize);
// db.transport = require("./transport.model")(sequelize, Sequelize);
// db.transportregister = require("./transportregister.model")(sequelize, Sequelize);
// db.vehicleregister = require("./vehicleregister.model")(sequelize, Sequelize);
// db.staffingregister = require("./staffingregister.model")(sequelize, Sequelize);



/** relationship */
db.users.hasOne(db.team, { foreignKey: 'user_id', targetKey: 'id' });
db.team.belongsTo(db.users, { foreignKey: 'user_id', targetKey: 'id' });
db.users.belongsTo(db.team, { foreignKey: 'team_id', targetKey: 'id' });
db.withdrawrequest.belongsTo(db.users, { foreignKey: 'user_id', targetKey: 'id' });
db.withdrawrequest.belongsTo(db.team, { foreignKey: 'team_id', targetKey: 'id' });

// db.product.hasMany(db.extra, { foreignKey: 'type', targetKey: 'type' });
db.product.hasMany(db.extra, { foreignKey: 'type', sourceKey: 'type' });
db.order.hasMany(db.orderhistory, { foreignKey: 'order_id', targetKey: 'id' });

db.order.hasMany(db.staffOrTransportRequest, { foreignKey: 'order_id', targetKey: 'id' });
db.employeruser.hasMany(db.staffOrTransportRequest, { foreignKey: 'employer_id', targetKey: 'id' });
db.staffOrTransportRequest.belongsTo(db.order, { foreignKey: 'order_id', targetKey: 'id' });
db.staffOrTransportRequest.belongsTo(db.employeruser, { foreignKey: 'employer_id', targetKey: 'id' });
db.staffOrTransportRequest.belongsTo(db.employee, { foreignKey: 'employee_id', targetKey: 'id' });
db.staffOrTransportInterest.belongsTo(db.staffOrTransportRequest, { foreignKey: 'staffortransportrequest_id', targetKey: 'id' });
db.employee.belongsTo(db.users, { foreignKey: 'user_id', targetKey: 'id' });
db.employer.belongsTo(db.users, { foreignKey: 'user_id', targetKey: 'id' });
db.staffOrTransportRequest.belongsTo(db.users, { foreignKey: 'user_id', targetKey: 'id' });
db.staffOrTransportInterest.belongsTo(db.users, { foreignKey: 'user_id', targetKey: 'id' });
db.staffOrTransportInterest.belongsTo(db.employee, { foreignKey: 'employee_id', targetKey: 'id' });
db.employee.hasMany(db.employeecategory, { foreignKey: 'employee_id', targetKey: 'id' });
db.employeecategory.belongsTo(db.employee, { foreignKey: 'employee_id', targetKey: 'id' });
db.category.hasMany(db.employeecategory, { foreignKey: 'category_id', targetKey: 'id' });
db.employeecategory.belongsTo(db.category, { foreignKey: 'category_id', targetKey: 'id' });
db.employee.hasMany(db.employeenotification, { foreignKey: 'employee_id', targetKey: 'id' });
db.employeenotification.belongsTo(db.employee, { foreignKey: 'employee_id', targetKey: 'id' });
db.employee.hasMany(db.employeeexperiense, { foreignKey: 'employee_id', targetKey: 'id' });
db.employeeexperiense.belongsTo(db.employee, { foreignKey: 'employee_id', targetKey: 'id' });

db.home.belongsTo(db.users, { foreignKey: 'created_by', targetKey: 'id' });
db.home.belongsTo(db.users, { foreignKey: 'updated_by', targetKey: 'id' });
db.faq.belongsTo(db.users, { foreignKey: 'created_by', targetKey: 'id' });
db.faq.belongsTo(db.users, { foreignKey: 'updated_by', targetKey: 'id' });
db.extra.belongsTo(db.product, { foreignKey: 'type', sourceKey: 'type' });

db.order.belongsTo(db.users, { foreignKey: 'user_id', targetKey: 'id' });
db.order.belongsTo(db.team, { foreignKey: 'team_id', targetKey: 'id' });
db.order.belongsTo(db.coupon, { foreignKey: 'coupon_id', targetKey: 'id' });
db.product.hasMany(db.orderhistory, { foreignKey: 'product_id', targetKey: 'id' });
db.orderhistory.belongsTo(db.product, { foreignKey: 'product_id', targetKey: 'id' });
db.orderhistory.belongsTo(db.extra, { foreignKey: 'extra_id', targetKey: 'id' })
db.orderhistory.belongsTo(db.filterlocation, { foreignKey: 'filterlocation_id', targetKey: 'id' })
db.orderhistory.belongsTo(db.order, { foreignKey: 'order_id', targetKey: 'id' })
db.orderhistory.belongsTo(db.users, { foreignKey: 'user_id', targetKey: 'id' });
db.orderhistory.hasOne(db.screenshot, { foreignKey: 'orderhistory_id', targetKey: 'id' })
db.screenshot.belongsTo(db.orderhistory, { foreignKey: 'orderhistory_id', targetKey: 'id' })

// db.category.belongsTo(db.employeruser, { foreignKey: 'employer_id', targetKey: 'id' });

db.staffOrTransportRequest.belongsTo(db.category, { foreignKey: 'category_id', targetKey: 'id' });

db.staffOrTransportRequest.hasMany(db.staffOrTransportInterest, { foreignKey: 'staffortransportrequest_id', targetKey: 'id' });


db.staffOrTransportWorkingHistory.belongsTo(db.employeruser, { foreignKey: 'employer_id', targetKey: 'id' });
db.staffOrTransportWorkingHistory.belongsTo(db.employee, { foreignKey: 'employee_id', targetKey: 'id' });
db.staffOrTransportWorkingHistory.belongsTo(db.staffOrTransportRequest, { foreignKey: 'staffortransportrequest_id', targetKey: 'id' });
db.staffOrTransportRequest.hasMany(db.staffOrTransportWorkingHistory, { foreignKey: 'staffortransportrequest_id', targetKey: 'id' });
// db.transportregister.belongsTo(db.users, { foreignKey: 'created_by', targetKey: 'id' });
// db.transportregister.belongsTo(db.users, { foreignKey: 'updated_by', targetKey: 'id' });

// db.vehicleregister.belongsTo(db.users, { foreignKey: 'created_by', targetKey: 'id' });
// db.vehicleregister.belongsTo(db.users, { foreignKey: 'updated_by', targetKey: 'id' });

// db.staffingregister.belongsTo(db.users, { foreignKey: 'created_by', targetKey: 'id' });
// db.staffingregister.belongsTo(db.users, { foreignKey: 'updated_by', targetKey: 'id' });

// db.soort.hasMany(db.vehicle, { foreignKey: 'soort_id', targetKey: 'id' });
// db.vehicle.belongsTo(db.soort, { foreignKey: 'soort_id', targetKey: 'id' });
// db.brandstof.hasMany(db.vehicle, { foreignKey: 'brandstof_id', targetKey: 'id' });
// db.vehicle.belongsTo(db.brandstof, { foreignKey: 'brandstof_id', targetKey: 'id' });
// db.transmissie.hasMany(db.vehicle, { foreignKey: 'transmissie_id', targetKey: 'id' });
// db.vehicle.belongsTo(db.transmissie, { foreignKey: 'transmissie_id', targetKey: 'id' });

// db.vehicle.belongsTo(db.users, { foreignKey: 'created_by', targetKey: 'id' });
// db.vehicle.belongsTo(db.users, { foreignKey: 'updated_by', targetKey: 'id' });

db.product.hasMany(db.productimage, { foreignKey: 'product_id', targetKey: 'id' });
db.product.hasMany(db.productspecification, { foreignKey: 'product_id', targetKey: 'id' });
db.productspecification.belongsTo(db.product, { foreignKey: 'product_id', targetKey: 'id' });
db.specification.hasMany(db.productspecification, { foreignKey: 'specification_id', targetKey: 'id' });
db.productspecification.belongsTo(db.specification, { foreignKey: 'specification_id', targetKey: 'id' });
db.product.belongsTo(db.filterlocation, { foreignKey: 'location_id', targetKey: 'id' });
db.product.belongsTo(db.filter, { foreignKey: 'vehicle', targetKey: 'id' });
db.product.belongsTo(db.filter, { foreignKey: 'fuel', targetKey: 'id' });
db.product.belongsTo(db.filter, { foreignKey: 'transmission', targetKey: 'id' });
db.product.belongsTo(db.filter, { foreignKey: 'parkingspace', targetKey: 'id' });
db.product.belongsTo(db.filter, { foreignKey: 'storagespace', targetKey: 'id' });
db.product.belongsTo(db.filter, { foreignKey: 'beroep', targetKey: 'id' });
db.product.belongsTo(db.filter, { foreignKey: 'leeftijd', targetKey: 'id' });
db.product.belongsTo(db.filter, { foreignKey: 'ervaring', targetKey: 'id' });
db.product.belongsTo(db.filter, { foreignKey: 'nationality', targetKey: 'id' });
db.product.belongsTo(db.filter, { foreignKey: 'voertuig', targetKey: 'id' });

db.productimage.belongsTo(db.product, { foreignKey: 'product_id', targetKey: 'id' });


db.orderSharing.belongsTo(db.orderhistory, { foreignKey: 'orderhistory_id', targetKey: 'id' })
db.orderSharing.belongsTo(db.users, { foreignKey: 'user_id', targetKey: 'id' })
db.orderhistory.hasMany(db.orderSharing, { foreignKey: 'orderhistory_id', targetKey: 'id' });

db.usertoken.belongsTo(db.users, { foreignKey: 'user_id', targetKey: 'id' })
// db.staffingmenu.hasMany(db.staffing, { foreignKey: 'beroep_id', targetKey: 'id' });
// db.staffing.belongsTo(db.staffingmenu, { foreignKey: 'beroep_id', targetKey: 'id' });
// db.staffingmenu.hasMany(db.staffing, { foreignKey: 'leeftijd_id', targetKey: 'id' });
// db.staffing.belongsTo(db.staffingmenu, { foreignKey: 'leeftijd_id', targetKey: 'id' });
// db.staffingmenu.hasMany(db.staffing, { foreignKey: 'ervaring_id', targetKey: 'id' });
// db.staffing.belongsTo(db.staffingmenu, { foreignKey: 'ervaring_id', targetKey: 'id' });
// db.staffingmenu.hasMany(db.staffing, { foreignKey: 'landen_id', targetKey: 'id' });
// db.staffing.belongsTo(db.staffingmenu, { foreignKey: 'landen_id', targetKey: 'id' });

// db.transportmenu.hasMany(db.transport, { foreignKey: 'brand_id', targetKey: 'id' });
// db.transport.belongsTo(db.transportmenu, { foreignKey: 'brand_id', targetKey: 'id' });
// db.transportmenu.hasMany(db.transport, { foreignKey: 'model_id', targetKey: 'id' });
// db.transport.belongsTo(db.transportmenu, { foreignKey: 'model_id', targetKey: 'id' });
// db.transportmenu.hasMany(db.transport, { foreignKey: 'variant_id', targetKey: 'id' });
// db.transport.belongsTo(db.transportmenu, { foreignKey: 'variant_id', targetKey: 'id' });

// db.transport.hasMany(db.transportregister, { foreignKey: 'transport_id', targetKey: 'id' });
// db.transportregister.belongsTo(db.transport, { foreignKey: 'transport_id', targetKey: 'id' });
// db.users.hasMany(db.transportregister, { foreignKey: 'registeruser_id', targetKey: 'id' });
// db.transportregister.belongsTo(db.users, { as: 'registeruser', foreignKey: 'registeruser_id', targetKey: 'id' });
// db.users.hasMany(db.transportregister, { foreignKey: 'paymentuser_id', targetKey: 'id' });
// db.transportregister.belongsTo(db.users, { as: 'paymentuser', foreignKey: 'paymentuser_id', targetKey: 'id' });

// db.vehicle.hasMany(db.vehicleregister, { foreignKey: 'vehicle_id', targetKey: 'id' });
// db.vehicleregister.belongsTo(db.vehicle, { foreignKey: 'vehicle_id', targetKey: 'id' });
// db.users.hasMany(db.transportregister, { foreignKey: 'registeruser_id', targetKey: 'id' });
// db.vehicleregister.belongsTo(db.users, { as: 'registeruser', foreignKey: 'registeruser_id', targetKey: 'id' });
// db.users.hasMany(db.transportregister, { foreignKey: 'paymentuser_id', targetKey: 'id' });
// db.vehicleregister.belongsTo(db.users, { as: 'paymentuser', foreignKey: 'paymentuser_id', targetKey: 'id' });


// db.staffing.hasMany(db.staffingregister, { foreignKey: 'staffing_id', targetKey: 'id' });
// db.staffingregister.belongsTo(db.staffing, { foreignKey: 'staffing_id', targetKey: 'id' });
// db.users.hasMany(db.staffingregister, { foreignKey: 'registeruser_id', targetKey: 'id' });
// db.staffingregister.belongsTo(db.users, { as: 'registeruser', foreignKey: 'registeruser_id', targetKey: 'id' });
// db.users.hasMany(db.staffingregister, { foreignKey: 'paymentuser_id', targetKey: 'id' });
// db.staffingregister.belongsTo(db.users, { as: 'paymentuser', foreignKey: 'paymentuser_id', targetKey: 'id' });

// /** Relationships */

// db.users.hasOne(db.userDetails, { foreignKey: 'user_id', targetKey: 'id' });
// db.userDetails.belongsTo(db.users, { foreignKey: 'user_id', targetKey: 'id' });

// db.filterlocation.hasMany(db.vehicle, { foreignKey: 'filterlocation_id', targetKey: 'id' });
// db.vehicle.belongsTo(db.filterlocation, { foreignKey: 'filterlocation_id', targetKey: 'id' });
// db.filterlocation.hasMany(db.staffing, { foreignKey: 'filterlocation_id', targetKey: 'id' });
// db.staffing.belongsTo(db.filterlocation, { foreignKey: 'filterlocation_id', targetKey: 'id' });
// db.filterlocation.hasMany(db.transport, { foreignKey: 'filterlocation_id', targetKey: 'id' });
// db.transport.belongsTo(db.filterlocation, { foreignKey: 'filterlocation_id', targetKey: 'id' });

// db.filtercity.hasMany(db.vehicle, { foreignKey: 'filtercity_id', targetKey: 'id' });
// db.vehicle.belongsTo(db.filtercity, { foreignKey: 'filtercity_id', targetKey: 'id' });
// db.filtercity.hasMany(db.staffing, { foreignKey: 'filtercity_id', targetKey: 'id' });
// db.staffing.belongsTo(db.filtercity, { foreignKey: 'filtercity_id', targetKey: 'id' });
// db.filtercity.hasMany(db.transport, { foreignKey: 'filtercity_id', targetKey: 'id' });
// db.transport.belongsTo(db.filtercity, { foreignKey: 'filtercity_id', targetKey: 'id' });

module.exports = db;