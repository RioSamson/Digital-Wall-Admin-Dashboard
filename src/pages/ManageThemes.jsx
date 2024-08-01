import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../firebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

/**
 * ManageThemes component handles the display, addition, editing, and deletion of themes
 * within the application. It interacts with the Firestore database to manage themes and
 * Firebase Storage to handle associated images.
 *
 * @component
 */
const ManageThemes = () => {
  const [themes, setThemes] = useState([]); // State to store the list of themes fetched from Firestore
  const [selectedTheme, setSelectedTheme] = useState(null); // State to store the currently selected theme for further actions
  const [confirmDelete, setConfirmDelete] = useState(false); // State to manage the delete confirmation dialog visibility
  const [themeToDelete, setThemeToDelete] = useState(null); // State to store the theme selected for deletion
  const navigate = useNavigate(); // React Router's hook for programmatically navigating between routes

  /**
   * Fetch all themes from the Firestore database and set the themes state.
   * This function runs when the component mounts.
   */
  const fetchThemes = async () => {
    try {
      // Retrieve all documents from the 'Themes' collection
      const querySnapshot = await getDocs(collection(db, "Themes"));
      const themesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })); // Map the documents to an array of theme objects with ID and data
      setThemes(themesList); // Update the themes state with the fetched list
    } catch (error) {
      console.error("Error fetching themes: ", error); // Log any errors that occur during the fetch
    }
  };

  /**
   * Delete all drawings associated with a specific theme. This involves deleting images
   * from Firebase Storage and documents from Firestore.
   *
   * @param {string} themeId - The ID of the theme whose drawings are to be deleted.
   */
  const deleteDrawingsForTheme = async (themeId) => {
    // Query drawings associated with the given theme ID
    const drawingsQuery = query(
      collection(db, "Drawings"),
      where("theme_id", "==", doc(db, "Themes", themeId))
    );
    const drawingsSnapshot = await getDocs(drawingsQuery); // Execute the query

    // Create an array of promises to delete each drawing
    const deletePromises = drawingsSnapshot.docs.map(async (drawingDoc) => {
      const drawingData = drawingDoc.data();

      // Delete the original drawing image from Firebase Storage
      const originalStorageRef = ref(storage, drawingData.original_drawing);
      await deleteObject(originalStorageRef);

      // Delete each enhanced drawing image from Firebase Storage
      const deleteEnhancedImagesPromises = drawingData.enhanced_drawings.map(
        async (url) => {
          const enhancedStorageRef = ref(storage, url);
          await deleteObject(enhancedStorageRef);
        }
      );

      await Promise.all(deleteEnhancedImagesPromises); // Wait for all enhanced images to be deleted
      await deleteDoc(drawingDoc.ref); // Delete the drawing document from Firestore
    });

    await Promise.all(deletePromises); // Wait for all drawing deletions to complete
  };

  /**
   * Handles the deletion of a theme by removing all associated drawings, images, and the theme
   * document itself from the database and storage.
   *
   * @param {string} themeId - The ID of the theme to delete.
   * @param {string} backgroundImgUrl - The URL of the theme's background image to delete.
   */
  const handleDelete = async (themeId, backgroundImgUrl) => {
    try {
      await deleteDrawingsForTheme(themeId); // Delete associated drawings

      await deleteDoc(doc(db, "Themes", themeId)); // Delete the theme document from Firestore

      // Delete the theme's background image from Firebase Storage
      const storageRef = ref(storage, backgroundImgUrl);
      await deleteObject(storageRef);

      // Update the themes state to reflect the deletion
      setThemes((prevThemes) =>
        prevThemes.filter((theme) => theme.id !== themeId)
      );
      setSelectedTheme(null); // Reset the selected theme
      setConfirmDelete(false); // Close the confirmation dialog
      setThemeToDelete(null); // Clear the themeToDelete state
    } catch (error) {
      console.error("Error deleting theme: ", error); // Log any errors during deletion
    }
  };

  /**
   * Fetch themes from Firestore when the component is mounted.
   */
  useEffect(() => {
    fetchThemes(); // Call fetchThemes to load themes initially
  }, []); // Empty dependency array ensures this runs only once on component mount

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900">
      <div className="w-full flex justify-between items-center p-4 bg-gray-800 fixed top-0 left-0 right-0 z-10">
        <h1 className="text-4xl">Manage Themes</h1>
        <button
          className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-2 px-6 rounded-full shadow-lg transition-all duration-300"
          onClick={() => navigate("/new-theme")} // Navigate to the New Theme creation page
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
              onClick={() => setSelectedTheme(theme)} // Set the selected theme for displaying details or actions
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
            onClick={() => setSelectedTheme(null)} // Close the modal when clicking outside
          >
            <div
              className="bg-gray-900 bg-opacity-90 p-6 rounded-lg relative max-w-3xl mx-auto shadow-lg"
              onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
            >
              <img
                src={selectedTheme.background_img}
                alt="Selected Theme"
                className="max-w-full max-h-96 mb-4"
              />
              <p className="text-white mb-4">
                URL:{" "}
                <a
                  href={`https://digital-art-wall.vercel.app/display?theme=${selectedTheme.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  https://digital-art-wall.vercel.app/display?theme=
                  {selectedTheme.id}
                </a>
              </p>
              <div className="flex justify-around mt-4">
                <button
                  onClick={() => setSelectedTheme(null)} // Close modal
                  className="bg-gray-600 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    () =>
                      navigate(`/edit-theme/${selectedTheme.id}`, {
                        state: { theme: selectedTheme },
                      }) // Navigate to edit theme page with selected theme data
                  }
                  className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300"
                >
                  Edit Theme
                </button>
                <button
                  onClick={() => {
                    setThemeToDelete(selectedTheme); // Set theme for deletion
                    setConfirmDelete(true); // Open delete confirmation dialog
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
                    onClick={() => setConfirmDelete(false)} // Close confirmation dialog
                    className="bg-gray-600 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300"
                  >
                    No
                  </button>
                  <button
                    onClick={() =>
                      handleDelete(
                        themeToDelete.id, // Execute deletion of the theme
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
