const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');

exports.getOverview = async (req, res, next) => {
  try {
    const tours = await Tour.find();

    res.status(200).render('overview', {
      title: 'All Tours',
      tours,
    });
  } catch (e) {
    next(new AppError(e.message, 400));
  }
};

exports.getTours = async (req, res, next) => {
  try {
    const name = req.params.slug.replace('%20', ' ');
    const tour = await Tour.findOne({ name }).populate({
      path: 'reviews',
      fields: 'review rating user',
    });
    // console.log('tour', tour);

    res.status(200).render('tour', {
      title: tour.name,
      tour,
    });
  } catch (err) {
    next(new AppError(`There's no tour with this ID`, 400));
  }
};

exports.getLoginForm = async (req, res, next) => {
  try {
    res.status(200).render('login', {
      title: 'Log into your account',
      currentPath: req.path,
    });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

exports.getAccount = (req, res, next) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getMyTours = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id });

    if (!bookings.length) {
      return next(new AppError(`You haven't booked any Tour 🥲`, 200));
    }

    const tourIDs = bookings.map((el) => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    res.status(200).render('overview', {
      title: 'My Tours',
      tours,
    });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

exports.getMyReviews = (req, res, next) => {
  res.status(200).render('incomplete');
};

exports.getBillings = (req, res, next) => {
  res.status(200).render('incomplete');
};
