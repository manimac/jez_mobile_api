var express = require("express");
var router = express.Router();
var passport = require("passport");
const user = require("../app/controller/user.controller");
const common = require("../app/controller/common.controller");
const order = require("../app/controller/order.controller");
const product = require("../app/controller/product.controller");
const invers = require("../app/controller/inversapi.controller");
const employee = require("../app/controller/employee.controller");
const employer = require("../app/controller/employer.controller");
const category = require("../app/controller/category.controller");
const staffingModule = require("../app/controller/staffing-module.controller");
const functions = require("../app/controller/function.controller");
const authMiddware = passport.authenticate("jwt", { session: false });

//Google map
router.post('/token/updatetoken', common.updatetoken);
router.post("/mapautocomplete", common.mapautocomplete);
router.post("/getPlaceById", common.getPlaceById);
router.post("/pushnotification/sendmessage", common.sendmessage);
router.post("/payment/ideal", order.productIdeal);
router.post("/payment/webhook", order.paymentWebhook);
router.post("/common/sumsubwebook", common.sumsubwebook);
router.get("/staff-transport-request/recentProcess", staffingModule.recentProcess);

router.get("/terms-and-condition", common.getTermAndCondition);
router.post("/forget", user.forget);
router.get("/user/verification/:id/:token", user.verifyUser);
router.post("/reset/password", user.resetPassword);
router.post("/checkPhoneExist", user.checkPhoneExist);
router.get('/filter/locations', common.allFilterLocations);

/** Profile Screen */
router.get("/user/get/:id", user.getUser);
router.post("/user/update", user.userUpdate);
router.post("/orders", order.orders);
router.post("/orders-app", order.ordersForApp);
router.post("/orders-invitations", order.invitations);
router.post("/orders-createinvitation", order.createinvitation);
router.post("/orders-removeinvitation", order.removeinvitation);
router.post("/order/my-wallet", order.myWallet);
router.post("/withdraws", common.withdrawRequests);
router.get("/product/extras", product.extras);
router.post("/order/find", order.findOrder);

/** Booking Screen */
router.post("/order/create", order.createProduct);
router.post("/order/update", order.updateProduct);
router.delete("/order/delete/:id", order.deleteProduct);
router.delete("/order/image/delete/:id", order.deleteProductImage);
router.post("/order/make-order", order.makeOrder);
router.post("/order/update-status", order.updateOrder);
router.post("/order/availability", order.checkAvailability);
router.post("/order/get-available-products", order.returnAvailableProducts);
router.post("/order-history/update", order.orderHistoryUpdate);
router.post("/order-history/find", order.findOrderHistory);
router.post("/order/update-read", order.updateRead);

router.post("/products", product.products);
router.get("/productfind/:id", product.getProductFind);
router.get("/product/similar/:type/:id", product.getSimilarProducts);
router.get("/filters/:type?/:category?", common.filters); // type- Rent, Staff, category - Fuel, Truck

router.get("/specifications", product.specifications);
router.post("/specification/create", product.createSpecifications);
router.post("/specification/update", product.updateSpecifications);
router.delete("/specification/delete/:id", product.deleteSpecifications);

//Invoice
router.get("/userinvoice/:id", order.invoiceslist);
router.get("/userfindinvoice/:id", order.userfindinvoice);

/** Stripe APP payment */
router.post("/payment-sheet", employee.stripePaymentSheet);


router.post("/employer/create", employer.createEmployer);
router.post("/employeruser/get", employer.getEmployerUser);
router.post("/employeruser/update", employer.updateEmployerUser);

router.post("/staffing/getFilterOptions", common.getFilterOptions);
router.post("/employeeuser/update", employee.userUpdate);
router.get("/invers/getNewToken", invers.getNewToken);
router.post("/invers/getApplication", invers.getApplication);
router.post("/common/createApplicant", common.createApplicant);
router.post("/common/getApplicant", common.getApplicant);

/** For auth enabled */
router.use(authMiddware);
router.post("/invers/devices-list", invers.deviceList);
router.post("/invers/lock-unlock", invers.lockUnlock);
router.post("/invers/getStatus", invers.getStatus);


