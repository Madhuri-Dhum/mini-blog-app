const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog.controller");

const {
  titleValidate,
  contentValidate,
} = require("../middleware/input.validator");

router.post("/add", [titleValidate, contentValidate], blogController.addBlog);

router.put("/update/:id", blogController.updateBlogById);

router.get("/get", blogController.getBlogs);

router.delete("/delete/:id", blogController.deleteBlog);

module.exports = router;
