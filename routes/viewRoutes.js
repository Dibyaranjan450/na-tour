const express = require('express');
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTours);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewController.getLoginForm);
router.get('/me', authController.protected, viewController.getAccount);
router.get('/my-tours', authController.protected, viewController.getMyTours);
router.get('/my-reviews', authController.protected, viewController.getMyReviews);
router.get('/billing', authController.protected, viewController.getBillings);

module.exports = router;
