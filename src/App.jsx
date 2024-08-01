// src/App.jsx

import React from "react"; // Importing React library to build components
import { Link, Route, Routes } from "react-router-dom"; // Importing routing components from react-router-dom

// Importing all the pages that will be used in the app
import DashboardPage from "./pages/Dashboard.jsx";
import GalleryPage from "./pages/Gallery.jsx";
import ManageThemesPage from "./pages/ManageThemes.jsx";
import NewThemePage from "./pages/NewThemePage.jsx";
import EditThemePage from "./pages/EditThemePage.jsx";
import ManageAIPage from "./pages/ManageAI.jsx";
import AddEditModelPage from "./pages/AddEditModel.jsx";

/**
 * The App component serves as the root component for the application. It defines all the routes and the overall structure of the admin dashboard.
 *
 * @returns {JSX.Element} The root component containing all the routes for the admin dashboard.
 */
const App = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900">
      {/* Using Routes to define the paths and components for each page */}
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
        {/* Route for the Dashboard page */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Route for the Gallery page */}
        <Route path="/gallery" element={<GalleryPage />} />

        {/* Route for the Manage Themes page */}
        <Route path="/manage-themes" element={<ManageThemesPage />} />

        {/* Route for creating a new theme */}
        <Route path="/new-theme" element={<NewThemePage />} />

        {/* Route for editing an existing theme, with a dynamic ID parameter */}
        <Route path="/edit-theme/:id" element={<EditThemePage />} />

        {/* Route for managing AI models */}
        <Route path="/manage-ai" element={<ManageAIPage />} />

        {/* Route for adding a new AI model */}
        <Route path="/manage-ai/add" element={<AddEditModelPage />} />

        {/* Route for editing an existing AI model, with a dynamic ID parameter */}
        <Route path="/manage-ai/edit/:id" element={<AddEditModelPage />} />
      </Routes>
    </div>
  );
};

export default App;
