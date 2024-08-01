import React, { useRef, useState, useEffect } from "react";

/**
 * ImageEditor component allows users to upload, edit, and annotate images.
 * It supports dragging and dropping coordinates on the image and provides undo/redo functionality.
 *
 * @component
 * @param {Object} props - The component props
 * @param {string} props.backgroundImgUrl - URL of the background image
 * @param {function} props.setBackgroundImgUrl - Function to set the background image URL
 * @param {function} props.setBackgroundImg - Function to set the background image file
 * @param {Array} props.coordinates - Array of coordinates for annotations
 * @param {function} props.setCoordinates - Function to set the coordinates
 * @param {string} props.selectedArea - The currently selected area (top, center, bottom)
 * @param {function} props.setSelectedArea - Function to set the selected area
 * @param {Array} props.undoStack - Stack for undo operations
 * @param {function} props.setUndoStack - Function to set the undo stack
 * @param {Array} props.redoStack - Stack for redo operations
 * @param {function} props.setRedoStack - Function to set the redo stack
 * @param {Array} props.initialCoordinates - Initial set of coordinates
 * @returns {JSX.Element} The rendered component
 */
const ImageEditor = ({
  backgroundImgUrl,
  setBackgroundImgUrl,
  setBackgroundImg,
  coordinates,
  setCoordinates,
  selectedArea,
  setSelectedArea,
  undoStack,
  setUndoStack,
  redoStack,
  setRedoStack,
  initialCoordinates,
}) => {
  const imageRef = useRef(null); // Ref for the image element
  const dragItemRef = useRef(null); // Ref for tracking dragged item
  const dragStartX = useRef(0); // Ref for storing initial drag X position
  const dragStartY = useRef(0); // Ref for storing initial drag Y position

  // Effect hook to set initial coordinates if provided
  useEffect(() => {
    if (initialCoordinates) {
      setCoordinates(initialCoordinates);
    }
  }, [initialCoordinates, setCoordinates]);

  /**
   * Handles file input changes for background image.
   * Updates the background image URL and file.
   *
   * @param {Event} e - The file input change event
   */
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setBackgroundImg(file);
      setBackgroundImgUrl(URL.createObjectURL(file));
    }
  };

  /**
   * Handles clicks on the image to add new coordinates.
   * Adds a coordinate based on the click position and selected area.
   *
   * @param {Event} e - The click event
   */
  const handleImageClick = (e) => {
    if (!selectedArea) return; // Check if an area is selected

    const rect = imageRef.current.getBoundingClientRect(); // Get image position
    const x = ((e.clientX - rect.left) / rect.width) * 100; // Calculate x position
    const y = ((e.clientY - rect.top) / rect.height) * 100; // Calculate y position
    const newCoord = { x, y, area: selectedArea }; // Create new coordinate
    setCoordinates((prev) => [...prev, newCoord]); // Add to coordinates
    setUndoStack((prev) => [...prev, newCoord]); // Add to undo stack
    setRedoStack([]); // Clear redo stack
  };

  /**
   * Handles the start of a drag operation for a coordinate.
   *
   * @param {number} index - Index of the dragged coordinate
   * @param {Event} e - The mouse down event
   */
  const handleDragStart = (index, e) => {
    dragItemRef.current = index; // Store dragged item index
    dragStartX.current = e.clientX; // Store initial drag X position
    dragStartY.current = e.clientY; // Store initial drag Y position
  };

  /**
   * Handles dragging of a coordinate to update its position.
   *
   * @param {Event} e - The mouse move event
   */
  const handleDrag = (e) => {
    if (dragItemRef.current === null) return; // Check if dragging

    const rect = imageRef.current.getBoundingClientRect(); // Get image position
    const x = ((e.clientX - rect.left) / rect.width) * 100; // Calculate new x position
    const y = ((e.clientY - rect.top) / rect.height) * 100; // Calculate new y position

    if (x < 0 || x > 100 || y < 0 || y > 100) return; // Check bounds

    // Update coordinates with new position
    setCoordinates((prev) =>
      prev.map((coord, index) =>
        index === dragItemRef.current ? { ...coord, x, y } : coord
      )
    );
  };

  /**
   * Handles the end of a drag operation.
   */
  const handleDragEnd = () => {
    dragItemRef.current = null; // Reset dragged item
  };

  /**
   * Handles undo operation to revert the last change.
   */
  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastAction = undoStack.pop(); // Remove last action from undo stack
      setCoordinates((prev) => prev.filter((coord) => coord !== lastAction)); // Remove last coordinate
      setRedoStack((prev) => [lastAction, ...prev]); // Add to redo stack
    }
  };

  /**
   * Handles redo operation to reapply the last undone change.
   */
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const lastAction = redoStack.shift(); // Remove last action from redo stack
      setCoordinates((prev) => [...prev, lastAction]); // Re-add coordinate
      setUndoStack((prev) => [...prev, lastAction]); // Add to undo stack
    }
  };

  /**
   * Toggles the selected area for annotations.
   *
   * @param {string} area - The area to select (top, center, bottom)
   */
  const toggleArea = (area) => {
    setSelectedArea((prev) => (prev === area ? "" : area)); // Toggle selected area
  };

  return (
    <div className="w-full max-w-4xl">
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
          onChange={handleFileChange} // Handle file change
          className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight bg-black focus:outline-none focus:shadow-outline"
        />
      </div>
      {backgroundImgUrl && (
        <>
          <div
            className="relative mb-1"
            onMouseMove={handleDrag} // Handle drag
            onMouseUp={handleDragEnd} // Handle drag end
          >
            <img
              src={backgroundImgUrl}
              alt="Background Preview"
              className="w-full h-auto max-h-96 object-contain"
              ref={imageRef} // Image reference
              onClick={handleImageClick} // Handle image click
            />
            {coordinates.map((coord, index) => (
              <div
                key={index}
                className="absolute"
                style={{
                  left: `${coord.x}%`, // Position based on x coordinate
                  top: `${coord.y}%`, // Position based on y coordinate
                  width: "7%", // Ensuring square size
                  height: "10%", // Ensuring square size
                  transform: "translate(-50%, -50%)",
                  borderWidth: "3px",
                  borderColor:
                    coord.area === "top"
                      ? "red" // Color for top area
                      : coord.area === "center"
                      ? "yellow" // Color for center area
                      : "black", // Color for bottom area
                  borderStyle: "solid",
                  cursor: "grab",
                }}
                onMouseDown={(e) => handleDragStart(index, e)} // Handle drag start
              />
            ))}
          </div>
          <div className="flex justify-around mb-4">
            <button
              type="button"
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
              onClick={handleUndo} // Handle undo
            >
              Undo
            </button>
            <button
              type="button"
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
              onClick={handleRedo} // Handle redo
            >
              Redo
            </button>
          </div>
          <div className="flex justify-around mb-8">
            <button
              type="button"
              className={`${
                selectedArea === "top"
                  ? "bg-red-700 border-2 border-white" // Active style for top area
                  : "bg-red-500 hover:bg-red-700"
              } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
              onClick={() => toggleArea("top")} // Toggle top area
            >
              Top
            </button>
            <button
              type="button"
              className={`${
                selectedArea === "center"
                  ? "bg-yellow-700 border-2 border-white" // Active style for center area
                  : "bg-yellow-500 hover:bg-yellow-700"
              } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
              onClick={() => toggleArea("center")} // Toggle center area
            >
              Center
            </button>
            <button
              type="button"
              className={`${
                selectedArea === "bottom"
                  ? "bg-gray-900 border-2 border-white" // Active style for bottom area
                  : "bg-black hover:bg-gray-900"
              } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
              onClick={() => toggleArea("bottom")} // Toggle bottom area
            >
              Bottom
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageEditor;
