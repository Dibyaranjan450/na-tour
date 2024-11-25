const fs = require('fs');
const Review = require('../models/reviewModel');
const factoryController = require('../controllers/factoryController');

exports.getAllReviews = async (req, res) => {
  try {
    const query = { ...req.query };
    const excludedQuery = ['sort', 'fields', 'page', 'limit'];
    excludedQuery.forEach((element) => delete query[element]);

    let queryString = JSON.stringify(query);
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );

    let reviewQuery = Review.find(JSON.parse(queryString));

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      reviewQuery = reviewQuery.sort(sortBy);
    } else {
      reviewQuery = reviewQuery.sort('-rating');
    }

    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      reviewQuery = reviewQuery.select(fields);
    }

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 5;
    const skip = (page - 1) * limit;
    reviewQuery = reviewQuery.skip(skip).limit(limit);

    if (req.query.page) {
      const reviewLength = await Review.countDocuments();
      if (skip >= reviewLength) throw new Error("This page doesn't exist");
    }

    const reviews = await reviewQuery;

    res.status(200).json({
      status: 'success',
      result: reviews.length,
      data: { reviews },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createReview = async (req, res) => {
  try {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    const newReview = await Review.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { review: newReview },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { review },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.editReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: { review },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

// exports.deleteReview = async (req, res) => {
//   try {
//     await Review.findByIdAndDelete(req.params.id);

//     res.status(204).json({
//       status: 'success',
//       data: null,
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: err,
//     });
//   }
// };

exports.deleteReview = factoryController.deleteOne(Review);
