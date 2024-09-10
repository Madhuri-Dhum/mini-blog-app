const db = require("../../models");

jest.mock("../../models");

const Blog = {
  create: jest.fn(),
  update: jest.fn(),
  findOne: jest.fn(),
  destroy: jest.fn(),
  findAndCountAll: jest.fn(),
};

db.blogs = Blog;
const User = db.users;

const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

const mockNext = jest.fn();

const {
  addBlog,
  updateBlogById,
  deleteBlog,
  getBlogs,
} = require("../../controllers/blog.controller");

describe("Blog Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should blog added successfully", async () => {
    const mockReq = {
      body: {
        title: "New Blog Post",
        content: "This is the content of the blog post.",
      },
      user: {
        id: 1,
      },
    };

    Blog.create.mockResolvedValue({
      dataValues: {
        title: mockReq.body.title,
        content: mockReq.body.content,
        author: mockReq.user.id,
      },
    });

    await addBlog(mockReq, mockRes, mockNext);

    expect(Blog.create).toHaveBeenCalledWith({
      title: mockReq.body.title,
      content: mockReq.body.content,
      author: mockReq.user.id,
    });

    expect(mockRes.status).toHaveBeenCalledWith(201);

    expect(mockRes.json).toHaveBeenCalledWith({
      status: true,
      message: "Blog added successfully",
    });
  });

  describe("updateBlogById", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const mockReq = {
      body: {
        title: "New Blog Post",
        content: "This is the content of the blog post.",
        status: "Accepted",
        author: 1,
      },
      user: {
        id: 1,
        isAdmin: true,
      },
      params: {
        id: 1,
      },
    };

    it("should update blog successfully by admin", async () => {
      Blog.findOne = jest.fn().mockResolvedValue({
        dataValues: {
          id: mockReq.params.id,
          title: mockReq.body.title,
          content: mockReq.body.content,
          status: mockReq.body.status,
        },
      });

      Blog.update = jest.fn().mockResolvedValue([1]);

      await updateBlogById(mockReq, mockRes, mockNext);

      expect(Blog.update).toHaveBeenCalledWith(
        {
          author: mockReq.user.id,
          title: mockReq.body.title,
          content: mockReq.body.content,
          status: mockReq.body.status,
        },
        { where: { id: mockReq.params.id } }
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: true,
        message: "Blog updated successfully",
      });
    });
    it("should update blog successfully by user", async () => {
      mockReq.user.isAdmin = false;
      Blog.findOne = jest.fn().mockResolvedValue({
        dataValues: {
          id: mockReq.params.id,
          title: mockReq.body.title,
          content: mockReq.body.content,
          status: mockReq.body.status,
          author: mockReq.body.author,
        },
      });

      delete mockReq.body.status;

      Blog.update = jest.fn().mockResolvedValue([1]);

      await updateBlogById(mockReq, mockRes, mockNext);

      expect(Blog.update).toHaveBeenCalledWith(
        {
          author: mockReq.user.id,
          title: mockReq.body.title,
          content: mockReq.body.content,
        },
        { where: { id: mockReq.params.id } }
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: true,
        message: "Blog updated successfully",
      });
    });
  });

  it("should blog delete successfully", async () => {
    const mockReq = {
      params: {
        id: 1,
      },
      user: {
        id: 1,
      },
    };

    Blog.findOne = jest.fn().mockResolvedValue({
      dataValues: {
        id: mockReq.params.id,
        author: mockReq.user.id,
      },
    });

    Blog.destroy = jest.fn().mockResolvedValue(1);

    await deleteBlog(mockReq, mockRes, mockNext);

    expect(Blog.destroy).toHaveBeenCalledWith({
      where: { id: mockReq.params.id },
    });

    expect(mockRes.status).toHaveBeenCalledWith(200);

    expect(mockRes.json).toHaveBeenCalledWith({
      status: true,
      message: "Blog deleted successfully",
    });
  });

  describe("getBlogs", () => {
    it("should retrieve all blogs for admin user", async () => {
      const mockReq = {
        query: { userId: 2 },
        user: {
          id: 2,
          isAdmin: true,
        },
      };

      const data = {
        count: 2,
        rows: [
          {
            dataValues: {
              id: 1,
              title: "Blog 1",
              author: 1,
              status: "Pending",
            },
            authorDetails: {
              dataValues: { id: 1, name: "Author 1" },
            },
          },
          {
            dataValues: {
              id: 2,
              title: "Blog 2",
              author: 2,
              status: "Approved",
            },
            authorDetails: {
              dataValues: { id: 2, name: "Author 2" },
            },
          },
        ],
      };

      Blog.findAndCountAll = jest.fn().mockResolvedValue(data);

      await getBlogs(mockReq, mockRes, mockNext);

      expect(Blog.findAndCountAll).toHaveBeenCalledWith({
        where: { author: mockReq.query.userId },
        include: [
          {
            model: User,
            as: "authorDetails",
            attributes: ["id", "name"],
          },
        ],
      });

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: true,
        data,
      });
    });

    it("should retrieve blogs for non-admin user with 'myBlogs' query", async () => {
      const mockReq = {
        query: { myBlogs: "true" },
        user: {
          id: 2,
          isAdmin: false,
        },
      };

      const data = {
        count: 2,
        rows: [
          {
            dataValues: {
              id: 1,
              title: "Blog 1",
              author: 2,
              status: "Approved",
            },
            authorDetails: {
              dataValues: { id: 2, name: "Author 2" },
            },
          },

          {
            dataValues: {
              id: 2,
              title: "Blog 2",
              author: 2,
              status: "Approved",
            },
            authorDetails: {
              dataValues: { id: 2, name: "Author 2" },
            },
          },
          {
            dataValues: {
              id: 3,
              title: "Blog 3",
              author: 2,
              status: "Pending",
            },
            authorDetails: {
              dataValues: { id: 2, name: "Author 3" },
            },
          },
        ],
      };

      Blog.findAndCountAll = jest.fn().mockResolvedValue(data);

      await getBlogs(mockReq, mockRes, mockNext);

      expect(Blog.findAndCountAll).toHaveBeenCalledWith({
        where: { author: mockReq.user.id },
        include: [
          {
            model: User,
            as: "authorDetails",
            attributes: ["id", "name"],
          },
        ],
      });

      expect(mockRes.status).toHaveBeenCalledWith(200);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: true,
        data,
      });
    });

    it("should return only approved blogs if no query or user filter is provided", async () => {
      const mockReq = {
        query: {},
        user: {
          id: 1,
          isAdmin: false,
        },
      };

      const data = {
        count: 2,
        rows: [
          {
            dataValues: {
              id: 1,
              title: "Blog 1",
              author: 1,
              status: "Approved",
            },
            authorDetails: {
              dataValues: { id: 1, name: "Author 1" },
            },
          },
          {
            dataValues: {
              id: 2,
              title: "Blog 2",
              author: 2,
              status: "Approved",
            },
            authorDetails: {
              dataValues: { id: 2, name: "Author 2" },
            },
          },
        ],
      };

      Blog.findAndCountAll.mockResolvedValue(data);

      await getBlogs(mockReq, mockRes, mockNext);

      expect(Blog.findAndCountAll).toHaveBeenCalledWith({
        where: { status: "Approved" },
        include: [
          {
            model: User,
            as: "authorDetails",
            attributes: ["id", "name"],
          },
        ],
      });

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: true,
        data,
      });
    });
  });
});
