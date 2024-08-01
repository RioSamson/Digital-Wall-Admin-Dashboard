// src/pages/Dashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleManageDrawings = () => {
    navigate("/gallery");
  };

  const handleManageThemes = () => {
    navigate("/manage-themes");
  };

  const handleManageAI = () => {
    navigate("/manage-ai");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
      <h1 className="text-4xl mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleManageDrawings}
        >
          Manage Drawings
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleManageThemes}
        >
          Manage Themes
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleManageAI}
        >
          Manage AI
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
