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

/**
 * AddEditModel component handles the creation and editing of AI models.
 * It allows users to specify API details such as URL, method, headers, and body fields.
 *
 * @component
 * @returns {JSX.Element} The rendered component
 */
const AddEditModel = () => {
  const { id } = useParams(); // Retrieves the model ID from the URL if in edit mode
  const navigate = useNavigate(); // Hook for navigation
  const [modelUrl, setModelUrl] = useState(""); // State for the model URL
  const [method, setMethod] = useState("POST"); // State for the HTTP method
  const [headers, setHeaders] = useState([
    { name: "", value: "", type: "string" }, // State for headers array
  ]);
  const [bodyFields, setBodyFields] = useState([
    { name: "", value: "", type: "string" }, // State for body fields array
  ]);
  const [promptFieldName, setPromptFieldName] = useState(""); // State for prompt field name
  const [imageDataFieldName, setImageDataFieldName] = useState(""); // State for image data field name
  const [isEditMode, setIsEditMode] = useState(false); // Determines if in edit mode
  const [error, setError] = useState(null); // Error state for validation

  // Fetch model details if in edit mode
  useEffect(() => {
    if (id) {
      setIsEditMode(true); // Set edit mode
      fetchModel(); // Fetch existing model details
    }
  }, [id]);

  /**
   * Fetches the model data from Firestore and populates the form fields.
   */
  const fetchModel = async () => {
    try {
      const docRef = doc(db, "AIModels", id); // Reference to the document
      const docSnap = await getDoc(docRef); // Get document snapshot
      if (docSnap.exists()) {
        const data = docSnap.data(); // Extract data
        setModelUrl(data.url); // Set model URL
        setMethod(data.method); // Set method
        setHeaders(data.headers || [{ name: "", value: "", type: "string" }]); // Set headers
        setBodyFields(
          data.bodyFields || [{ name: "", value: "", type: "string" }]
        ); // Set body fields
        setPromptFieldName(data.promptFieldName); // Set prompt field name
        setImageDataFieldName(data.imageDataFieldName); // Set image data field name
      } else {
        console.error("No such document!"); // Log error if document doesn't exist
      }
    } catch (error) {
      console.error("Error fetching model:", error); // Log any errors
    }
  };

  /**
   * Adds a new header to the headers array.
   * Validates to ensure all header fields are filled before adding.
   */
  const handleAddHeader = () => {
    if (headers.some((header) => !header.name || !header.value)) {
      setError("Please fill both field name and value before adding."); // Set error if validation fails
      return;
    }
    setHeaders([...headers, { name: "", value: "", type: "string" }]); // Add a new header object
    setError(null); // Reset error
  };

  /**
   * Removes a header from the headers array at the specified index.
   *
   * @param {number} index - Index of the header to be removed
   */
  const handleRemoveHeader = (index) => {
    if (headers.length > 1) {
      const updatedHeaders = headers.filter((_, i) => i !== index); // Remove the specified header
      setHeaders(updatedHeaders); // Update headers array
    }
  };

  /**
   * Handles changes to header fields and updates the state.
   *
   * @param {number} index - Index of the header being changed
   * @param {string} field - Field name (name, value, type) being changed
   * @param {string} value - New value for the field
   */
  const handleHeaderChange = (index, field, value) => {
    const updatedHeaders = headers.map((header, i) => {
      if (i === index) {
        return { ...header, [field]: value }; // Update specific header field
      }
      return header; // Return unchanged headers
    });
    setHeaders(updatedHeaders); // Set updated headers
  };

  /**
   * Adds a new body field to the bodyFields array.
   * Validates to ensure all body field inputs are filled before adding.
   */
  const handleAddBodyField = () => {
    if (bodyFields.some((field) => !field.name || !field.value)) {
      setError("Please fill both field name and value before adding."); // Set error if validation fails
      return;
    }
    setBodyFields([...bodyFields, { name: "", value: "", type: "string" }]); // Add a new body field
    setError(null); // Reset error
  };

  /**
   * Removes a body field from the bodyFields array at the specified index.
   *
   * @param {number} index - Index of the body field to be removed
   */
  const handleRemoveBodyField = (index) => {
    const updatedBodyFields = bodyFields.filter((_, i) => i !== index); // Remove specified body field
    setBodyFields(updatedBodyFields); // Update bodyFields array
  };

  /**
   * Handles changes to body fields and updates the state.
   *
   * @param {number} index - Index of the body field being changed
   * @param {string} field - Field name (name, value, type) being changed
   * @param {string} value - New value for the field
   */
  const handleBodyFieldChange = (index, field, value) => {
    const updatedBodyFields = bodyFields.map((bodyField, i) => {
      if (i === index) {
        return { ...bodyField, [field]: value }; // Update specific body field
      }
      return bodyField; // Return unchanged body fields
    });
    setBodyFields(updatedBodyFields); // Set updated body fields
  };

  /**
   * Handles form submission to add or update the AI model.
   * Validates the inputs and either updates the existing model or adds a new one.
   *
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (
      !modelUrl ||
      !method ||
      !promptFieldName ||
      !imageDataFieldName ||
      headers.some((header) => !header.name || !header.value)
    ) {
      setError(
        "All required fields must be filled and at least one header must be provided."
      ); // Set error if validation fails
      return;
    }

    const modelData = {
      url: modelUrl,
      method,
      headers,
      bodyFields,
      promptFieldName,
      imageDataFieldName,
    }; // Model data object

    try {
      if (isEditMode) {
        await updateDoc(doc(db, "AIModels", id), modelData); // Update existing model
      } else {
        await addDoc(collection(db, "AIModels"), modelData); // Add new model
      }
      navigate("/manage-ai"); // Navigate to manage AI page
    } catch (err) {
      console.error("Error saving model:", err); // Log error
      setError("Error saving model. Please try again."); // Set error message
    }
  };

  /**
   * Navigates back to the manage AI page without making changes.
   */
  const handleCancel = () => {
    navigate("/manage-ai"); // Navigate to manage AI page
  };

  /**
   * Deletes the current model if in edit mode.
   * Confirms deletion and navigates back to the manage AI page.
   */
  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "AIModels", id)); // Delete model document
      navigate("/manage-ai"); // Navigate to manage AI page
    } catch (error) {
      console.error("Error deleting model:", error); // Log error
      setError("Error deleting model. Please try again."); // Set error message
    }
  };

  /**
   * Renders input fields for header or body fields with dynamic types.
   *
   * @param {Object} field - The field object containing name, value, and type
   * @param {number} index - Index of the field in the array
   * @param {string} type - Type of the field (headers or bodyFields)
   * @param {function} handleChange - Function to handle field changes
   * @returns {JSX.Element} Rendered input element
   */
  const renderFieldInput = (field, index, type, handleChange) => {
    switch (field.type) {
      case "boolean":
        return (
          <input
            type="checkbox"
            checked={field.value === "true"} // Boolean checkbox
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
            value={field.value} // Integer input
            onChange={(e) => handleChange(index, "value", e.target.value)}
            className="shadow appearance-none border rounded py-2 px-3 text-white leading-tight bg-gray-800 focus:outline-none focus:shadow-outline w-1/3"
          />
        );
      default:
        return (
          <input
            type="text"
            value={field.value} // Default string input
            onChange={(e) => handleChange(index, "value", e.target.value)}
            className="shadow appearance-none border rounded py-2 px-3 text-white leading-tight bg-gray-800 focus:outline-none focus:shadow-outline w-1/3"
          />
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900 p-4">
      <h1 className="text-4xl mb-8">
        {isEditMode ? "Edit Model" : "Add New Model"}{" "}
        {/* Conditional heading */}
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
                disabled={headers.length === 1} // Prevent removal if only one header
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
