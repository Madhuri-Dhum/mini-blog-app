const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

const {
  nameValidate,
  emailValidate,
  passwordValidate,
} = require("../middleware/input.validator");

router.post(
  "/register",
  [nameValidate, emailValidate, passwordValidate],
  authController.userRegistration
);

router.post(
  "/login",
  [emailValidate, passwordValidate],
  authController.userLogin
);

module.exports = router;
