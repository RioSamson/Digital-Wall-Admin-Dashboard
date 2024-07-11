import React, { useRef, useState, useEffect } from "react";

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
  const imageRef = useRef(null);
  const dragItemRef = useRef(null);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);

  useEffect(() => {
    if (initialCoordinates) {
      setCoordinates(initialCoordinates);
    }
  }, [initialCoordinates, setCoordinates]);

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

  const handleDragStart = (index, e) => {
    dragItemRef.current = index;
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
  };

  const handleDrag = (e) => {
    if (dragItemRef.current === null) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (x < 0 || x > 100 || y < 0 || y > 100) return;

    setCoordinates((prev) =>
      prev.map((coord, index) =>
        index === dragItemRef.current ? { ...coord, x, y } : coord
      )
    );
  };

  const handleDragEnd = () => {
    dragItemRef.current = null;
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

  const toggleArea = (area) => {
    setSelectedArea((prev) => (prev === area ? "" : area));
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
          onChange={handleFileChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight bg-black focus:outline-none focus:shadow-outline"
        />
      </div>
      {backgroundImgUrl && (
        <>
          <div
            className="relative mb-1"
            onMouseMove={handleDrag}
            onMouseUp={handleDragEnd}
          >
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
                  cursor: "grab",
                }}
                onMouseDown={(e) => handleDragStart(index, e)}
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
    </div>
  );
};

export default ImageEditor;
