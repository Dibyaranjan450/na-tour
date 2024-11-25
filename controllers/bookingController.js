const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');

exports.getCheckoutSession = async (req, res, next) => {
  try {
    // Get the currently booking tour
    const tour = await Tour.findById(req.params.tourId);

    //Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/?tour=${
        req.params.tourId
      }&user=${req.user.id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.name
        .split(' ')
        .join('%20')}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [`https://natours.dev/img/tours/${tour.imageCover}`],
            },
            unit_amount: tour.price * 100, // Amount in cents
          },
          quantity: 1,
        },
      ],
    });

    // Create session as responce
    res.status(200).json({
      status: 'success',
      session,
    });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

exports.createBookingCheckout = async (req, res, next) => {
  try {
    // Not a secure way to do this //
    const { tour, user, price } = req.query;

    if (!tour && !user && !price) return next();

    await Booking.create({ tour, user, price });
    res.redirect(req.originalUrl.split('?')[0]);
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};
