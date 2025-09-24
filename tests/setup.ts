// tests/setup.ts
import dotenv from "dotenv";

dotenv.config({ path: "../.env.test" });

// optional global setup / mocks
beforeAll(() => {
  // any global initialization
});

afterAll(() => {
  // global cleanup
});
