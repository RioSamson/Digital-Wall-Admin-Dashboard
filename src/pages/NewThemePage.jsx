import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { storage, db } from "../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import ImageEditor from "../components/ImageEditor";

const NewThemePage = () => {
  const [themeName, setThemeName] = useState("");
  const [description, setDescription] = useState("");
  const [aiPrompts, setAiPrompts] = useState(""); // New state for AI prompts
  const [backgroundImg, setBackgroundImg] = useState(null);
  const [backgroundImgUrl, setBackgroundImgUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!themeName || !description || !backgroundImg || !aiPrompts) {
      setError("All fields are required.");
      return;
    }

    setUploading(true);

    try {
      const storageRef = ref(storage, `themes/${backgroundImg.name}`);
      const snapshot = await uploadBytes(storageRef, backgroundImg);
      const url = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, "Themes"), {
        Name: themeName,
        description,
        aiPrompts, // Include the new field
        background_img: url,
        coordinates,
      });

      setThemeName("");
      setDescription("");
      setAiPrompts(""); // Clear the new field
      setBackgroundImg(null);
      setBackgroundImgUrl(null);
      setCoordinates([]);
      setError(null);
      navigate("/manage-themes");
    } catch (err) {
      console.error("Error uploading theme:", err);
      setError("Error uploading theme. Please try again.");
    }

    setUploading(false);
  };

  const handleCancel = () => {
    navigate("/manage-themes");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900 p-4">
      <h1 className="text-4xl mb-8">Add New Theme</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-4xl">
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
            onChange={(e) => setThemeName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
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
            onChange={(e) => setDescription(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
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
            onChange={(e) => setAiPrompts(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <ImageEditor
          backgroundImgUrl={backgroundImgUrl}
          setBackgroundImgUrl={setBackgroundImgUrl}
          setBackgroundImg={setBackgroundImg}
          coordinates={coordinates}
          setCoordinates={setCoordinates}
          selectedArea={selectedArea}
          setSelectedArea={setSelectedArea}
          undoStack={undoStack}
          setUndoStack={setUndoStack}
          redoStack={redoStack}
          setRedoStack={setRedoStack}
        />
        {error && <p className="text-red-500 text-xs italic">{error}</p>}
        <div className="flex justify-between mt-20">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {uploading ? "Uploading..." : "Add Theme"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewThemePage;
