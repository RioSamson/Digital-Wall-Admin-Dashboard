// src/pages/ManageThemes.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

const ManageThemes = () => {
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [themeToDelete, setThemeToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchThemes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Themes"));
      const themesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setThemes(themesList);
    } catch (error) {
      console.error("Error fetching themes: ", error);
    }
  };

  const handleDelete = async (themeId, backgroundImgUrl) => {
    try {
      await deleteDoc(doc(db, "Themes", themeId));
      const storageRef = ref(storage, backgroundImgUrl);
      await deleteObject(storageRef);
      setThemes((prevThemes) =>
        prevThemes.filter((theme) => theme.id !== themeId)
      );
      setSelectedTheme(null);
      setConfirmDelete(false);
      setThemeToDelete(null);
    } catch (error) {
      console.error("Error deleting theme: ", error);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900">
      <div className="w-full flex justify-between items-center p-4 bg-gray-800 fixed top-0 left-0 right-0 z-10">
        <h1 className="text-4xl">Manage Themes</h1>
        <button
          className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all duration-300"
          onClick={() => navigate("/new-theme")}
        >
          Add New Theme
        </button>
      </div>
      <div className="flex flex-col items-center justify-center w-full flex-1 p-4 mt-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {themes.map((theme, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-lg shadow-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-all duration-300"
              onClick={() => setSelectedTheme(theme)}
            >
              <div className="w-full" style={{ aspectRatio: "16/9" }}>
                <img
                  src={theme.background_img}
                  alt={`Theme ${index}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-xl text-white font-bold">
                <span>{theme.Name}</span>
                {theme.description && <span>{theme.description}</span>}
              </div>
              <div className="text-center py-2 bg-gray-800">
                <span className="text-white font-semibold">{theme.Name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedTheme && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setSelectedTheme(null)}
          >
            <div
              className="bg-gray-900 bg-opacity-90 p-6 rounded-lg relative max-w-3xl mx-auto shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedTheme.background_img}
                alt="Selected Theme"
                className="max-w-full max-h-96 mb-4"
              />
              <div className="flex justify-around mt-4">
                <button
                  onClick={() => setSelectedTheme(null)}
                  className="bg-gray-600 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setThemeToDelete(selectedTheme);
                    setConfirmDelete(true);
                  }}
                  className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          {confirmDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-gray-900 bg-opacity-90 p-6 rounded-lg relative max-w-md mx-auto shadow-lg">
                <h2 className="text-2xl mb-4">
                  Are you sure you want to permanently delete this theme?
                </h2>
                <div className="flex justify-around mt-4">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="bg-gray-600 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300"
                  >
                    No
                  </button>
                  <button
                    onClick={() =>
                      handleDelete(
                        themeToDelete.id,
                        themeToDelete.background_img
                      )
                    }
                    className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300"
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManageThemes;
