const mongoose = require('mongoose');
// const User = require('../models/userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour should ave name.'],
      unique: true,
      trim: true,
      maxLength: [40, 'A name should be less tahn 40 characters.'],
      minLength: [10, 'A name should have greater than 5 characters.'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour should have duration.'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour should have group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour should have difficult level.'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty value should be easy, medium or difficult.',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 1.0,
      min: [1, 'Rating must be greater than 1.0'],
      max: [5, 'Rating must be lesser than 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour should have price.'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price({VALUE}) should be lesser than the price.',
      },
    },
    summary: {
      type: String,
      default: '',
      trim: true,
      required: [true, 'A tour should have summary.'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: true,
    },
    images: [String],
    createdAt: {
      type: String,
      default: Date.now(),
      select: false,
    },
    startDates: [String],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinated: [Number],
        adress: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// tourSchema.pre('save', async function (next) {
//   const guides = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guides);

//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
