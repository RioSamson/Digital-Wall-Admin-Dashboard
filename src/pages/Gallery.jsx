// src/pages/Gallery.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const Gallery = () => {
  const [drawings, setDrawings] = useState([]);
  const [selectedDrawing, setSelectedDrawing] = useState(null);

  const fetchDrawings = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Drawings"));
      const drawingsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDrawings(drawingsList);
    } catch (error) {
      console.error("Error fetching drawings: ", error);
    }
  };

  const handleDelete = async (drawingId) => {
    try {
      await deleteDoc(doc(db, "Drawings", drawingId));
      setDrawings((prevDrawings) =>
        prevDrawings.filter((drawing) => drawing.id !== drawingId)
      );
      setSelectedDrawing(null);
    } catch (error) {
      console.error("Error deleting drawing: ", error);
    }
  };

  useEffect(() => {
    fetchDrawings();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
      <h1 className="text-4xl mb-8">Manage Drawings</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
        {drawings.map((drawing, index) => (
          <div
            key={index}
            className="relative group overflow-hidden rounded-lg shadow-lg cursor-pointer"
            onClick={() => setSelectedDrawing(drawing)}
          >
            <img
              src={drawing.enhanced_drawings[0]}
              alt={`Drawing ${index}`}
              className="w-full h-auto object-cover transform transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-xl text-white font-bold">
              <span>User: {drawing.user_id?.id || "N/A"}</span>
              {drawing.displayArea && (
                <span>Display Area: {drawing.displayArea}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedDrawing && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-dark-900 bg-opacity-90 p-6 rounded-lg relative max-w-3xl mx-auto shadow-lg">
            <button
              onClick={() => setSelectedDrawing(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-100 text-2xl"
            >
              &times;
            </button>
            <img
              src={selectedDrawing.original_drawing}
              alt="Selected Drawing"
              className="max-w-full max-h-96 mb-4"
            />
            <div className="flex justify-around mt-4">
              <button
                onClick={() => setSelectedDrawing(null)}
                className="bg-gray-600 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300"
              >
                Cancel
              </button>
              <button className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300">
                Approve
              </button>
              <button
                onClick={() => handleDelete(selectedDrawing.id)}
                className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
