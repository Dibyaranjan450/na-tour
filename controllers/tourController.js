// const fs = require('fs');
const multer = require('multer');

const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factoryController = require('../controllers/factoryController');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

let tourImageIndex = 0;
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/tours');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];

    if (file.fieldname === 'imageCover') {
      cb(null, `tour-${req.params.id}-${Date.now()}-cover.${ext}`);
    } else {
      cb(null, `tour-${req.params.id}-${Date.now()}-${tourImageIndex}.${ext}`);
    }

    tourImageIndex++;
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

////////////////////////// Middlewares //////////////////////////

// exports.checkID = (req, res, next, val) => {
//   const tour = tours.find((tour) => tour.id === req.params.id * 1);

//   if (!tour) {
//     res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });

//     return;
//   }

//   next();
// };

// exports.checkBody = (req, res, next) => {
//   const newTour = req.body;

//   if (!newTour.name || !newTour.price) {
//     res.status(400).json({
//       status: 'fail',
//       message: 'Missing Information',
//     });

//     return;
//   }

//   next();
// };

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['sort', 'fields', 'page', 'limit'];
    excludedFields.forEach((field) => delete queryObj[field]);

    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`
    );

    this.query.find(JSON.parse(queryString));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-maxGroupSize');
    }

    return this;
  }

  limitingFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-id');
    }
    return this;
  }
}

////////////////////////// Controller Functions //////////////////////////

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = (req, res, next) => {
  // console.log(req.files);
  if (!req.files.imageCover || !req.files.images) return next();

  req.body.imageCover = req.files.imageCover[0].filename;
  req.body.images = req.files.images.map((file) => file.filename);

  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // FETCHING Tours FROM LOCAL FILE //

  // res.status(200).json({
  //   status: 'success',
  //   results: tours.length,
  //   data: {
  //     tours: tours,
  //   },
  // });

  // const { duration, difficulty } = req.query;

  // FILTERING //

  // const queryObj = { ...req.query };
  // const excludedFields = ['sort', 'fields', 'page', 'limit'];
  // excludedFields.forEach((field) => delete queryObj[field]);

  // ADVANCE FILTERING //

  // let queryString = JSON.stringify(queryObj);
  // queryString = queryString.replace(
  //   /\b(gt|gte|lt|lte)\b/g,
  //   (match) => `$${match}`
  // );

  // const tours = await Tour.find({
  //   duration: { $gt: duration },
  //   difficulty,
  // });

  // let query = Tour.find(JSON.parse(queryString));

  // SORTING //

  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(',').join(' ');
  //   query = query.sort(sortBy);
  // } else {
  //   query = query.sort('-maxGroupSize');
  // }

  // FIELD LIMITING //

  // if (req.query.fields) {
  //   const fields = req.query.fields.split(',').join(' ');
  //   query = query.select(fields);
  // } else {
  //   query = query.select('-id');
  // }

  // PAGINATION //

  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 4;
  // const skip = (page - 1) * limit;

  // query = query.skip(skip).limit(limit);

  // if (req.query.page) {
  //   const tourCount = await Tour.countDocuments();

  //   if (skip >= tourCount) {
  //     throw new Error('This page does not exist.');
  //   }
  // }

  const tourFeatures = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitingFields();

  // EXECUTING QUERY //
  const tours = await tourFeatures.query;

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: { tours },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  // const newTourId = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newTourId }, req.body);

  // tours.push(newTour);

  // fs.writeFile(
  //   `${__dirname}/../dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   (err) => {
  //     res.status(201).json({
  //       status: 'success',
  //       data: { tour: newTour },
  //     });
  //   }
  // );

  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { tour: newTour },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // const tour = tours.find((tour) => tour.id === req.params.id * 1);

  // res.status(201).json({
  //   status: 'success',
  //   data: {
  //     tour,
  //   },
  // });

  const tour = await Tour.findById(req.params.id).populate({
    path: 'reviews',
    select: 'review rating',
  });

  if (!tour) {
    return next(new AppError(`No tour find with ID.`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  // const tour = tours.find((tour) => tour.id === req.params.id * 1);

  // for (key in req.body) {
  //   if (tour.hasOwnProperty(key)) {
  //     tour[key] = req.body[key];
  //   }
  // }

  // fs.writeFile(
  //   `${__dirname}/../dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   (err) =>
  //     res.status(201).json({
  //       status: 'edited successfully',
  //       data: { tour },
  //     })
  // );

  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError(`No tour find with ID.`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

// exports.deleteTour = catchAsync(async (req, res, next) => {
// const id = req.params.id * 1;
// const newTours = tours.filter((tour) => tour.id !== id);

// fs.writeFile(
//   `${__dirname}/../dev-data/data/tours-simple.json`,
//   JSON.stringify(newTours),
//   (err) =>
//     res.status(401).json({
//       staus: 'deleted successfully',
//     })
// );

//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError(`No tour find with ID.`, 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

exports.deleteTour = factoryController.deleteOne(Tour);
