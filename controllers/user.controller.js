const db = require("../models");
const User = db.users;

const userLogin = async (req, res, next) => {
  try {
    const users = await User.findAndCountAll();

    res.status(200).json({ data: users });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  userLogin,
};
