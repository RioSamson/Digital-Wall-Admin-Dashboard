// src/pages/NewThemePage.jsx
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
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCoordinates((prev) => [...prev, { x, y }]);
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900">
      <h1 className="text-4xl mb-8">Add New Theme</h1>
      <div className="flex w-full max-w-6xl">
        <div className="w-2/3 flex flex-col items-center">
          {backgroundImgUrl ? (
            <div className="relative">
              <img
                src={backgroundImgUrl}
                alt="Background Preview"
                className="w-full h-auto"
                ref={imageRef}
                onClick={handleImageClick}
              />
              {coordinates.map((coord, index) => (
                <div
                  key={index}
                  className="absolute border border-red-500"
                  style={{
                    left: `${coord.x}%`,
                    top: `${coord.y}%`,
                    width: "20px",
                    height: "20px",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No image selected</p>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-4"
          />
        </div>
        <form onSubmit={handleSubmit} className="w-1/3 ml-8">
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
          {error && <p className="text-red-500 text-xs italic">{error}</p>}
          <div className="flex items-center justify-between">
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
    </div>
  );
};

export default NewThemePage;
