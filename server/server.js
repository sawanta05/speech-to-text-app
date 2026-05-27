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
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// allowed audio types
const allowedTypes = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
  "audio/mp4",
];

// multer upload config
const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },

  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Upload audio only."));
    }
  },
});

// =======================
// UPLOAD + TRANSCRIBE ROUTE
// =======================
app.post("/upload", upload.single("file"), async (req, res) => {
  try {

    // =======================
    // CHECK FILE
    // =======================
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No audio file uploaded",
      });
    }

    // =======================
    // MOCK TRANSCRIPTION
    // =======================
    const transcript =
      "This is a mock transcription because OpenAI quota is exceeded.";

    // =======================
    // SAVE TO SUPABASE
    // =======================
    const { data, error } = await supabase
      .from("transcriptions")
      .insert([
        {
          file_name: req.file.filename,
          transcription: transcript,
        },
      ])
      .select();

    // =======================
    // SUPABASE ERROR
    // =======================
    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    // =======================
    // SUCCESS RESPONSE
    // =======================
    res.json({
      success: true,
      message: "File uploaded and transcribed successfully 🚀",
      transcript,
      data,
    });

  } catch (error) {

    console.error("Server Error:", error);

    res.status(500).json({
      success: false,
      error: "Transcription failed",
    });
  }
});

// =======================
// GET ALL TRANSCRIPTIONS
// =======================
app.get("/transcriptions", async (req, res) => {
  try {

    const { data, error } = await supabase
      .from("transcriptions")
      .select("*")
      .order("created_at", { ascending: false });

    // =======================
    // SUPABASE ERROR
    // =======================
    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    // =======================
    // SUCCESS RESPONSE
    // =======================
    res.json({
      success: true,
      data,
    });

  } catch (error) {

    console.error("Fetch Error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to fetch transcriptions",
    });
  }
});

// =======================
// GLOBAL ERROR HANDLER
// =======================
app.use((err, req, res, next) => {

  console.error("Global Error:", err);

  // multer errors
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  // invalid file type
  if (err.message === "Invalid file type. Upload audio only.") {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  // generic error
  res.status(500).json({
    success: false,
    error: err.message || "Something went wrong",
  });
});

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});