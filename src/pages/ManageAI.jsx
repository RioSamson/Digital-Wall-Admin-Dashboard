import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

/**
 * ManageAI component is responsible for displaying and managing AI models.
 * It provides functionalities to fetch, display, add, and edit AI models.
 *
 * @component
 */
const ManageAI = () => {
  // State to store the list of AI models
  const [models, setModels] = useState([]);

  // Hook for navigation between routes
  const navigate = useNavigate();

  /**
   * Fetches AI models from the Firestore database.
   * Retrieves all documents from the "AIModels" collection and updates the models state.
   */
  const fetchModels = async () => {
    try {
      // Query the "AIModels" collection in Firestore
      const querySnapshot = await getDocs(collection(db, "AIModels"));

      // Map over the documents to extract data and add to the models list
      const modelsList = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Document ID
        ...doc.data(), // Document data
      }));

      // Update the state with the list of models
      setModels(modelsList);
    } catch (error) {
      console.error("Error fetching models: ", error); // Log any errors
    }
  };

  /**
   * useEffect hook to fetch AI models when the component mounts.
   * It ensures that the models are loaded and displayed as soon as the component is rendered.
   */
  useEffect(() => {
    fetchModels(); // Call the fetchModels function
  }, []); // Empty dependency array ensures it runs only once

  /**
   * Navigates to the add model page.
   * Triggered when the "Add Model" button is clicked.
   */
  const handleAddModel = () => {
    navigate("/manage-ai/add"); // Navigate to the add model page
  };

  /**
   * Navigates to the edit model page for a specific model.
   * Triggered when a model is clicked for editing.
   *
   * @param {string} modelId - The ID of the model to be edited.
   */
  const handleEditModel = (modelId) => {
    navigate(`/manage-ai/edit/${modelId}`); // Navigate to the edit page with modelId
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900 p-4">
      <h1 className="text-4xl mb-8">Manage AI Models</h1>

      {/* Button to add a new AI model */}
      <button
        onClick={handleAddModel} // Add model button handler
        className="mb-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Add Model
      </button>

      {/* Grid to display the list of AI models */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((model) => (
          <div
            key={model.id} // Unique key for each model
            className="relative group overflow-hidden rounded-lg shadow-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-all duration-300"
            onClick={() => handleEditModel(model.id)} // Edit model handler
          >
            <div className="p-4">
              <h2 className="text-xl font-bold">{model.name}</h2>{" "}
              {/* Display model name */}
              <p>{model.description}</p> {/* Display model description */}
              <p className="text-sm mt-2 text-gray-400">
                API Key: {model.apiKey} {/* Display model API key */}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageAI; // Export the component for use in other parts of the application
