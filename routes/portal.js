var express = require('express');
var router = express.Router();
var passport = require('passport');
const user = require('../app/controller/user.controller');
const common = require('../app/controller/common.controller');
const order = require('../app/controller/order.controller');
// const vehicle = require('../app/controller/vehicle.controller');
// const staffing = require('../app/controller/staffing.controller');
// const transport = require('../app/controller/transport.controller');

const authMiddware = passport.authenticate('jwt', { session: false });
router.get('/home', common.getHome);
router.get('/aboutus', common.getAboutUs);
router.get('/certificate', common.getcertificate);
router.get('/terms-and-condition', common.getTermAndCondition);
router.get('/contactus', common.contactus);
router.get('/findOrderExpireNotificationTemp', order.findOrderExpireNotificationTemp);
router.get('/findExpiredOrderForInvoiceTemp', order.findExpiredOrderForInvoiceTemp);
router.get('/userorders/:id', order.userorders);
router.get('/userwallet/:id', order.userwallet);
router.get('/userwithdraws/:id', common.userwithdraws);
router.get('/enquiries', common.enquiries);
router.post('/forget', common.forget);
router.get('/user/search', user.userSearch);
router.get('/user/verification/:id/:token', user.verifyUser);
router.post('/reset/password', common.resetPassword);
router.get('/faqs', common.faqs);
// router.get('/soorts', vehicle.soorts);
router.get('/filter/locations', common.allFilterLocations);
router.get('/filters/:type?/:category?', common.filters); // type- Rent, Staff, category - Fuel, Truck
router.get('/filters-by-group/:section?/:category?', common.filtersByGroup); // type- Rent, Staff, category - Fuel, Truck
router.get('/filtersOptions', common.filtersOptions);
// router.get('/filter/cities', common.allFilterCities);
// router.get('/brandstofs', vehicle.brandstofs);
// router.get('/transmissies', vehicle.transmissies);
router.post('/products', order.products);
router.get('/product/extras', order.extras); // Admin portal
router.get('/product/similar/:type/:id', order.getSimilarProducts);


router.get('/product/extra/:type', order.findExtraByType);

router.get('/location', common.location);
router.post('/location/create', common.createlocation);
router.post('/location/update', common.updatelocation);
router.delete('/location/delete/:id', common.deletelocation);

router.get('/advertisement', common.advertisement);
router.post('/advertisement/create', common.createadvertisement);
router.post('/advertisement/update', common.updateadvertisement);
router.delete('/advertisement/delete/:id', common.deleteadvertisement);
// router.post('/staffings', staffing.staffings);
// router.post('/transports', transport.transports);

// router.get('/staffingmenu/:type', staffing.staffingMenus);
// router.get('/rent-detail/:route', vehicle.getVehicle);
// router.get('/transportmenu/:type', transport.transportMenus);
// router.get('/transport/:route', transport.findTransport);
// router.get('/staffing/:route', staffing.getStaffing);
router.post('/send-payment-link', common.sendPaymentLink);
router.get('/product/:route', order.getProduct);
router.get('/productfind/:id', order.getProductFind);
router.post('/order/availability', order.checkAvailability);
router.post('/order/bookedtime', order.returnBookedTimes);
router.post('/user/update', user.userUpdate);
router.post('/subscribe/email', common.subscribe);
/** For auth enabled */
router.use(authMiddware);
router.post('/reset/password/admin', common.resetPasswordAdmin);
router.post('/reset/changepassword', common.resetPasswordAdmin);
/**Homes */
router.post('/home/update', common.updateHome);
router.post('/home/peek', common.updatePeekHour);
router.post('/aboutus', common.updateAboutUs);
router.post('/update-term-and-cond', common.updateTermAndCond);
router.post('/location', common.updateLocation);



/** user */
router.post('/users', user.allUsers);
router.get('/user/get/:id', user.getUser);

router.post('/user/set-favorite', user.setFavorite);
router.get('/user/favorities', user.getFavorites);
router.delete('/user/delete/:id', user.deleteUser);

/** FAQ */
router.post('/faq/create', common.createFaq);
router.post('/faq/update', common.updateFaq);
router.delete('/faq/delete/:id', common.deleteFaq);

/** Extra */
router.post('/orders', order.orders);
router.post('/order/extra/create', order.createExtra);
router.post('/order/extra/update', order.updateExtra);
router.delete('/order/extra/delete/:id', order.deleteExtra);

