const db = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const inputErrorValidation = require("../middleware/inputError.validation");
const User = db.users;

const userRegistration = async (req, res, next) => {
  try {
    inputErrorValidation(req);

    const { email, password } = req.body;

    const userDetails = await checkUserByEmail(email);

    if (userDetails) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }

    const hashPassword = await bcrypt.hash(password, 12);

    await User.create({ ...req.body, password: hashPassword });

    res
      .status(201)
      .json({ status: true, message: "User registered successfully" });
  } catch (error) {
    next(error);
  }
};

const userLogin = async (req, res, next) => {
  try {
    inputErrorValidation(req);

    const { email, password } = req.body;

    const userDetails = await checkUserByEmail(email);

    if (!userDetails) {
      const error = new Error("Please signup first");
      error.statusCode = 401;
      throw error;
    }

    const isPasswordEqual = await bcrypt.compare(
      password,
      userDetails.password
    );

    if (!isPasswordEqual) {
      const error = new Error("Password is incorrect");
      error.statusCode = 401;
      throw error;
    }

    const userPayload = { id: userDetails.id, isAdmin: userDetails.isAdmin };

    const token = jwt.sign(userPayload, process.env.JWT_SECRET_KEY, {
      expiresIn: "30d",
    });

    res.status(200).json({
      status: true,
      message: "User login successfully",
      data: {
        ...userPayload,
        name: userDetails.name,
        email: userDetails.email,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const checkUserByEmail = (email) => {
  return User.findOne({ where: { email: email } });
};

module.exports = {
  userRegistration,
  userLogin,
};
