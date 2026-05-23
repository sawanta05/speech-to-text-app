const express = require("express");
const cors = require("cors");
require("dotenv").config();

const multer = require("multer");
const path = require("path");

const supabase = require("./config/supabase");

const app = express();

// =======================
// MIDDLEWARE
// =======================
app.use(cors());
app.use(express.json());

// Access uploads folder
app.use("/uploads", express.static("uploads"));

// =======================
// ROOT ROUTE
// =======================
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// =======================
// MULTER CONFIGURATION
// =======================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// =======================
// FILE UPLOAD ROUTE
// =======================
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    // Save file info in Supabase
    const { data, error } = await supabase
      .from("audio_files")
      .insert([
        {
          filename: req.file.filename,
          file_url: req.file.path,
          transcription: "",
        },
      ]);

    // Supabase error handling
    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    // Success response
    res.json({
      message: "File uploaded and saved to Supabase 🚀",
      data,
    });

  } catch (error) {
    res.status(500).json({
      error: "Upload failed",
    });
  }
});

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});