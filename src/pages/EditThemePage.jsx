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

const EditThemePage = () => {
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
  const [topAreaName, setTopAreaName] = useState("");
  const [centerAreaName, setCenterAreaName] = useState("");
  const [bottomAreaName, setBottomAreaName] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const docRef = doc(db, "Themes", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setThemeName(data.Name);
          setDescription(data.description);
          setAiPrompts(data.aiPrompts);
          setBackgroundImgUrl(data.background_img);
          setCoordinates(data.coordinates);
          setTopAreaName(data.topAreaName || "");
          setCenterAreaName(data.centerAreaName || "");
          setBottomAreaName(data.bottomAreaName || "");
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching theme:", error);
      }
    };

    fetchTheme();
  }, [id]);

  const deleteDrawingsForTheme = async (themeId) => {
    const drawingsQuery = query(
      collection(db, "Drawings"),
      where("theme_id", "==", doc(db, "Themes", themeId))
    );
    const drawingsSnapshot = await getDocs(drawingsQuery);

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

      await Promise.all(deleteEnhancedImagesPromises);
      await deleteDoc(drawingDoc.ref);
    });

    await Promise.all(deletePromises);
  };

  const handleDelete = async (themeId, backgroundImgUrl) => {
    try {
      // Delete drawings associated with the theme
      await deleteDrawingsForTheme(themeId);

      // Delete the theme document
      await deleteDoc(doc(db, "Themes", themeId));

      // Delete the background image from storage
      const storageRef = ref(storage, backgroundImgUrl);
      await deleteObject(storageRef);

      navigate("/manage-themes");
    } catch (error) {
      console.error("Error deleting theme: ", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !themeName ||
      !description ||
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
      let imageUrl = backgroundImgUrl;

      if (backgroundImg) {
        const storageRef = ref(storage, `themes/${backgroundImg.name}`);
        const snapshot = await uploadBytes(storageRef, backgroundImg);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

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
      });

      setError(null);
      navigate("/manage-themes");
    } catch (err) {
      console.error("Error updating theme:", err);
      setError("Error updating theme. Please try again.");
    }

    setUploading(false);
  };

  const handleCancel = () => {
    navigate("/manage-themes");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900 p-4">
      <h1 className="text-4xl mb-8">Edit Theme</h1>
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
            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight bg-black focus:outline-none focus:shadow-outline"
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
            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight bg-black focus:outline-none focus:shadow-outline"
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
            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight bg-black focus:outline-none focus:shadow-outline"
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
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight bg-black focus:outline-none focus:shadow-outline"
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
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight bg-black focus:outline-none focus:shadow-outline"
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
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight bg-black focus:outline-none focus:shadow-outline"
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
          initialCoordinates={coordinates}
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
            {uploading ? "Uploading..." : "Update Theme"}
          </button>
        </div>
        <div className="flex justify-center mt-10">
          <button
            type="button"
            onClick={() => handleDelete(id, backgroundImgUrl)}
            className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300"
          >
            Delete Theme
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditThemePage;
