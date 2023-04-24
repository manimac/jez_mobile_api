var express = require('express');
var router = express.Router();
var passport = require('passport');
const user = require('../app/controller/user.controller');
const common = require('../app/controller/common.controller');
const order = require('../app/controller/order.controller');
const product = require('../app/controller/product.controller');
const invers = require('../app/controller/inversapi.controller');
const employee = require('../app/controller/employee.controller');
const employer = require('../app/controller/employer.controller');
const authMiddware = passport.authenticate('jwt', { session: false });

router.get('/terms-and-condition', common.getTermAndCondition);
router.post('/forget', user.forget);
router.get('/user/verification/:id/:token', user.verifyUser);
router.post('/reset/password', user.resetPassword);


/** Profile Screen */
router.get('/user/get/:id', user.getUser);
router.post('/user/update', user.userUpdate);
router.post('/orders', order.orders);
router.post('/orders-app', order.ordersForApp);
router.post('/order/my-wallet', order.myWallet);
router.post('/withdraws', common.withdrawRequests);
router.get('/product/extras', product.extras);

/** Booking Screen */
router.post('/order/make-order', order.makeOrder);
router.post('/order/update-status', order.updateOrder);
router.post('/order/availability', order.checkAvailability);

router.post('/products', product.products);
router.get('/productfind/:id', product.getProductFind);
router.get('/product/similar/:type/:id', product.getSimilarProducts);
router.get('/filters/:type?/:category?', common.filters); // type- Rent, Staff, category - Fuel, Truck

//Invoice
router.get('/userinvoice/:id', order.invoiceslist);
router.get('/userfindinvoice/:id', order.userfindinvoice);

/** For auth enabled */
router.use(authMiddware);
router.post('/invers/devices-list', invers.deviceList);
router.post('/invers/lock-unlock', invers.lockUnlock);

router.post('/order/staff-transport-requests', order.staffOrTransportRequests);
router.post('/order/staff-transport-request/create', order.createStaffOrTransportRequest);
router.post('/order/staff-transport-request/update', order.updateStaffOrTransportRequest);
router.post('/order/staff-transport-interest/create', order.makeStaffOrTransportInterest);
router.post('/order/staff-transport-interest/update', order.updateStaffOrTransportInterest);
/** Screenshots update */
router.post('/screenshot/upsert', order.upsertScreenshots);

router.post('/employee/create', employee.createEmployee);
router.post('/employee/update', employee.updateEmployee);
router.post('/employer/get', employer.getEmployer);
router.post('/employer/create', employer.createEmployer);
router.post('/employer/update', employer.updateEmployer);
router.post('/payment/ideal', order.productIdeal);

module.exports = router;