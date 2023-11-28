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
const authMiddware = passport.authenticate("jwt", { session: false });

router.get("/terms-and-condition", common.getTermAndCondition);
router.post("/forget", user.forget);
router.get("/user/verification/:id/:token", user.verifyUser);
router.post("/reset/password", user.resetPassword);

/** Profile Screen */
router.get("/user/get/:id", user.getUser);
router.post("/user/update", user.userUpdate);
router.post("/orders", order.orders);
router.post("/orders-app", order.ordersForApp);
router.post("/order/my-wallet", order.myWallet);
router.post("/withdraws", common.withdrawRequests);
router.get("/product/extras", product.extras);

/** Booking Screen */
router.post("/order/create", order.createProduct);
router.post("/order/update", order.updateProduct);
router.delete("/order/delete/:id", order.deleteProduct);
router.delete("/order/image/delete/:id", order.deleteProductImage);
router.post("/order/make-order", order.makeOrder);
router.post("/order/update-status", order.updateOrder);
router.post("/order/availability", order.checkAvailability);
router.post("/order-history/update", order.orderHistoryUpdate);

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

/** For auth enabled */
router.use(authMiddware);
router.post("/invers/devices-list", invers.deviceList);
router.post("/invers/lock-unlock", invers.lockUnlock);
router.post("/invers/getStatus", invers.getStatus);

router.post("/order/staff-transport-requests", order.staffOrTransportRequests);
router.post(
  "/order/staff-transport-request/create",
  order.createStaffOrTransportRequest
);
router.post(
  "/order/staff-transport-request/update",
  order.updateStaffOrTransportRequest
);
router.delete(
  "/order/staff-transport-request/delete/:id",
  order.deleteStaffOrTransportRequest
);
router.post(
  "/order/staff-transport-interest/create",
  order.makeStaffOrTransportInterest
);
router.post(
  "/order/staff-transport-interest/update",
  order.updateStaffOrTransportInterest
);

/** Screenshots update */
router.post("/screenshot/upsert", order.upsertScreenshots);

router.post("/employee/get", employee.getEmployee);
router.post("/employee/create", employee.createEmployee);
router.post("/employee/update", employee.updateEmployee);
router.post("/employer/get", employer.getEmployer);
router.post("/employer/update", employer.updateEmployer);
router.post("/employee/createCategories", employee.createCategories);
router.post("/employee/createExperience", employee.createExperience);
router.post("/employee/getExperience", employee.getExperience);
router.post("/employee/getAssignments", employee.getAssignments);
router.post("/employee/successAssignments", employee.successAssignments);
router.post("/employee/pendingAssignments", employee.pendingAssignments);
router.post("/employee/confirmAssignments", employee.confirmAssignments);
router.post("/employer/listEmployer", employer.listEmployer);
router.post("/employer/updateEmployerStatus", employer.updateEmployerStatus);

router.post("/payment/ideal", order.productIdeal);

router.post("/reset/password", common.resetPassword);
router.post("/withdraw/create", common.createWithdrawRequest);
router.post('/order/cancel-order', order.cancelOrderHistory);

//categories
router.post("/category/get", category.getCategory);
router.post("/category/create", category.createCategory);
router.post("/category/update", category.updateCategory);
router.delete("/category/delete/:id", category.deleteCategory);

router.post("/pendingStaffOrTransportInterest", employer.pendingStaffOrTransportInterest);
router.post("/inprogressStaffOrTransportInterest", employer.inprogressStaffOrTransportInterest);
router.post("/rejectedStaffOrTransportInterest", employer.rejectedStaffOrTransportInterest);
router.post("/completedStaffOrTransportInterest", employer.completedStaffOrTransportInterest);
router.post("/assignmentUpdate", employer.assignmentUpdate);
router.post("/hoursUpdate", employer.hoursUpdate);


//backup
router.get('/filter/locations', common.allFilterLocations);
router.get('/filtersOptions', common.filtersOptions);
router.post('/home/update', common.updateHome);
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
module.exports = router;
