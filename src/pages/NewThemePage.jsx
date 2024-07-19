import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { storage, db } from "../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import ImageEditor from "../components/ImageEditor";

const NewThemePage = () => {
  const [themeName, setThemeName] = useState("");
  const [description, setDescription] = useState("");
  const [aiPrompts, setAiPrompts] = useState("");
  const [backgroundImg, setBackgroundImg] = useState(null);
  const [backgroundImgUrl, setBackgroundImgUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [topAreaName, setTopAreaName] = useState(""); // New state for top area name
  const [centerAreaName, setCenterAreaName] = useState(""); // New state for center area name
  const [bottomAreaName, setBottomAreaName] = useState(""); // New state for bottom area name
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !themeName ||
      !description ||
      !backgroundImg ||
      !aiPrompts ||
      !topAreaName ||
      !centerAreaName ||
      !bottomAreaName
    ) {
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
        aiPrompts,
        background_img: url,
        topAreaName, // Include the new field
        centerAreaName, // Include the new field
        bottomAreaName, // Include the new field
        coordinates,
      });

      setThemeName("");
      setDescription("");
      setAiPrompts("");
      setTopAreaName(""); // Clear the new field
      setCenterAreaName(""); // Clear the new field
      setBottomAreaName(""); // Clear the new field
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
        <div className="mb-4 flex justify-between">
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
              onChange={(e) => setTopAreaName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
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
              onChange={(e) => setCenterAreaName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
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
              onChange={(e) => setBottomAreaName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
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
