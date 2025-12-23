const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
// require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.use(morgan("dev"));

// --- CONFIGURATION ---
const MONGO_URI = "mongodb://127.0.0.1:27017/axyres";
const PORT = 3000;

// --- ROUTES ---
app.use("/api/auth", require("./routes/auth"));
app.use("/api/resumes", require("./routes/resume"));

// --- ERROR HANDLING ---
const errorHandler = require("./middleware/errorMiddleware");
app.use(errorHandler);

// --- START SERVER (Only if running directly) ---
// This prevents the DB from connecting twice when running tests
if (require.main === module) {
  // 1. Connect to DB
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.log("❌ DB ERROR:", err));

  // 2. Start Listening
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Live Logs enabled... waiting for requests.`);
    console.log(`-----------------------------------------------`);
  });
}

// Export app for testing (without starting the server or DB)
module.exports = app;
