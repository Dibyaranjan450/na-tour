const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const User = require('../models/userModel');
const AppError = require('../utils/appError');
// const sendMail = require('../utils/email');
const Email = require('../utils/email');
const { promisify } = require('util');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });
};

const setCookieToken = (token, res) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
};

exports.protected = async (req, res, next) => {
  let token;

  if (req.headers?.authorization?.startsWith('Bearer')) {
    token = req.headers?.authorization?.split(' ')[1];
  } else {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('Authorization failed! Please pass the token', 400)
    );
  }

  let decode;

  try {
    decode = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('decode ', decode);
  } catch (err) {
    return next(new AppError('invalid or malformed signature', 401));
  }

  try {
    const isUserExist = await User.findById(decode.id);
    req.user = isUserExist;
    res.locals.user = isUserExist;
  } catch (err) {
    return next(new AppError('User bearing token doesnt exist', 400));
  }

  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next( new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const decode = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);

      const currentUser = await User.findById(decode.id);
      if (!currentUser) {
        return res.status(401).json({
          status: 'fail',
          message: 'User bearing this token doesnt exist',
        });
      }
      // console.log(currentUser);

      res.locals.user = currentUser;
      return next();
    }
  } catch (err) {
    // return res.status(401).json({
    //   status: 'fail',
    //   success: false,
    //   message: 'invalid or malformed signature.',
    // });
    return next();
  }

  next();
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    const token = generateToken(newUser._id);
    setCookieToken(token, res);

    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();

    res.status(201).json({
      status: 'success',
      token,
    });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide email & password', 401));

  try {
    const user = await User.findOne({ email }).select('+password');

    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!user || !isCorrectPassword)
      return next(new AppError('Incorrect email or password!', 401));

    const token = generateToken(user._id);
    setCookieToken(token, res);

    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (err) {
    return next(new AppError('Incorrect email or password!', 401));
  }
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError("User bearing this emial doesn't exist!", 404));
    }

    const getPasswordToken = user.generateResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${getPasswordToken}`;
    // const subject = 'Your password reset token (valid for 10 min.)';
    // const text = `Forgot your password? Set a new password to your account by going to ${resetURL}`;

    // await sendMail({
    //   email: user.email,
    //   subject,
    //   text,
    // });
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token send to email.',
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  try {
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken,
      passwordTokenValidTime: { $gt: Date.now() },
    });
    // console.log(user);

    if (!user) {
      return next(new AppError('Token invalid or expired!', 400));
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordTokenValidTime = undefined;
    await user.save();

    const token = generateToken(user._id);
    setCookieToken(token, res);

    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (err) {
    next(new AppError(err.message, err.statusCode));
  }
};

exports.updatePassword = async (req, res, next) => {
  const { password, newPassword, passwordConfirm } = req.body;

  try {
    const user = await User.findById(req.user.id).select('+password');
    const isCorrectPassword = await user.comparePassword(
      password,
      user.password
    );

    if (!isCorrectPassword) {
      return next(new AppError('Please enter the correct password', 400));
    }

    user.password = newPassword;
    user.passwordConfirm = passwordConfirm;
    await user.save();

    const token = generateToken(user._id);
    setCookieToken(token, res);

    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (err) {
    next(new AppError(err.message, err.statusCode));
  }
};
