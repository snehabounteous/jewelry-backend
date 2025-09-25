import * as authService from "../services/auth.service.js";
import { db } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Mock external modules
jest.mock("../config/db.js");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("AuthService", () => {
  const mockUser = {
    id: "user1",
    name: "Alice",
    email: "alice@test.com",
    password_hash: "hashedpassword",
    role: "user",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should hash password and insert user", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockUser]),
      });

      const result = await authService.registerUser("Alice", "alice@test.com", "123456");

      expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);
      expect(db.insert).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe("loginUser", () => {
    it("should throw if user not found", async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      });

      await expect(authService.loginUser("notfound@test.com", "123456"))
        .rejects.toThrow("User not found");
    });

    it("should throw if password invalid", async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockUser]),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.loginUser("alice@test.com", "wrongpassword"))
        .rejects.toThrow("Invalid password");
    });

    it("should return user, accessToken, refreshToken if valid", async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([mockUser]),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockImplementation((payload, secret) => `token-${payload.id}`);

      const result = await authService.loginUser("alice@test.com", "123456");

      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBe("token-user1");
      expect(result.refreshToken).toBe("token-user1");
    });
  });

  describe("verifyAccessToken", () => {
    it("should call jwt.verify with ACCESS_SECRET", () => {
      (jwt.verify as jest.Mock).mockReturnValue({ id: "user1" });

      const decoded = authService.verifyAccessToken("token");
      expect(jwt.verify).toHaveBeenCalledWith("token", process.env.JWT_ACCESS_SECRET);
      expect(decoded).toEqual({ id: "user1" });
    });
  });

  describe("verifyRefreshToken", () => {
    it("should call jwt.verify with REFRESH_SECRET", () => {
      (jwt.verify as jest.Mock).mockReturnValue({ id: "user1" });

      const decoded = authService.verifyRefreshToken("token");
      expect(jwt.verify).toHaveBeenCalledWith("token", process.env.JWT_REFRESH_SECRET);
      expect(decoded).toEqual({ id: "user1" });
    });
  });
});
