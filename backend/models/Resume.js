const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fileName: String,
  filePath: String,
  uploadDate: { type: Date, default: Date.now },
  parsedData: {
    // This stores the AI output
    name: String,
    email: String,
    phone: String,
    skills: [String],
    education: Array,
    experience: Array,
  },
});

module.exports = mongoose.model("Resume", ResumeSchema);
