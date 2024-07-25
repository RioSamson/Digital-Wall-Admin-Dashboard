import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

const Gallery = () => {
  const [drawings, setDrawings] = useState([]);
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [themes, setThemes] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const fetchThemes = async () => {
    try {
      const themesSnapshot = await getDocs(collection(db, "Themes"));
      const themesList = themesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setThemes(themesList);
    } catch (error) {
      console.error("Error fetching themes: ", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "Users"));
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users: ", error);
    }
  };

  const fetchDrawings = async () => {
    try {
      setLoading(true);
      setNoResults(false);
      let drawingsQuery = collection(db, "Drawings");
      let conditions = [];

      if (selectedTheme) {
        conditions.push(
          where("theme_id", "==", doc(db, "Themes", selectedTheme))
        );
      }
      if (selectedUser) {
        conditions.push(where("user_id", "==", doc(db, "Users", selectedUser)));
      }
      if (reviewStatus !== "") {
        const isReviewed = reviewStatus === "reviewed";
        conditions.push(where("isReviewed", "==", isReviewed));
      }

      if (conditions.length > 0) {
        drawingsQuery = query(drawingsQuery, ...conditions);
      }

      const querySnapshot = await getDocs(drawingsQuery);
      const drawingsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDrawings(drawingsList);
      setLoading(false);
      setNoResults(drawingsList.length === 0);
    } catch (error) {
      console.error("Error fetching drawings: ", error);
      setLoading(false);
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

  const handleApprove = async (drawingId) => {
    try {
      const drawingRef = doc(db, "Drawings", drawingId);
      await updateDoc(drawingRef, { isReviewed: true });
      setDrawings((prevDrawings) =>
        prevDrawings.map((drawing) =>
          drawing.id === drawingId ? { ...drawing, isReviewed: true } : drawing
        )
      );
      setSelectedDrawing(null);
    } catch (error) {
      console.error("Error approving drawing: ", error);
    }
  };

  useEffect(() => {
    fetchThemes();
    fetchUsers();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900 p-4">
      <h1 className="text-4xl mb-8">Manage Drawings</h1>
      <div className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="themeSelect" className="block mb-2">
              Select Theme:
            </label>
            <select
              id="themeSelect"
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white"
            >
              <option value="">All Themes</option>
              {themes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.Name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="userSelect" className="block mb-2">
              Select User:
            </label>
            <select
              id="userSelect"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white"
            >
              <option value="">All Users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="reviewSelect" className="block mb-2">
              Review Status:
            </label>
            <select
              id="reviewSelect"
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white"
            >
              <option value="">All Drawings</option>
              <option value="reviewed">Reviewed</option>
              <option value="unreviewed">Unreviewed</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <button
            onClick={fetchDrawings}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Search
          </button>
        </div>
      </div>
      {loading ? (
        <div className="text-white">Loading...</div>
      ) : noResults ? (
        <div className="text-white">No drawings match the descriptions</div>
      ) : (
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
                <span>
                  Status: {drawing.isReviewed ? "Reviewed" : "Unreviewed"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedDrawing && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 bg-opacity-90 p-6 rounded-lg relative max-w-4xl mx-auto shadow-lg">
            <button
              onClick={() => setSelectedDrawing(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-100 text-2xl"
            >
              &times;
            </button>
            <div className="flex justify-between items-center">
              <img
                src={selectedDrawing.original_drawing}
                alt="Original Drawing"
                className="max-w-full max-h-96 mb-4 p-2"
                style={{ flex: "1 0 45%" }}
              />
              <img
                src={selectedDrawing.enhanced_drawings[0]}
                alt="Enhanced Drawing"
                className="max-w-full max-h-96 mb-4 p-2"
                style={{ flex: "1 0 45%" }}
              />
            </div>
            <div className="flex justify-around mt-4">
              <button
                onClick={() => setSelectedDrawing(null)}
                className="bg-gray-600 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300"
              >
                Cancel
              </button>
              {!selectedDrawing.isReviewed && (
                <button
                  onClick={() => handleApprove(selectedDrawing.id)}
                  className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300"
                >
                  Approve
                </button>
              )}
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
