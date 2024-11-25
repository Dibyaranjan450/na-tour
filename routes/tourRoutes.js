const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
// const reviewController = require('../controllers/reviewController');
const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();

// router.param('id', tourController.checkID);

router
  .route('/')
  .get(
    authController.protected,
    tourController.getAllTours
  )
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protected,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(tourController.deleteTour);

// router
//   .route('/:tourId/reviews')
//   .post(authController.protected, reviewController.createReview);

router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
