const { check } = require("express-validator");

module.exports = {
  nameValidate: check("name").trim().notEmpty().withMessage("Name is required"),
  emailValidate: check("email")
    .trim()
    .notEmpty()
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false })
    .withMessage("Invalid email"),
  passwordValidate: check("password")
    .trim()
    .isLength({ min: 4 })
    .withMessage("Password must be at least 4 characters long"),
  titleValidate: check("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required"),
  contentValidate: check("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required"),
  statusValidate: check("status")
    .trim()
    .notEmpty()
    .withMessage("Status is required"),
};
