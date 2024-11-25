const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review should have content.'],
    },
    rating: {
      type: Number,
      required: [true, 'A review should have rating.'],
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review should have a sender.'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review should have tour ID.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'user',
  //   select: 'name email photo',
  // }).populate({
  //   path: 'tour',
  //   select: 'name',
  // });

  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
