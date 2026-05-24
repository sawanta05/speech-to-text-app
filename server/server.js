const express = require("express");
const cors = require("cors");
require("dotenv").config();

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const OpenAI = require("openai");

const supabase = require("./config/supabase");

const app = express();

// =======================
// OPENAI SETUP
// =======================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =======================
// MIDDLEWARE
// =======================
app.use(cors());
app.use(express.json());

// serve uploads folder publicly
app.use("/uploads", express.static("uploads"));

// =======================
// ROOT ROUTE
// =======================
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
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
// UPLOAD + TRANSCRIBE ROUTE
// =======================
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // =======================
    // WHISPER TRANSCRIPTION
    // =======================
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: "whisper-1",
    });

    const transcript = transcriptionResponse.text;

    // =======================
    // SAVE TO SUPABASE
    // =======================
    const { data, error } = await supabase
      .from("audio_files")
      .insert([
        {
          filename: req.file.filename,
          file_url: req.file.path,
          transcription: transcript,
        },
      ])
      .select(); // 👈 important to return inserted row

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    // =======================
    // RESPONSE TO FRONTEND
    // =======================
    res.json({
      success: true,
      message: "File uploaded and transcribed successfully 🚀",
      transcript,
      data,
    });

  } catch (error) {
    console.error("Server Error:", error.message);

    res.status(500).json({
      success: false,
      error: error.message,
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