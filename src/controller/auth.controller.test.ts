import request from "supertest";
import express, { Express } from "express";
import cookieParser from "cookie-parser";
import * as authController from "../controller/auth.controller.js";
import * as authService from "../services/auth.service.js";
import { db } from "../config/db.js";
import jwt from "jsonwebtoken";

// mock modules
jest.mock("../services/auth.service");
jest.mock("jsonwebtoken");

// Cast db to a mocked type so TS doesn’t complain
const mockedDb = db as unknown as {
  select: jest.Mock;
  from: jest.Mock;
  where: jest.Mock;
};

jest.mock("../config/db", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn(),
  },
}));

let app: Express;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use(cookieParser());

  // wire routes
  app.post("/register", authController.register);
  app.post("/login", authController.login);
  app.post("/refresh", authController.refreshToken);
  app.get("/me", authController.getCurrentUser);
  app.post("/logout", authController.logout);
});

describe("Auth Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a user successfully", async () => {
      (authService.registerUser as jest.Mock).mockResolvedValue({
        id: "1",
        name: "Test User",
        email: "test@example.com",
        role: "user",
      });

      const res = await request(app).post("/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe("test@example.com");
      expect(authService.registerUser).toHaveBeenCalledWith(
        "Test User",
        "test@example.com",
        "password123"
      );
    });

    it("should return error on failure", async () => {
      (authService.registerUser as jest.Mock).mockRejectedValue(
        new Error("Registration failed")
      );

      const res = await request(app).post("/register").send({
        name: "Test",
        email: "fail@example.com",
        password: "123",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Registration failed");
    });
  });

  describe("login", () => {
    it("should login and set refresh token cookie", async () => {
      (authService.loginUser as jest.Mock).mockResolvedValue({
        user: { id: "1", name: "Test User", email: "test@example.com", role: "user" },
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });

      const res = await request(app).post("/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBe("access-token");
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("should return error for invalid login", async () => {
      (authService.loginUser as jest.Mock).mockRejectedValue(
        new Error("Invalid credentials")
      );

      const res = await request(app).post("/login").send({
        email: "wrong@example.com",
        password: "wrong",
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Invalid credentials");
    });
  });

  describe("refreshToken", () => {
    it("should issue a new access token", async () => {
      (authService.verifyRefreshToken as jest.Mock).mockReturnValue({ id: "1" });
      mockedDb.where.mockResolvedValue([
        { id: "1", name: "Test", email: "t@example.com", role: "user" },
      ]);
      (jwt.sign as jest.Mock).mockReturnValue("new-access-token");

      const res = await request(app)
        .post("/refresh")
        .set("Cookie", "refreshToken=valid-refresh")
        .send();

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBe("new-access-token");
    });

    it("should fail without refresh token", async () => {
      const res = await request(app).post("/refresh").send();
      expect(res.status).toBe(400);
    });
  });

  describe("getCurrentUser", () => {
    it("should return current user", async () => {
      (authService.verifyAccessToken as jest.Mock).mockReturnValue({ id: "1" });
      mockedDb.where.mockResolvedValue([
        { id: "1", name: "Test User", email: "test@example.com", role: "user" },
      ]);

      const res = await request(app)
        .get("/me")
        .set("Authorization", "Bearer valid-token");

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe("test@example.com");
    });

    it("should fail if no token", async () => {
      const res = await request(app).get("/me");
      expect(res.status).toBe(401);
    });
  });

  describe("logout", () => {
    it("should clear cookie and return success", async () => {
      const res = await request(app).post("/logout").send();
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Logged out successfully");
    });
  });
});
