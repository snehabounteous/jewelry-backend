// tests/middleware/auth.middleware.test.ts
import express, { Request, Response } from "express";
import request from "supertest";
import { authenticate, authorize, AuthRequest } from "../../src/middleware/auth.middleware.js";

// ESM-compatible jest mock
import { jest } from "@jest/globals";
import * as authServiceModule from "../../src/services/auth.service.js";

// Mock verifyAccessToken
jest.unstable_mockModule("../../src/services/auth.service.js", () => ({
  verifyAccessToken: jest.fn(),
}));

// Import the mocked module
const authService = (await import("../../src/services/auth.service.js")) as typeof authServiceModule;
const mockedVerifyAccessToken = authService.verifyAccessToken as jest.Mock;

describe("Auth Middleware (NodeNext / ESM)", () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();

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
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should return 401 if Authorization header is missing", async () => {
    const res = await request(app).get("/protected");
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Missing token" });
  });

  it("should return 401 if token is malformed", async () => {
    const res = await request(app).get("/protected").set("Authorization", "Bearer");
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Malformed token" });
  });

  it("should return 401 if token is invalid", async () => {
    mockedVerifyAccessToken.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    const res = await request(app).get("/protected").set("Authorization", "Bearer bad-token");
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: "Invalid or expired token" });
  });

  it("should allow access with valid token", async () => {
    mockedVerifyAccessToken.mockReturnValue({ id: "user1", role: "user" });

    const res = await request(app).get("/protected").set("Authorization", "Bearer good-token");
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toEqual({ id: "user1", role: "user" });
  });

  it("should return 403 if user role is not authorized", async () => {
    mockedVerifyAccessToken.mockReturnValue({ id: "user1", role: "user" });

    const res = await request(app).get("/admin").set("Authorization", "Bearer good-token");
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Forbidden" });
  });

  it("should allow access if user role is authorized", async () => {
    mockedVerifyAccessToken.mockReturnValue({ id: "admin1", role: "admin" });

    const res = await request(app).get("/admin").set("Authorization", "Bearer good-token");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ msg: "Welcome admin" });
  });
});
    