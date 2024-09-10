const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../models");
jest.mock("../../models");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

const User = {
  create: jest.fn(),
  findOne: jest.fn(),
};

db.users = User;

const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

const mockNext = jest.fn();

const {
  userRegistration,
  userLogin,
} = require("../../controllers/auth.controller");

describe("Auth Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe("userRegistration", () => {
    const mockReq = {
      body: {
        name: "test",
        email: "test@example.com",
        password: "password123",
      },
    };

    it("should user registered successfully", async () => {
      const hashedPassword = "hashedPassword";

      bcrypt.hash = jest.fn().mockResolvedValue(hashedPassword);

      User.findOne = jest.fn().mockResolvedValue(null);

      User.create = jest.fn().mockResolvedValue({
        dataValues: {
          name: mockReq.body.name,
          email: mockReq.body.email,
          password: hashedPassword,
        },
      });

      await userRegistration(mockReq, mockRes, mockNext);

      expect(bcrypt.hash).toHaveBeenCalledWith(mockReq.body.password, 12);

      expect(User.create).toHaveBeenCalledWith({
        name: mockReq.body.name,
        email: mockReq.body.email,
        password: hashedPassword,
      });

      expect(mockRes.status).toHaveBeenCalledWith(201);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: true,
        message: "User registered successfully",
      });
    });

    it("should throw error if user already exists", async () => {
      User.findOne = jest.fn().mockResolvedValue({
        dataValues: {
          email: mockReq.body.email,
        },
      });

      await userRegistration(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 409,
          message: "User already exists",
        })
      );
    });
  });

  describe("userLogin", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const mockReq = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    };

    it("should user login successfully", async () => {
      const userDetails = {
        id: 1,
        email: "test@example.com",
        password: "hashedPassword",
        name: "Test User",
        isAdmin: false,
      };

      User.findOne.mockResolvedValue(userDetails);

      bcrypt.compare.mockResolvedValue(true);

      jwt.sign.mockReturnValue("mockToken");

      await userLogin(mockReq, mockRes, mockNext);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockReq.body.password,
        userDetails.password
      );

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userDetails.id, isAdmin: userDetails.isAdmin },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "30d" }
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: true,
        message: "User login successfully",
        data: {
          id: userDetails.id,
          isAdmin: userDetails.isAdmin,
          name: userDetails.name,
          email: userDetails.email,
          token: "mockToken",
        },
      });
    });

    it("should throw error if user does not exist", async () => {
      User.findOne.mockResolvedValue(null);

      await userLogin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "Please signup first",
        })
      );
    });

    it("should throw error if password is incorrect", async () => {
      const userDetails = {
        id: 1,
        email: "test@example.com",
        password: "hashedPassword",
      };

      User.findOne.mockResolvedValue(userDetails);

      bcrypt.compare.mockResolvedValue(false);

      await userLogin(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: "Password is incorrect",
        })
      );
    });
  });
});
