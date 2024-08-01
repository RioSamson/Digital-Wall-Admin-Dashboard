// src/pages/Dashboard.jsx

import React from "react"; // Import React library
import { useNavigate } from "react-router-dom"; // Import useNavigate hook from react-router-dom for navigation

/**
 * Dashboard component serves as the main entry point for the admin panel,
 * providing navigation to different management sections like Drawings, Themes, and AI Models.
 *
 * @returns {JSX.Element} - The rendered component for the admin dashboard
 */
const Dashboard = () => {
  const navigate = useNavigate(); // Initialize the useNavigate hook for programmatic navigation

  /**
   * Navigates to the gallery page to manage drawings.
   */
  const handleManageDrawings = () => {
    navigate("/gallery"); // Navigate to the gallery page
  };

  /**
   * Navigates to the themes management page.
   */
  const handleManageThemes = () => {
    navigate("/manage-themes"); // Navigate to the manage themes page
  };

  /**
   * Navigates to the AI models management page.
   */
  const handleManageAI = () => {
    navigate("/manage-ai"); // Navigate to the manage AI page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
      <h1 className="text-4xl mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleManageDrawings} // Button to navigate to the Manage Drawings section
        >
          Manage Drawings
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleManageThemes} // Button to navigate to the Manage Themes section
        >
          Manage Themes
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleManageAI} // Button to navigate to the Manage AI section
        >
          Manage AI
        </button>
      </div>
    </div>
  );
};

export default Dashboard; // Export the Dashboard component as default
