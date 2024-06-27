import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { storage, db } from "../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";

const NewThemePage = () => {
  const [themeName, setThemeName] = useState("");
  const [description, setDescription] = useState("");
  const [backgroundImg, setBackgroundImg] = useState(null);
  const [backgroundImgUrl, setBackgroundImgUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const navigate = useNavigate();
  const imageRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setBackgroundImg(file);
      setBackgroundImgUrl(URL.createObjectURL(file));
    }
  };

  const handleImageClick = (e) => {
    if (!selectedArea) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newCoord = { x, y, area: selectedArea };
    setCoordinates((prev) => [...prev, newCoord]);
    setUndoStack((prev) => [...prev, newCoord]);
    setRedoStack([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!themeName || !description || !backgroundImg) {
      setError("All fields are required.");
      return;
    }

    setUploading(true);

    try {
      // Upload the image to Firebase Storage
      const storageRef = ref(storage, `themes/${backgroundImg.name}`);
      const snapshot = await uploadBytes(storageRef, backgroundImg);
      const url = await getDownloadURL(snapshot.ref);

      // Save the theme data to Firestore
      await addDoc(collection(db, "Themes"), {
        Name: themeName,
        description,
        background_img: url,
        coordinates,
      });

      setThemeName("");
      setDescription("");
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

  const toggleArea = (area) => {
    setSelectedArea((prev) => (prev === area ? "" : area));
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastAction = undoStack.pop();
      setCoordinates((prev) => prev.filter((coord) => coord !== lastAction));
      setRedoStack((prev) => [lastAction, ...prev]);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const lastAction = redoStack.shift();
      setCoordinates((prev) => [...prev, lastAction]);
      setUndoStack((prev) => [...prev, lastAction]);
    }
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
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-400 text-sm font-bold mb-2"
            htmlFor="backgroundImg"
          >
            Background Image
          </label>
          <input
            type="file"
            id="backgroundImg"
            accept="image/*"
            onChange={handleFileChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        {backgroundImgUrl && (
          <>
            <div className="relative mb-1">
              <img
                src={backgroundImgUrl}
                alt="Background Preview"
                className="w-full h-auto max-h-96 object-contain"
                ref={imageRef}
                onClick={handleImageClick}
              />
              {coordinates.map((coord, index) => (
                <div
                  key={index}
                  className="absolute"
                  style={{
                    left: `${coord.x}%`,
                    top: `${coord.y}%`,
                    width: "40px",
                    height: "40px",
                    transform: "translate(-50%, -50%)",
                    borderWidth: "3px",
                    borderColor:
                      coord.area === "top"
                        ? "red"
                        : coord.area === "center"
                        ? "yellow"
                        : "black",
                    borderStyle: "solid",
                  }}
                />
              ))}
            </div>
            <div className="flex justify-around mb-4">
              <button
                type="button"
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                onClick={handleUndo}
              >
                Undo
              </button>
              <button
                type="button"
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
                onClick={handleRedo}
              >
                Redo
              </button>
            </div>
            <div className="flex justify-around mb-8">
              <button
                type="button"
                className={`${
                  selectedArea === "top"
                    ? "bg-red-700 border-2 border-white"
                    : "bg-red-500 hover:bg-red-700"
                } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
                onClick={() => toggleArea("top")}
              >
                Top
              </button>
              <button
                type="button"
                className={`${
                  selectedArea === "center"
                    ? "bg-yellow-700 border-2 border-white"
                    : "bg-yellow-500 hover:bg-yellow-700"
                } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
                onClick={() => toggleArea("center")}
              >
                Center
              </button>
              <button
                type="button"
                className={`${
                  selectedArea === "bottom"
                    ? "bg-gray-900 border-2 border-white"
                    : "bg-black hover:bg-gray-900"
                } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
                onClick={() => toggleArea("bottom")}
              >
                Bottom
              </button>
            </div>
          </>
        )}
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
