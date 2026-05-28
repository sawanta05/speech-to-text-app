import { useState, useEffect } from "react";
import { supabase } from "../config/supabase";

function Dashboard({ user }) {
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // =========================
  // FETCH HISTORY
  // =========================
  const fetchHistory = async () => {
    try {
      const response = await fetch(
        `https://speech-to-text-app-oea9.onrender.com/transcriptions/${user.id}`
      );

      const data = await response.json();

      if (data.success) {
        setHistory(data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
  if (user?.id) {
    fetchHistory();
  }
}, [user]);

  // =========================
  // FILE CHANGE
  // =========================
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // =========================
  // UPLOAD AUDIO
  // =========================
  const handleUpload = async () => {
    if (!file) return alert("Select a file first");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", user.id);

    try {
      setLoading(true);

      const res = await fetch("https://speech-to-text-app-oea9.onrender.com", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setTranscription(data.transcript);
        fetchHistory();
      } else {
        setTranscription(data.error);
      }
    } catch (err) {
      setTranscription("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-blue-50 p-6 flex justify-center">

      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">

          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              Speech To Text 🎤
            </h1>
            <p className="text-sm text-gray-500">
              {user.email}
            </p>
          </div>

          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-xl"
          >
            Logout
          </button>

        </div>

        {/* UPLOAD */}
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="w-full border p-3 rounded-xl mb-4"
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-xl"
        >
          {loading ? "Uploading..." : "Upload Audio"}
        </button>

        {/* RESULT */}
        {transcription && (
          <div className="mt-6 bg-gray-100 p-4 rounded-xl">
            <h2 className="font-bold mb-2">Transcription</h2>
            <p>{transcription}</p>
          </div>
        )}

        {/* HISTORY */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">
            History
          </h2>

          {history.length === 0 ? (
            <p className="text-gray-500">No history yet</p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 p-3 rounded-xl mb-3"
              >
                <p className="font-semibold">{item.file_name}</p>
                <p>{item.transcription}</p>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;