import React, { useEffect, useState } from "react"; // Import React and its hooks
import { db } from "../firebaseConfig"; // Import the Firestore database configuration
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore"; // Firestore functions for database operations

/**
 * Gallery component provides the functionality to view, filter, approve, and delete drawings
 * created by users. The component interacts with the Firestore database to fetch data and
 * display drawings based on selected filters such as theme, user, and review status.
 *
 * @component
 */
const Gallery = () => {
  // State hooks to manage component state
  const [drawings, setDrawings] = useState([]); // List of drawings to display
  const [selectedDrawing, setSelectedDrawing] = useState(null); // Currently selected drawing for detailed view
  const [themes, setThemes] = useState([]); // Available themes to filter drawings
  const [users, setUsers] = useState([]); // Available users to filter drawings
  const [selectedTheme, setSelectedTheme] = useState(""); // Currently selected theme filter
  const [selectedUser, setSelectedUser] = useState(""); // Currently selected user filter
  const [reviewStatus, setReviewStatus] = useState(""); // Currently selected review status filter
  const [loading, setLoading] = useState(false); // Loading state to manage data fetching process
  const [noResults, setNoResults] = useState(false); // State to display a "no results" message if no drawings match the filters

  /**
   * Fetches all themes from the Firestore database and sets them in state.
   * This function is used to populate the theme selection dropdown.
   */
  const fetchThemes = async () => {
    try {
      const themesSnapshot = await getDocs(collection(db, "Themes")); // Fetch theme documents
      const themesList = themesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })); // Map theme documents to an array
      setThemes(themesList); // Update state with the list of themes
    } catch (error) {
      console.error("Error fetching themes: ", error); // Log errors if fetching fails
    }
  };

  /**
   * Fetches all users from the Firestore database and sets them in state.
   * This function is used to populate the user selection dropdown.
   */
  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "Users")); // Fetch user documents
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })); // Map user documents to an array
      setUsers(usersList); // Update state with the list of users
    } catch (error) {
      console.error("Error fetching users: ", error); // Log errors if fetching fails
    }
  };

  /**
   * Fetches drawings from the Firestore database based on the selected filters.
   * Filters include theme, user, and review status. Updates the drawings state
   * with the list of drawings that match the filters.
   */
  const fetchDrawings = async () => {
    try {
      setLoading(true); // Set loading state to true to indicate data fetching
      setNoResults(false); // Reset no results state

      // Initialize a Firestore query object for the Drawings collection
      let drawingsQuery = collection(db, "Drawings");
      let conditions = []; // Array to hold any query conditions

      // Add a condition to filter by selected theme
      if (selectedTheme) {
        conditions.push(
          where("theme_id", "==", doc(db, "Themes", selectedTheme))
        );
      }

      // Add a condition to filter by selected user
      if (selectedUser) {
        conditions.push(where("user_id", "==", doc(db, "Users", selectedUser)));
      }

      // Add a condition to filter by review status
      if (reviewStatus !== "") {
        const isReviewed = reviewStatus === "reviewed"; // Determine boolean value based on selected status
        conditions.push(where("isReviewed", "==", isReviewed));
      }

      // Apply any conditions to the query
      if (conditions.length > 0) {
        drawingsQuery = query(drawingsQuery, ...conditions);
      }

      const querySnapshot = await getDocs(drawingsQuery); // Execute the query
      const drawingsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })); // Map documents to an array
      setDrawings(drawingsList); // Update state with the list of drawings
      setLoading(false); // Set loading state to false
      setNoResults(drawingsList.length === 0); // Set no results state if the list is empty
    } catch (error) {
      console.error("Error fetching drawings: ", error); // Log errors if fetching fails
      setLoading(false); // Ensure loading state is set to false in case of error
    }
  };

  /**
   * Deletes a drawing from the Firestore database.
   * Updates the drawings state to remove the deleted drawing from the UI.
   *
   * @param {string} drawingId - The ID of the drawing to delete.
   */
  const handleDelete = async (drawingId) => {
    try {
      await deleteDoc(doc(db, "Drawings", drawingId)); // Delete the drawing document from Firestore
      setDrawings((prevDrawings) =>
        prevDrawings.filter((drawing) => drawing.id !== drawingId)
      ); // Update the state to remove the deleted drawing
      setSelectedDrawing(null); // Clear any selected drawing in the UI
    } catch (error) {
      console.error("Error deleting drawing: ", error); // Log errors if deletion fails
    }
  };

  /**
   * Approves a drawing by updating its review status in the Firestore database.
   *
   * @param {string} drawingId - The ID of the drawing to approve.
   */
  const handleApprove = async (drawingId) => {
    try {
      const drawingRef = doc(db, "Drawings", drawingId); // Reference to the drawing document
      await updateDoc(drawingRef, { isReviewed: true }); // Update the drawing's review status to true
      setDrawings((prevDrawings) =>
        prevDrawings.map((drawing) =>
          drawing.id === drawingId ? { ...drawing, isReviewed: true } : drawing
        )
      ); // Update state to reflect the approved drawing
      setSelectedDrawing(null); // Clear any selected drawing in the UI
    } catch (error) {
      console.error("Error approving drawing: ", error); // Log errors if updating fails
    }
  };

  // useEffect hook to fetch themes and users on component mount
  useEffect(() => {
    fetchThemes(); // Fetch themes from Firestore
    fetchUsers(); // Fetch users from Firestore
  }, []); // Empty dependency array ensures this runs only once on mount

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
              value={selectedTheme} // Control component state for selected theme
              onChange={(e) => setSelectedTheme(e.target.value)} // Update selected theme on change
              className="w-full p-2 rounded bg-gray-800 text-white"
            >
              <option value="">All Themes</option>
              {themes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.Name}
                </option>
              ))}{" "}
              {/* Iterate over themes to create select options */}
            </select>
          </div>
          <div>
            <label htmlFor="userSelect" className="block mb-2">
              Select User:
            </label>
            <select
              id="userSelect"
              value={selectedUser} // Control component state for selected user
              onChange={(e) => setSelectedUser(e.target.value)} // Update selected user on change
              className="w-full p-2 rounded bg-gray-800 text-white"
            >
              <option value="">All Users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.id}
                </option>
              ))}{" "}
              {/* Iterate over users to create select options */}
            </select>
          </div>
          <div>
            <label htmlFor="reviewSelect" className="block mb-2">
              Review Status:
            </label>
            <select
              id="reviewSelect"
              value={reviewStatus} // Control component state for review status
              onChange={(e) => setReviewStatus(e.target.value)} // Update review status on change
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
            onClick={fetchDrawings} // Fetch drawings based on selected filters
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Search
          </button>
        </div>
      </div>
      {loading ? (
        <div className="text-white">Loading...</div> // Display loading message
      ) : noResults ? (
        <div className="text-white">No drawings match the descriptions</div> // Display no results message
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
          {drawings.map((drawing, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-lg shadow-lg cursor-pointer"
              onClick={() => setSelectedDrawing(drawing)} // Set selected drawing for detailed view
            >
              <img
                src={drawing.enhanced_drawings[0]} // Display the enhanced drawing image
                alt={`Drawing ${index}`}
                className="w-full h-auto object-cover transform transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-xl text-white font-bold">
                <span>User: {drawing.user_id?.id || "N/A"}</span>{" "}
                {/* Display user ID */}
                {drawing.displayArea && (
                  <span>Display Area: {drawing.displayArea}</span> // Display area if available
                )}
                <span>
                  Status: {drawing.isReviewed ? "Reviewed" : "Unreviewed"} //
                  Display review status
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedDrawing && ( // If a drawing is selected, display detailed view modal
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 bg-opacity-90 p-6 rounded-lg relative max-w-4xl mx-auto shadow-lg">
            <button
              onClick={() => setSelectedDrawing(null)} // Close the modal
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-100 text-2xl"
            >
              &times; {/* Close button */}
            </button>
            <div className="flex justify-between items-center">
              <img
                src={selectedDrawing.original_drawing} // Display original drawing
                alt="Original Drawing"
                className="max-w-full max-h-96 mb-4 p-2"
                style={{ flex: "1 0 45%" }}
              />
              <img
                src={selectedDrawing.enhanced_drawings[0]} // Display enhanced drawing
                alt="Enhanced Drawing"
                className="max-w-full max-h-96 mb-4 p-2"
                style={{ flex: "1 0 45%" }}
              />
            </div>
            <div className="flex justify-around mt-4">
              <button
                onClick={() => setSelectedDrawing(null)} // Close the modal
                className="bg-gray-600 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300"
              >
                Cancel
              </button>
              {!selectedDrawing.isReviewed && ( // If the drawing is not reviewed, show approve button
                <button
                  onClick={() => handleApprove(selectedDrawing.id)} // Approve the drawing
                  className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all duration-300"
                >
                  Approve
                </button>
              )}
              <button
                onClick={() => handleDelete(selectedDrawing.id)} // Delete the drawing
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

export default Gallery; // Export the Gallery component as default