/** Filter */
router.post('/filter/create', common.createFilter);
router.post('/filter/update', common.updateFilter);
router.delete('/filter/delete/:id', common.deleteFilter);

/** Filter Location */
router.post('/filter/location/create', common.createFilterLocation);
router.post('/filter/location/update', common.updateFilterLocation);
router.delete('/filter/location/delete/:id', common.deleteFilterLocation);

/** Contact us */
router.post('/contact/create', common.createContact);
router.post('/contact/update', common.updateContact);
router.delete('/contact/delete/:id', common.deleteContact);

/** Enquires */
router.post('/enquiry/create', common.createEnquiry);
router.post('/enquiry/update', common.updateEnquiry);
router.delete('/enquiry/delete/:id', common.deleteEnquiry);

/** Teams */
router.get('/teams', common.teams);
router.post('/team/create', common.upsertTeam);
router.post('/team/update', common.upsertTeam);
router.delete('/team/delete/:id', common.deleteTeam);
router.post('/team/members', common.teamMembers);

/** Withdrawrequests */
router.post('/withdraws', common.withdrawrequests);
router.post('/withdraw/create', common.createWithdrawRequest);
router.post('/withdraw/update', common.updateWithdrawRequest);
router.delete('/withdraw/delete/:id', common.deleteWithdrawReques);
/** Orders */
router.post('/order/create', order.createProduct);
router.post('/order/update', order.updateProduct);
router.delete('/order/delete/:id', order.deleteProduct);
router.delete('/order/image/delete/:id', order.deleteProductImage);
router.post('/order/get', order.getOrder);
router.post('/order/update-status', order.updateOrder);
router.post('/order/updateDriverLicense', order.updateDriverLicense);
router.post('/order/make-order', order.makeOrder);
router.post('/order/cancel-order', order.cancelOrderHistory);
router.post('/order/my-wallet', order.myWallet);
router.delete('/order/deleteOrder/:id', order.deleteOrder);
/** Coupons */
router.post('/coupons', common.coupons);
router.post('/check-coupon-used', common.checkCouponUsed);
router.post('/coupon/create', common.createCoupon);
router.post('/coupon/update', common.updateCoupon);
router.delete('/coupon/delete/:id', common.deleteCoupon);
router.post('/certificate', common.updatecertificate);
// router.post('/vehicle/image/create', vehicle.uploadVehicleImage);

// /** Staffing  */
// router.post('/staffing/create', staffing.createStaffing);
// router.post('/staffing/update', staffing.updateStaffing);
// router.delete('/staffing/delete/:id', staffing.deleteStaffing);

// /** Tarnsport */
// router.post('/transportmenu/create', transport.createTransportMenu);
// router.post('/transportmenu/update', transport.updateTransportMenu);
// router.delete('/transportmenu/delete/:id', transport.deleteTransportMenu);

// router.post('/transport/create', transport.createTransport);
// router.post('/transport/update', transport.updateTransport);
// router.delete('/transport/delete/:id', transport.deleteTransport);

// router.post('/transportregisters', transport.transportRegisters);
// router.post('/transportregister/create', transport.createTransportRegister);
// router.get('/transportregister/get', transport.getTransportRegister);
// router.post('/transportregister/update', transport.updateTransportRegister);
// router.delete('/transportregister/delete/:id', transport.deleteTransportRegister);

// router.post('/vehicleregisters', vehicle.vehicleRegisters);
// router.post('/vehicleregister/create', vehicle.createVehicleRegister);
// router.get('/vehicleregister/get', vehicle.getVehicleRegister);
// router.post('/vehicleregister/update', vehicle.updateVehicleRegister);
// router.delete('/vehicleregister/delete/:id', vehicle.deleteVehicleRegister);

// router.post('/staffingregisters', staffing.staffingRegisters);
// router.post('/staffingregister/create', staffing.createStaffingRegister);
// router.get('/staffingregister/get', staffing.getStaffingRegister);
// router.post('/staffingregister/update', staffing.updateStaffingRegister);
// router.delete('/staffingregister/delete/:id', staffing.deleteStaffingRegister);

router.post('/payment/ideal', order.productIdeal);
// router.post('/staffing/ideal', staffing.staffingIdeal);
// router.post('/transport/ideal', transport.transportIdeal);

module.exports = router;