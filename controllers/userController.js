// const fs = require('fs');
const multer = require('multer');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

// const { ObjectId } = require('mongodb');
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
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

// const users = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
// );

// exports.checkUserID = (req, res, next, val) => {
//   const user = users.find((user) => user._id === req.params.id);

//   if (!user) {
//     res.status(404).json({
//       status: 'fail',
//       message: 'Invalid Id',
//     });

//     return;
//   }

//   next();
// };

exports.uploadUserPhoto = upload.single('photo');

exports.updateMe = async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  try {
    const { name, email } = req.body;
    const photo = req.file?.filename;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, photo },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

exports.getAllUsers = async (req, res) => {
  // res.status(200).json({
  //   status: 'success',
  //   results: users.length,
  //   data: { users },
  // });

  try {
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      result: users.length,
      data: { users },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createUser = async (req, res) => {
  // const _id = new ObjectId().toString();
  // const newUser = Object.assign({ _id }, req.body);
  // users.push(newUser);

  // fs.writeFile(
  //   `${__dirname}/../dev-data/data/users.json`,
  //   JSON.stringify(users),
  //   (err) =>
  //     res.status(201).json({
  //       status: 'success',
  //       data: { user: newUser },
  //     })
  // );

  try {
    const user = await User.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { user },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getUser = async (req, res) => {
  // const id = req.params.id;
  // const user = users.find((user) => user._id === id);

  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     user,
  //   },
  // });

  try {
    const user = await User.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateUser = async (req, res) => {
  // const id = req.params.id;
  // const user = users.find((user) => user._id === id);

  // for (key in req.body) {
  //   if (user.hasOwnProperty(key)) {
  //     user[key] = req.body[key];
  //   }
  // }

  // fs.writeFile(
  //   `${__dirname}/../dev-data/data/users.json`,
  //   JSON.stringify(users),
  //   (err) =>
  //     res.status(200).json({
  //       status: 'success',
  //       data: {
  //         user,
  //       },
  //     })
  // );

  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteUser = async (req, res) => {
  // const id = req.params.id;
  // const newUsers = users.filter((user) => user._id !== id);

  // fs.writeFile(
  //   `${__dirname}/../dev-data/data/users.json`,
  //   JSON.stringify(newUsers),
  //   (err) =>
  //     res.status(204).json({
  //       status: 'success',
  //       data: null,
  //     })
  // );

  try {
    await User.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
