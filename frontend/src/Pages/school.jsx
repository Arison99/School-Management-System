import { useState, useEffect } from "react";
import { Edit2, Save, X } from "lucide-react";
import schoolService from "../api/schoolService";

const School = () => {
  const initialSchoolData = {
    name: "",
    type: "",
    registrationNumber: "",
    licenseNumber: "",
    tin: "",
    location: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    totalStaff: "",
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
  const [isEditing, setIsEditing] = useState(false);
  const [isNewSchool, setIsNewSchool] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [headMasterPhotoPreview, setHeadMasterPhotoPreview] = useState(null);

  useEffect(() => {
    fetchSchoolData();
  }, []);

  const fetchSchoolData = async () => {
    setIsLoading(true);
    try {
      const result = await schoolService.getMySchool();
      if (result.success && result.data) {
        setSchoolData(result.data);
        setEditedData(result.data);
        setIsNewSchool(false);
        // Set photo previews if photos exist
        if (result.data.photo) {
          setPhotoPreview(`http://localhost:5000${result.data.photo}`);
        }
        if (result.data.headMaster?.photo) {
          setHeadMasterPhotoPreview(`http://localhost:5000${result.data.headMaster.photo}`);
        }
      } else if (result.error === 'SCHOOL_NOT_FOUND') {
        // No school exists yet, show create form
        setIsNewSchool(true);
        setIsEditing(true);
        setMessage("Please fill in your school details to get started");
      }
    } catch (error) {
      console.error("Error fetching school data:", error);
      setMessage("Error loading school data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
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
      // Validate file type and size
      const maxSize = 2 * 1024 * 1024; // 2 MB
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        alert("Invalid file type. Please upload a JPEG, PNG, or GIF image.");
        return;
      }
      if (file.size > maxSize) {
        alert("File size exceeds 2 MB. Please upload a smaller image.");
        return;
      }
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
    setErrors({});
    setMessage("");
    // Reset photo previews
    if (schoolData.photo) {
      setPhotoPreview(`http://localhost:5000${schoolData.photo}`);
    }
    if (schoolData.headMaster?.photo) {
      setHeadMasterPhotoPreview(`http://localhost:5000${schoolData.headMaster.photo}`);
    }
  };

  const handleSaveClick = async () => {
    setMessage("");
    
    // Validate data
    const validation = schoolService.validateSchoolData(editedData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setMessage("Please fix the errors before saving");
      return;
    }

    setIsLoading(true);
    try {
      let result;
      if (isNewSchool) {
        // Create new school
        result = await schoolService.createSchool(editedData);
      } else {
        // Update existing school
        result = await schoolService.updateSchool(editedData);
      }

      if (result.success) {
        setMessage("School data saved successfully!");
        setIsEditing(false);
        setIsNewSchool(false);
        // Refresh data
        await fetchSchoolData();
      } else {
        setMessage(result.message || "Error saving school data");
        if (result.errors) {
          setErrors(result.errors);
        }
      }
    } catch (error) {
      console.error("Error saving school data:", error);
      setMessage("Error saving school data");
    } finally {
      setIsLoading(false);
    }
  };

  const schoolTypes = schoolService.getSchoolTypes();

  if (isLoading && !isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow rounded p-6">
        <h1 className="text-3xl font-bold mb-6">
          {isNewSchool ? "Create School Profile" : "School / Institute Data"}
        </h1>

        {message && (
          <div className={`mb-4 p-3 rounded ${
            message.includes('successfully') ? 'bg-green-100 text-green-700' : 
            message.includes('Error') || message.includes('fix') ? 'bg-red-100 text-red-700' : 
            'bg-blue-100 text-blue-700'
          }`}>
            {message}
          </div>
        )}

        {/* School Details Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">School Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                School/Institute Name *
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="name"
                    value={editedData.name || ""}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border rounded p-2 ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs italic mt-1">{errors.name}</p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-gray-900">{schoolData.name}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type of Institute *
              </label>
              {isEditing ? (
                <>
                  <select
                    name="type"
                    value={editedData.type || ""}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border rounded p-2 ${errors.type ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select type</option>
                    {schoolTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="text-red-500 text-xs italic mt-1">{errors.type}</p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-gray-900">{schoolData.type}</p>
              )}
            </div>

            {/* Registration Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Registration Number *
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={editedData.registrationNumber || ""}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border rounded p-2 ${errors.registrationNumber ? 'border-red-500' : ''}`}
                  />
                  {errors.registrationNumber && (
                    <p className="text-red-500 text-xs italic mt-1">{errors.registrationNumber}</p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-gray-900">{schoolData.registrationNumber}</p>
              )}
            </div>

            {/* License Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                License Number *
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={editedData.licenseNumber || ""}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border rounded p-2 ${errors.licenseNumber ? 'border-red-500' : ''}`}
                  />
                  {errors.licenseNumber && (
                    <p className="text-red-500 text-xs italic mt-1">{errors.licenseNumber}</p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-gray-900">{schoolData.licenseNumber}</p>
              )}
            </div>

            {/* TIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                TIN *
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="tin"
                    value={editedData.tin || ""}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border rounded p-2 ${errors.tin ? 'border-red-500' : ''}`}
                  />
                  {errors.tin && (
                    <p className="text-red-500 text-xs italic mt-1">{errors.tin}</p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-gray-900">{schoolData.tin}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location *
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="location"
                    value={editedData.location || ""}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border rounded p-2 ${errors.location ? 'border-red-500' : ''}`}
                  />
                  {errors.location && (
                    <p className="text-red-500 text-xs italic mt-1">{errors.location}</p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-gray-900">{schoolData.location}</p>
              )}
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={editedData.address || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border rounded p-2"
                  rows="2"
                />
              ) : (
                <p className="mt-1 text-gray-900">{schoolData.address || 'Not specified'}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={editedData.phone || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border rounded p-2"
                />
              ) : (
                <p className="mt-1 text-gray-900">{schoolData.phone || 'Not specified'}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              {isEditing ? (
                <>
                  <input
                    type="email"
                    name="email"
                    value={editedData.email || ""}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border rounded p-2 ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs italic mt-1">{errors.email}</p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-gray-900">{schoolData.email || 'Not specified'}</p>
              )}
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Website
              </label>
              {isEditing ? (
                <input
                  type="url"
                  name="website"
                  value={editedData.website || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border rounded p-2"
                  placeholder="https://example.com"
                />
              ) : (
                <p className="mt-1 text-gray-900">{schoolData.website || 'Not specified'}</p>
              )}
            </div>

            {/* Established Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Established Year
              </label>
              {isEditing ? (
                <input
                  type="number"
                  name="establishedYear"
                  value={editedData.establishedYear || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border rounded p-2"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              ) : (
                <p className="mt-1 text-gray-900">{schoolData.establishedYear || 'Not specified'}</p>
              )}
            </div>

            {/* Total Staff */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total Staff
              </label>
              {isEditing ? (
                <input
                  type="number"
                  name="totalStaff"
                  value={editedData.totalStaff || ""}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border rounded p-2"
                />
              ) : (
                <p className="mt-1 text-gray-900">{schoolData.totalStaff || 0}</p>
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
              ) : null}
              {photoPreview ? (
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

        {/* Head Master Section */}
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
              ) : null}
              {headMasterPhotoPreview ? (
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
                <p className="mt-1 text-gray-900">{schoolData.headMaster.head_master_name || 'Not specified'}</p>
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
                <p className="mt-1 text-gray-900">{schoolData.headMaster.head_master_age || 'Not specified'}</p>
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
                <p className="mt-1 text-gray-900">{schoolData.headMaster.head_master_nin || 'Not specified'}</p>
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
                  {schoolData.headMaster.head_master_educationLevel || 'Not specified'}
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
                disabled={isLoading}
                className={`flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Save className="mr-2" size={18} /> {isLoading ? 'Saving...' : (isNewSchool ? 'Create School' : 'Save')}
              </button>
              {!isNewSchool && (
                <button
                  onClick={handleCancelClick}
                  disabled={isLoading}
                  className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  <X className="mr-2" size={18} /> Cancel
                </button>
              )}
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