const express = require('express');
const reviewControllers = require('../controllers/reviewController');
const authControllers = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewControllers.getAllReviews)
  .post(authControllers.protected, reviewControllers.createReview);

router
  .route('/:id')
  .get(reviewControllers.getReviewById)
  .patch(reviewControllers.editReview)
  .delete(reviewControllers.deleteReview);

module.exports = router;
