// src/pages/AddEditModel.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

const AddEditModel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [modelUrl, setModelUrl] = useState("");
  const [method, setMethod] = useState("POST");
  const [headers, setHeaders] = useState([
    { name: "", value: "", type: "string" },
  ]);
  const [bodyFields, setBodyFields] = useState([
    { name: "", value: "", type: "string" },
  ]);
  const [promptFieldName, setPromptFieldName] = useState("");
  const [imageDataFieldName, setImageDataFieldName] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchModel();
    }
  }, [id]);

  const fetchModel = async () => {
    try {
      const docRef = doc(db, "AIModels", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setModelUrl(data.url);
        setMethod(data.method);
        setHeaders(data.headers || [{ name: "", value: "", type: "string" }]);
        setBodyFields(
          data.bodyFields || [{ name: "", value: "", type: "string" }]
        );
        setPromptFieldName(data.promptFieldName);
        setImageDataFieldName(data.imageDataFieldName);
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      console.error("Error fetching model:", error);
    }
  };

  const handleAddHeader = () => {
    if (headers.some((header) => !header.name || !header.value)) {
      setError("Please fill both field name and value before adding.");
      return;
    }
    setHeaders([...headers, { name: "", value: "", type: "string" }]);
    setError(null);
  };

  const handleRemoveHeader = (index) => {
    if (headers.length > 1) {
      const updatedHeaders = headers.filter((_, i) => i !== index);
      setHeaders(updatedHeaders);
    }
  };

  const handleHeaderChange = (index, field, value) => {
    const updatedHeaders = headers.map((header, i) => {
      if (i === index) {
        return { ...header, [field]: value };
      }
      return header;
    });
    setHeaders(updatedHeaders);
  };

  const handleAddBodyField = () => {
    if (bodyFields.some((field) => !field.name || !field.value)) {
      setError("Please fill both field name and value before adding.");
      return;
    }
    setBodyFields([...bodyFields, { name: "", value: "", type: "string" }]);
    setError(null);
  };

  const handleRemoveBodyField = (index) => {
    const updatedBodyFields = bodyFields.filter((_, i) => i !== index);
    setBodyFields(updatedBodyFields);
  };

  const handleBodyFieldChange = (index, field, value) => {
    const updatedBodyFields = bodyFields.map((bodyField, i) => {
      if (i === index) {
        return { ...bodyField, [field]: value };
      }
      return bodyField;
    });
    setBodyFields(updatedBodyFields);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !modelUrl ||
      !method ||
      !promptFieldName ||
      !imageDataFieldName ||
      headers.some((header) => !header.name || !header.value)
    ) {
      setError(
        "All required fields must be filled and at least one header must be provided."
      );
      return;
    }

    const modelData = {
      url: modelUrl,
      method,
      headers,
      bodyFields,
      promptFieldName,
      imageDataFieldName,
    };

    try {
      if (isEditMode) {
        await updateDoc(doc(db, "AIModels", id), modelData);
      } else {
        await addDoc(collection(db, "AIModels"), modelData);
      }
      navigate("/manage-ai");
    } catch (err) {
      console.error("Error saving model:", err);
      setError("Error saving model. Please try again.");
    }
  };

  const handleCancel = () => {
    navigate("/manage-ai");
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "AIModels", id));
      navigate("/manage-ai");
    } catch (error) {
      console.error("Error deleting model:", error);
      setError("Error deleting model. Please try again.");
    }
  };

  const renderFieldInput = (field, index, type, handleChange) => {
    switch (field.type) {
      case "boolean":
        return (
          <input
            type="checkbox"
            checked={field.value === "true"}
            onChange={(e) =>
              handleChange(index, "value", e.target.checked ? "true" : "false")
            }
            className="shadow appearance-none border rounded py-2 px-3 text-white leading-tight bg-gray-800 focus:outline-none focus:shadow-outline w-1/3"
          />
        );
      case "integer":
        return (
          <input
            type="number"
            value={field.value}
            onChange={(e) => handleChange(index, "value", e.target.value)}
            className="shadow appearance-none border rounded py-2 px-3 text-white leading-tight bg-gray-800 focus:outline-none focus:shadow-outline w-1/3"
          />
        );
      default:
        return (
          <input
            type="text"
            value={field.value}
            onChange={(e) => handleChange(index, "value", e.target.value)}
            className="shadow appearance-none border rounded py-2 px-3 text-white leading-tight bg-gray-800 focus:outline-none focus:shadow-outline w-1/3"
          />
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900 p-4">
      <h1 className="text-4xl mb-8">
        {isEditMode ? "Edit Model" : "Add New Model"}
      </h1>
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4">
        <div>
          <label
            className="block text-gray-400 text-sm font-bold mb-2"
            htmlFor="modelUrl"
          >
            Model URL
          </label>
          <input
            type="text"
            id="modelUrl"
            value={modelUrl}
            onChange={(e) => setModelUrl(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div>
          <h2 className="text-2xl mb-2">Method</h2>
          <label
            className="block text-gray-400 text-sm font-bold mb-2"
            htmlFor="method"
          >
            Method
          </label>
          <input
            type="text"
            id="method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div>
          <h2 className="text-2xl mb-2">Headers</h2>
          {headers.map((header, index) => (
            <div key={index} className="flex items-center mb-2 space-x-2">
              <input
                type="text"
                value={header.name}
                onChange={(e) =>
                  handleHeaderChange(index, "name", e.target.value)
                }
                className={`shadow appearance-none border rounded w-1/3 py-2 px-3 text-white leading-tight bg-gray-800 focus:outline-none focus:shadow-outline ${
                  error && !header.name ? "border-red-500" : ""
                }`}
                placeholder="Field Name"
              />
              {renderFieldInput(header, index, "headers", handleHeaderChange)}
              <select
                value={header.type}
                onChange={(e) =>
                  handleHeaderChange(index, "type", e.target.value)
                }
                className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-white leading-tight bg-gray-800 focus:outline-none focus:shadow-outline"
              >
                <option value="string">String</option>
                <option value="boolean">Boolean</option>
                <option value="integer">Integer</option>
              </select>
              <button
                type="button"
                onClick={() => handleRemoveHeader(index)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                disabled={headers.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          <div className="flex justify-center mb-2">
            <button
              type="button"
              onClick={handleAddHeader}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              + Add Header
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-2xl mb-2">Body</h2>
          <div className="mb-4">
            <label
              className="block text-gray-400 text-sm font-bold mb-2"
              htmlFor="promptFieldName"
            >
              Prompt Field Name
            </label>
            <input
              type="text"
              id="promptFieldName"
              value={promptFieldName}
              onChange={(e) => setPromptFieldName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-400 text-sm font-bold mb-2"
              htmlFor="imageDataFieldName"
            >
              Image Data Field Name
            </label>
            <input
              type="text"
              id="imageDataFieldName"
              value={imageDataFieldName}
              onChange={(e) => setImageDataFieldName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          {bodyFields.map((field, index) => (
            <div key={index} className="flex items-center mb-2 space-x-2">
              <input
                type="text"
                value={field.name}
                onChange={(e) =>
                  handleBodyFieldChange(index, "name", e.target.value)
                }
                className={`shadow appearance-none border rounded w-1/3 py-2 px-3 text-white leading-tight bg-gray-800 focus:outline-none focus:shadow-outline ${
                  error && !field.name ? "border-red-500" : ""
                }`}
                placeholder="Field Name"
              />
              {renderFieldInput(
                field,
                index,
                "bodyFields",
                handleBodyFieldChange
              )}
              <select
                value={field.type}
                onChange={(e) =>
                  handleBodyFieldChange(index, "type", e.target.value)
                }
                className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-white leading-tight bg-gray-800 focus:outline-none focus:shadow-outline"
              >
                <option value="string">String</option>
                <option value="boolean">Boolean</option>
                <option value="integer">Integer</option>
              </select>
              <button
                type="button"
                onClick={() => handleRemoveBodyField(index)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="flex justify-center mb-2">
            <button
              type="button"
              onClick={handleAddBodyField}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              + Add Field
            </button>
          </div>
        </div>

        {error && <p className="text-red-500 text-xs italic">{error}</p>}
        <div className="flex justify-between mt-10">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
          {isEditMode && (
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Delete Model
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {isEditMode ? "Update Model" : "Add Model"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditModel;
