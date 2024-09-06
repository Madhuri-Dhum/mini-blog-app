const express = require("express");
const router = express.Router();
const authController = require("../controllers/blog.controller");

const {
  titleValidate,
  contentValidate,
  statusValidate,
} = require("../middleware/input.validator");

router.post("/add", [titleValidate, contentValidate], authController.addBlog);

router.put(
  "/update/:id",
  [titleValidate, contentValidate],
  authController.updateBlogById
);

router.get("/get", authController.getBlogs);

router.delete("/delete/:id", authController.deleteBlog);

module.exports = router;
