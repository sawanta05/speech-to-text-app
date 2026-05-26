const express = require("express");
const cors = require("cors");
require("dotenv").config();

const multer = require("multer");
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
    // check file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // =======================
    // WHISPER TRANSCRIPTION
    // =======================
    let transcript = "";

    try {
      const transcriptionResponse =
        await openai.audio.transcriptions.create({
          file: fs.createReadStream(req.file.path),
          model: "whisper-1",
        });

      transcript = transcriptionResponse.text;
    } catch (openaiError) {
      console.error("OpenAI Error:", openaiError.status, openaiError.message);

      // 👉 HANDLE QUOTA ERROR (429)
      if (openaiError.status === 429) {
        return res.status(429).json({
          success: false,
          error:
            "OpenAI quota exceeded. Please check your billing or try again later.",
        });
      }

      return res.status(500).json({
        success: false,
        error: "Transcription failed",
      });
    }

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

    // if supabase error
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
    console.error("Server Error:", error.message);

    res.status(500).json({
      success: false,
      error: error.message,
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

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error("Fetch Error:", error.message);

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