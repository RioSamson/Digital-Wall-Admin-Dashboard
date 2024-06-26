// src/App.jsx
import React from "react";
import { Link, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/Dashboard.jsx";
import GalleryPage from "./pages/Gallery.jsx";

const App = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900">
      <Routes>
        <Route
          path="/"
          element={
            <div className="text-center">
              <h1 className="text-4xl mb-8">Welcome to the Admin Dashboard</h1>
              <Link
                to="/dashboard"
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Dashboard Page
              </Link>
            </div>
          }
        />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
      </Routes>
    </div>
  );
};

export default App;
