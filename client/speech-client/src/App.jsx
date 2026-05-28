import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./config/supabase";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // GET CURRENT SESSION
  // =========================
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(session?.user || null);
      setLoading(false);
    };

    getSession();

    // LISTEN FOR LOGIN / LOGOUT CHANGES
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // =========================
  // LOADING SCREEN
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-100 via-white to-purple-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Loading Speech App...
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-blue-50">

        <Routes>

          {/* LOGIN PAGE */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/" />
              ) : (
                <Login />
              )
            }
          />

          {/* DASHBOARD (PROTECTED) */}
          <Route
            path="/"
            element={
              user ? (
                <Dashboard user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* FALLBACK ROUTE */}
          <Route
            path="*"
            element={<Navigate to="/" />}
          />

        </Routes>

      </div>
    </BrowserRouter>
  );
}

export default App;