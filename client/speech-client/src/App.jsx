import { useState, useEffect } from "react";
import { supabase } from "./config/supabase";

function App() {

  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // AUTH STATES
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  // =======================
  // SIGN UP
  // =======================
  const signUp = async () => {

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {

      alert(error.message);

    } else {

      alert("Signup successful!");

    }
  };

  // =======================
  // SIGN IN
  // =======================
  const signIn = async () => {

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {

      alert(error.message);

    } else {

      setUser(data.user);

      alert("Login successful!");

      fetchHistory(data.user.id);

    }
  };

  // =======================
  // LOGOUT
  // =======================
  const logout = async () => {

    await supabase.auth.signOut();

    setUser(null);

    setHistory([]);

    alert("Logged out");
  };

  // =======================
  // CHECK SESSION
  // =======================
  useEffect(() => {

    const getSession = async () => {

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {

        setUser(session.user);

        fetchHistory(session.user.id);

      }
    };

    getSession();

  }, []);

  // =======================
  // FETCH HISTORY
  // =======================
  const fetchHistory = async (userId) => {

    try {

      const response = await fetch(
        `http://localhost:5000/transcriptions/${userId}`
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
  // FILE CHANGE
  // =======================
  const handleFileChange = (e) => {

    setFile(e.target.files[0]);

  };

  // =======================
  // UPLOAD AUDIO
  // =======================
  const handleUpload = async () => {

    if (!user) {

      alert("Please login first");
      return;

    }

    if (!file) {

      alert("Please select a file");
      return;

    }

    const formData = new FormData();

    formData.append("file", file);

    // SEND USER ID
    formData.append("user_id", user.id);

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

        // REFRESH HISTORY
        fetchHistory(user.id);

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

        {/* AUTH SECTION */}
        <div className="mb-8 space-y-4">

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="
              w-full
              border
              border-gray-300
              p-3
              rounded-xl
            "
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="
              w-full
              border
              border-gray-300
              p-3
              rounded-xl
            "
          />

          <div className="flex gap-4">

            <button
              onClick={signUp}
              className="
                w-full
                bg-green-600
                hover:bg-green-700
                text-white
                py-3
                rounded-xl
              "
            >
              Signup
            </button>

            <button
              onClick={signIn}
              className="
                w-full
                bg-blue-600
                hover:bg-blue-700
                text-white
                py-3
                rounded-xl
              "
            >
              Login
            </button>

          </div>

          {
            user && (

              <div className="text-center">

                <p className="text-green-600 font-semibold mb-3">
                  Logged in as:
                  <br />
                  {user.email}
                </p>

                <button
                  onClick={logout}
                  className="
                    bg-red-500
                    hover:bg-red-600
                    text-white
                    px-6
                    py-2
                    rounded-xl
                  "
                >
                  Logout
                </button>

              </div>

            )
          }

        </div>

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
        {
          transcription && (

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

          )
        }

        {/* HISTORY */}
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

                {
                  history.map((item) => (

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

                  ))
                }

              </div>

            )
          }

        </div>

      </div>

    </div>
  );
}

export default App;