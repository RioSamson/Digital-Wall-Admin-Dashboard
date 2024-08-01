import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { storage, db } from "../firebaseConfig"; // Import Firebase storage and database configurations
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import storage functions
import { collection, addDoc } from "firebase/firestore"; // Import Firestore functions
import ImageEditor from "../components/ImageEditor"; // Import custom ImageEditor component

/**
 * The NewThemePage component allows admins to create a new theme, upload a background image,
 * and specify various settings for the theme such as AI prompts and area names.
 *
 * @component
 */
const NewThemePage = () => {
  const [themeName, setThemeName] = useState(""); // State for theme name input
  const [description, setDescription] = useState(""); // State for theme description
  const [aiPrompts, setAiPrompts] = useState(""); // State for AI prompts associated with the theme
  const [backgroundImg, setBackgroundImg] = useState(null); // State to store the selected background image file
  const [backgroundImgUrl, setBackgroundImgUrl] = useState(null); // State for storing URL of the uploaded background image
  const [uploading, setUploading] = useState(false); // State to manage the uploading status
  const [error, setError] = useState(null); // State to handle and display errors
  const [coordinates, setCoordinates] = useState([]); // State for storing area coordinates on the image
  const [selectedArea, setSelectedArea] = useState(""); // State to keep track of the selected area
  const [undoStack, setUndoStack] = useState([]); // State for managing undo actions
  const [redoStack, setRedoStack] = useState([]); // State for managing redo actions
  const [topAreaName, setTopAreaName] = useState(""); // State for the name of the top area
  const [centerAreaName, setCenterAreaName] = useState(""); // State for the name of the center area
  const [bottomAreaName, setBottomAreaName] = useState(""); // State for the name of the bottom area
  const [onlyReviewedDrawings, setOnlyReviewedDrawings] = useState(false); // State to check if only reviewed drawings are displayed
  const navigate = useNavigate(); // Hook to navigate between routes

  /**
   * Handles the submission of the new theme form. Validates input fields and uploads
   * the theme data to Firestore and the image to Firebase Storage.
   *
   * @param {object} e - The event object from form submission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Check for required fields
    if (
      !themeName ||
      !description ||
      !backgroundImg ||
      !aiPrompts ||
      !topAreaName ||
      !centerAreaName ||
      !bottomAreaName
    ) {
      setError("All fields are required."); // Set error message if validation fails
      return; // Exit function if validation fails
    }

    setUploading(true); // Set uploading state to true

    try {
      // Create a reference in Firebase Storage for the background image
      const storageRef = ref(storage, `themes/${backgroundImg.name}`);
      // Upload the image to Firebase Storage
      const snapshot = await uploadBytes(storageRef, backgroundImg);
      // Get the download URL for the uploaded image
      const url = await getDownloadURL(snapshot.ref);

      // Add a new document to the 'Themes' collection in Firestore
      await addDoc(collection(db, "Themes"), {
        Name: themeName,
        description,
        aiPrompts,
        background_img: url,
        topAreaName,
        centerAreaName,
        bottomAreaName,
        coordinates,
        onlyReviewedDrawings,
      });

      // Reset states after successful upload
      setThemeName("");
      setDescription("");
      setAiPrompts("");
      setTopAreaName("");
      setCenterAreaName("");
      setBottomAreaName("");
      setBackgroundImg(null);
      setBackgroundImgUrl(null);
      setCoordinates([]);
      setOnlyReviewedDrawings(false);
      setError(null);
      // Navigate back to the manage themes page
      navigate("/manage-themes");
    } catch (err) {
      console.error("Error uploading theme:", err); // Log any errors that occur during upload
      setError("Error uploading theme. Please try again."); // Set error message for UI
    }

    setUploading(false); // Reset uploading state
  };

  /**
   * Cancels the theme creation process and navigates back to the manage themes page.
   */
  const handleCancel = () => {
    navigate("/manage-themes"); // Use navigate to return to manage themes page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900 p-4">
      <h1 className="text-4xl mb-8">Add New Theme</h1>
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
            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
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
            onChange={(e) => setDescription(e.target.value)} // Update state with input value
            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
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
            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        {/* Area Names Inputs */}
        <div className="mb-4 flex justify-between">
          {/* Top Area Name */}
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
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* Center Area Name */}
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
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* Bottom Area Name */}
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
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>

        {/* Only Reviewed Drawings Checkbox */}
        <div className="mb-4">
          <label className="block text-gray-400 text-sm font-bold mb-2">
            <input
              type="checkbox"
              checked={onlyReviewedDrawings}
              onChange={(e) => setOnlyReviewedDrawings(e.target.checked)} // Toggle state on checkbox change
              className="mr-2"
            />
            Admin reviews drawing before being displayed
          </label>
        </div>

        {/* Image Editor Component */}
        <ImageEditor
          backgroundImgUrl={backgroundImgUrl} // Pass background image URL to the ImageEditor
          setBackgroundImgUrl={setBackgroundImgUrl} // Function to update background image URL state
          setBackgroundImg={setBackgroundImg} // Function to update background image file state
          coordinates={coordinates} // Pass coordinates state
          setCoordinates={setCoordinates} // Function to update coordinates state
          selectedArea={selectedArea} // Pass selected area state
          setSelectedArea={setSelectedArea} // Function to update selected area state
          undoStack={undoStack} // Pass undo stack state
          setUndoStack={setUndoStack} // Function to update undo stack state
          redoStack={redoStack} // Pass redo stack state
          setRedoStack={setRedoStack} // Function to update redo stack state
        />

        {/* Display error message if there's any */}
        {error && <p className="text-red-500 text-xs italic">{error}</p>}

        {/* Form Buttons */}
        <div className="flex justify-between mt-20">
          {/* Cancel Button */}
          <button
            type="button"
            onClick={handleCancel} // Navigate back to manage themes
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading} // Disable button when uploading
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {uploading ? "Uploading..." : "Add Theme"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewThemePage; // Export the NewThemePage component as default
