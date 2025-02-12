import { useState, useEffect } from "react";
import axios from "axios";
import { Edit2, Save, X } from "lucide-react";

const School = () => {
  const initialSchoolData = {
    school: "",
    type: "",
    registrationNumber: "",
    licenseNumber: "",
    tin: "",
    location: "",
    staff: "",
    photo: null,
    headMaster: {
      photo: null,
      head_master_name: "",
      head_master_age: "",
      head_master_nin: "",
      head_master_educationLevel: "",
    },
  };

  const [schoolData, setSchoolData] = useState(initialSchoolData);
  const [editedData, setEditedData] = useState(initialSchoolData);
  const [isEditing, setIsEditing] = useState(true);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [headMasterPhotoPreview, setHeadMasterPhotoPreview] = useState(null);

  const apiUrl = "http://localhost:5000/api/school/";

  useEffect(() => {
    if (!isEditing) {
      axios
        .get(apiUrl)
        .then((response) => {
          const data = response.data || initialSchoolData;
          setSchoolData(data);
          setEditedData(data);
          // Set photo previews if photos exist in response
          setPhotoPreview(data.photo);
          setHeadMasterPhotoPreview(data.headMaster?.photo);
        })
        .catch((error) => {
          console.error("Error fetching school data:", error);
          setIsEditing(true);
        });
    }
  }, [isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSchoolPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedData((prev) => ({
        ...prev,
        photo: file,
      }));
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const handleHeadMasterChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      headMaster: {
        ...prev.headMaster,
        [name]: value,
      },
    }));
  };

  const handleHeadMasterPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedData((prev) => ({
        ...prev,
        headMaster: {
          ...prev.headMaster,
          photo: file,
        },
      }));
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setHeadMasterPhotoPreview(previewUrl);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedData(schoolData);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedData(schoolData);
    // Reset photo previews
    setPhotoPreview(schoolData.photo);
    setHeadMasterPhotoPreview(schoolData.headMaster?.photo);
  };

  const handleSaveClick = () => {
    const formData = new FormData();

    // Append school details
    Object.keys(editedData).forEach((key) => {
      if (key !== "headMaster") {
        if (key === "photo" && editedData[key] instanceof File) {
          formData.append(key, editedData[key]);
        } else if (key !== "photo") {
          formData.append(key, editedData[key]);
        }
      }
    });

    // Append headMaster details
    Object.keys(editedData.headMaster).forEach((key) => {
      if (key === "photo" && editedData.headMaster[key] instanceof File) {
        formData.append(`headMaster.${key}`, editedData.headMaster[key]);
      } else {
        formData.append(`headMaster.${key}`, editedData.headMaster[key]);
      }
    });

    axios
      .put(apiUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        setIsEditing(false);
      })
      .catch((error) => console.error("Error updating school data:", error));
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow rounded p-6">
        <h1 className="text-3xl font-bold mb-6">School / Institute Data</h1>

        {/* School Details Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">School Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Name (Now editable) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                School/Institute Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="school"
                  value={editedData.school || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border rounded p-2"
                />
              ) : (
                <p className="mt-1 text-gray-900">{schoolData.school}</p>
              )}
            </div>

            {/* Type (Now editable) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type of Institute
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="type"
                  value={editedData.type || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border rounded p-2"
                />
              ) : (
                <p className="mt-1 text-gray-900">{schoolData.type}</p>
              )}
            </div>

            {/* Registration Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Registration Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="registrationNumber"
                  value={editedData.registrationNumber || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border rounded p-2"
                />
              ) : (
                <p className="mt-1 text-gray-900">
                  {schoolData.registrationNumber}
                </p>
              )}
            </div>

            {/* License Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                License Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="licenseNumber"
                  value={editedData.licenseNumber || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border rounded p-2"
                />
              ) : (
                <p className="mt-1 text-gray-900">{schoolData.licenseNumber}</p>
              )}
            </div>

            {/* TIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                TIN
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="tin"
                  value={editedData.tin || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border rounded p-2"
                />
              ) : (
                <p className="mt-1 text-gray-900">{schoolData.tin}</p>
              )}
            </div>

            {/* SCHOOL LOCATION */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                LOCATION
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={editedData.location || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border rounded p-2"
                />
              ) : (
                <p className="mt-1 text-gray-900">{schoolData.location}</p>
              )}
            </div>

            {/* NO. OF LECTURERS/TEACHERS/STAFF */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Teaching Staff
              </label>
              {isEditing ? (
                <input
                  type="integer"
                  name="staff"
                  value={editedData.staff || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border rounded p-2"
                />
              ) : (
                <p className="mt-1 text-gray-900">{schoolData.staff}</p>
              )}
            </div>

            {/* School Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                School Photo
              </label>
              {isEditing ? (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSchoolPhotoChange}
                  className="mt-1 block w-full"
                />
              ) : photoPreview ? (
                <img
                  src={photoPreview}
                  alt="School"
                  className="mt-1 h-24 w-24 object-cover rounded"
                />
              ) : (
                <div className="mt-1 h-24 w-24 flex items-center justify-center bg-gray-200 rounded">
                  No Photo
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Head Master / Principal / VC Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Head Master / Principal / VC
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Head Master Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Photo
              </label>
              {isEditing ? (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeadMasterPhotoChange}
                  className="mt-1 block w-full"
                />
              ) : headMasterPhotoPreview ? (
                <img
                  src={headMasterPhotoPreview}
                  alt="Head Master"
                  className="mt-1 h-24 w-24 object-cover rounded-full"
                />
              ) : (
                <div className="mt-1 h-24 w-24 flex items-center justify-center bg-gray-200 rounded-full">
                  No Photo
                </div>
              )}
            </div>
            {/* Head Master Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="head_master_name"
                  value={editedData.headMaster.head_master_name || ""}
                  onChange={handleHeadMasterChange}
                  className="mt-1 block w-full border rounded p-2"
                />
              ) : (
                <p className="mt-1 text-gray-900">{schoolData.headMaster.head_master_name}</p>
              )}
            </div>

            {/* Head Master Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Age
              </label>
              {isEditing ? (
                <input
                  type="number"
                  name="head_master_age"
                  value={editedData.headMaster.head_master_age || ""}
                  onChange={handleHeadMasterChange}
                  className="mt-1 block w-full border rounded p-2"
                />
              ) : (
                <p className="mt-1 text-gray-900">{schoolData.headMaster.head_master_age}</p>
              )}
            </div>

            {/* Head Master NIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                NIN
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="head_master_nin"
                  value={editedData.headMaster.head_master_nin || ""}
                  onChange={handleHeadMasterChange}
                  className="mt-1 block w-full border rounded p-2"
                />
              ) : (
                <p className="mt-1 text-gray-900">{schoolData.headMaster.head_master_nin}</p>
              )}
            </div>

            {/* Head Master Education Level */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Education Level
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="head_master_educationLevel"
                  value={editedData.headMaster.head_master_educationLevel || ""}
                  onChange={handleHeadMasterChange}
                  className="mt-1 block w-full border rounded p-2"
                />
              ) : (
                <p className="mt-1 text-gray-900">
                  {schoolData.headMaster.head_master_educationLevel}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveClick}
                className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                <Save className="mr-2" size={18} /> Save
              </button>
              <button
                onClick={handleCancelClick}
                className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                <X className="mr-2" size={18} /> Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleEditClick}
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              <Edit2 className="mr-2" size={18} /> Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default School;