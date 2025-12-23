const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Resume = require("../models/Resume");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path"); // [IMPORTANT] Added for safe file path handling

// Configure Multer for local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// 1. Upload & Process Route
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    // Prepare Form Data for Python Service
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    console.log("Sending to AI service...");

    // Call Python AI Service
    // Using 127.0.0.1 prevents 'localhost' lookup issues on Windows
    const aiResponse = await axios.post(
      "http://127.0.0.1:5000/process",
      formData,
      {
        headers: { ...formData.getHeaders() },
      }
    );

    console.log("AI Response:", aiResponse.data);

    // Save to MongoDB
    const newResume = new Resume({
      user: req.user.id,
      fileName: req.file.originalname,
      filePath: filePath,
      parsedData: aiResponse.data,
    });

    await newResume.save();
    res.json(newResume);
  } catch (err) {
    console.error("UPLOAD ERROR:", err.message);
    res.status(500).json({ msg: "Error processing resume" });
  }
});

// 2. Get All Resumes for User
router.get("/", auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id });
    res.json(resumes);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// 3. Get Specific Resume (Needed for "View" button)
router.get("/:id", auth, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ msg: "Resume not found" });

    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }
    res.json(resume);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// 4. Update Resume (Needed for "Edit" button)
router.put("/:id", auth, async (req, res) => {
  try {
    let resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ msg: "Resume not found" });

    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    // Update parsed data if provided
    if (req.body.parsedData) {
      resume.parsedData = req.body.parsedData;
    }

    await resume.save();
    res.json(resume);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// 5. Delete Resume (Needed for "Trash" button)
router.delete("/:id", auth, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ msg: "Resume not found" });

    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    // Try to delete the physical file
    try {
      // Resolve absolute path for safety
      const absolutePath = path.resolve(resume.filePath);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    } catch (fsError) {
      console.error("File delete error:", fsError);
    }

    // Delete from DB
    await Resume.findByIdAndDelete(req.params.id);
    res.json({ msg: "Resume removed" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// [UPDATED] 6. Download Resume File (Safer Path Handling)
router.get("/:id/download", auth, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ msg: "Resume not found" });

    // Check ownership
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    // FIX: Resolve the absolute path to ensure the system finds the file
    // We assume 'server.js' is in the root 'backend' folder, so uploads are relative to that.
    const absolutePath = path.resolve(resume.filePath);

    // Check if file exists before sending
    if (!fs.existsSync(absolutePath)) {
      console.error("File missing at:", absolutePath);
      return res.status(404).json({ msg: "Physical file not found on server" });
    }

    res.download(absolutePath, resume.fileName);
  } catch (err) {
    console.error("DOWNLOAD ERROR:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
