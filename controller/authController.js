const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const userModel = require("../model/userModel");
const sendEmail = require("../utils/sendEmail");
const createToken = require("../utils/createToken");
const { sanitizeUser } = require("../utils/sanitizData");

exports.singup = asyncHandler(async (req, res, next) => {
  // create a new user
  const user = await userModel.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  });

  // create token
  const token = createToken(user._id);

  // send token to user
  res.status(201).json({
    data: sanitizeUser(user),
    token,
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  // 1) find user by email
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("Invalid email or password", 401));
  }
  // 2) compare entered password with user password
  const isCorrect = await bcrypt.compare(req.body.password, user.password);

  if (!user || !isCorrect) {
    return next(new ApiError("Invalid email or password", 401));
  }

  // create token
  const token = createToken(user._id);

  // send token to user
  res.status(201).json({
    data: sanitizeUser(user),
    token,
  });
});

// protect route
exports.protect = asyncHandler(async (req, res, next) => {
  // check if token is exist , if exist get token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "Not authorized to access this route, Please login to access this route ",
        401
      )
    );
  }
  // 2) verify token ( no change happened , expired token )
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  // check if user exist
  const currentUser = await userModel.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }
  // check if user changed password after token was created
  if (currentUser.passwordChangedAt) {
    const passwordChangedAtTiemstemp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    // Password changed after token created (Error)
    if (passwordChangedAtTiemstemp > decoded.iat) {
      return next(
        new ApiError("User recently changed password! Please login again", 401)
      );
    }
  }
  // check if user active of not
  if (!currentUser.active) {
    return next(
      new ApiError(
        "Your account is not active, Please activate your account first",
        400
      )
    );
  }
  req.user = currentUser;
  next();
});

// @desc    Authorization (User Permissions)
// ["admin", "manager"]
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1) access roles
    // 2) access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  });

exports.forgetPassword = asyncHandler(async (req, res, next) => {
  // get user by email
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`No user found with this email ${req.body.email}`, 404)
    );
  }
  // create restCode
  const restCode = Math.floor(100000 + Math.random() * 900000).toString();
  // hash restCode
  const hashedRestCode = crypto
    .createHash("sha256")
    .update(restCode)
    .digest("hex");

  user.passwordResetCode = hashedRestCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  const message = `Hi ${user.name}, \n We received a request to reset the password on your Harvest Hub Account . \n ${restCode} \n Enter this cod to complete the reset.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code ( valid for 10 min)",
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(
      new ApiError(
        `There was an error sending the email, please try again later ${err}`,
        500
      )
    );
  }
  res.status(200).json({
    status: "success",
    message: "Reset code sent to email",
  });
});

exports.verifyResetCode = asyncHandler(async (req, res, next) => {
  // hash restCode
  const hashedRestCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await userModel.findOne({
    passwordResetCode: hashedRestCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError(`reset Code invalid or expired`, 404));
  }
  user.passwordResetVerified = true;

  await user.save();

  res.status(200).json({
    status: "success",
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await userModel.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`No user found with this email ${req.body.email}`, 404)
    );
  }
  if (!user.passwordResetVerified) {
    return next(
      new ApiError(
        `Please verify your reset code before resetting your password`,
        400
      )
    );
  }
  // 2) compare entered new password with user password
  const isCorrect = await bcrypt.compare(req.body.newPassword, user.password);
  if (isCorrect) {
    return next(
      new ApiError(`New password cannot be the same as the old password`, 404)
    );
  }
  user.password = req.body.newPassword;
  user.passwordChangedAt = Date.now();
  user.passwordResetVerified = undefined;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  const token = createToken(user._id);

  res.status(200).json({
    status: "success",
    message: "Password reset successfully",
    token,
  });
});
