// src/pages/ManageAI.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const ManageAI = () => {
  const [models, setModels] = useState([]);
  const navigate = useNavigate();

  const fetchModels = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "AIModels"));
      const modelsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setModels(modelsList);
    } catch (error) {
      console.error("Error fetching models: ", error);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleAddModel = () => {
    navigate("/manage-ai/add");
  };

  const handleEditModel = (modelId) => {
    navigate(`/manage-ai/edit/${modelId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900 p-4">
      <h1 className="text-4xl mb-8">Manage AI Models</h1>
      <button
        onClick={handleAddModel}
        className="mb-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Add Model
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((model) => (
          <div
            key={model.id}
            className="relative group overflow-hidden rounded-lg shadow-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-all duration-300"
            onClick={() => handleEditModel(model.id)}
          >
            <div className="p-4">
              <h2 className="text-xl font-bold">{model.name}</h2>
              <p>{model.description}</p>
              <p className="text-sm mt-2 text-gray-400">
                API Key: {model.apiKey}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageAI;
