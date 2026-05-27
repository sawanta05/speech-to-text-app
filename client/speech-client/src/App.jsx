import { useState, useEffect } from "react";

function App() {

  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // =======================
  // FETCH HISTORY
  // =======================
  const fetchHistory = async () => {

    try {

      const response = await fetch(
        "http://localhost:5000/transcriptions"
      );

      const data = await response.json();

      if (data.success) {
        setHistory(data.data);
      }

    } catch (error) {

      console.log(error);

    }
  };

  // =======================
  // LOAD HISTORY ON PAGE LOAD
  // =======================
  useEffect(() => {
    fetchHistory();
  }, []);

  // =======================
  // FILE CHANGE
  // =======================
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // =======================
  // UPLOAD AUDIO
  // =======================
  const handleUpload = async () => {

    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {

      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      console.log(data);

      // SUCCESS
      if (data.success) {

        setTranscription(data.transcript);

        // refresh history
        fetchHistory();

      } else {

        setTranscription(data.error);

      }

    } catch (error) {

      console.log(error);

      setTranscription(
        "Error uploading audio"
      );

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-2xl">

        {/* HEADING */}
        <h1 className="text-4xl font-bold text-center text-blue-600">
          Speech To Text App 🎤
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Upload audio files and convert speech into text
        </p>

        {/* FILE INPUT */}
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="
            w-full
            border
            border-gray-300
            p-3
            rounded-xl
            mb-6
            cursor-pointer
            bg-gray-50
          "
        />

        {/* BUTTON */}
        <button
          onClick={handleUpload}
          disabled={loading}
          className="
            w-full
            bg-blue-600
            hover:bg-blue-700
            hover:scale-105
            transition
            duration-300
            text-white
            font-semibold
            py-3
            rounded-xl
            disabled:opacity-50
          "
        >
          {loading ? "Uploading..." : "Upload Audio"}
        </button>

        {/* TRANSCRIPTION */}
        {transcription && (

          <div
            className="
              mt-8
              bg-gray-100
              p-5
              rounded-2xl
              shadow-inner
            "
          >

            <h2 className="text-2xl font-semibold mb-3 text-gray-700">
              Transcription
            </h2>

            <p className="text-gray-600 break-words">
              {transcription}
            </p>

          </div>

        )}

        {/* HISTORY SECTION */}
        <div className="mt-10">

          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Previous Transcriptions
          </h2>

          {
            history.length === 0 ? (

              <p className="text-gray-500">
                No transcriptions yet
              </p>

            ) : (

              <div className="space-y-4">

                {history.map((item) => (

                  <div
                    key={item.id}
                    className="
                      bg-gray-50
                      p-5
                      rounded-2xl
                      shadow-md
                      hover:shadow-xl
                      transition
                      duration-300
                    "
                  >

                    <h3 className="text-lg font-semibold text-blue-600">
                      {item.file_name}
                    </h3>

                    <p className="text-gray-700 mt-3">
                      {item.transcription}
                    </p>

                    <p className="text-sm text-gray-400 mt-4">
                      {
                        new Date(
                          item.created_at
                        ).toLocaleString()
                      }
                    </p>

                  </div>

                ))}

              </div>

            )
          }

        </div>

      </div>

    </div>
  );
}

export default App;