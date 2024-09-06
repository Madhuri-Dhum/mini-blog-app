const db = require("../models");
const Blog = db.blogs;
const User = db.users;
const inputErrorValidation = require("../middleware/inputError.validation");

const addBlog = async (req, res, next) => {
  try {
    inputErrorValidation(req);

    await Blog.create({ ...req.body, author: req.user.id });

    res.status(201).json({ status: true, message: "Blog added successfully" });
  } catch (error) {
    next(error);
  }
};

const updateBlogById = async (req, res, next) => {
  try {
    inputErrorValidation(req);

    const blogId = req.params.id;
    const { id, isAdmin } = req.user;
    const { status } = req.body;

    const blogDetails = await getBlogById(blogId);

    if (blogDetails.author !== id && !isAdmin) {
      const error = new Error("You don't have access");
      error.statusCode = 403;
      throw error;
    }

    if (!isAdmin && status) {
      const error = new Error("You don't have access to update the status");
      error.statusCode = 403;
      throw error;
    }

    await Blog.update(req.body, {
      where: { id: blogId },
    });

    res
      .status(200)
      .json({ status: true, message: "Blog updated successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getBlogs = async (req, res, next) => {
  try {
    const { myBlogs, userId, status } = req.query;
    const { isAdmin, id } = req.user;

    const whereClause = {};

    if (isAdmin) {
      if (userId) {
        whereClause.author = userId;
      }
      if (status) {
        whereClause.status = status;
      }
    } else if (myBlogs === "true") {
      whereClause.author = id;
      if (status) {
        whereClause.status = status;
      }
    } else {
      if (userId) {
        whereClause.author = userId;
      }
      whereClause.status = "Approved";
    }

    const blogs = await Blog.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "authorDetails",
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(200).json({ status: true, data: blogs });
  } catch (error) {
    next(error);
  }
};

const getBlogById = async (blogId) => {
  try {
    const blog = await Blog.findOne({ where: { id: blogId } });

    if (!blog) {
      const error = new Error("Blog not found");
      error.statusCode = 404;
      throw error;
    }

    return blog;
  } catch (error) {
    throw error;
  }
};

const deleteBlog = async (req, res, next) => {
  try {
    const blogId = req.params.id;
    const authorId = req.user.id;

    const blogDetails = await getBlogById(blogId);

    if (blogDetails.author !== authorId) {
      const error = new Error("You don't have access");
      error.statusCode = 403;
      throw error;
    }

    await Blog.destroy({
      where: { id: blogId },
    });

    res
      .status(200)
      .json({ status: true, message: "Blog deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addBlog,
  updateBlogById,
  getBlogs,
  deleteBlog,
};
