import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { storage, db } from "../firebaseConfig";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import ImageEditor from "../components/ImageEditor";

/**
 * The EditThemePage component allows administrators to edit existing themes.
 * It enables updating theme information, changing the background image, and managing related settings.
 *
 * @component
 */
const EditThemePage = () => {
  // State variables to manage theme data and user inputs
  const [themeName, setThemeName] = useState(""); // Theme name input
  const [description, setDescription] = useState(""); // Theme description input
  const [aiPrompts, setAiPrompts] = useState(""); // AI prompts for drawings
  const [backgroundImg, setBackgroundImg] = useState(null); // Background image file
  const [backgroundImgUrl, setBackgroundImgUrl] = useState(null); // URL for the background image
  const [uploading, setUploading] = useState(false); // Uploading state
  const [error, setError] = useState(null); // Error handling state
  const [coordinates, setCoordinates] = useState([]); // Coordinates for image areas
  const [selectedArea, setSelectedArea] = useState(""); // Currently selected area
  const [undoStack, setUndoStack] = useState([]); // Undo stack for image editing
  const [redoStack, setRedoStack] = useState([]); // Redo stack for image editing
  const [topAreaName, setTopAreaName] = useState(""); // Name for the top area
  const [centerAreaName, setCenterAreaName] = useState(""); // Name for the center area
  const [bottomAreaName, setBottomAreaName] = useState(""); // Name for the bottom area
  const [onlyReviewedDrawings, setOnlyReviewedDrawings] = useState(false); // Toggle for displaying only reviewed drawings

  const navigate = useNavigate(); // Hook for navigation
  const { id } = useParams(); // Retrieve theme ID from URL parameters

  /**
   * Fetches the theme data from Firestore when the component mounts.
   */
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const docRef = doc(db, "Themes", id); // Reference to the specific theme document
        const docSnap = await getDoc(docRef); // Fetch the document snapshot

        if (docSnap.exists()) {
          const data = docSnap.data(); // Retrieve data from the document
          setThemeName(data.Name); // Set theme name
          setDescription(data.description); // Set theme description
          setAiPrompts(data.aiPrompts); // Set AI prompts
          setBackgroundImgUrl(data.background_img); // Set background image URL
          setCoordinates(data.coordinates); // Set coordinates for image areas
          setTopAreaName(data.topAreaName || ""); // Set top area name
          setCenterAreaName(data.centerAreaName || ""); // Set center area name
          setBottomAreaName(data.bottomAreaName || ""); // Set bottom area name
          setOnlyReviewedDrawings(data.onlyReviewedDrawings || false); // Set toggle for reviewed drawings
        } else {
          console.error("No such document!"); // Log an error if the document doesn't exist
        }
      } catch (error) {
        console.error("Error fetching theme:", error); // Handle errors during fetch
      }
    };

    fetchTheme(); // Call the fetch function
  }, [id]); // Dependency array, re-fetch if `id` changes

  /**
   * Deletes all drawings related to a specific theme.
   *
   * @param {string} themeId - The ID of the theme to delete drawings for.
   */
  const deleteDrawingsForTheme = async (themeId) => {
    // Query to fetch all drawings associated with the theme
    const drawingsQuery = query(
      collection(db, "Drawings"),
      where("theme_id", "==", doc(db, "Themes", themeId))
    );
    const drawingsSnapshot = await getDocs(drawingsQuery);

    // Map through each drawing document and delete associated images and document
    const deletePromises = drawingsSnapshot.docs.map(async (drawingDoc) => {
      const drawingData = drawingDoc.data();

      // Delete original drawing image
      const originalStorageRef = ref(storage, drawingData.original_drawing);
      await deleteObject(originalStorageRef);

      // Delete enhanced drawing images
      const deleteEnhancedImagesPromises = drawingData.enhanced_drawings.map(
        async (url) => {
          const enhancedStorageRef = ref(storage, url);
          await deleteObject(enhancedStorageRef);
        }
      );

      await Promise.all(deleteEnhancedImagesPromises); // Wait for all enhanced images to be deleted
      await deleteDoc(drawingDoc.ref); // Delete the drawing document
    });

    await Promise.all(deletePromises); // Wait for all drawings to be deleted
  };

  /**
   * Handles the deletion of a theme, including related images and drawings.
   *
   * @param {string} themeId - The ID of the theme to delete.
   * @param {string} backgroundImgUrl - The URL of the theme's background image.
   */
  const handleDelete = async (themeId, backgroundImgUrl) => {
    try {
      // Delete drawings associated with the theme
      await deleteDrawingsForTheme(themeId);

      // Delete the theme document
      await deleteDoc(doc(db, "Themes", themeId));

      // Delete the background image from storage
      const storageRef = ref(storage, backgroundImgUrl);
      await deleteObject(storageRef);

      navigate("/manage-themes"); // Navigate back to manage themes
    } catch (error) {
      console.error("Error deleting theme: ", error); // Log errors if any
    }
  };

  /**
   * Handles the form submission to update the theme.
   *
   * @param {object} e - The event object from form submission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Validate required fields
    if (
      !themeName ||
      !description ||
      !aiPrompts ||
      !topAreaName ||
      !centerAreaName ||
      !bottomAreaName
    ) {
      setError("All fields are required."); // Set error message if validation fails
      return;
    }

    setUploading(true); // Set uploading state

    try {
      let imageUrl = backgroundImgUrl; // Initialize image URL

      // Check if a new background image is provided
      if (backgroundImg) {
        const storageRef = ref(storage, `themes/${backgroundImg.name}`); // Create reference in storage
        const snapshot = await uploadBytes(storageRef, backgroundImg); // Upload new image
        imageUrl = await getDownloadURL(snapshot.ref); // Get download URL
      }

      // Update the theme document with new values
      const docRef = doc(db, "Themes", id);
      await updateDoc(docRef, {
        Name: themeName,
        description,
        aiPrompts,
        background_img: imageUrl,
        coordinates,
        topAreaName,
        centerAreaName,
        bottomAreaName,
        onlyReviewedDrawings,
      });

      setError(null); // Clear any errors
      navigate("/manage-themes"); // Navigate back to manage themes
    } catch (err) {
      console.error("Error updating theme:", err); // Log errors during update
      setError("Error updating theme. Please try again."); // Set error message
    }

    setUploading(false); // Reset uploading state
  };

  /**
   * Cancels the edit operation and navigates back to the manage themes page.
   */
  const handleCancel = () => {
    navigate("/manage-themes"); // Navigate back to manage themes
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900 p-4">
      <h1 className="text-4xl mb-8">Edit Theme</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-4xl">
        {/* Theme Name Input */}
        <div className="mb-4">
          <label
            className="block text-gray-400 text-sm font-bold mb-2"
            htmlFor="themeName"
          >
            Theme Name
          </label>
          <input
            type="text"
            id="themeName"
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)} // Update state with input value
            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight bg-black focus:outline-none focus:shadow-outline"
          />
        </div>

        {/* Description Input */}
        <div className="mb-4">
          <label
            className="block text-gray-400 text-sm font-bold mb-2"
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)} // Update state with textarea value
            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight bg-black focus:outline-none focus:shadow-outline"
          />
        </div>

        {/* AI Prompts Input */}
        <div className="mb-4">
          <label
            className="block text-gray-400 text-sm font-bold mb-2"
            htmlFor="aiPrompts"
          >
            AI prompts for children's drawings
          </label>
          <input
            type="text"
            id="aiPrompts"
            value={aiPrompts}
            onChange={(e) => setAiPrompts(e.target.value)} // Update state with input value
            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight bg-black focus:outline-none focus:shadow-outline"
          />
        </div>

        {/* Area Name Inputs */}
        <div className="mb-4 flex justify-between">
          {/* Top Area Name Input */}
          <div className="w-1/3 pr-2">
            <label
              className="block text-gray-400 text-sm font-bold mb-2"
              htmlFor="topAreaName"
            >
              Top Area Name
            </label>
            <input
              type="text"
              id="topAreaName"
              value={topAreaName}
              onChange={(e) => setTopAreaName(e.target.value)} // Update state with input value
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight bg-black focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* Center Area Name Input */}
          <div className="w-1/3 px-2">
            <label
              className="block text-gray-400 text-sm font-bold mb-2"
              htmlFor="centerAreaName"
            >
              Center Area Name
            </label>
            <input
              type="text"
              id="centerAreaName"
              value={centerAreaName}
              onChange={(e) => setCenterAreaName(e.target.value)} // Update state with input value
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight bg-black focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* Bottom Area Name Input */}
          <div className="w-1/3 pl-2">
            <label
              className="block text-gray-400 text-sm font-bold mb-2"
              htmlFor="bottomAreaName"
            >
              Bottom Area Name
            </label>
            <input
              type="text"
              id="bottomAreaName"
              value={bottomAreaName}
              onChange={(e) => setBottomAreaName(e.target.value)} // Update state with input value
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight bg-black focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>

        {/* Only Reviewed Drawings Toggle */}
        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-bold mb-2">
            <input
              type="checkbox"
              checked={onlyReviewedDrawings}
              onChange={(e) => setOnlyReviewedDrawings(e.target.checked)} // Toggle state with checkbox
              className="mr-2"
            />
            Admin reviews drawing before being displayed
          </label>
        </div>

        {/* Image Editor Component */}
        <ImageEditor
          backgroundImgUrl={backgroundImgUrl} // URL for the background image
          setBackgroundImgUrl={setBackgroundImgUrl} // Function to update background image URL
          setBackgroundImg={setBackgroundImg} // Function to update background image file
          coordinates={coordinates} // Image area coordinates
          setCoordinates={setCoordinates} // Function to update coordinates
          selectedArea={selectedArea} // Currently selected area
          setSelectedArea={setSelectedArea} // Function to update selected area
          undoStack={undoStack} // Undo stack for image editing
          setUndoStack={setUndoStack} // Function to update undo stack
          redoStack={redoStack} // Redo stack for image editing
          setRedoStack={setRedoStack} // Function to update redo stack
          initialCoordinates={coordinates} // Initial coordinates for image areas
        />

        {/* Error Message Display */}
        {error && <p className="text-red-500 text-xs italic">{error}</p>}

        {/* Form Buttons */}
        <div className="flex justify-between mt-20">
          {/* Cancel Button */}
          <button
            type="button"
            onClick={handleCancel} // Cancel editing and navigate back
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading} // Disable button during uploading
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {uploading ? "Uploading..." : "Update Theme"}
          </button>
        </div>

        {/* Delete Theme Button */}
        <div className="flex justify-center mt-10">
          <button
            type="button"
            onClick={() => handleDelete(id, backgroundImgUrl)} // Delete theme on button click
            className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300"
          >
            Delete Theme
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditThemePage; // Export the component for use in other parts of the application
