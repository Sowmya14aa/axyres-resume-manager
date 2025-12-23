const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server"); // Import your app
const User = require("../models/User");

// Connect to a test database before running
beforeAll(async () => {
  // We use a separate DB for testing so we don't delete your real data
  await mongoose.connect("mongodb://127.0.0.1:27017/axyres_test");
});

// Clean up database after tests
afterAll(async () => {
  await User.deleteMany({ email: "testuser@example.com" }); // Clean up
  await mongoose.connection.close();
});

describe("Authentication Endpoints", () => {
  const testUser = {
    email: "testuser@example.com",
    password: "password123",
  };

  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/signup").send(testUser);

    // We expect status 200 (OK)
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("msg", "User registered successfully");
  });

  it("should login the user and return a JWT token", async () => {
    const res = await request(app).post("/api/auth/login").send(testUser);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token"); // Token must exist
  });

  it("should fail login with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "wrongpassword",
    });

    expect(res.statusCode).toEqual(400);
  });
});
