import { useState } from "react";
import axios from "axios";

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");

  const handleUpload = async () => {
    if (!file) return alert("Select an audio file first!");

    const formData = new FormData();
    formData.append("audio", file);

    try {
      setLoading(true);
      setText("");

      const res = await axios.post(
        "http://localhost:5000/upload-audio",
        formData
      );

      setText(res.data.text);
    } catch (err) {
      console.log(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🎤 Speech to Text</h1>

      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleUpload}>
        Upload & Transcribe
      </button>

      <br /><br />

      {loading && <p>⏳ Transcribing...</p>}

      {text && (
        <div>
          <h3>Result:</h3>
          <p>{text}</p>
        </div>
      )}
    </div>
  );
}