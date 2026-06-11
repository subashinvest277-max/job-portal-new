import React, { useState, useRef } from "react";
import "./MyProfile.css";
import { Link } from "react-router-dom";
import addPhoto from "../assets/AddPhoto.png";
import editIcon from "../assets/EditIcon.png";
import uploadIcon from "../assets/UploadIcon.png";
import deleteIcon from "../assets/DeleteIcon.png";
import resumeIcon from "../assets/resume_icon.png";
import { Header } from "../Components-LandingPage/Header";
import { useEffect } from "react";
import api from "../api/axios";

const isValidValue = (value) => {
    if (!value) return false;

    const cleaned = value.trim();

    if (cleaned.length < 2) return false;

    if (!/[A-Za-z]/.test(cleaned)) return false;

    if (!/^[A-Za-z0-9\s.+#&/-]+$/.test(cleaned)) return false;

    if (/^(.)\1+$/.test(cleaned)) return false;

    if (/([.+#&/-])\1{1,}/.test(cleaned)) return false;

    if (/^[.+#&/-]|[.+#&/-]$/.test(cleaned)) return false;

    return true;
};

// --- REUSABLE COMPONENTS ---

const EditableListItem = ({ title, onEdit }) => (
    <div className="skill-item">
        <span>{title}</span>
        <button type="button" onClick={onEdit} className="edit-skill-btn">
            <img className="edit-icon-btn" src={editIcon} alt="edit" title="Edit" />
        </button>
    </div>
);

// Filter drop down skills and languages

const FilterableDropdown = ({ options, selectedValue, onSelect, placeholder }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="jobpost-dropdown" style={{ position: 'relative', width: '100%' }}>
            <div
                className="jobpost-dropdown-trigger"
                onClick={() => setIsOpen(!isOpen)}
                style={{ height: '44px', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '0 16px', display: 'flex', alignItems: 'center', cursor: 'pointer', background: '#fff' }}
            >
                {selectedValue || placeholder}
                <i className={`fas fa-angle-down jobpost-arrow ${isOpen ? 'open' : ''}`} style={{ marginLeft: 'auto' }}></i>
            </div>

            {isOpen && (
                <div className="jobpost-dropdown-panel" style={{ display: 'block', position: 'absolute', top: '100%', left: 0, width: '100%', zIndex: 1000, background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <input
                        type="text"
                        className="jobpost-input"
                        placeholder="Search..."
                        autoFocus
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ marginBottom: '10px', height: '36px' }}
                    />
                    <div className="jobpost-options-grid" style={{ gridTemplateColumns: '1fr', maxHeight: '150px', overflowY: 'auto' }}>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div
                                    key={opt}
                                    className="jobpost-option-item"
                                    onClick={() => { onSelect(opt); setIsOpen(false); setSearchTerm(""); }}
                                    style={{ padding: '8px', cursor: 'pointer' }}
                                >
                                    {opt}
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '8px', color: '#999' }}>No results found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const nationalityOptions = [
    "American", "British", "Canadian", "Chinese", "French", "German",
    "Indian", "Indonesian", "Italian", "Japanese", "Mexican", "Russian",
    "Singaporean", "Spanish", "Swiss"
];

const PopupModal = ({
    title,
    isOpen,
    onClose,
    onSave,
    onDelete,
    mode,
    children,
}) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button type="button" className="close-modal" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div className="modal-body">{children}</div>
                <div className="modal-actions">
                    <button
                        type="button"
                        className="btn btn-primary btn-full"
                        onClick={onSave}
                    >
                        Save
                    </button>
                    {mode === "edit" ? (
                        <button
                            type="button"
                            className="btn btn-danger btn-full"
                            onClick={onDelete}
                        >
                            Delete
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-danger btn-full"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- FORM SECTIONS ---


const Profile = ({ data, onChange, onReset, onNext, setProfilePhoto, setRemovePhotoFlag }) => {
    const [errors, setErrors] = useState({});
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [imageError, setImageError] = useState("");
    const [imageLoading, setImageLoading] = useState(false);

    useEffect(() => {
        if (data.profile_photo && !photoPreview) {
            if (typeof data.profile_photo === 'string') {
                setPhotoPreview(data.profile_photo);
            } else if (data.profile_photo instanceof File) {
                const objectUrl = URL.createObjectURL(data.profile_photo);
                setPhotoPreview(objectUrl);
                // Cleanup function to prevent memory leaks
                return () => URL.revokeObjectURL(objectUrl);
            }
        }
    }, [data.profile_photo])

    const handleNationalitySelect = (val) => {
        handleChange({
            target: { name: 'nationality', value: val }
        });
    };

    // const handlePhotoChange = (e) => {
    //     const file = e.target.files[0];
    //     if (!file) return;

    //     setPhoto(file);
    //     setProfilePhoto(file);
    //     setPhotoPreview(URL.createObjectURL(file));

    //     // Clear remove flag if it was set
    //     if (setRemovePhotoFlag) {
    //         setRemovePhotoFlag(false);
    //     }

    //     // Update parent to clear existing photo reference
    //     onChange({
    //         target: {
    //             name: "profile_photo",
    //             value: file
    //         }
    //     });
    // };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // ONLY FILE TYPE VALIDATION (NO SIZE CHECK)
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

        console.log("Selected file:", {
            name: file.name,
            type: file.type,
            size: (file.size / (1024 * 1024)).toFixed(2) + "MB"
        });

        // Check file type only
        if (!allowedTypes.includes(file.type)) {
            const errorMsg = ` Invalid file format: ${file.type}. Please upload JPG, JPEG, PNG.`;
            setImageError(errorMsg);
            console.error('Image upload error:', errorMsg);

            // Clear the file input
            e.target.value = "";

            // DON'T create preview for invalid files
            return;
        }

        // Clear any previous errors
        setImageError("");
        setImageLoading(true);

        try {
            // Create preview ONLY for valid image types
            if (photoPreview && photoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(photoPreview);
            }

            const previewUrl = URL.createObjectURL(file);
            setPhotoPreview(previewUrl);
            setPhoto(file);
            setProfilePhoto(file);

            // Clear remove flag if it was set
            if (setRemovePhotoFlag) {
                setRemovePhotoFlag(false);
            }

            // Update parent to clear existing photo reference
            onChange({
                target: {
                    name: "profile_photo",
                    value: file
                }
            });

            console.log("Image accepted - type valid:", file.type);

        } catch (error) {
            console.error('Image processing error:', error);
            setImageError('Failed to process image. Please try another file.');
            setPhotoPreview(null);
        } finally {
            setImageLoading(false);
        }
    };

    const removePhoto = () => {
        setImageError("");
        setPhoto(null);
        setProfilePhoto(null);
        setPhotoPreview(null);


        if (setRemovePhotoFlag) {
            setRemovePhotoFlag(true);
        }

        // Update parent to mark photo for deletion
        onChange({
            target: {
                name: "profile_photo",
                value: null,
                removePhoto: true
            }
        });

        // Clear the file input
        const fileInput = document.getElementById("photoUpload");
        if (fileInput) {
            fileInput.value = "";
        }
    };

    // Date of Birth validation
    const todayDate = new Date();
    const maxDate = new Date();
    maxDate.setFullYear(todayDate.getFullYear() - 15);
    const maxString = maxDate.toISOString().split("T")[0];
    const minString = "1960-01-01";
    const birthDate = new Date(data.dob);
    const AlphaOnlyreg = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

    const handleChange = (e) => {
        onChange(e);
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!data.fullName?.trim()) newErrors.fullName = "*Full Name is required";
        else if (!AlphaOnlyreg.test(data.fullName))
            newErrors.fullName = "*Please use letters only; no spaces or numbers allowed";
        if (data.gender === "Select") newErrors.gender = "*Please select a gender";
        if (!data.dob) {
            newErrors.dob = "*Date of Birth is required";
        } else if (birthDate.getFullYear() < 1960) {
            newErrors.dob = "*Year must be 1960 or later";
        } else if (birthDate > maxDate) {
            newErrors.dob = "*You must be at least 15 years old";
        }
        if (data.maritalStatus === "Select")
            newErrors.maritalStatus = "*Please select status";
        if (!data.nationality?.trim())
            newErrors.nationality = "*Nationality is required";
        else if (!AlphaOnlyreg.test(data.nationality))
            newErrors.nationality = "*Please use letters only";

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            onNext();
        } else {
            alert("Please fill all required fields.");
        }
    };

    return (
        <form className="content-card" onSubmit={handleSubmit}>
            <div className="profile-header">
                <h2>Profile</h2>
                <button
                    type="button"
                    className="reset-link"
                    onClick={() => {
                        onReset();
                        setErrors({});
                        removePhoto();
                    }}
                >
                    Reset
                </button>
            </div>
            <div className="profile-layout">
                <div className="photo-uploader">
                    <div className="photo-placeholder">
                        {photoPreview ? (
                            <img
                                src={photoPreview}
                                alt="Profile"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                }}
                                onError={(e) => {
                                    console.error("Failed to load image preview:", photoPreview);
                                    setImageError("❌ Failed to load image preview. The file may be corrupted or in an unsupported format.");
                                    setPhotoPreview(null);
                                    e.target.style.display = "none";
                                }}
                                onLoad={() => {
                                    console.log("✅ Image preview loaded successfully");
                                    setImageError("");
                                }}
                            />
                        ) : (

                            <>
                                <img
                                    className="photo-placeholder-icon"
                                    src={addPhoto}
                                    alt="upload"
                                />
                                <p>Upload photo</p>
                            </>
                        )}

                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            id="photoUpload"
                            hidden
                            onChange={handlePhotoChange}
                        />
                    </div>

                    <small>Allowed format: </small>
                    <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>
                        JPG, JPEG, PNG
                    </span>

                    <div className="photo-actions">
                        <button
                            type="button"
                            className="photo-btn remove"
                            onClick={removePhoto}
                            disabled={!photoPreview && !data.profile_photo}
                        >
                            <div className="remove-action-wrapper">
                                <img
                                    className="upload-icon-btn"
                                    src={deleteIcon}
                                    alt="delete"
                                />{" "}
                                Remove Photo
                            </div>
                        </button>
                        <button
                            type="button"
                            className="photo-btn upload"
                            onClick={() => document.getElementById("photoUpload").click()}
                        >
                            {!photoPreview ? (
                                <div className="remove-action-wrapper">
                                    <img
                                        className="upload-icon-btn"
                                        src={uploadIcon}
                                        alt="upload"
                                    />{" "}
                                    Upload Photo{" "}
                                </div>
                            ) : (
                                <div className="remove-action-wrapper">
                                    <img
                                        className="upload-icon-btn"
                                        src={uploadIcon}
                                        alt="upload"
                                    />{" "}
                                    Change Photo{" "}
                                </div>
                            )}
                        </button>
                    </div>

                    {imageError && (
                        <div style={{
                            color: '#dc3545',
                            fontSize: '13px',
                            marginTop: '12px',
                            padding: '10px',
                            backgroundColor: '#ffe6e6',
                            borderRadius: '6px',
                            textAlign: 'center',
                            border: '1px solid #ffcccc'
                        }}>
                            {imageError}
                        </div>
                    )}
                    {imageLoading && (
                        <div style={{
                            color: '#007bff',
                            fontSize: '12px',
                            marginTop: '10px',
                            textAlign: 'center'
                        }}>
                            Uploading image...
                        </div>
                    )}
                </div>
                <div className="profile-form">
                    {/* Form fields remain the same */}
                    <div className="form-group">
                        <label>Full name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={data.fullName || ""}
                            onChange={handleChange}
                            className={errors.fullName ? "input-error" : ""}
                            placeholder="Enter full name"
                        />
                        {errors.fullName && (
                            <span className="error-message">{errors.fullName}</span>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Gender</label>
                        <select
                            name="gender"
                            value={data.gender || "Select"}
                            onChange={handleChange}
                            className={errors.gender ? "input-error" : ""}
                        >
                            <option value="Select">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Not Specified">Not Specified</option>
                        </select>
                        {errors.gender && (
                            <span className="error-message">{errors.gender}</span>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Date of Birth</label>
                        <input
                            type="date"
                            name="dob"
                            value={data.dob || ""}
                            min={minString}
                            max={maxString}
                            onChange={handleChange}
                            className={errors.dob ? "input-error" : "", "cursor-as-pointer"}
                        />
                        {errors.dob && <span className="error-message">{errors.dob}</span>}
                    </div>
                    <div className="form-group">
                        <label>Marital Status</label>
                        <select
                            name="maritalStatus"
                            value={data.maritalStatus || "Select"}
                            onChange={handleChange}
                            className={errors.maritalStatus ? "input-error" : ""}
                        >
                            <option value="Select">Select</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                        </select>
                        {errors.maritalStatus && (
                            <span className="error-message">{errors.maritalStatus}</span>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Nationality</label>
                        {/* <input
                            type="text"
                            name="nationality"
                            value={data.nationality || ""}
                            onChange={(e) => {
                                if (/^[A-Za-z\s]*$/.test(e.target.value)) {
                                    handleChange(e);
                                }
                            }}
                            className={errors.nationality ? "input-error" : ""}
                            placeholder="Enter nationality"
                        /> */}
                        <FilterableDropdown
                            options={nationalityOptions}
                            selectedValue={data.nationality}
                            onSelect={handleNationalitySelect}
                            placeholder="Select Nationality"
                        />
                        {errors.nationality && (
                            <span className="error-message">{errors.nationality}</span>
                        )}
                    </div>
                </div>
            </div>
            <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                    Save & Continue
                </button>
            </div>
        </form>
    );
};

const CurrentDetails = ({ data, onChange, onReset, onNext }) => {
    const [errors, setErrors] = useState({});

    // Derived state to check if the user is a fresher based on experienceType
    const isFresher = data.experienceType === "fresher";

    const AlphaOnlyWithSpace = /^[A-Za-z\s]*$/;

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Validation RegEx rules for live typing
        if (name === "jobTitle" && !AlphaOnlyWithSpace.test(value)) return;
        if (name === "company" && value !== "" && !/^(?=.*[A-Za-z])[A-Za-z0-9\s\.\-\'\,\&\(\)@#\$]*$/.test(value)) return;
        if ((name === "currentLocation" || name === "prefLocation") && !/^[A-Za-z\s,]*$/.test(value)) return;

        // Reset experience fields when switching to fresher
        if (name === "experienceType") {
            if (value === "fresher") {
                onChange({ target: { name: "experience", value: "" } });
                onChange({ target: { name: "jobTitle", value: "" } });
                onChange({ target: { name: "company", value: "" } });
                onChange({ target: { name: "noticePeriod", value: "" } });
            }
        }

        // Clear individual error as the user types a correct value
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }

        onChange(e);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        // 1. Validate experienceType is selected (Required for everyone)
        if (!data.experienceType) {
            newErrors.experienceType = "*Please select your experience status";
        } else {
            // 2. Validate locations (Required for BOTH Freshers and Experienced users)
            if (!data.currentLocation?.trim()) {
                newErrors.currentLocation = "*Current location is required";
            }
            if (!data.prefLocation?.trim()) {
                newErrors.prefLocation = "*Preferred location is required";
            }

            // 3. Separate Validation block strictly for Experienced users
            if (!isFresher) {
                if (!data.jobTitle?.trim()) newErrors.jobTitle = "*Job Title is required";
                if (!data.company?.trim()) newErrors.company = "*Company name is required";
                
                if (!data.experience) {
                    newErrors.experience = "*Experience is required";
                } else if (isNaN(data.experience)) {
                    newErrors.experience = "*Please enter a valid number";
                }
                
                if (!data.noticePeriod || data.noticePeriod === "Select") {
                    newErrors.noticePeriod = "*Please select a notice period";
                }
            }
        }

        setErrors(newErrors);

        // Run navigation step if there are absolutely zero errors detected
        if (Object.keys(newErrors).length === 0) {
            onNext();
        } else {
            alert("Please fill all required fields.");
        }
    };

    return (
        <form className="content-card" onSubmit={handleSubmit} noValidate>
            <div className="profile-header">
                <h2>Current Details</h2>
                <button
                    type="button"
                    className="reset-link"
                    onClick={() => {
                        onReset();
                        setErrors({});
                    }}
                >
                    Reset
                </button>
            </div>

            <div className="form-grid">
                {/* Experience Status */}
                <div className="form-group">
                    <label>Experience Status *</label>
                    <select
                        name="experienceType"
                        value={data.experienceType || ""}
                        onChange={handleChange}
                        className={errors.experienceType ? "input-error" : ""}
                    >
                        <option value="">Select</option>
                        <option value="experienced">Experienced</option>
                        <option value="fresher">Fresher</option>
                    </select>
                    {errors.experienceType && <span className="error-message">{errors.experienceType}</span>}
                </div>

                {/* Conditional Fields: Hidden if user is a Fresher */}
                {!isFresher && data.experienceType === "experienced" && (
                    <>
                        <div className="form-group">
                            <label>Total Experience (Years) *</label>
                            <input
                                type="text"
                                name="experience"
                                placeholder="e.g., 2.5"
                                value={data.experience || ""}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || /^\d{0,2}(\.\d{0,1})?$/.test(val)) handleChange(e);
                                }}
                                className={errors.experience ? "input-error" : ""}
                            />
                            {errors.experience && <span className="error-message">{errors.experience}</span>}
                        </div>

                        <div className="form-group">
                            <label>Current Job Title *</label>
                            <input
                                type="text"
                                name="jobTitle"
                                value={data.jobTitle || ""}
                                onChange={handleChange}
                                className={errors.jobTitle ? "input-error" : ""}
                                placeholder="e.g., Software Engineer"
                            />
                            {errors.jobTitle && <span className="error-message">{errors.jobTitle}</span>}
                        </div>

                        <div className="form-group">
                            <label>Current Company *</label>
                            <input
                                type="text"
                                name="company"
                                value={data.company || ""}
                                onChange={handleChange}
                                className={errors.company ? "input-error" : ""}
                                placeholder="e.g., XYZ Company"
                            />
                            {errors.company && <span className="error-message">{errors.company}</span>}
                        </div>

                        <div className="form-group">
                            <label>Notice Period *</label>
                            <select
                                name="noticePeriod"
                                value={data.noticePeriod || "Select"}
                                onChange={handleChange}
                                className={errors.noticePeriod ? "input-error" : ""}
                            >
                                <option value="Select">Select</option>
                                <option value="Immediate">Immediate</option>
                                <option value="1 Month">1 Month</option>
                                <option value="2 Months">2 Months</option>
                                <option value="3 Months">3 Months</option>
                            </select>
                            {errors.noticePeriod && <span className="error-message">{errors.noticePeriod}</span>}
                        </div>
                    </>
                )}

                {/* Location Fields: Rendered cleanly for both statuses */}
                <div className="form-group full-width">
                    <label>Current Location *</label>
                    <input
                        type="text"
                        name="currentLocation"
                        value={data.currentLocation || ""}
                        onChange={handleChange}
                        className={errors.currentLocation ? "input-error" : ""}
                        placeholder="e.g., Bangalore"
                    />
                    {errors.currentLocation && <span className="error-message">{errors.currentLocation}</span>}
                </div>

                <div className="form-group full-width">
                    <label>Preferred Location(s) *</label>
                    <input
                        type="text"
                        name="prefLocation"
                        value={data.prefLocation || ""}
                        onChange={handleChange}
                        className={errors.prefLocation ? "input-error" : ""}
                        placeholder="e.g., Bangalore, Chennai, Coimbatore"
                    />
                    {errors.prefLocation && <span className="error-message">{errors.prefLocation}</span>}
                </div>
            </div>

            <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                    Save & Continue
                </button>
            </div>
        </form>
    );
};

const ContactDetails = ({ data, onChange, onReset, onNext }) => {
    const [errors, setErrors] = useState({});
    const handleChange = (e) => {
        onChange(e);
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
    };
    const mobileRegex = /^[6-9]\d{9}$/;
    const Pincode = /^[1-9][0-9]{5}$/;
    const gmailAlphaRegex = /^[a-zA-Z][a-zA-Z0-9]*@(gmail|yahoo|outlook|hotmail)\.[a-zA-Z]{2,}$/;
    const addressRegex = /^(?=.*[A-Za-z])[A-Za-z0-9\s,./#-]+$/;


    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!data.mobile) newErrors.mobile = "*Mobile number is required";
        else if (!mobileRegex.test(data.mobile))
            newErrors.mobile = "*Enter a valid 10-digit mobile number";

        if (data.altMobile && !mobileRegex.test(data.altMobile))
            newErrors.altMobile = "*Invalid alternate number format";
        else if (data.mobile.length > 0 && data.mobile === data.altMobile)
            newErrors.altMobile = "*Alternate number cannot be the same as primary";

        if (!data.email) {
            newErrors.email = "*Email ID is required";
        } else if (!gmailAlphaRegex.test(data.email)) {
            newErrors.email = "*Please enter a valid Email (must start with a letter)";
        }

        // Alternate Email
        if (data.altEmail) {
            if (!gmailAlphaRegex.test(data.altEmail)) {
                newErrors.altEmail = "*Invalid alternate email format";
            } else if (data.email.toLowerCase() === data.altEmail.toLowerCase()) {
                newErrors.altEmail = "*Alternate email cannot be the same as primary";
            }
        }


        if (!data.address) {
            newErrors.address = "*Full address is required";
        } else if (!addressRegex.test(data.address)) {
            newErrors.address = "*Enter a valid address";
        }
        if (!data.country) newErrors.country = "*Country is required";
        if (!data.state) newErrors.state = "*State is required";
        if (!data.street) newErrors.street = "*Street/Area is required";
        if (!data.pincode) newErrors.pincode = "*Pincode is required";
        if (!data.city) newErrors.city = "*City is required";
        else if (!Pincode.test(data.pincode))
            newErrors.pincode = "*Enter a valid 6-digit pincode";

        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            onNext();
        } else {
            alert("Please fill all required fields.");
        }
    };

    return (
        <form className="content-card" onSubmit={handleSubmit}>
            <div className="profile-header">
                <h2>Contact Details</h2>
                <button
                    type="button"
                    className="reset-link"
                    onClick={() => {
                        onReset();
                        setErrors({});
                    }}
                >
                    Reset
                </button>
            </div>
            <div className="form-grid">
                <div className="form-group">
                    <label>Mobile Number</label>
                    <input
                        type="tel"
                        name="mobile"
                        maxLength="10"
                        value={data.mobile || ""}
                        onChange={(e) => {
                            if (/^\d*$/.test(e.target.value)) handleChange(e);
                        }}
                        className={errors.mobile ? "input-error" : ""}
                        placeholder="Enter phone number"
                    />
                    {errors.mobile && <span className="error-msg">{errors.mobile}</span>}
                </div>

                <div className="form-group">
                    <label>Alternate Number</label>
                    <input
                        type="tel"
                        name="altMobile"
                        maxLength="10"
                        value={data.altMobile || ""}
                        onChange={(e) => {
                            if (/^\d*$/.test(e.target.value)) handleChange(e);
                        }}
                        placeholder="Enter phone number"
                    />
                    {errors.altMobile && (
                        <span className="error-msg">{errors.altMobile}</span>
                    )}
                </div>

                <div className="form-group">
                    <label>Email ID</label>
                    <input
                        type="email"
                        name="email"
                        value={data.email || ""}
                        onChange={handleChange}
                        className={errors.email ? "input-error" : ""}
                        placeholder="Enter email address"
                    />
                    {errors.email && <span className="error-msg">{errors.email}</span>}
                </div>

                <div className="form-group">
                    <label>Alternate Email</label>
                    <input
                        type="email"
                        name="altEmail"
                        value={data.altEmail || ""}
                        onChange={handleChange}
                        className={errors.altEmail ? "input-error" : ""}
                        placeholder="Enter email address"
                    />
                    {errors.altEmail && (
                        <span className="error-msg">{errors.altEmail}</span>
                    )}
                </div>

                <div className="form-group full-width">
                    <label>Address</label>
                    <input
                        type="text"
                        name="address"
                        value={data.address || ""}
                        onChange={onChange}
                        className={errors.address ? "input-error" : ""}
                        placeholder="Street, City, State, Pincode, Country"
                    />
                    {errors.address && (
                        <span className="error-msg">{errors.address}</span>
                    )}
                </div>

                <div className="form-group">
                    <label>Street</label>
                    <input
                        type="text"
                        name="street"
                        value={data.street || ""}
                        onChange={handleChange}
                        placeholder="e.g., Flat 402"
                        className={errors.street ? "input-error" : ""}
                    />
                    {errors.street && <span className="error-msg">{errors.street}</span>}
                </div>

                <div className="form-group">
                    <label>City</label>
                    <input
                        type="text"
                        name="city"
                        value={data.city || ""}
                        onChange={(e) => {
                            if (/^[A-Za-z\s]*$/.test(e.target.value)) handleChange(e);
                        }}
                        className={errors.city ? "input-error" : ""}
                        placeholder="e.g., Green Park"
                    />
                    {errors.city && <span className="error-msg">{errors.city}</span>}
                </div>

                <div className="form-group">
                    <label>State</label>
                    <input
                        type="text"
                        name="state"
                        value={data.state || ""}
                        onChange={(e) => {
                            if (/^[A-Za-z\s]*$/.test(e.target.value)) handleChange(e);
                        }}
                        className={errors.state ? "input-error" : ""}
                        placeholder="e.g., Karnataka"
                    />
                    {errors.state && <span className="error-msg">{errors.state}</span>}
                </div>

                <div className="form-group">
                    <label>Pincode</label>
                    <input
                        type="text"
                        name="pincode"
                        maxLength="6"
                        value={data.pincode || ""}
                        onChange={(e) => {
                            if (/^\d*$/.test(e.target.value)) handleChange(e);
                        }}
                        placeholder="e.g., 625601"
                    />
                    {errors.pincode && (
                        <span className="error-msg">{errors.pincode}</span>
                    )}
                </div>

                <div className="form-group">
                    <label>Country</label>
                    <input
                        type="text"
                        name="country"
                        value={data.country || ""}
                        onChange={(e) => {
                            if (/^[A-Za-z\s]*$/.test(e.target.value)) handleChange(e);
                        }}
                        className={errors.country ? "input-error" : ""}
                        placeholder="e.g., India"
                    />
                    {errors.country && (
                        <span className="error-msg">{errors.country}</span>
                    )}
                </div>
            </div>
            <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                    Save & Continue
                </button>
            </div>
        </form>
    );
};

const ResumeSection = ({
    data,
    onChange,
    onReset,
    onNext,
    setResumeFile,
    resumeFile,
}) => {
    const [errors, setErrors] = useState({});
    const [existingResume, setExistingResume] = useState(null);

    useEffect(() => {
        if (data.resume_file) {
            setExistingResume(data.resume_file);
        } else if (resumeFile) {
            setExistingResume(resumeFile);
        } else {
            setExistingResume(null);
        }
    }, [data.resume_file, resumeFile]);

    const handleResumeChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (!allowedTypes.includes(file.type)) {
            alert("Only PDF, DOC, DOCX allowed");
            e.target.value = "";
            return;
        }

        setResumeFile(file);
        setExistingResume(null); // Clear existing resume when new file is uploaded
        setErrors((prev) => ({ ...prev, resumeFile: "" }));
    };

    const handleDeleteFile = (e) => {
        e.stopPropagation();

        if (window.confirm("Are you sure you want to remove this resume?")) {
            onChange({
                target: {
                    name: "resume_file",
                    value: null,
                },
            });

            setResumeFile(null);
            setExistingResume(null);
            setErrors({ ...errors, resumeFile: "" });

            const fileInput = document.getElementById("resumeInput");
            if (fileInput) {
                fileInput.value = "";
            }
        }
    };

    const handleViewResume = (e) => {
        e.stopPropagation();

        const fileToView = resumeFile || data.resume_file || existingResume;

        if (!fileToView) return;

        if (fileToView instanceof File) {
            const fileURL = URL.createObjectURL(fileToView);
            window.open(fileURL, "_blank");
            setTimeout(() => URL.revokeObjectURL(fileURL), 100);
        } else if (typeof fileToView === "string" && fileToView) {
            window.open(fileToView, "_blank");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!resumeFile && !data.resume_file) {
            newErrors.resumeFile = "*Please upload your resume to continue";
        }

        if (data.portfolio_link && data.portfolio_link.trim() !== "") {
            const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
            if (!urlPattern.test(data.portfolio_link.trim())) {
                newErrors.portfolio_link = "*Please enter a valid URL (e.g., https://example.com)";
            }
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            onNext();
        }
    };

    return (
        <form className="content-card" onSubmit={handleSubmit}>
            <div className="profile-header">
                <h2>Resume</h2>
                <button
                    type="button"
                    className="reset-link"
                    onClick={() => {
                        onReset();
                        setErrors({});
                        setResumeFile(null);
                        setExistingResume(null);
                        const fileInput = document.getElementById("resumeInput");
                        if (fileInput) {
                            fileInput.value = "";
                        }
                    }}
                >
                    Reset
                </button>
            </div>

            <div className={`upload-box ${errors.resumeFile ? "input-error" : ""}`}>
                <input
                    type="file"
                    id="resumeInput"
                    hidden
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                />

                <div>
                    {existingResume ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <div className="ResumeName">
                                <img src={resumeIcon} className="resume-icon" alt="resume" />
                                <h4>
                                    {existingResume instanceof File
                                        ? existingResume.name
                                        : typeof existingResume === "string"
                                            ? existingResume.split('/').pop() || existingResume
                                            : "Resume"}
                                </h4>
                            </div>

                            <div className="ActionButtons">
                                <button
                                    className="btn btn-primary btn-mini"
                                    type="button"
                                    onClick={handleViewResume}
                                >
                                    View
                                </button>
                                <button
                                    className="btn btn-danger btn-mini"
                                    type="button"
                                    onClick={handleDeleteFile}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div
                                onClick={() => document.getElementById("resumeInput").click()}
                                className="upload-text"
                            >
                                <img
                                    className="upload-icon-btn"
                                    src={uploadIcon}
                                    alt="upload"
                                />{" "}
                                Upload Resume
                            </div>
                            <div>
                                <small>Allowed formats: PDF, DOC, DOCX</small>
                            </div>
                        </div>
                    )}
                    {errors.resumeFile && (
                        <span className="error-message">{errors.resumeFile}</span>
                    )}
                </div>
            </div>

            <div className="form-group full-width">
                <label>Portfolio/Website Link</label>
                <input
                    type="url"
                    name="portfolio_link"
                    value={data.portfolio_link || ""}
                    onChange={onChange}
                    placeholder="e.g., https://yourportfolio.com"
                    className={errors.portfolio_link ? "input-error" : ""}
                />
                {errors.portfolio_link && (
                    <span className="error-message">{errors.portfolio_link}</span>
                )}
            </div>

            <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                    Save & Continue
                </button>
            </div>
        </form>
    );
};

const EducationDetails = ({
    data,
    onHighestQualChange,
    onUpdateSSLC,
    onUpdateHSC,
    onUpdateGrad,
    onAddGrad,
    onRemoveGrad,
    onReset,
    onNext,
}) => {
    const [openSection, setOpenSection] = useState("sslc");
    const currentYear = new Date().getFullYear();
    const percentageReg = /^(\d{1,2}(\.\d{0,2})?|100(\.0{0,2})?)$/;

    const toggleSection = (id) => setOpenSection(openSection === id ? null : id);

    const [errors, setErrors] = useState({});

    // Local change handler to clear errors immediately when user types
    const handleInputChange = (e, type, id = null) => {
        const { name, value } = e.target;

        if (name === "percentage") {
            const decimalRegex = /^\d*\.?\d{0,2}$/;

            if (value !== "" && !decimalRegex.test(value)) return;

            if (parseFloat(value) > 100) return;
        }

        // 2. Letters only for City/State/Location
        if (["city", "state", "country", "location", "country", "degree", "dept"].includes(name)) {
            if (value !== "" && !/^[A-Za-z\s,]*$/.test(value)) return;
        }

        // Clear the specific error for this field
        const errorKey = id !== null ? `grad${name}${id}` : `${type}${name}`;
        if (errors[errorKey]) {
            setErrors(prev => ({ ...prev, [errorKey]: "" }));
        }

        // Call the parent update functions
        if (type === 'sslc') onUpdateSSLC(e);
        else if (type === 'hsc') onUpdateHSC(e);
        else onUpdateGrad(id, e);
    };

    const handleBlur = (e, type, id = null) => {
        const { name, value } = e.target;

        if (name === "percentage" && value !== "" && !isNaN(value)) {
            // Convert to float and fix to 2 decimal places
            const formatted = parseFloat(value).toFixed(2);

            // Create a synthetic event to update the parent
            const syntheticEvent = { target: { name, value: formatted } };

            if (type === 'sslc') onUpdateSSLC(syntheticEvent);
            else if (type === 'hsc') onUpdateHSC(syntheticEvent);
            else if (type === 'grad') onUpdateGrad(id, syntheticEvent);
        }
    };

    function isValidInstitution(name) {
        if (!name || typeof name !== 'string') return false;
        const trimmed = name.trim();
        if (trimmed.length < 2) return false;
        if (!/[A-Za-z]/.test(trimmed)) return false;
        // Allow: letters, numbers, spaces, and special characters: . , ' " & - / ( )
        return /^[A-Za-z0-9\s\.\,\’\'\"\&\-\/\(\)]+$/.test(trimmed);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        const today = new Date();

        if (!data.highestQual || data.highestQual === "Select")
            newErrors.highestQual = "*Please select your highest qualification";

        if (!data.sslc.institution?.trim()) {
            newErrors.sslcinstitution = "*Institution Required";
        } else if (!isValidInstitution(data.sslc.institution)) {
            newErrors.sslcinstitution = "*Invalid institution name";
        }
        if (!data.sslc.percentage) newErrors.sslcpercentage = "*Percentage is required";
        else if (!percentageReg.test(data.sslc.percentage))
            newErrors.sslcpercentage = "should not be greater than 100";
        if (!data.sslc.location?.trim()) newErrors.sslclocation = "*Location is required";
        if (!data.sslc.year) newErrors.sslcyear = "*Year of completion is required";
        else if (new Date(data.sslc.year) > today) {
            newErrors.sslcyear = "Year cannot be in the future";
        }


        if (!data.hsc.stream || data.hsc.stream === "Select")
            newErrors.hscstream = "*Please select your stream";
        if (!data.hsc.institution?.trim()) {
            newErrors.hscinstitution = "*Institution Required";
        } else if (!isValidInstitution(data.hsc.institution)) {
            newErrors.hscinstitution = "*Invalid institution name";
        }
        if (!data.hsc.percentage) newErrors.hscpercentage = "*Percentage is required";
        else if (!percentageReg.test(data.hsc.percentage))
            newErrors.hscpercentage = "should not be greater than 100";

        if (!data.hsc.location?.trim()) newErrors.hsclocation = "*Location is required";
        if (!data.hsc.year) newErrors.hscyear = "*Year of completion is required";
        else if (parseInt(data.hsc.year) > currentYear) newErrors.hscyear = "*Cannot be in future";
        else if (data.sslc.year && parseInt(data.hsc.year) <= parseInt(data.sslc.year))
            newErrors.hscyear = "*Must be after SSLC";

        data.graduations.forEach((grad) => {
            if (!grad.degree || grad.degree.trim() === "") {
                newErrors[`graddegree${grad.id}`] = "Degree is required";
            }
            if (!grad.dept || grad.dept.trim() === "") {
                newErrors[`graddept${grad.id}`] = "Department is required";
            }
            if (!grad.status || grad.status === "Select") {
                newErrors[`gradstatus${grad.id}`] = "Please select degree status";
            }
            if (!grad.college?.trim()) {
                newErrors[`gradcollege${grad.id}`] = "Institution name is required";
            } else if (!isValidInstitution(grad.college)) {
                newErrors[`gradcollege${grad.id}`] = "Invalid institution name";
            }
            if (!grad.percentage || grad.percentage.trim() === "") {
                newErrors[`gradpercentage${grad.id}`] = "Percentage is required";
            } else if (!percentageReg.test(grad.percentage)) {
                newErrors[`gradpercentage${grad.id}`] = "Invalid (e.g. 85.50)";
            }
            else if (Number(grad.percentage) > 100) {
                newErrors[`gradpercentage${grad.id}`] = "Percentage cannot exceed 100";
            }
            // Year Logic
            const today = new Date();

            const startDate = grad.startYear ? new Date(grad.startYear) : null;
            const endDate = grad.endYear ? new Date(grad.endYear) : null;

            if (!grad.startYear) {
                newErrors[`gradstartYear${grad.id}`] = "*Starting year is required";
            }
            else if (startDate > today) {
                newErrors[`gradstartYear${grad.id}`] = "*Starting year cannot be in future";
            }

            if (!grad.endYear) {
                newErrors[`gradendYear${grad.id}`] = "*Ending year is required";
            }
            else if (endDate > today) {
                newErrors[`gradendYear${grad.id}`] = "*Ending year cannot be in future";
            }
            else if (startDate && endDate < startDate) {
                newErrors[`gradendYear${grad.id}`] = "*Ending year cannot be before starting year";
            }
            else if (
                startDate &&
                endDate &&
                endDate.getFullYear() - startDate.getFullYear() < 1
            ) {
                newErrors[`gradendYear${grad.id}`] = "*Course duration must be at least 1 year";
            }
            if (!grad.city) {
                newErrors[`gradcity${grad.id}`] = "City is required";
            }
            if (!grad.state) {
                newErrors[`gradstate${grad.id}`] = "State is required";
            }
            if (!grad.country) {
                newErrors[`gradcountry${grad.id}`] = "Country is required";
            }
            if (!grad.dept) {
                newErrors[`graddepartment${grad.id}`] = "department is required";
            }

            else if (grad.startYear) {
                const start = new Date(grad.startYear);
                const end = new Date(grad.endYear);

                if (end < start) {
                    newErrors[`gradendYear${grad.id}`] = "Ending year cannot be before starting year";
                }
                else if (end.getFullYear() - start.getFullYear() < 1) {
                    newErrors[`gradendYear${grad.id}`] = "Course duration must be at least 1 year";
                }
            }
        });

        setErrors(newErrors);

        const hasRequiredFieldError = Object.values(newErrors).some((message) =>
            message.toLowerCase().includes("required") ||
            message.toLowerCase().includes("select")
        );

        if (Object.keys(newErrors).length === 0) {
            onNext();
        } else {
            // Auto-open the first section with an error
            if (
                newErrors.sslcinstitution ||
                newErrors.sslcpercentage ||
                newErrors.sslclocation ||
                newErrors.sslcyear
            ) {
                setOpenSection("sslc");
            } else if (
                newErrors.hscstream ||
                newErrors.hscinstitution ||
                newErrors.hscpercentage ||
                newErrors.hsclocation ||
                newErrors.hscyear
            ) {
                setOpenSection("hsc");
            } else {
                const firstGradErrorKey = Object.keys(newErrors).find((key) =>
                    key.startsWith("grad")
                );

                if (firstGradErrorKey && data.graduations.length > 0) {
                    setOpenSection(`grad-${data.graduations[0].id}`);
                }
            }

            // Alert only for empty/select required fields
            if (hasRequiredFieldError) {
                alert("Please fill all required fields.");
            }
        }
    };

    return (
        <form className="content-card" onSubmit={handleSubmit}>
            <div className="profile-header">
                <h2>Education Details</h2>
                <button type="button" className="reset-link" onClick={() => { onReset(); setErrors({}); }}>
                    Reset
                </button>
            </div>

            <div className="form-group full-width" style={{ marginBottom: "1.5rem" }}>
                <label>Highest Qualification?</label>
                <select
                    name="highestQual"
                    value={data.highestQual}
                    onChange={(e) => { onHighestQualChange(e); setErrors(p => ({ ...p, highestQual: "" })) }}
                    className={errors.highestQual ? "input-error" : ""}

                >
                    <option value="">Select</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Under-Graduation">Under-Graduation</option>
                    <option value="Post-Graduation">Post-Graduation</option>
                    <option value="Doctorate">Doctorate</option>
                </select>
                {errors.highestQual && (
                    <span className="error-msg">{errors.highestQual}</span>
                )}
            </div>

            <div className="accordion-wrapper">
                {/* --- SSLC Form --- */}
                <div className="accordion-item">
                    <div
                        className="accordion-header"
                        onClick={() => toggleSection("sslc")}
                    >
                        <span>SSLC</span>
                        <span className="accordion-icon">
                            {openSection === "sslc" ? "-" : "+"}
                        </span>
                    </div>
                    {openSection === "sslc" && (
                        <div className="accordion-body">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Name of Institution</label>
                                    <input
                                        type="text"
                                        name="institution"
                                        value={data.sslc.institution}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === "" || /^[a-zA-Z0-9\s\.\,\’\'\"\&\-\/\(\)]*$/.test(val)) {
                                                handleInputChange(e, 'sslc');
                                            }
                                        }}
                                        placeholder="e.g., XYZ School"
                                        className={errors.sslcinstitution ? "input-error" : ""}
                                    />
                                    {errors.sslcinstitution && <span className="error-message">{errors.sslcinstitution}</span>}
                                </div>

                                <div className="form-group">
                                    <label>Percentage</label>
                                    <input
                                        type="text"
                                        name="percentage"
                                        value={data.sslc.percentage || ""}
                                        onChange={(e) => handleInputChange(e, 'sslc')}
                                        onBlur={(e) => handleBlur(e, 'sslc')}
                                        placeholder="e.g., 80.00"
                                        className={errors.sslcpercentage ? "input-error" : ""}
                                    />
                                    {errors.sslcpercentage && (
                                        <span className="error-msg">{errors.sslcpercentage}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={data.sslc.location || ""}
                                        placeholder="e.g., Bangalore"
                                        className={errors.sslclocation ? "input-error" : ""}
                                        onChange={(e) => {

                                            if (/^[A-Za-z\s,]*$/.test(e.target.value)) {
                                                handleInputChange(e, 'sslc');

                                            }
                                        }}
                                    />
                                    {errors.sslclocation && (
                                        <span className="error-msg">{errors.sslclocation}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Year of completion</label>
                                    <input
                                        type="date"
                                        name="year"
                                        value={data.sslc.year || ""}
                                        onChange={(e) => handleInputChange(e, 'sslc')}
                                        className={`${errors.sslcyear ? "input-error" : ""} cursor-as-pointer`}
                                    />
                                    {errors.sslcyear && (
                                        <span className="error-msg">{errors.sslcyear}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- HSC Form --- */}
                <div className="accordion-item">
                    <div
                        className="accordion-header"
                        onClick={() => toggleSection("hsc")}
                    >
                        <span>HSC</span>
                        <span className="accordion-icon">
                            {openSection === "hsc" ? "-" : "+"}
                        </span>
                    </div>
                    {openSection === "hsc" && (
                        <div className="accordion-body">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>What did you studied after 10th?</label>
                                    <select
                                        name="stream"
                                        value={data.hsc.stream || ""}
                                        onChange={onUpdateHSC}
                                        className={errors.hscstream ? "input-error" : ""}
                                    >
                                        <option value="">Select</option>
                                        <option value="Intermediate">Intermediate/12</option>
                                        <option value="Diploma">Diploma</option>
                                    </select>
                                    {errors.hscstream && (
                                        <span className="error-msg">{errors.hscstream}</span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Name of Institution</label>
                                    <input
                                        type="text"
                                        name="institution"
                                        value={data.hsc.institution || ""}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === "" || /^[a-zA-Z0-9\s\.\,\’\'\"\&\-\/\(\)]*$/.test(val)) {
                                                handleInputChange(e, 'hsc');
                                            }
                                        }}
                                        placeholder="e.g., XYZ School"
                                        className={errors.hscinstitution ? "input-error" : ""}
                                    />
                                    {errors.hscinstitution && (
                                        <span className="error-msg">{errors.hscinstitution}</span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={data.hsc.location || ""}
                                        placeholder="e.g., Bangalore"
                                        className={errors.hsclocation ? "input-error" : ""}
                                        onChange={(e) => {
                                            if (/^[A-Za-z\s,]*$/.test(e.target.value)) {
                                                onUpdateHSC(e);
                                                if (errors.hsclocation) {
                                                    setErrors((prev) => ({ ...prev, hsclocation: "" }));
                                                }
                                            }
                                        }}
                                    />
                                    {errors.hsclocation && (
                                        <span className="error-msg">{errors.hsclocation}</span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Year of completion</label>
                                    <input
                                        type="date"
                                        name="year"
                                        value={data.hsc.year || ""}
                                        onChange={(e) => handleInputChange(e, 'hsc')}
                                        className={`${errors.hscyear ? "input-error" : ""} cursor-as-pointer`}

                                    />
                                    {errors.hscyear && (
                                        <span className="error-msg">{errors.hscyear}</span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Percentage</label>
                                    <input
                                        type="text"
                                        name="percentage"
                                        value={data.hsc.percentage || ""}
                                        onChange={(e) => handleInputChange(e, 'hsc')}
                                        onBlur={(e) => handleBlur(e, 'hsc')}
                                        placeholder="e.g., 80.00"
                                        className={errors.hscpercentage ? "input-error" : ""}
                                    />
                                    {errors.hscpercentage && (
                                        <span className="error-msg">{errors.hscpercentage}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- Graduation Forms --- */}
                {data.graduations.map((grad, index) => (
                    <div className="accordion-item" key={grad.id}>
                        <div
                            className="accordion-header"
                            onClick={() => toggleSection(`grad-${grad.id}`)}
                        >
                            <div
                                style={{ display: "flex", alignItems: "center", gap: "10px" }}
                            >
                                <span>Graduation {index > 0 ? index + 1 : ""}</span>
                            </div>
                            <span className="accordion-icon">
                                {openSection === `grad-${grad.id}` ? "-" : "+"}
                            </span>
                        </div>

                        {openSection === `grad-${grad.id}` && (
                            <div className="accordion-body">
                                {index > 0 && (
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            marginBottom: "1rem",
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemoveGrad(grad.id);
                                            }}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <img
                                                className="upload-icon-btn"
                                                src={deleteIcon}
                                                alt="delete"
                                            />
                                        </button>
                                    </div>
                                )}

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Degree</label>
                                        <input
                                            type="text"
                                            name="degree"
                                            value={grad.degree}
                                            onChange={(e) => handleInputChange(e, 'grad', grad.id)}
                                            placeholder="e.g., B.E"
                                            className={errors[`graddegree${grad.id}`] ? "input-error" : ""}
                                        />
                                        {errors[`graddegree${grad.id}`] && <span className="error-message">{errors[`graddegree${grad.id}`]}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Degree status</label>
                                        <select
                                            name="status"
                                            value={grad.status}
                                            onChange={(e) => handleInputChange(e, 'grad', grad.id)}
                                            className={errors[`gradstatus${grad.id}`] ? "input-error" : ""}
                                        >
                                            <option value="Select">Select</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Pursuing">Pursuing</option>
                                        </select>
                                        {errors[`gradstatus${grad.id}`] && (
                                            <span className="error-message">{errors[`gradstatus${grad.id}`]}</span>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label>Department</label>
                                        <input
                                            type="text"
                                            name="dept"
                                            value={grad.dept}
                                            onChange={(e) => handleInputChange(e, 'grad', grad.id)}
                                            placeholder="e.g., Computer Science"
                                            className={errors[`graddept${grad.id}`] ? "input-error" : ""}
                                        />
                                        {errors[`graddept${grad.id}`] && (
                                            <span className="error-message">{errors[`graddept${grad.id}`]}</span>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label>Percentage</label>
                                        <input
                                            type="text"
                                            name="percentage"
                                            value={grad.percentage}
                                            onChange={(e) => handleInputChange(e, 'grad', grad.id)}
                                            onBlur={(e) => handleBlur(e, 'grad', grad.id)}
                                            placeholder="e.g., 75.25"
                                            className={errors[`gradpercentage${grad.id}`] ? "input-error" : ""}
                                        />
                                        {errors[`gradpercentage${grad.id}`] && <span className="error-message">{errors[`gradpercentage${grad.id}`]}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Starting year</label>
                                        <input
                                            type="date"
                                            name="startYear"
                                            value={grad.startYear}
                                            onChange={(e) => handleInputChange(e, 'grad', grad.id)}
                                            className={`${errors[`gradstartYear${grad.id}`] ? "input-error" : ""} cursor-as-pointer`}
                                        />
                                        {errors[`gradstartYear${grad.id}`] && <span className="error-message">{errors[`gradstartYear${grad.id}`]}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Ending year</label>
                                        <input
                                            type="date"
                                            name="endYear"
                                            value={grad.endYear}
                                            onChange={(e) => handleInputChange(e, 'grad', grad.id)}
                                            className={`${errors[`gradendYear${grad.id}`] ? "input-error" : ""} cursor-as-pointer`}
                                        />
                                        {errors[`gradendYear${grad.id}`] && <span className="error-message">{errors[`gradendYear${grad.id}`]}</span>}
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Institution name</label>
                                        <input
                                            type="text"
                                            name="college"
                                            value={grad.college}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === "" || /^[a-zA-Z0-9\s\.\,\’\'\"\&\-\/\(\)]*$/.test(val)) {
                                                    handleInputChange(e, 'grad', grad.id);
                                                }
                                            }}
                                            placeholder="e.g., XYZ Institute"
                                            className={errors[`gradcollege${grad.id}`] ? "input-error" : ""}
                                        />
                                        {errors[`gradcollege${grad.id}`] && (
                                            <span className="error-message">{errors[`gradcollege${grad.id}`]}</span>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label>City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={grad.city}
                                            onChange={(e) => handleInputChange(e, 'grad', grad.id)}
                                            placeholder="e.g., Green park"
                                            className={errors[`gradcity${grad.id}`] ? "input-error" : ""}
                                        />
                                        {errors[`gradcity${grad.id}`] && <span className="error-message">{errors[`gradcity${grad.id}`]}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={grad.state}
                                            onChange={(e) => handleInputChange(e, 'grad', grad.id)}
                                            placeholder="e.g., Tamil Nadu"
                                            className={errors[`gradstate${grad.id}`] ? "input-error" : ""}
                                        />
                                        {errors[`gradstate${grad.id}`] && <span className="error-message">{errors[`gradstate${grad.id}`]}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Country</label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={grad.country}
                                            onChange={(e) => handleInputChange(e, 'grad', grad.id)}
                                            placeholder="e.g., India"
                                            className={errors[`gradcountry${grad.id}`] ? "input-error" : ""}
                                        />
                                        {errors[`gradcountry${grad.id}`] && (
                                            <span className="error-message">{errors[`gradcountry${grad.id}`]}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <button type="button" className="add-link" onClick={onAddGrad}>
                + Add Education
            </button>
            <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                    Save & Continue
                </button>
            </div>
        </form>
    );
};

const WorkExperience = ({
    data,
    onChange,
    onUpdateEntry,
    onAddEntry,
    onRemoveEntry,
    onReset,
    onNext,
}) => {
    const [errors, setErrors] = useState({});
    // ✅ Get experienceType from parent via data prop
    // data.status is coming from allData.experience.status which is synced with currentDetails.experienceType
    const isFresher = data.status === "Fresher";
    const AlphaOnlyreg = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

    const handleDateChangeWithValidation = (entryId, fieldName, dateValue, currentEntry) => {
        if (!dateValue) {
            const syntheticEvent = { target: { name: fieldName, value: '' } };
            onUpdateEntry(entryId, syntheticEvent);
            return;
        }
        const [year, month, day] = dateValue.split('-');
        if (year && year.length !== 4) {
            alert("Please enter a valid year with 4 digits (e.g., 2024)");
            return;
        }
        const syntheticEvent = { target: { name: fieldName, value: dateValue } };
        onUpdateEntry(entryId, syntheticEvent);
    };

    const handleEntryChange = (id, e) => {
        const { name, value } = e.target;
        if (name === "location" && value !== "" && !AlphaOnlyreg.test(value)) return;
        if (["title"].includes(name)) {
            if (value !== "" && !/^[A-Za-z\s,]*$/.test(value)) return;
        }
        if (["company"].includes(name)) {
            if (value !== "" && !/^(?=.*[A-Za-z])[A-Za-z0-9\s\.\-\'\,\&\(\)@#\$]*$/.test(value)) return;
        }
        const errorKey = `${name}_${id}`;
        if (errors[errorKey]) {
            setErrors(prev => ({ ...prev, [errorKey]: "" }));
        }
        onUpdateEntry(id, e);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        const today = new Date();

        // Only validate entries if user is Experienced OR a Fresher with Internships
        if (data.status === "Experienced" || data.hasExperience === "Yes") {
            if (data.entries.length === 0) {
                alert("Please add at least one work or internship entry.");
                return;
            }

            data.entries.forEach((entry) => {
                if (!entry.title?.trim()) newErrors[`title_${entry.id}`] = "*Job Title is required";
                if (!entry.company?.trim()) {
                    newErrors[`company_${entry.id}`] = "*Company name is required";
                } else if (!/[A-Za-z]/.test(entry.company)) {
                    newErrors[`company_${entry.id}`] = "*Company name must contain at least one letter";
                }
                if (!entry.location?.trim()) newErrors[`location_${entry.id}`] = "*Location is required";
                if (!entry.industry || entry.industry === "Select") {
                    newErrors[`industry_${entry.id}`] = "*Please select an industry";
                }
                if (!entry.jobType || entry.jobType === "Select") {
                    newErrors[`jobType_${entry.id}`] = "*Please select a job type";
                }
                if (!entry.startDate) {
                    newErrors[`startDate_${entry.id}`] = "*Start date is required";
                } else if (new Date(entry.startDate) > today) {
                    newErrors[`startDate_${entry.id}`] = "*Start date cannot be in the future";
                }
                if (!entry.endDate) {
                    newErrors[`endDate_${entry.id}`] = "*End date is required";
                }
                else if (new Date(entry.endDate) > today) {
                    newErrors[`endDate_${entry.id}`] = "*End date cannot be in the future";
                }
                if (entry.startDate && entry.endDate) {
                    if (new Date(entry.startDate) > new Date(entry.endDate)) {
                        newErrors[`endDate_${entry.id}`] = "*End date must be after start date";
                    }
                }
                if (!entry.responsibilities?.trim()) {
                    newErrors[`responsibilities_${entry.id}`] = "*Responsibilities are required";
                } else if (entry.responsibilities.trim().length < 10) {
                    newErrors[`responsibilities_${entry.id}`] = "*Please provide a more detailed description (min 10 chars)";
                }
            });
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            onNext();
        } else {
            const hasRequiredFieldError = Object.values(newErrors).some((message) =>
                message.toLowerCase().includes("required") ||
                message.toLowerCase().includes("select")
            );

            if (hasRequiredFieldError) {
                alert("Please fill all required fields.");
            }
        }
    };

    // Handle Status Change - Show alert or error message
    const handleStatusChange = (newStatus) => {
        // Check if trying to change to Fresher when data exists
        if (newStatus === "Fresher" && (data.entries.length > 0 || data.hasExperience === "Yes")) {
            alert("Cannot change to Fresher because you have added work experience entries. Please remove all entries first.");
            return;
        }

        // Check if trying to change to Experienced when it's already Experienced
        if (newStatus === "Experienced" && data.status === "Experienced") {
            return;
        }

        // Create synthetic event to update parent
        const syntheticEvent = {
            target: {
                name: "status",
                value: newStatus
            }
        };
        onChange(syntheticEvent);
    };

    const showEntries = data.status === "Experienced" || data.hasExperience === "Yes";

    return (
        <form className="content-card" onSubmit={handleSubmit}>
            <div className="profile-header">
                <h2>Work Experience</h2>
                <button type="button" className="reset-link" onClick={() => { onReset(); setErrors({}); }}>
                    Reset
                </button>
            </div>
            <div className="form-grid">
                <div className="form-group">
                    <label>Current Status (Synced with Basic Details)</label>
                    {/* ✅ Show status but allow change with validation */}
                    <select
                        name="status"
                        value={data.status || "Fresher"}
                        onChange={(e) => handleStatusChange(e.target.value)}
                    >
                        <option value="Fresher">Fresher</option>
                        <option value="Experienced">Experienced</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Do you have any internship or work experience?</label>
                    <select
                        name="hasExperience"
                        value={data.hasExperience || "No"}
                        onChange={onChange}
                        disabled={data.status === "Experienced"}
                    >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                    </select>
                </div>
            </div>

            {showEntries && (
                <>
                    {data.entries.map((entry, index) => (
                        <div key={entry.id} className="experience-entry-block" style={{ marginTop: "2rem", borderTop: "1px solid #eee", paddingTop: "1rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <h4>{data.status === "Experienced" ? "Company" : "Internship"} {index + 1}</h4>
                                <button type="button" onClick={() => onRemoveEntry(entry.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                                    <img className="upload-icon-btn" src={deleteIcon} alt="delete" title="Remove" />
                                </button>
                            </div>
                            <div className="form-grid">
                                {/* ... all entry fields remain same ... */}
                                <div className="form-group">
                                    <label>Job Title</label>
                                    <input
                                        type="text" name="title" value={entry.title}
                                        onChange={(e) => handleEntryChange(entry.id, e)}
                                        className={errors[`title_${entry.id}`] ? "input-error" : ""}
                                        placeholder="e.g. Frontend Intern"
                                    />
                                    {errors[`title_${entry.id}`] && <span className="error-message">{errors[`title_${entry.id}`]}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Company Name</label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={entry.company}
                                        onChange={(e) => handleEntryChange(entry.id, e)}
                                        placeholder="e.g., XYZ Company"
                                        className={errors[`company_${entry.id}`] ? "input-error" : ""}
                                    />
                                    {errors[`company_${entry.id}`] && <span className="error-message">{errors[`company_${entry.id}`]}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={entry.startDate || ""}
                                        onChange={(e) => handleDateChangeWithValidation(entry.id, 'startDate', e.target.value, entry)}
                                        className={`${errors[`startDate_${entry.id}`] ? "input-error" : ""} cursor-as-pointer`} />
                                    {errors[`startDate_${entry.id}`] && <span className="error-message">{errors[`startDate_${entry.id}`]}</span>}
                                </div>
                                <div className="form-group">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={entry.endDate || ""}
                                        onChange={(e) => handleDateChangeWithValidation(entry.id, 'endDate', e.target.value, entry)}
                                        className={`${errors[`endDate_${entry.id}`] ? "input-error" : ""} cursor-as-pointer`} />
                                    {errors[`endDate_${entry.id}`] && (
                                        <span className="error-message">
                                            {errors[`endDate_${entry.id}`]}
                                        </span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Industry / Domain</label>
                                    <select
                                        name="industry"
                                        value={entry.industry}
                                        onChange={(e) => handleEntryChange(entry.id, e)}
                                        className={errors[`industry_${entry.id}`] ? "input-error" : ""}
                                    >
                                        <option value="Select">Select</option>
                                        <option value="IT-Software">IT - Software</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Education">Education</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors[`industry_${entry.id}`] && <span className="error-message">{errors[`industry_${entry.id}`]}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Job Type</label>
                                    <select
                                        name="jobType"
                                        value={entry.jobType}
                                        onChange={(e) => handleEntryChange(entry.id, e)}
                                        className={errors[`jobType_${entry.id}`] ? "input-error" : ""}
                                    >
                                        <option value="Select">Select</option>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Internship">Internship</option>
                                        <option value="Contract">Contract</option>
                                    </select>
                                    {errors[`jobType_${entry.id}`] && <span className="error-message">{errors[`jobType_${entry.id}`]}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={entry.location}
                                        placeholder="e.g., Bangalore"
                                        onChange={(e) => handleEntryChange(entry.id, e)}
                                        className={errors[`location_${entry.id}`] ? "input-error" : ""}
                                    />
                                    {errors[`location_${entry.id}`] && <span className="error-message">{errors[`location_${entry.id}`]}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Key Responsibilities / Achievements</label>
                                    <textarea
                                        name="responsibilities"
                                        value={entry.responsibilities || ""}
                                        onChange={(e) => handleEntryChange(entry.id, e)}
                                        placeholder="Briefly describe your role, projects, or achievements..."
                                        className={errors[`responsibilities_${entry.id}`] ? "input-error" : ""}
                                        rows="3"
                                    />
                                    {errors[`responsibilities_${entry.id}`] && (
                                        <span className="error-message">
                                            {errors[`responsibilities_${entry.id}`]}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <button type="button" className="add-link" onClick={onAddEntry}>
                        + Add {data.status === "Experienced" ? "Company" : "Internship"}
                    </button>
                </>
            )}

            {isFresher && data.hasExperience === "No" && data.entries.length === 0 && (
                <div style={{ padding: "20px", textAlign: "center", color: "#666", backgroundColor: "#f5f5f5", borderRadius: "8px", marginTop: "20px" }}>
                    📌 As a Fresher, work experience details are optional. You can add internship experience if you have any.
                </div>
            )}

            <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                    Save & Continue
                </button>
            </div>
        </form>
    );
};


const KeySkills = ({ skills, onAdd, onUpdate, onDelete, onReset, onNext }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [currentSkill, setCurrentSkill] = useState("");

    const [error, setError] = useState("");

    const skillOptions = ["UI & UX", "UI/UX Design", "UI Design", "UX Design", "User Interface", "User Experience", "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator", "InDesign", "Wireframing", "Prototyping",
        "HTML", "HTML5", "CSS", "CSS3", "JavaScript", "TypeScript", "React", "React Native", "Angular", "Vue.js", "Next.js", "Nuxt.js", "Svelte", "SASS", "LESS", "Tailwind CSS", "Bootstrap", "Material UI", "Redux", "Webpack", "Babel", "DOM Manipulation", "AJAX", "JSON",
        "Node.js", "Express.js", "Python", "Django", "Flask", "FastAPI", "Java", "Spring Boot", "Hibernate", "C", "C++", "C#", ".NET", "ASP.NET", "PHP", "Laravel", "Symfony", "Ruby", "Ruby on Rails", "Go", "Rust", "Swift", "Kotlin", "Scala", "Elixir", "Erlang",
        "SQL", "MySQL", "PostgreSQL", "SQLite", "MongoDB", "Mongoose", "Redis", "Cassandra", "DynamoDB", "Firebase", "Oracle", "Microsoft SQL Server", "GraphQL", "REST API", "Prisma",
        "AWS", "Azure", "Google Cloud Platform (GCP)", "Docker", "Kubernetes", "Linux", "Unix", "Ubuntu", "CentOS", "Jenkins", "Travis CI", "CircleCI", "GitLab CI/CD", "Terraform", "Ansible", "Puppet", "Chef", "Bash", "Shell Scripting", "Nginx", "Apache",
        "Data Analysis", "Data Science", "Machine Learning", "Artificial Intelligence", "Deep Learning", "NLP", "Computer Vision", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Scikit-Learn", "TensorFlow", "Keras", "PyTorch", "Tableau", "Power BI", "Excel", "R", "Hadoop", "Spark", "Kafka",
        "Android SDK", "iOS Development", "Flutter", "Dart", "Objective-C", "Xamarin", "Ionic",
        "Agile", "Scrum", "Kanban", "Jira", "Trello", "Asana", "Git", "GitHub", "GitLab", "Bitbucket", "Postman", "Swagger",
        "Cybersecurity", "Penetration Testing", "Ethical Hacking", "Cryptography", "Blockchain", "Web3", "Smart Contracts", "Solidity", "QA Testing", "Selenium", "Jest", "Mocha", "Chai", "Cypress", "Puppeteer", "Project Management", "Product Management", "Digital Marketing", "SEO", "SEM", "Content Writing", "Copywriting", "Sales", "Business Development", "Customer Success", "Technical Support"];

    const openAdd = () => {
        setEditIndex(null);
        setCurrentSkill("");
        setIsModalOpen(true);
    };
    const openEdit = (index) => {
        setEditIndex(index);
        setCurrentSkill(skills[index]);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        const value = currentSkill.trim();
        if (!value) {
            setError("Key Skills field is Mandatory");
            return;
        }
        const isDuplicate = skills.some((skill, index) =>
            skill.toLowerCase() === currentSkill.toLowerCase() && index !== editIndex
        );

        if (isDuplicate) {
            alert("This skill is already in your list.");
            return;
        }


        if (!isValidValue(value)) {
            setError("Enter a valid skill (avoid special character misuse)");
            return;
        }

        if (editIndex !== null) onUpdate(editIndex, value);
        else onAdd(value);

        setError("");
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (editIndex !== null) {
            onDelete(editIndex);
            setIsModalOpen(false);
        }
    };

    const handleContinue = (e) => {
        e.preventDefault();
        if (skills.length === 0) {
            setError("*At least one skill is required to proceed.");
        } else {
            setError("");
            onNext();
        }
    };

    // const handleReset = () => {
    //     if (onReset) {
    //         onReset("skills");
    //     }
    // };

    return (
        <form className="content-card" onSubmit={handleContinue}>
            <div className="profile-header">
                <h2>Key skills</h2>
                <button type="button" className="reset-link" onClick={() => { onReset("skills"); setError(""); }}>
                    Reset
                </button>
            </div>
            {error && (
                <div style={{ color: "red", fontSize: "0.9rem", marginBottom: "1rem", fontWeight: "500" }}>
                    {error}
                </div>
            )}
            <div className="skills-list">
                {skills.map((skill, index) => (
                    <EditableListItem
                        key={index}
                        title={skill}
                        onEdit={() => openEdit(index)}
                    />
                ))}
            </div>
            <button type="button" className="add-link" onClick={openAdd}>
                + Add another skill
            </button>
            <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                    Save & Continue
                </button>
            </div>
            <PopupModal
                title={editIndex !== null ? "Edit Skill" : "Add Skill"}
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setError(""); }}
                onSave={handleSave}
                onDelete={handleDelete}
                mode={editIndex !== null ? "edit" : "add"}
            >
                {error && (
                    <div style={{ color: "red", fontSize: "0.85rem", marginBottom: "1rem", fontWeight: "500" }}>
                        {error}
                    </div>
                )}
                <div className="form-group">
                    <label>Skill *</label>
                    <FilterableDropdown
                        options={skillOptions.filter(opt => !skills.includes(opt))}
                        selectedValue={currentSkill}
                        onSelect={setCurrentSkill}
                        placeholder="Select or Search Skill"
                    />
                </div>
            </PopupModal>
        </form>
    );
};

const LanguagesKnown = ({
    languages,
    onAdd,
    onUpdate,
    onDelete,
    onReset,
    onNext,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [currentLang, setCurrentLang] = useState({
        name: "",
        proficiency: "Select",
    });
    const [error, setError] = useState("");

    const languageOptions = [
        "Afrikaans", "Albanian", "Amharic", "Arabic", "Armenian", "Assamese",
        "Azerbaijani", "Basque", "Belarusian", "Bengali", "Bosnian", "Bulgarian",
        "Burmese", "Catalan", "Cebuano", "Chichewa", "Chinese (Simplified)",
        "Chinese (Traditional)", "Corsican", "Croatian", "Czech", "Danish",
        "Dutch", "English", "Esperanto", "Estonian", "Filipino", "Finnish",
        "French", "Frisian", "Galician", "Georgian", "German", "Greek",
        "Gujarati", "Haitian Creole", "Hausa", "Hawaiian", "Hebrew", "Hindi",
        "Hmong", "Hungarian", "Icelandic", "Igbo", "Indonesian", "Irish",
        "Italian", "Japanese", "Javanese", "Kannada", "Kazakh", "Khmer",
        "Kinyarwanda", "Korean", "Kurdish", "Kyrgyz", "Lao", "Latin", "Latvian",
        "Lithuanian", "Luxembourgish", "Macedonian", "Malagasy", "Malay",
        "Malayalam", "Maltese", "Maori", "Marathi", "Mongolian", "Nepali",
        "Norwegian", "Odia", "Pashto", "Persian", "Polish", "Portuguese",
        "Punjabi", "Romanian", "Russian", "Samoan", "Sanskrit", "Serbian",
        "Sesotho", "Shona", "Sindhi", "Sinhala", "Slovak", "Slovenian",
        "Somali", "Spanish", "Sundanese", "Swahili", "Swedish", "Tajik",
        "Tamil", "Tatar", "Telugu", "Thai", "Turkish", "Turkmen", "Ukrainian",
        "Urdu", "Uyghur", "Uzbek", "Vietnamese", "Welsh", "Xhosa", "Yiddish",
        "Yoruba", "Zulu"
    ];

    const openAdd = () => {
        setEditIndex(null);
        setCurrentLang({ name: "", proficiency: "Select" });
        setIsModalOpen(true);
    };
    const openEdit = (index) => {
        setEditIndex(index);
        setCurrentLang(languages[index]);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        const isDuplicate = languages.some((lang, index) =>
            lang.name.toLowerCase() === currentLang.name.toLowerCase() && index !== editIndex
        );

        if (isDuplicate) {
            alert("This language is already in your list.");
            return;
        }
        const value = currentLang.name?.trim();

        if (!value) {
            setError("Language cannot be empty");
            return;
        }

        if (!currentLang.proficiency || currentLang.proficiency === "Select") {
            setError("Please select your language proficiency level");
            return;
        }

        if (!/^[A-Za-z\s]+$/.test(value)) {
            setError("Only alphabets allowed");
            return;
        }

        if (value.length < 2) {
            setError("Minimum 2 characters required");
            return;
        }

        if (/^(.)\1+$/.test(value)) {
            setError("Invalid language");
            return;
        }

        const formatted = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

        if (editIndex !== null) {
            onUpdate(editIndex, { ...currentLang, name: formatted });
        } else {
            onAdd({ ...currentLang, name: formatted });
        }

        setError("");
        setIsModalOpen(false);
        console.log("Formatted:", formatted);
    };

    const handleDelete = () => {
        if (editIndex !== null) {
            onDelete(editIndex);
            setIsModalOpen(false);
        }
    };

    const handleContinue = (e) => {
        e.preventDefault();
        if (languages.length === 0) {
            setError("*At least one language is required to continue.");
        } else {
            setError("");
            onNext();
        }
    };

    return (
        <form className="content-card" onSubmit={handleContinue}>
            <div className="profile-header">
                <h2>Languages Known</h2>
                <button type="button" className="reset-link" onClick={() => { onReset(); setError(""); }}>
                    Reset
                </button>
            </div>
            {error && (
                <div style={{ color: "red", fontSize: "0.9rem", marginBottom: "1rem", fontWeight: "500" }}>
                    {error}
                </div>
            )}
            <div className="skills-list" >
                {languages.map((lang, index) => (
                    <EditableListItem
                        key={index}
                        title={lang.name.charAt(0).toUpperCase() + lang.name.slice(1).toLowerCase()}
                        onEdit={() => openEdit(index)}
                    />
                ))}
            </div>
            <button type="button" className="add-link" onClick={openAdd}>
                + Add another
            </button>
            <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                    Save & Continue
                </button>
            </div>
            <PopupModal
                title={editIndex !== null ? "Edit Language" : "Add Language"}
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setError(""); }}
                onSave={handleSave}
                onDelete={handleDelete}
                mode={editIndex !== null ? "edit" : "add"}
            >
                {error && (
                    <div style={{ color: "red", fontSize: "0.85rem", marginBottom: "1rem", fontWeight: "500" }}>
                        {error}
                    </div>
                )}

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label>Language Name *</label>
                    <FilterableDropdown
                        options={languageOptions.filter(opt => !languages.some(l => l.name === opt))}
                        selectedValue={currentLang.name}
                        onSelect={(val) => setCurrentLang({ ...currentLang, name: val })}
                        placeholder="Select Language"
                    />
                </div>
                <div className="form-group">
                    <label>Proficiency</label>
                    <select value={currentLang.proficiency} onChange={(e) => setCurrentLang({ ...currentLang, proficiency: e.target.value })}>
                        <option value="Select">Select</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Native">Native</option>
                    </select>

                </div>
            </PopupModal>
        </form>
    );
};

const Certifications = ({
    certs,
    onAdd,
    onUpdate,
    onDelete,
    onReset,
    onNext,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [currentCert, setCurrentCert] = useState({
        id: null,  // Add id field
        name: "",
        file: null,
        existingFile: null
    });

    const [errors, setErrors] = useState({});
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewType, setPreviewType] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validation: Check if file size is > 500KB
            if (file.size > 512000) {
                setErrors({ ...errors, file: "*Certificate file size must be below 500KB" });
                return;
            }
            setErrors({ ...errors, file: '' });

            setCurrentCert({ ...currentCert, file });
        }

        const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
        if (!allowedTypes.includes(file.type)) {
            alert("Only PDF, PNG, JPG allowed");
            e.target.value = "";
            return;
        }

        setCurrentCert({ ...currentCert, file: file, existingFile: null });
    };

    const openAdd = () => {
        setEditIndex(null);
        setCurrentCert({ id: null, name: "", file: null, existingFile: null });
        setIsModalOpen(true);
    };

    const openEdit = (index) => {
        const certToEdit = certs[index];
        setEditIndex(index);
        setErrors({});
        setCurrentCert({
            id: certToEdit.id || null,  // Make sure this is set
            name: certToEdit.name,
            file: null,
            existingFile: certToEdit.existingFile || certToEdit.file || null
        });
        const filePath = certToEdit.file || certToEdit.existingFile;
        if (filePath && typeof filePath === 'string' && /\.(jpg|jpeg|png|webp)$/i.test(filePath)) {
            setPreviewType("image");
            setPreviewUrl(filePath);
        }

        setIsModalOpen(true);
    };

    const handlePreview = () => {
        // 1. Identify which file data to use
        const fileToPreview = currentCert.file || currentCert.existingFile;
        if (!fileToPreview) return;

        // 2. Handle newly uploaded File objects
        if (fileToPreview instanceof File) {
            const url = URL.createObjectURL(fileToPreview);
            if (fileToPreview.type === "application/pdf") {
                window.open(url, "_blank");
            } else {
                setPreviewUrl(url);
                setPreviewType("image");
            }
        }
        // 3. Handle existing file URLs (Strings)
        else if (typeof fileToPreview === 'string') {
            // If it's a PDF URL
            if (fileToPreview.toLowerCase().endsWith('.pdf')) {
                window.open(fileToPreview, "_blank");
            }
            // If it's an image URL
            else {
                setPreviewUrl(fileToPreview);
                setPreviewType("image");
            }
        }
    };

    const handleSave = () => {
        if (currentCert.name.trim()) {
            const certData = {
                name: currentCert.name,
                file: currentCert.file,
                existingFile: currentCert.existingFile
            };

            // IMPORTANT: Preserve ID when editing
            if (currentCert.id) {
                certData.id = currentCert.id;
                console.log(`Saving certification with ID: ${currentCert.id}`);
            }

            if (editIndex !== null) {
                onUpdate(editIndex, certData);
            } else {
                onAdd(certData);
            }
            setIsModalOpen(false);
        } else {
            alert("Certification name is required");
        }
    };

    const handleDelete = () => {
        if (editIndex !== null) {
            onDelete(editIndex);
            setIsModalOpen(false);
        }
    };

    return (
        <form
            className="content-card"
            onSubmit={(e) => {
                e.preventDefault();
                onNext();
            }}
        >
            <div className="profile-header">
                <h2>Certifications</h2>
                <button type="button" className="reset-link" onClick={onReset}>
                    Reset
                </button>
            </div>
            <div className="skills-list">
                {certs.map((cert, index) => (
                    <div key={index} className="skill-item">
                        <span>{cert.name}</span>
                        <button
                            type="button"
                            onClick={() => openEdit(index)}
                            className="edit-skill-btn"
                        >
                            <img className="edit-icon-btn" title="Edit" src={editIcon} alt="edit" />
                        </button>
                    </div>
                ))}
            </div>
            <button type="button" className="add-link" onClick={openAdd}>
                + Add another certification
            </button>
            <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                    Save & Continue
                </button>
            </div>

            <PopupModal
                title={editIndex !== null ? "Edit Certification" : "Add Certification"}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                onDelete={handleDelete}
                mode={editIndex !== null ? "edit" : "add"}
            >
                <div className="form-group" style={{ marginBottom: "1rem" }}>
                    <label>Certification Name *</label>
                    <input
                        type="text"
                        value={currentCert.name}
                        onChange={(e) =>
                            setCurrentCert({ ...currentCert, name: e.target.value })
                        }
                        placeholder="e.g., Full-stack development"
                    />
                </div>

                <div className="form-group">
                    <label>Upload Certificate (PDF, PNG, JPEG)</label>
                    <input
                        type="file"
                        id="certUpload"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                    />


                    {errors.file && <span className="error-message" style={{ display: 'block', marginTop: '5px' }}>{errors.file}</span>}

                    {(currentCert.file || currentCert.existingFile) && (
                        <div className="uploaded-file-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                            <span className="uploaded-file-name" onClick={handlePreview} style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}>
                                {currentCert.file
                                    ? currentCert.file.name
                                    : (typeof currentCert.existingFile === 'string' ? currentCert.existingFile.split('/').pop() : "View Saved Certificate")
                                }
                            </span>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentCert({ ...currentCert, file: null, existingFile: null });
                                    const fileInput = document.getElementById("certUpload");
                                    if (fileInput) fileInput.value = "";
                                }}
                                style={{ border: 'none', background: 'none', fontSize: '1.5rem', lineHeight: '1', cursor: 'pointer', color: '#888' }}
                                title="Remove file"
                            >
                                &times;
                            </button>
                        </div>
                    )}
                </div>

                {previewType === "image" && (
                    <div className="preview-overlay" onClick={() => setPreviewType(null)}>
                        <div className="preview-box" onClick={(e) => e.stopPropagation()}>
                            <img src={previewUrl || currentCert.existingFile} alt="Preview" />
                        </div>
                    </div>
                )}
            </PopupModal>
        </form>
    );
};

// --- FINAL SUBMIT BUTTON SECTION ---
const Preferences = ({ data, experienceType, onChange, onReset, onSubmitFinal, saving }) => {
    const onlyNums = /^[0-9]*$/;
    const AlphaOnlyreg = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
    const [errors, setErrors] = useState({});

    const isFresher = String(experienceType || "").toLowerCase() === "fresher";

    const handleLocalChange = (e) => {
        const { name, value } = e.target;

        if (name === "currentCTC" || name === "expectedCTC") {
            if (!onlyNums.test(value)) return;
            if (value.length > 9) return;
        }

        if (name === "role") {
            if (value !== "" && !/^[A-Za-z\s]*$/.test(value)) return;
        }

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }

        onChange(e);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};

        const currentVal = parseInt(data.currentCTC || 0);
        const expectedVal = parseInt(data.expectedCTC || 0);

        if (!isFresher) {
            if (!data.currentCTC) {
                newErrors.currentCTC = "Current CTC Required";
            } else if (!onlyNums.test(data.currentCTC)) {
                newErrors.currentCTC = "Salary in numbers only";
            } else if (currentVal < 50000) {
                newErrors.currentCTC = "Minimum Current CTC allowed is 50,000";
            }

            if (!data.jobType || data.jobType === "Select") {
                newErrors.jobType = "Please select a job type";
            }

            if (!data.role) {
                newErrors.role = "Role Required";
            } else if (!AlphaOnlyreg.test(data.role)) {
                newErrors.role = "Only letters allowed";
            }
        }

        if (!data.expectedCTC) {
            newErrors.expectedCTC = "Expected CTC Required";
        } else if (!onlyNums.test(data.expectedCTC)) {
            newErrors.expectedCTC = "Salary in numbers only";
        } else if (expectedVal < 100000) {
            newErrors.expectedCTC = "*Minimum Expected CTC allowed is 1,00,000";
        } else if (!isFresher && expectedVal <= currentVal) {
            newErrors.expectedCTC = "*Expected CTC should be greater than Current CTC";
        }

        if (!data.ready) {
            newErrors.ready = "Please select your availability";
        }

        if (!data.relocate) {
            newErrors.relocate = "Please select relocation preference";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            onSubmitFinal();
        } else {
            alert("Please fill all required fields.");
        }
    };

    const formatCurrency = (val) => {
        if (!val) return "";
        return new Intl.NumberFormat("en-IN").format(val);
    };

    return (
        <form className="content-card" onSubmit={handleSubmit}>
            <div className="profile-header">
                <h2>Preferences / Career Details</h2>
                <button
                    type="button"
                    className="reset-link"
                    onClick={() => {
                        onReset("preferences");
                        setErrors({});
                    }}
                >
                    Reset
                </button>
            </div>

            <div className="form-grid">
                {!isFresher && (
                    <div className="form-group">
                        <label>Current CTC</label>
                        <input
                            type="text"
                            name="currentCTC"
                            value={data.currentCTC || ""}
                            onChange={handleLocalChange}
                            placeholder="Enter your Current CTC Min 50,000"
                            className={errors.currentCTC ? "input-error" : ""}
                        />
                        <small className="help-text">₹ {formatCurrency(data.currentCTC)}</small>
                        {errors.currentCTC && (
                            <span className="error-msg">{errors.currentCTC}</span>
                        )}
                    </div>
                )}

                <div className="form-group">
                    <label>Expected CTC</label>
                    <input
                        type="text"
                        name="expectedCTC"
                        value={data.expectedCTC || ""}
                        onChange={handleLocalChange}
                        placeholder="Enter your Expected CTC Min 1,00,000"
                        className={errors.expectedCTC ? "input-error" : ""}
                    />
                    <small className="help-text">₹ {formatCurrency(data.expectedCTC)}</small>
                    {errors.expectedCTC && (
                        <span className="error-msg">{errors.expectedCTC}</span>
                    )}
                </div>

                <div className="form-group">
                    <label>Preferred Job Type</label>
                    <select
                        name="jobType"
                        value={data.jobType || "Select"}
                        onChange={handleLocalChange}
                        className={errors.jobType ? "input-error" : ""}
                    >
                        <option value="Select">Select</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Internship">Internship</option>
                        <option value="Contract">Contract</option>
                    </select>
                    {errors.jobType && (
                        <span className="error-msg">{errors.jobType}</span>
                    )}
                </div>

                <div className="form-group">
                    <label>Preferred Industry/Role</label>
                    <input
                        type="text"
                        name="role"
                        value={data.role || ""}
                        onChange={handleLocalChange}
                        placeholder="Enter preferred industry/role"
                        className={errors.role ? "input-error" : ""}
                    />
                    {errors.role && (
                        <span className="error-msg">{errors.role}</span>
                    )}
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2rem",
                    marginTop: "2rem",
                }}
            >
                <div style={{ display: "flex", gap: "12rem" }}>
                    <div>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "0.8rem",
                                fontWeight: "500",
                                fontSize: "0.9rem",
                            }}
                        >
                            Ready to work
                        </label>
                        <small>
                            Inform employers that you’re available to begin immediately.
                        </small>
                        {errors.ready && (
                            <span className="error-msg">{errors.ready}</span>
                        )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                        <label style={{ display: "flex", gap: "5px", cursor: "pointer" }}>
                            <input
                                type="radio"
                                name="ready"
                                value="Yes"
                                checked={data.ready === "Yes"}
                                onChange={onChange}
                            />
                            Yes
                        </label>

                        <label style={{ display: "flex", gap: "5px", cursor: "pointer" }}>
                            <input
                                type="radio"
                                name="ready"
                                value="No"
                                checked={data.ready === "No"}
                                onChange={onChange}
                            />
                            No
                        </label>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "12rem" }}>
                    <div>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "0.8rem",
                                fontWeight: "500",
                                fontSize: "0.9rem",
                            }}
                        >
                            Willing to Relocate
                        </label>
                        <small>
                            Let employers know if you are open to moving for job opportunities.
                        </small>
                        {errors.relocate && (
                            <span className="error-msg">{errors.relocate}</span>
                        )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                        <label style={{ display: "flex", gap: "5px", cursor: "pointer" }}>
                            <input
                                type="radio"
                                name="relocate"
                                value="Yes"
                                checked={data.relocate === "Yes"}
                                onChange={onChange}
                            />
                            Yes
                        </label>

                        <label style={{ display: "flex", gap: "5px", cursor: "pointer" }}>
                            <input
                                type="radio"
                                name="relocate"
                                value="No"
                                checked={data.relocate === "No"}
                                onChange={onChange}
                            />
                            No
                        </label>
                    </div>
                </div>
            </div>

            <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                </button>
            </div>
        </form>
    );
};

// --- MAIN COMPONENT ---

export const MyProfile = () => {
    const [openDropdown, setOpenDropdown] = useState("Basic Details");
    const [activeItem, setActiveItem] = useState("Profile");
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [removePhotoFlag, setRemovePhotoFlag] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const fetchProfile = async () => {
        try {
            const token = sessionStorage.getItem("access");
            if (!token) {
                window.location.href = "/login";
                return;
            }
            const res = await api.get("profile/jobseeker/");
            console.log("Received Profile Data:", res.data); // Debug log

            setAllData((prev) => ({
                ...prev,

                profile: {
                    fullName: res.data.full_name || "",
                    gender: res.data.gender || "Select",
                    dob: res.data.dob || "",
                    maritalStatus: res.data.marital_status || "Select",
                    nationality: res.data.nationality || "",
                    profile_photo: res.data.profile_photo,
                },

                currentDetails: {
                    jobTitle: res.data.current_job_title || "",
                    company: res.data.current_company || "",
                    experience: res.data.total_experience_years || "",
                    noticePeriod: res.data.notice_period || "",
                    currentLocation: res.data.current_location || "",
                    prefLocation: res.data.preferred_locations || "",
                    experienceType: res.data.employment_status || "",
                },

                contact: {
                    mobile: res.data.phone || "",
                    email: res.data.email || "",
                    altMobile: res.data.alternate_phone || "",
                    altEmail: res.data.alternate_email || "",
                    address: res.data.full_address || "",
                    street: res.data.street || "",
                    city: res.data.city || "",
                    state: res.data.state || "",
                    pincode: res.data.pincode || "",
                    country: res.data.country || "",
                },

                resume: {
                    resume_file: res.data.resume_file,
                    portfolio_link: res.data.portfolio_link || "",
                },

                education: {
                    highestQual: (() => {
                        const hasGraduation = res.data.educations?.some(
                            (e) => e.qualification_level === "Graduation"
                        );
                        const hasPostGraduation = res.data.educations?.some(
                            (e) => e.qualification_level === "Post-Graduation"
                        );
                        const hasDoctorate = res.data.educations?.some(
                            (e) => e.qualification_level === "Doctorate"
                        );

                        if (res.data.highest_qualification === "Diploma") return "Diploma";

                        if (hasDoctorate) return "Doctorate";
                        if (hasPostGraduation) return "Post-Graduation";
                        if (hasGraduation) return "Under-Graduation";

                        const hscEntry = res.data.educations?.find(e => e.qualification_level === "HSC");
                        if (hscEntry && (hscEntry.post_10th_study === "Diploma" || hscEntry.post_10th_study === "Intermediate")) {

                            return "Diploma";
                        }

                        return "Select";
                    })(),

                    sslc: res.data.educations?.find(
                        (e) => e.qualification_level === "SSLC",
                    )
                        ? {
                            id: res.data.educations.find(
                                (e) => e.qualification_level === "SSLC",
                            ).id,
                            institution: res.data.educations.find(
                                (e) => e.qualification_level === "SSLC",
                            ).institution,
                            percentage: res.data.educations.find(
                                (e) => e.qualification_level === "SSLC",
                            ).percentage_or_cgpa,
                            location: res.data.educations.find(
                                (e) => e.qualification_level === "SSLC",
                            ).location,
                            year: res.data.educations.find(
                                (e) => e.qualification_level === "SSLC",
                            ).completion_year,
                        }
                        : { institution: "", percentage: "", location: "", year: "" },

                    hsc: res.data.educations?.find((e) => e.qualification_level === "HSC")
                        ? {
                            id: res.data.educations.find(
                                (e) => e.qualification_level === "HSC",
                            ).id,
                            stream: res.data.educations.find(
                                (e) => e.qualification_level === "HSC",
                            ).post_10th_study,
                            institution: res.data.educations.find(
                                (e) => e.qualification_level === "HSC",
                            ).institution,
                            location: res.data.educations.find(
                                (e) => e.qualification_level === "HSC",
                            ).location,
                            year: res.data.educations.find(
                                (e) => e.qualification_level === "HSC",
                            ).completion_year,
                            percentage: res.data.educations.find(
                                (e) => e.qualification_level === "HSC",
                            ).percentage_or_cgpa,
                        }
                        : {
                            stream: "Select",
                            institution: "",
                            location: "",
                            year: "",
                            percentage: "",
                        },

                    graduations:
                        res.data.educations
                            ?.filter((e) => e.qualification_level === "Graduation" ||
                                e.qualification_level === "Post-Graduation" ||
                                e.qualification_level === "Doctorate")
                            .map((e) => ({
                                id: e.id,
                                degree: e.degree,
                                status: e.status,
                                dept: e.department,
                                percentage: e.percentage_or_cgpa,
                                startYear: e.start_year,
                                endYear: e.end_year,
                                college: e.institution,
                                city: e.city,
                                state: e.state,
                                country: e.country,
                            })) || [],
                },

                experience: {
                    status: res.data.experiences?.length ? "Experienced" : "Fresher",
                    hasExperience: res.data.experiences?.length ? "Yes" : "No",
                    entries:
                        res.data.experiences?.map((e) => ({
                            id: e.id,
                            title: e.job_title,
                            company: e.company_name,
                            startDate: e.start_date,
                            endDate: e.end_date,
                            industry: e.industry_domain,
                            jobType: e.job_type,
                            location: e.location,
                            responsibilities: e.key_responsibilities,
                        })) || [],
                },

                skills: res.data.skills?.map((s) => s.name) || [],

                languages:
                    res.data.languages?.map((l) => ({
                        name: l.name,
                        proficiency: l.proficiency,
                    })) || [],

                certs: (res.data.certifications || []).map((cert) => ({
                    id: cert.id,
                    name: cert.name,
                    file: null,
                    existingFile: cert.certificate_file || cert.certificate_url,
                    // url: cert.certificate_url || cert.certificate_file,
                })),

                preferences: {
                    currentCTC: res.data.current_ctc
                        ? res.data.current_ctc.toString().slice(0, -2).replace(/\D/g, "")
                        : "",
                    expectedCTC: res.data.expected_ctc
                        ? res.data.expected_ctc.toString().slice(0, -2).replace(/\D/g, "")
                        : "",
                    jobType: res.data.preferred_job_type || "Select",
                    role: res.data.preferred_role_industry || "",
                    ready: res.data.ready_to_start_immediately ? "Yes" : "No",
                    relocate: res.data.willing_to_relocate ? "Yes" : "No",
                },
            }));
        } catch (err) {
            console.error("Failed to load profile", err);
            if (err.response?.status === 401) {
                alert("your session time expired, please login again");
                sessionStorage.clear();
                window.location.href = "/Job-portal/jobseeker/login";
            }
        }
    };

    // ORDER of Steps for Navigation
    const steps = [
        "Profile",
        "Current Details",
        "Contact Details",
        "Resume",
        "Education Details",
        "Work Experience",
        "Key Skills",
        "Languages Known",
        "Certifications",
        "Preferences / Career Details",
    ];

    const [allData, setAllData] = useState({
        profile: {
            fullName: "",
            gender: "",
            dob: "",
            maritalStatus: "",
            nationality: "",
        },

        currentDetails: {
            jobTitle: "",
            company: "",
            experience: "",
            noticePeriod: "",
            currentLocation: "",
            prefLocation: "",
            experienceType: "",
        },

        contact: {
            mobile: "",
            altMobile: "",
            email: "",
            altEmail: "",
            address: "",
            street: "",
            city: "",
            state: "",
            pincode: "",
            country: "",
        },

        resume: {
            resume_file: null,
            fileName: "",
            isUploaded: false,
            portfolio_link: "",
        },

        education: {
            highestQual: "Select",
            sslc: { institution: "", percentage: "", location: "", year: "" },
            hsc: {
                stream: "Select",
                institution: "",
                location: "",
                year: "",
                percentage: "",
            },
            graduations: [],
        },

        experience: {
            status: "Fresher",
            hasExperience: "No",
            entries: [],
        },

        skills: [],
        languages: [],
        certs: [],

        preferences: {
            currentCTC: "",
            expectedCTC: "",
            jobType: "Select",
            role: "",
            ready: "",
            relocate: "",
        },
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        const experienceType = allData.currentDetails.experienceType;

        // Only sync if there's a change and no entries exist (to prevent data loss)
        if (experienceType === "fresher" && allData.experience.status !== "Fresher") {
            // Check if there are existing entries
            if (allData.experience.entries.length > 0) {
                console.warn("Cannot change to Fresher - entries exist");
                return;
            }
            setAllData(prev => ({
                ...prev,
                experience: {
                    ...prev.experience,
                    status: "Fresher",
                    hasExperience: "No"
                }
            }));
        } else if (experienceType === "experienced" && allData.experience.status !== "Experienced") {
            setAllData(prev => ({
                ...prev,
                experience: {
                    ...prev.experience,
                    status: "Experienced",
                    hasExperience: "Yes"
                }
            }));
        }
    }, [allData.currentDetails.experienceType, allData.experience.entries.length]);

    const handleHighestQualChange = (e) => {
        const { value } = e.target;
        setAllData((prev) => ({
            ...prev,
            education: {
                ...prev.education,
                highestQual: value,
            },
        }));
    };

    const handleUpdateSSLC = (e) => {
        const { name, value } = e.target;
        if (name === "location" && !/^[A-Za-z\s,]*$/.test(value)) return;

        setAllData((prev) => ({
            ...prev,
            education: {
                ...prev.education,
                sslc: { ...prev.education.sslc, [name]: value },

            },
        }));
    };

    const handleUpdateHSC = (e) => {
        const { name, value } = e.target;
        setAllData((prev) => ({
            ...prev,
            education: {
                ...prev.education,
                hsc: { ...prev.education.hsc, [name]: value },
            },
        }));
    };

    const handleUpdateGrad = (id, e) => {
        const { name, value } = e.target;
        setAllData((prev) => ({
            ...prev,
            education: {
                ...prev.education,
                graduations: prev.education.graduations.map((g) =>
                    g.id === id ? { ...g, [name]: value } : g,
                ),
            },
        }));
    };

    const handleAddGrad = () => {
        setAllData((prev) => ({
            ...prev,
            education: {
                ...prev.education,
                graduations: [
                    ...prev.education.graduations,
                    {
                        id: `temp-${Date.now()}`,
                        degree: "",
                        status: "Select",
                        dept: "",
                        percentage: "",
                        startYear: "",
                        endYear: "",
                        college: "",
                        city: "",
                        state: "",
                        country: "",
                    },
                ],
            },
        }));
    };

    const handleRemoveGrad = (id) => {
        setAllData((prev) => ({
            ...prev,
            education: {
                ...prev.education,
                graduations: prev.education.graduations.filter((g) => g.id !== id),
            },
        }));
    };
    const handleExpUpdateEntry = (id, e) => {
        const { name, value } = e.target;
        setAllData((prev) => ({
            ...prev,
            experience: {
                ...prev.experience,
                entries: prev.experience.entries.map((entry) =>
                    entry.id === id ? { ...entry, [name]: value } : entry,
                ),
            },
        }));
    };

    const handleAddExpEntry = () => {
        setAllData((prev) => ({
            ...prev,
            experience: {
                ...prev.experience,
                entries: [
                    ...prev.experience.entries,
                    {
                        id: `temp-${Date.now()}`,
                        title: "",
                        company: "",
                        startDate: "",
                        endDate: "",
                        industry: "Select",
                        jobType: "Select",
                        location: "",
                        responsibilities: "",
                    },
                ],
            },
        }));
    };

    const handleRemoveExpEntry = (id) => {
        setAllData((prev) => ({
            ...prev,
            experience: {
                ...prev.experience,
                entries: prev.experience.entries.filter((e) => e.id !== id),
            },
        }));
    };
    const normalize = (val) =>
        val?.trim().toLowerCase();

    const format = (val) =>
        val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();

    const isValid = (val) => {
        if (!val) return false;
        if (!/^[A-Za-z\s]{2,}$/.test(val)) return false;
        if (/^(.)\1+$/.test(val)) return false;
        return true;
    };

    const cleanArray = (arr, isObject = false) => {
        const map = new Map();

        arr.forEach((item) => {
            let value = isObject ? item.name : item;

            if (!value) return;

            value = value.trim();

            // ❌ skip invalid
            if (!isValid(value)) return;

            const key = normalize(value);

            // ✅ remove duplicates
            if (!map.has(key)) {
                map.set(key, isObject ? { ...item, name: format(value) } : format(value));
            }
        });

        return Array.from(map.values());
    };

    const handleArrayAdd = (section, item) => {

        let value =
            typeof item === "string"
                ? item
                : item?.name;

        if (!value) return;

        value = normalize(value.trim());

        setAllData((prev) => {

            const exists = prev[section]?.some((v) => {
                const existing =
                    typeof v === "string" ? v : v.name;

                return existing?.toLowerCase() === value.toLowerCase();
            });

            if (exists) {
                alert(`${value} already exists`);
                return prev;
            }

            // 🔥 replace normalized value
            const newItem =
                typeof item === "string"
                    ? value
                    : { ...item, name: value };

            return {
                ...prev,
                [section]: [...prev[section], newItem],
            };
        });
    };

    const handleArrayUpdate = (section, index, item) => {

        let value = section === "skills" ? item : item.name;

        if (!isValidValue(value)) {
            alert(`Invalid ${section} value`);
            return;
        }

        setAllData((prev) => ({
            ...prev,
            [section]: prev[section].map((v, i) => {
                if (i === index) return item;
                return v;
            }),
        }));
    };

    const handleArrayDelete = (section, index) => {
        setAllData((prev) => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index),
        }));
    };

    // --- NAVIGATION LOGIC ---
    const handleNextStep = () => {
        const currentIndex = steps.indexOf(activeItem);
        if (currentIndex < steps.length - 1) {
            const nextItem = steps[currentIndex + 1];
            setActiveItem(nextItem);

            // Auto-open Dropdowns
            if (["Profile", "Current Details", "Contact Details"].includes(nextItem))
                setOpenDropdown("Basic Details");
            else if (
                ["Key Skills", "Languages Known", "Certifications"].includes(nextItem)
            )
                setOpenDropdown("Skills & Certifications");
        }
    };

    const mapFrontendToBackendPayload = () => {
        const normalize = (val) => val?.trim().toLowerCase();

        const format = (val) => {
            if (!val) return "";
            return val.split(' ').map(word => {
                if (word.length === 0) return word;
                return word[0].toUpperCase() + word.slice(1).toLowerCase();
            }).join(' ');
        };

        const isValid = (val) => {
            if (!val) return false;
            if (!/^[A-Za-z0-9\s&\/#.,+-]+$/.test(val)) return false;
            if (/^(.)\1{3,}$/.test(val)) return false;
            if (val.length < 2) return false;
            return true;
        };

        const cleanSkills = () => {
            const map = new Map();

            allData.skills.forEach((skill) => {
                if (!skill) return;

                const value = skill.trim();
                if (value.length < 2) return;

                if (!/^[A-Za-z0-9\s&\/#.,+-]{2,}$/.test(value)) return;

                const key = value.toLowerCase();

                if (!map.has(key)) {
                    map.set(key, { name: value });
                }
            });

            return Array.from(map.values());
        };

        const cleanLanguages = () => {
            const map = new Map();

            allData.languages.forEach((lang) => {
                if (!lang?.name) return;

                const value = lang.name.trim();
                if (!isValid(value)) return;

                const key = normalize(value);

                if (!map.has(key)) {
                    map.set(key, {
                        name: format(value),
                        proficiency: lang.proficiency,
                    });
                }
            });

            return Array.from(map.values());
        };

        let backendHighestQual = null;
        if (allData.education.highestQual !== "Select") {
            if (allData.education.highestQual === "Under-Graduation") {
                backendHighestQual = "Graduation";
            } else {
                backendHighestQual = allData.education.highestQual;
            }
        }
        const payload = {
            full_name: allData.profile.fullName,
            gender: allData.profile.gender,
            dob: allData.profile.dob,
            marital_status: allData.profile.maritalStatus,
            nationality: allData.profile.nationality,
            employment_status: allData.currentDetails.experienceType,
            // ... rest of your payload fields ...

            current_job_title: allData.currentDetails.jobTitle,
            current_company: allData.currentDetails.company,
            total_experience_years: allData.currentDetails.experience,
            notice_period: allData.currentDetails.noticePeriod,
            current_location: allData.currentDetails.currentLocation,
            preferred_locations: allData.currentDetails.prefLocation,

            phone: allData.contact.mobile,
            alternate_phone: allData.contact.altMobile || null,
            alternate_email: allData.contact.altEmail || null,
            full_address: allData.contact.address,
            street: allData.contact.street,
            city: allData.contact.city,
            state: allData.contact.state,
            pincode: allData.contact.pincode,
            country: allData.contact.country,

            portfolio_link: allData.resume.portfolio_link,

            highest_qualification: backendHighestQual,

            educations: (() => {
                const eduArray = [];

                if (allData.education.sslc.institution && allData.education.sslc.institution.trim() !== "") {
                    const sslcData = {
                        qualification_level: "SSLC",
                        institution: allData.education.sslc.institution,
                        completion_year: allData.education.sslc.year,
                        percentage_or_cgpa: allData.education.sslc.percentage,
                        location: allData.education.sslc.location,
                    };
                    if (allData.education.sslc.id) {
                        sslcData.id = allData.education.sslc.id;
                    }
                    eduArray.push(sslcData);
                }

                if (allData.education.hsc.institution && allData.education.hsc.institution.trim() !== "") {
                    const hscData = {
                        qualification_level: "HSC",
                        institution: allData.education.hsc.institution,
                        completion_year: allData.education.hsc.year,
                        percentage_or_cgpa: allData.education.hsc.percentage,
                        location: allData.education.hsc.location,
                        post_10th_study: allData.education.hsc.stream,
                    };
                    if (allData.education.hsc.id) {
                        hscData.id = allData.education.hsc.id;
                    }
                    eduArray.push(hscData);
                }

                const highestQual = allData.education.highestQual;

                allData.education.graduations.forEach((g) => {
                    if (g.college && g.college.trim() !== "" && g.degree && g.degree.trim() !== "") {
                        let qualificationLevel = "Graduation";

                        if (highestQual === "Diploma") {
                            qualificationLevel = "Diploma";
                        } else if (highestQual === "Under-Graduation") {
                            qualificationLevel = "Graduation";
                        } else if (highestQual === "Post-Graduation") {
                            qualificationLevel = "Post-Graduation";
                        } else if (highestQual === "Doctorate") {
                            qualificationLevel = "Doctorate";
                        }

                        const gradData = {
                            qualification_level: qualificationLevel,
                            institution: g.college,
                            degree: g.degree,
                            department: g.dept,
                            status: g.status,
                            start_year: g.startYear,
                            end_year: g.endYear,
                            percentage_or_cgpa: g.percentage,
                            city: g.city,
                            state: g.state,
                            country: g.country,
                        };
                        if (g.id && typeof g.id === "number") {
                            gradData.id = g.id;
                        }
                        eduArray.push(gradData);
                    }
                });

                return eduArray;
            })(),

            experiences: allData.experience.entries.map((e) => ({
                job_title: e.title,
                company_name: e.company,
                start_date: e.startDate || null,
                end_date: e.endDate || null,
                industry_domain: e.industry,
                job_type: e.jobType,
                location: e.location,
                key_responsibilities: e.responsibilities,
            })),

            skills: cleanSkills(),

            languages: cleanLanguages(),

            certifications: allData.certs
                .filter(cert => cert && cert.name && cert.name.trim() !== "")
                .map(cert => ({
                    ...(cert.id ? { id: cert.id } : {}),
                    name: cert.name.trim(),
                })),

            current_ctc: allData.preferences.currentCTC,
            expected_ctc: allData.preferences.expectedCTC,
            preferred_job_type: allData.preferences.jobType,
            preferred_role_industry: allData.preferences.role,
            ready_to_start_immediately: allData.preferences.ready === "Yes",
            willing_to_relocate: allData.preferences.relocate === "Yes",
        };
        console.log(cleanSkills());
        console.log(cleanLanguages());

        // ✅ Add photo deletion flag if needed
        if (allData.profile.photoDeleted) {
            payload.delete_profile_photo = true;
        }

        return payload;
    };

    const handleFinalSubmit = async () => {
        if (saving) return;

        // Pre-Submit Validation
        if (!resumeFile && !allData.resume.resume_file) {
            alert("Please upload your resume before finishing.");
            setActiveItem("Resume");
            return;
        }

        if (allData.skills.length === 0) {
            alert("Please add at least one skill.");
            setActiveItem("Key Skills");
            setOpenDropdown("Skills & Certifications");
            return;
        }

        setSaving(true);

        try {
            const token = sessionStorage.getItem("access");
            if (!token) {
                window.location.href = "/login";
                return;
            }

            const formData = new FormData();
            const payload = mapFrontendToBackendPayload();

            // ✅ DEBUG: Check what we're sending
            console.log("=== PHOTO DELETION DEBUG ===");
            console.log("removePhotoFlag:", removePhotoFlag);
            console.log("allData.profile.photoDeleted:", allData.profile.photoDeleted);
            console.log("profilePhoto instanceof File:", profilePhoto instanceof File);
            console.log("profilePhoto value:", profilePhoto);


            if (removePhotoFlag || allData.profile.photoDeleted) {

                formData.append("delete_profile_photo", "true");

                payload.delete_profile_photo = true;

                console.log("✅ Photo deletion flag added - NOT sending profile_photo field");
            }
            formData.append("data", JSON.stringify(payload));

            if (profilePhoto instanceof File) {
                formData.append("profile_photo", profilePhoto);
                console.log("✅ Added new profile photo to FormData");
            } else if (!(removePhotoFlag || allData.profile.photoDeleted) && allData.profile.profile_photo) {

                console.log("ℹ️ Keeping existing profile photo (not sending any file)");
            } else if (removePhotoFlag || allData.profile.photoDeleted) {
                // When deleting, explicitly DO NOT send the profile_photo field
                console.log("🗑️ Deleting profile photo - not sending profile_photo field");
            }

            // Add resume
            if (resumeFile instanceof File) {
                formData.append("resume_file", resumeFile);
                console.log("✅ Added resume to FormData");
            }

            // Add certification files with their names and IDs
            if (allData.certs.length > 0) {
                allData.certs.forEach((cert, index) => {
                    if (cert.id) {
                        formData.append(`certifications[${index}][id]`, cert.id);
                    }
                    formData.append(`certifications[${index}][name]`, cert.name);

                    if (cert.file instanceof File) {
                        formData.append(
                            `certifications[${index}][certificate_file]`,
                            cert.file,
                        );
                        console.log(`✅ Added certification file ${index}: ${cert.file.name}`);
                    }
                });
            }

            // Log FormData contents for debugging
            console.log("📦 FormData entries:");
            for (let pair of formData.entries()) {
                console.log(
                    "  ",
                    pair[0],
                    pair[1] instanceof File ? pair[1].name : pair[1],
                );
            }



            // Send single request with all data
            const response = await api.patch("profile/jobseeker/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("✅ Response status:", response.status);
            console.log("✅ Response data:", response.data);

            if (response.status === 200 || response.status === 201) {
                alert("Profile saved successfully!");

                // Fetch fresh data after successful save
                await fetchProfile();

                setActiveItem("Profile");
                setOpenDropdown("Basic Details");
                setRemovePhotoFlag(false);
                setProfilePhoto(null);

                // Clear the photo from local state if deletion was requested
                if (removePhotoFlag || allData.profile.photoDeleted) {
                    setAllData(prev => ({
                        ...prev,
                        profile: {
                            ...prev.profile,
                            profile_photo: null,
                            photoDeleted: false
                        }
                    }));
                }
            }
        }catch (err) {
            console.error("Profile save failed", err);
            if (err.response?.status === 401) {
                alert("Session expired. Please login again.");
                return;
            }
            
            if (err.response && err.response.data) {
                const backendErrors = err.response.data;
                
                // Fallback text if something generic fails
                let alertMessage = "Could not save profile. Please fix the following:\n\n";
                let issuesFound = false;

                // Dictionary mapping technical fields to beautiful visual step names
                const fieldMapping = {
                    full_name: { field: "Full Name", section: "Profile" },
                    gender: { field: "Gender", section: "Profile" },
                    dob: { field: "Date of Birth", section: "Profile" },
                    marital_status: { field: "Marital Status", section: "Profile" },
                    nationality: { field: "Nationality", section: "Profile" },
                    current_job_title: { field: "Current Job Title", section: "Current Details" },
                    current_company: { field: "Current Company", section: "Current Details" },
                    total_experience_years: { field: "Total Experience", section: "Current Details" },
                    notice_period: { field: "Notice Period", section: "Current Details" },
                    current_location: { field: "Current Location", section: "Current Details" },
                    preferred_locations: { field: "Preferred Locations", section: "Current Details" },
                    phone: { field: "Mobile Number", section: "Contact Details" },
                    full_address: { field: "Address", section: "Contact Details" },
                    city: { field: "City", section: "Contact Details" },
                    state: { field: "State", section: "Contact Details" },
                    pincode: { field: "Pincode", section: "Contact Details" },
                    country: { field: "Country", section: "Contact Details" },
                    current_ctc: { field: "Current CTC", section: "Preferences / Career Details" },
                    expected_ctc: { field: "Expected CTC", section: "Preferences / Career Details" },
                    preferred_job_type: { field: "Preferred Job Type", section: "Preferences / Career Details" },
                    preferred_role_industry: { field: "Preferred Industry/Role", section: "Preferences / Career Details" }
                };

                // Loop over the keys arriving from the server dictionary
                Object.keys(backendErrors).forEach((key) => {
                    const errorContent = backendErrors[key];
                    const msg = Array.isArray(errorContent) ? errorContent[0] : errorContent;
                    
                    if (fieldMapping[key]) {
                        issuesFound = true;
                        alertMessage += `📍 Section: [${fieldMapping[key].section}] \n👉 Field: ${fieldMapping[key].field} - ${msg}\n\n`;
                    } else if (key === "educations" || key === "experiences" || key === "skills" || key === "languages") {
                        // Handle array block descriptions cleanly
                        issuesFound = true;
                        alertMessage += `📍 Section: [${format(key)}] \n👉 Issue: ${msg}\n\n`;
                    }
                });

                if (issuesFound) {
                    alert(alertMessage);
                } else {
                    // Fallback to text message parsing if nested deep down inside unknown error namespaces
                    alert("Validation Error:\n" + JSON.stringify(backendErrors));
                }
            } else {
                alert("Failed to save profile. Try again.");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = (section, e) => {
        const { name, value, removePhoto } = e.target;

        if (section === "profile" && name === "profile_photo") {
            if (removePhoto) {
                // Handle photo removal
                setAllData((prev) => ({
                    ...prev,
                    [section]: {
                        ...prev[section],
                        [name]: null,
                        photoDeleted: true // Flag to indicate deletion
                    },
                }));
                setRemovePhotoFlag(true);
                setProfilePhoto(null);
            } else if (value instanceof File) {
                // Handle new photo upload
                setAllData((prev) => ({
                    ...prev,
                    [section]: {
                        ...prev[section],
                        [name]: value,
                        photoDeleted: false
                    },
                }));
            } else {
                // Regular update
                setAllData((prev) => ({
                    ...prev,
                    [section]: {
                        ...prev[section],
                        [name]: value,
                    },
                }));
            }
        } else {
            setAllData((prev) => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [name]: value,
                },
            }));
        }
    };

    const handleReset = (section) => {
        const defaults = {
            profile: {
                fullName: "",
                gender: "Select",
                dob: "",
                maritalStatus: "Select",
                nationality: "",
            },
            currentDetails: {
                jobTitle: "",
                company: "",
                experience: "",
                noticePeriod: "",
                currentLocation: "",
                prefLocation: "",
                experienceType: "",
            },
            contact: {
                mobile: "",
                altMobile: "",
                email: "",
                altEmail: "",
                address: "",
                street: "",
                city: "",
                state: "",
                pincode: "",
                country: "",
            },
            resume: { portfolio_link: "" },
            skills: [],
            languages: [],
            certs: [],
            preferences: {
                currentCTC: "",
                expectedCTC: "",
                jobType: "Select",
                role: "",
                ready: "",
                relocate: "",
            },
            education: {
                highestQual: "Select",
                sslc: { institution: "", percentage: "", location: "", year: "" },
                hsc: {
                    stream: "Select",
                    institution: "",
                    location: "",
                    year: "",
                    percentage: "",
                },
                graduations: [],
            },
            experience: {
                status: "Fresher",
                hasExperience: "No",
                entries: [],
            },
        };

        setAllData((prev) => ({
            ...prev,
            [section]: defaults[section],
        }));
    };

    const handleDropdownClick = (title) =>
        setOpenDropdown(openDropdown === title ? null : title);
    const handleItemClick = (title, parent = null) => {
        setActiveItem(title);
        if (parent) setOpenDropdown(parent);
    };

    const menuItems = [
        {
            title: "Basic Details",
            subItems: ["Profile", "Current Details", "Contact Details"],
        },
        { title: "Resume" },
        { title: "Education Details" },
        { title: "Work Experience" },
        {
            title: "Skills & Certifications",
            subItems: ["Key Skills", "Languages Known", "Certifications"],
        },
        { title: "Preferences / Career Details" },
    ];

    const renderContent = () => {
        switch (activeItem) {
            case "Profile":
                return (
                    <Profile
                        data={allData.profile}
                        onChange={(e) => handleUpdate("profile", e)}
                        onReset={() => handleReset("profile")}
                        onNext={handleNextStep}
                        setProfilePhoto={setProfilePhoto}
                        setRemovePhotoFlag={setRemovePhotoFlag}
                    />
                );
            case "Current Details":
                return (
                    <CurrentDetails
                        data={allData.currentDetails}
                        onChange={(e) => handleUpdate("currentDetails", e)}
                        onReset={() => handleReset("currentDetails")}
                        onNext={handleNextStep}
                    />
                );
            case "Contact Details":
                return (
                    <ContactDetails
                        data={allData.contact}
                        onChange={(e) => handleUpdate("contact", e)}
                        onReset={() => handleReset("contact")}
                        onNext={handleNextStep}
                    />
                );
            case "Resume":
                return (
                    <ResumeSection
                        data={allData.resume}
                        onChange={(e) => handleUpdate("resume", e)}
                        onReset={() => handleReset("resume")}
                        onNext={handleNextStep}
                        setResumeFile={setResumeFile}
                        resumeFile={resumeFile}
                    />
                );
            case "Education Details":
                return (
                    <EducationDetails
                        data={allData.education}
                        onHighestQualChange={handleHighestQualChange}
                        onUpdateSSLC={handleUpdateSSLC}
                        onUpdateHSC={handleUpdateHSC}
                        onUpdateGrad={handleUpdateGrad}
                        onAddGrad={handleAddGrad}
                        onRemoveGrad={handleRemoveGrad}
                        onReset={() => handleReset("education")}
                        onNext={handleNextStep}
                    />
                );
            case "Work Experience":
                return (
                    <WorkExperience
                        data={allData.experience}
                        onChange={(e) => handleUpdate("experience", e)}
                        onUpdateEntry={handleExpUpdateEntry}
                        onAddEntry={handleAddExpEntry}
                        onRemoveEntry={handleRemoveExpEntry}
                        onReset={() => handleReset("experience")}
                        onNext={handleNextStep}
                    />
                );
            case "Key Skills":
                return (
                    <KeySkills
                        skills={allData.skills}
                        onAdd={(item) => handleArrayAdd("skills", item)}
                        onUpdate={(idx, item) => handleArrayUpdate("skills", idx, item)}
                        onDelete={(idx) => handleArrayDelete("skills", idx)}
                        onReset={() => handleReset("skills")}
                        onNext={handleNextStep}
                    />
                );
            case "Languages Known":
                return (
                    <LanguagesKnown
                        languages={allData.languages}
                        onAdd={(item) => handleArrayAdd("languages", item)}
                        onUpdate={(idx, item) => handleArrayUpdate("languages", idx, item)}
                        onDelete={(idx) => handleArrayDelete("languages", idx)}
                        onReset={() => handleReset("languages")}
                        onNext={handleNextStep}
                    />
                );
            case "Certifications":
                return (
                    <Certifications
                        certs={allData.certs}
                        onAdd={(item) => handleArrayAdd("certs", item)}
                        onUpdate={(idx, item) => handleArrayUpdate("certs", idx, item)}
                        onDelete={(idx) => handleArrayDelete("certs", idx)}
                        onReset={() => handleReset("certs")}
                        onNext={handleNextStep}
                    />
                );

            // Final Step -> Submit
            case "Preferences / Career Details":
                return (
                    <Preferences
                        data={allData.preferences}
                        experienceType={allData.currentDetails.experienceType || allData.experience.status}
                        onChange={(e) => handleUpdate("preferences", e)}
                        onReset={() => handleReset("preferences")}
                        onSubmitFinal={handleFinalSubmit}
                        saving={saving}
                    />
                );
            default:
                return (
                    <Profile
                        data={allData.profile}
                        onChange={(e) => handleUpdate("profile", e)}
                        onReset={() => handleReset("profile")}
                        onNext={handleNextStep}
                    />
                );
        }
    };

    return (
        <div>
            <Header />
            <main>
                <div className="profile-main-desc">
                    <h1>My Profile</h1>
                    <p>
                        Build and update your profile with personal, education, and career
                        details to connect with the right opportunities.
                    </p>
                </div>
                <div className="profile-main-content">
                    <aside className="sidebar">
                        {menuItems.map((item) => {
                            const isParentActive = item.subItems
                                ? item.subItems.includes(activeItem)
                                : activeItem === item.title;
                            return (
                                <div key={item.title}>
                                    <div
                                        className={`sidebar-item ${item.subItems ? "has-submenu" : ""} ${item.subItems && openDropdown === item.title ? "open" : ""} ${isParentActive ? "active-main" : ""}`}
                                        onClick={() =>
                                            item.subItems
                                                ? handleDropdownClick(item.title)
                                                : handleItemClick(item.title)
                                        }
                                    >
                                        {item.title}
                                        {item.subItems && <span className="arrow"></span>}
                                    </div>
                                    {item.subItems && openDropdown === item.title && (
                                        <div className="submenu">
                                            {item.subItems.map((subItem) => (
                                                <div
                                                    key={subItem}
                                                    className={`submenu-item ${activeItem === subItem ? "active" : ""}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleItemClick(subItem, item.title);
                                                    }}
                                                >
                                                    <span className="dot">•</span> {subItem}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </aside>
                    <section className="content-area">{renderContent()}</section>
                </div>
            </main>
            <footer className="myprofile-footer">
                © 2025 JobPortal. All rights reserved.
            </footer>
        </div>
    );
};