//staffing module
router.post("/staff-transport-request/create", staffingModule.createStaffOrTransportRequest);
router.post("/staff-transport-request/assignmentUpdate", staffingModule.assignmentUpdate);
router.post("/staff-transport-request/statusFilter", staffingModule.statusStaffOrTransportInterest);
router.post("/staff-transport-request/get", staffingModule.staffOrTransportRequests);
router.post("/staff-transport-request/update", staffingModule.updateStaffOrTransportRequest);
router.delete("/staff-transport-request/delete/:id", staffingModule.deleteStaffOrTransportRequest);
router.post("/staff-transport-interest/create", staffingModule.makeStaffOrTransportInterest);
router.post("/staff-transport-interest/update",staffingModule.updateStaffOrTransportInterest);
// router.post("/pendingStaffOrTransportInterest", staffingModule.pendingStaffOrTransportInterest);
// router.post("/inprogressStaffOrTransportInterest", staffingModule.inprogressStaffOrTransportInterest);
// router.post("/rejectedStaffOrTransportInterest", staffingModule.rejectedStaffOrTransportInterest);
// router.post("/completedStaffOrTransportInterest", staffingModule.completedStaffOrTransportInterest);





/** Screenshots update */
router.post("/screenshot/upsert", order.upsertScreenshots);
router.post("/screenshot/get", order.getscreenshot);

router.post("/employee/get", employee.getEmployee);
router.post("/employee/create", employee.createEmployee);
router.post("/employee/update", employee.updateEmployee);
router.post("/employer/get", employer.getEmployer);
router.post("/employer/update", employer.updateEmployer);
router.post("/employee/createCategories", employee.createCategories);
router.post("/employee/removeCategories", employee.removeCategories);
router.post("/employee/createCategory", employee.createCategory);
router.post("/employee/removeFunctions", employee.removeFunctions);
router.post("/employee/createFunctions", employee.createFunctions);
router.post("/employee/createExperience", employee.createExperience);
router.post("/employee/getExperience", employee.getExperience);


router.post("/employee/getAssignments", employee.getAssignments);
router.post("/employee/successAssignments", employee.successAssignments);
router.post("/employee/pendingAssignments", employee.pendingAssignments);
router.post("/employee/confirmAssignments", employee.confirmAssignments);


router.post("/employer/listEmployer", employer.listEmployer);
router.post("/employer/updateEmployerStatus", employer.updateEmployerStatus);


router.post("/reset/password", common.resetPassword);
router.post("/withdraw/create", common.createWithdrawRequest);
router.post('/order/cancel-order', order.cancelOrderHistory);

//categories
router.post("/category/get", category.getCategory);
router.post("/category/create", category.createCategory);
router.post("/category/update", category.updateCategory);
router.delete("/category/delete/:id", category.deleteCategory);
//functions
router.post("/functions/get", functions.getFunction);
router.post("/functions/create", functions.createFunction);
router.post("/functions/update", functions.updateFunction);
router.delete("/functions/delete/:id", functions.deleteFunction);


router.post("/hoursUpdate", employer.hoursUpdate);
router.post("/hoursSingleUpdate", employer.hoursSingleUpdate);


//backup
router.get('/filtersOptions', common.filtersOptions);
router.post('/home/update', common.updateHome);
router.delete('/order/deleteOrder/:id', order.deleteOrder);
router.post('/home/peek', common.updatePeekHour);
router.post('/aboutus', common.updateAboutUs);
router.post('/update-term-and-cond', common.updateTermAndCond);
router.post('/location', common.updateLocation);
router.get('/location', common.location);
/** FAQ */
router.post('/faq/create', common.createFaq);
router.post('/faq/update', common.updateFaq);
router.delete('/faq/delete/:id', common.deleteFaq);
router.post('/location/create', common.createlocation);
router.post('/location/update', common.updatelocation);
router.delete('/location/delete/:id', common.deletelocation);
router.get('/enquiries', common.enquiries);
/** user */
router.post('/users', user.allUsers);
router.get('/user/get/:id', user.getUser);
/** Coupons */
router.post('/coupons', common.coupons);
router.post('/check-coupon-used', common.checkCouponUsed);
router.post('/coupon/create', common.createCoupon);
router.post('/coupon/update', common.updateCoupon);
router.delete('/coupon/delete/:id', common.deleteCoupon);


router.get('/advertisement', common.advertisement);
router.post('/advertisement/create', common.createadvertisement);
router.post('/advertisement/update', common.updateadvertisement);
router.delete('/advertisement/delete/:id', common.deleteadvertisement);


//backupwithout middleware
router.get('/home', common.getHome);
router.get('/aboutus', common.getAboutUs);
router.get('/certificate', common.getcertificate);
router.get('/contactus', common.contactus);
router.get('/faqs', common.faqs);

router.get('/notification-masters', common.notificationMasters);
router.post('/getUserNotification', common.getUserNotification);
router.post('/notification-setting/update', common.upsertUserNotificationSetting);

module.exports = router;
