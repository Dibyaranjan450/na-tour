const AppError = require('../utils/appError');

exports.deleteOne = (Model) => {
  return async (req, res, next) => {
    try {
      await Model.findByIdAndDelete(req.params.id);

      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (err) {
      return next(new AppError("The tour with this ID doesn't exist", 404));
    }
  };
};
