var express = require('express');
var router = express.Router();
var passport = require('passport');
const user = require('../app/controller/user.controller');
const common = require('../app/controller/common.controller');
const order = require('../app/controller/order.controller');
const product = require('../app/controller/product.controller');
const authMiddware = passport.authenticate('jwt', { session: false });

router.get('/terms-and-condition', common.getTermAndCondition);
router.post('/forget', user.forget);
router.get('/user/verification/:id/:token', user.verifyUser);
router.post('/reset/password', user.resetPassword);


/** Profile Screen */
router.get('/user/get/:id', user.getUser);
router.post('/user/update', user.userUpdate);
router.post('/orders', order.orders);
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

/** For auth enabled */
router.use(authMiddware);
module.exports = router;