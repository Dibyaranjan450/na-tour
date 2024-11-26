const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorControlller');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewsRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// Serving Static Files
app.use(express.static(`${__dirname}/public`));

app.use(express.json({ limit: '10kb' }));
app.use(cors()              );
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/', viewsRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // res.status(400).json({
  //   status: 'fail',
  //   message: `Can't find '${req.originalUrl}' on this server!`,
  // });

  // const err = new Error(`Can't find '${req.originalUrl}' on this server!`);
  // err.status = 'fail';
  // err.statusCode = 400;
  // next(err);

  next(new AppError(`Can't find '${req.originalUrl}' on this server!`, 400));
});

app.use(globalErrorHandler);

module.exports = app;
