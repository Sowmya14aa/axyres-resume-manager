const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware"); // [NEW] Import Auth Middleware
const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ email, password: hashedPassword });
    await user.save();

    res.json({ msg: "User registered successfully" });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).send("Server Error");
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const payload = { user: { id: user.id } };

    // Use Environment Variable for security (Best Practice)
    // If you haven't set JWT_SECRET in .env, it defaults to 'supersecretkey123'
    const secret = process.env.JWT_SECRET || "supersecretkey123";

    jwt.sign(payload, secret, { expiresIn: "1h" }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).send("Server Error");
  }
});

// [NEW] Get Current User Profile (Required by Task 1)
router.get("/me", auth, async (req, res) => {
  try {
    // Returns user data minus the password
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// [NEW] Logout (Required by Task 1)
router.post("/logout", (req, res) => {
  // Since we use stateless JWT, the client (frontend) just needs to delete the token.
  // We return a success message to confirm the action.
  res.json({ msg: "Logged out successfully" });
});

module.exports = router;
