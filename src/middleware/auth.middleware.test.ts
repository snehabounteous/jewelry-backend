import express, { Response } from "express";
import request from "supertest";
import { authenticate, authorize, AuthRequest } from "./auth.middleware.js";
import * as authService from "../services/auth.service.js";
 
// Mock the auth service
jest.mock("../services/auth.service.js", () => ({
  verifyAccessToken: jest.fn(),
}));
 
describe("Auth Middleware (NodeNext / ESM)", () => {
  let app: express.Express;
  const mockVerifyAccessToken = authService.verifyAccessToken as jest.MockedFunction<typeof authService.verifyAccessToken>;
 
  beforeEach(() => {
    app = express();
    app.use(express.json());
 
    // Route using authenticate
    app.get("/protected", authenticate, (req: AuthRequest, res: Response) => {
      res.status(200).json({ user: req.user });
    });
 
    // Route using authorize
    app.get(
      "/admin",
      authenticate,
      authorize("admin"),
      (req: AuthRequest, res: Response) => {
        res.status(200).json({ msg: "Welcome admin" });
      }
    );
 
    // Route using authorize for user role
    app.get(
      "/user",
      authenticate,
      authorize("user", "admin"),
      (req: AuthRequest, res: Response) => {
        res.status(200).json({ msg: "Welcome user" });
      }
    );
  });
 
  afterEach(() => {
    jest.resetAllMocks();
  });
 
  describe("authenticate middleware", () => {
    it("should return 401 if Authorization header is missing", async () => {
      const res = await request(app).get("/protected");
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: "Missing token" });
    });
 
    it("should return 401 if token is malformed", async () => {
      const res = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer");
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: "Malformed token" });
    });
 
    it("should return 401 if Authorization header doesn't start with Bearer", async () => {
      const res = await request(app)
        .get("/protected")
        .set("Authorization", "InvalidToken");
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: "Malformed token" });
    });
 
    it("should return 401 if token verification fails", async () => {
      mockVerifyAccessToken.mockImplementation(() => {
        throw new Error("Invalid token");
      });
 
      const res = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer invalid-token");
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: "Invalid or expired token" });
      expect(mockVerifyAccessToken).toHaveBeenCalledWith("invalid-token");
    });
 
    it("should successfully authenticate with valid token", async () => {
      const mockUser = { id: "123", role: "user", iat: 1234567890, exp: 1234567890 };
      mockVerifyAccessToken.mockReturnValue(mockUser);
 
      const res = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer valid-token");
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ user: mockUser });
      expect(mockVerifyAccessToken).toHaveBeenCalledWith("valid-token");
    });
  });
 
  describe("authorize middleware", () => {
    it("should return 403 if user doesn't have required role", async () => {
      const mockUser = { id: "123", role: "user", iat: 1234567890, exp: 1234567890 };
      mockVerifyAccessToken.mockReturnValue(mockUser);
 
      const res = await request(app)
        .get("/admin")
        .set("Authorization", "Bearer valid-token");
      
      expect(res.statusCode).toBe(403);
      expect(res.body).toEqual({ error: "Forbidden" });
    });
 
    it("should allow access if user has required role", async () => {
      const mockUser = { id: "123", role: "admin", iat: 1234567890, exp: 1234567890 };
      mockVerifyAccessToken.mockReturnValue(mockUser);
 
      const res = await request(app)
        .get("/admin")
        .set("Authorization", "Bearer valid-token");
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ msg: "Welcome admin" });
    });
 
    it("should allow access if user has one of the required roles", async () => {
      const mockUser = { id: "123", role: "user", iat: 1234567890, exp: 1234567890 };
      mockVerifyAccessToken.mockReturnValue(mockUser);
 
      const res = await request(app)
        .get("/user")
        .set("Authorization", "Bearer valid-token");
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ msg: "Welcome user" });
    });
 
    it("should return 403 if user role is not in the allowed roles list", async () => {
      const mockUser = { id: "123", role: "guest", iat: 1234567890, exp: 1234567890 };
      mockVerifyAccessToken.mockReturnValue(mockUser);
 
      const res = await request(app)
        .get("/user")
        .set("Authorization", "Bearer valid-token");
      
      expect(res.statusCode).toBe(403);
      expect(res.body).toEqual({ error: "Forbidden" });
    });
  });
});