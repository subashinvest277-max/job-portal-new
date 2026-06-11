import React, { useState, useEffect } from "react";
import { Footer } from "../Components-LandingPage/Footer";
import { EHeader } from "./EHeader";
import "./AboutYourCompany.css";
import fileIcon from "../assets/Employer/fileIcon.png";
import { useNavigate, useLocation } from "react-router-dom";
import { useJobs } from "../JobContext";
import api from "../api/axios";

export const AboutYourCompany = ({ hideNavigation = false, setActiveTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCompanyProfile } = useJobs();
  const [isLoading, setIsLoading] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [errorType, setErrorType] = useState("");
  const [existingLogo, setExistingLogo] = useState(null);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [pendingCompanyName, setPendingCompanyName] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [existingLogoSize, setExistingLogoSize] = useState("");

  const fromSignup = location.state?.fromSignup || false;
  // Recover identifying contextual email parameter from signup routing link state
  const employerEmail = location.state?.employerEmail || "";

  const [formData, setFormData] = useState({
    fullName: "",
    employerId: "",
    companyName: "",
    companyMoto: "",
    contactPerson: "",
    contactNumber: "",
    companyMail: "",
    website: "",
    companySize: "",
    address1: "",
    address2: "",
    about: "",
    companyLogo: null,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!fromSignup) {
      fetchExistingProfile();
    } else {
      console.log("Coming from signup, skipping profile fetch for email:", employerEmail);
      setIsLoading(false);
    }
  }, [fromSignup]);

  // const fetchExistingProfile = async () => {
  //   try {
  //     setIsLoading(true);
  //     console.log("Fetching existing company profile for dashboard...");

  //     const response = await api.get("/company/profile/");
  //     console.log("✅ Existing profile found:", response.data);

  //     const profile = response.data;
  //     setFormData({
  //       fullName: profile.full_name|| "",
  //       employerId: profile.employee_id || "",
  //       companyName: profile.company_name || "",
  //       companyMoto: profile.company_moto || "",
  //       contactPerson: profile.contact_person || "",
  //       contactNumber: profile.contact_number || "",
  //       companyMail: profile.company_email || "",
  //       website: profile.website || "",
  //       companySize: profile.company_size || "",
  //       address1: profile.address1 || "",
  //       address2: profile.address2 || "",
  //       about: profile.about || "",
  //       companyLogo: null,
  //     });

  //     setExistingLogo(profile.company_logo);
  //     setHasExistingProfile(true);

  //   } catch (err) {
  //     if (err.response?.status === 404) {
  //       console.log("No existing profile found");
  //       setHasExistingProfile(false);
  //       setExistingLogo(null);
  //       if (!hideNavigation) {
  //         setBackendError("No company profile found. Please create one.");
  //       }
  //     } else if (err.response?.status === 401) {
  //       console.log("Unauthorized - redirecting to login");
  //       if (!hideNavigation) {
  //         navigate("/Job-portal/employer/login");
  //       } else {
  //         setBackendError("Session expired. Please login again.");
  //       }
  //     } else {
  //       console.error("Error fetching profile:", err);
  //       setBackendError("Failed to load company profile");
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }; 

  const fetchExistingProfile = async () => {
    try {
      setIsLoading(true);
      setBackendError("");

      let errorMsg = "";

      let employerData = null;
      try {
        const res = await api.get("/profile/employer/");
        employerData = res.data;
      } catch (err) {
        console.error("Employer error:", err);
        if (err.response?.status === 401) {
          if (!hideNavigation) {
            navigate("/Job-portal/employer/login");
          } else {
            setBackendError("Session expired. Please login again.");
          }
          return;
        }
        if (err.code === "ERR_NETWORK") {
          setBackendError("Network error. Please check your connection.");
          return;
        }
        errorMsg = "Failed to load employer data.";
      }

      let companyData = null;
      try {
        const res = await api.get("/company/profile/");
        companyData = res.data;
        console.log(companyData, "company data ::");
        setHasExistingProfile(true);
        setExistingLogo(companyData.logo_absolute_url || companyData.logo_url);

        setExistingLogoSize(
          companyData.logo_size
            ? `${(companyData.logo_size / 1024 / 1024).toFixed(2)} MB`
            : ""
        );
      } catch (err) {
        console.error("Company error:", err);
        if (err.response?.status === 401) {
          if (!hideNavigation) {
            navigate("/Job-portal/employer/login");
          } else {
            setBackendError("Session expired. Please login again.");
          }
          return;
        }
        if (err.code === "ERR_NETWORK") {
          setBackendError("Network error. Please check your connection.");
          return;
        }
        if (err.response?.status === 404) {
          setHasExistingProfile(false);
          setExistingLogo(null);
          setBackendError("No company profile found. Please create one.");
        } else {
          setHasExistingProfile(false);
          setExistingLogo(null);
          errorMsg = errorMsg || "Failed to load company profile.";
        }
      }

      const newFormData = {
        fullName: employerData?.full_name || "",
        employerId: employerData?.employee_id || "",
        companyName: companyData?.company_name || "",
        companyMoto: companyData?.company_moto || "",
        contactPerson: companyData?.contact_person || "",
        contactNumber: companyData?.contact_number || "",
        companyMail: companyData?.company_email || "",
        website: companyData?.website || "",
        companySize: companyData?.company_size || "",
        address1: companyData?.address1 || "",
        address2: companyData?.address2 || "",
        about: companyData?.about || "",
        companyLogo: null,
      };

      setFormData(newFormData);
      setOriginalData(JSON.parse(JSON.stringify(newFormData)));

      if (errorMsg) {
        setBackendError(errorMsg);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    if (originalData) {
      setFormData(originalData);
      setErrors({});
      setBackendError("");
      if (hasExistingProfile && originalData.companyLogo !== null) {
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const companyNameRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s&.,-]{3,100}$/;
    const motoRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s.,!'-]{5,150}$/;
    const personRegex = /^[A-Za-z\s]+$/;
    const mobileRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const urlRegex = /^(https?:\/\/)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}(\/[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=%-]*)?$/;
    const fullNameRegex = /^[A-Za-z]+( [A-Za-z]+)+$/;
    const employerIdRegex = /^(?=.*[A-Za-z])[A-Za-z0-9](?:[A-Za-z0-9_-]{0,18}[A-Za-z0-9])?$/;

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Please enter your full name";
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters";
    } else if (!fullNameRegex.test(formData.fullName)) {
      newErrors.fullName = "Enter valid full name (First & Last name, only letters)";
    }

    if (!formData.employerId.trim()) {
      newErrors.employerId = "Employer ID is required";
    } else if (formData.employerId.length > 20) {
      newErrors.employerId = "Maximum 20 characters allowed";
    } else if (!/^[A-Za-z0-9_-]+$/.test(formData.employerId)) {
      newErrors.employerId = "Only letters, numbers, '-' and '_' are allowed";
    } else if (!/^[A-Za-z0-9]/.test(formData.employerId)) {
      newErrors.employerId = "Must start with a letter or number";
    } else if (!/[A-Za-z0-9]$/.test(formData.employerId)) {
      newErrors.employerId = "Must end with a letter or number";
    } else if (!employerIdRegex.test(formData.employerId)) {
      newErrors.employerId = "Invalid Employer ID format";
    }

    if (!formData.companyName?.trim()) {
      newErrors.companyName = "Company Name is required";
    } else if (!companyNameRegex.test(formData.companyName)) {
      newErrors.companyName = "Invalid Name (must contain letters, no special symbols)";
    }

    if (!formData.companyMoto?.trim()) {
      newErrors.companyMoto = "Company Moto is required";
    } else if (!motoRegex.test(formData.companyMoto)) {
      newErrors.companyMoto = "Moto must contain letters (min 5 characters)";
    }

    if (!formData.contactPerson?.trim()) {
      newErrors.contactPerson = "Contact person name is required";
    } else if (!/^[A-Za-z\s]+$/.test(formData.contactPerson)) {
      newErrors.contactPerson = "Contact person name must contain only alphabets and spaces";
    } else if (formData.contactPerson.length < 3) {
      newErrors.contactPerson = "Contact person name must be at least 3 characters";
    } else if (formData.contactPerson.length > 50) {
      newErrors.contactPerson = "Contact person name must be less than 50 characters";
    }

    if (!formData.contactNumber?.trim()) {
      newErrors.contactNumber = "Mobile number is required";
    } else if (!mobileRegex.test(formData.contactNumber)) {
      newErrors.contactNumber = "Enter valid 10-digit mobile (starts with 6-9)";
    }

    if (!formData.companyMail?.trim()) {
      newErrors.companyMail = "Company email is required";
    } else if (!emailRegex.test(formData.companyMail)) {
      newErrors.companyMail = "Email must start with a letter and be valid";
    }

    if (!formData.website?.trim()) {
      newErrors.website = "Company website is required";
    } else if (!urlRegex.test(formData.website)) {
      newErrors.website = "Include https:// (e.g., https://www.company.com)";
    }

    if (!formData.companySize?.trim()) newErrors.companySize = "Please select company size";
    if (!formData.address1?.trim() || formData.address1.length < 10) {
      newErrors.address1 = "Enter a complete address (min 10 chars)";
    }
    if (!formData.about?.trim() || formData.about.length < 50) {
      newErrors.about = "About description must be at least 50 characters";
    }

    if (!formData.companyLogo && !existingLogo) {
      newErrors.companyLogo = "Please upload a company logo";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const target = e?.target;
    if (!target) return;

    const { name, value, files } = target;

    setErrors((prev) => ({ ...prev, [name]: "" }));
    setBackendError("");

    if (name === "contactPerson") {
      // Allow only alphabets and spaces
      const filteredValue = value.replace(/[^A-Za-z\s]/g, '');
      setFormData({ ...formData, [name]: filteredValue });
      return;
    }

    if (files) {
      const file = files[0];
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
      const maxSize = 5 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, companyLogo: "Only image files are allowed!" }));
        return;
      }

      if (file.size > maxSize) {
        setErrors((prev) => ({ ...prev, companyLogo: "File size should be less than 5MB" }));
        return;
      }

      setFormData({ ...formData, [name]: file });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, companyLogo: null }));
    setExistingLogo(null);
    setShowMenu(false);
  };

  const handleViewLogo = () => {
    let fileUrl = null;
    if (formData.companyLogo) {
      fileUrl = URL.createObjectURL(formData.companyLogo);
    } else if (existingLogo) {
      fileUrl = existingLogo;
    }

    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
    setShowMenu(false);
  };

  const linkToExistingCompany = async (companyName) => {
    setIsLoading(true);
    setBackendError("");

    try {
      const response = await api.post("/company/link-to-existing/", {
        company_name: companyName,
        employer_email: employerEmail // Send identifier context explicitly if tokenless
      });

      console.log("Linked to existing company:", response.data);

      setCompanyProfile({
        ...formData,
        id: response.data.company_id,
        companyName: response.data.company_name,
        isExisting: true
      });

      return {
        success: true,
        data: {
          ...response.data,
          id: response.data.company_id,
          is_existing: true
        }
      };
    } catch (err) {
      console.error("Link to company error:", err);
      if (err.response?.status === 404) {
        setBackendError("Company not found. Please create a new company.");
      } else if (err.response?.status === 400) {
        setBackendError(err.response?.data?.error || "Cannot link to this company");
      } else {
        setBackendError("Failed to link to company. Please try again.");
      }
      return { success: false, error: "Link failed" };
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Create new company profile with popup handling
  // const createCompanyProfile = async (data) => {
  //   setIsLoading(true);
  //   setBackendError("");

  //   try {
  //     const formDataToSend = new FormData();
  //     formDataToSend.append("company_name", data.companyName);
  //     formDataToSend.append("company_moto", data.companyMoto);
  //     formDataToSend.append("contact_person", data.contactPerson);
  //     formDataToSend.append("contact_number", data.contactNumber);
  //     formDataToSend.append("company_email", data.companyMail);
  //     formDataToSend.append("website", data.website);
  //     formDataToSend.append("company_size", data.companySize);
  //     formDataToSend.append("address1", data.address1);
  //     if (data.address2) formDataToSend.append("address2", data.address2);
  //     formDataToSend.append("about", data.about);
  //     if (data.companyLogo) formDataToSend.append("company_logo", data.companyLogo);

  //     const response = await api.post("/company/profile/create/", formDataToSend, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });

  //     console.log("✅ Company profile created:", response.data);
  //     return { success: true, data: { ...response.data, is_existing: false } };
  //   } catch (err) {
  //     console.error("Create profile error:", err);

  //     if (err.response?.status === 400) {
  //       const errorMsg = err.response?.data?.error || "";

  //       // ✅ Check if error is about duplicate company
  //       if (errorMsg.includes("already exists")) {
  //         // Show popup instead of window.confirm
  //         setPendingCompanyName(data.companyName);
  //         setShowPopup(true);
  //         setIsLoading(false);
  //         return { success: false, error: "duplicate_company", pending: true };
  //       }

  //       // Handle other validation errors
  //       const backendErrors = err.response.data;
  //       const newErrors = {};
  //       const fieldMapping = {
  //         company_name: "companyName", company_moto: "companyMoto",
  //         contact_person: "contactPerson", contact_number: "contactNumber",
  //         company_email: "companyMail", website: "website",
  //         company_size: "companySize", address1: "address1",
  //         about: "about", company_logo: "companyLogo",
  //       };

  //       Object.keys(backendErrors).forEach((key) => {
  //         const frontendKey = fieldMapping[key];
  //         if (frontendKey) {
  //           newErrors[frontendKey] = Array.isArray(backendErrors[key])
  //             ? backendErrors[key][0] : backendErrors[key];
  //         }
  //       });
  //       setErrors(newErrors);
  //       return { success: false, error: "Validation failed" };
  //     }

  //     return { success: false, error: err.response?.data?.error || "Network error" };
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const createCompanyProfile = async (data) => {
    setIsLoading(true);
    setBackendError("");
    setErrors({});

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("company_name", data.companyName);
      formDataToSend.append("company_moto", data.companyMoto);
      formDataToSend.append("contact_person", data.contactPerson);
      formDataToSend.append("contact_number", data.contactNumber);
      formDataToSend.append("company_email", data.companyMail);
      formDataToSend.append("website", data.website);
      formDataToSend.append("company_size", data.companySize);
      formDataToSend.append("address1", data.address1);
      if (data.address2) formDataToSend.append("address2", data.address2);
      formDataToSend.append("about", data.about);
      if (data.companyLogo) formDataToSend.append("company_logo", data.companyLogo);
      
      // Explicit onboarding fallback parameter injection
      if (fromSignup && employerEmail) {
        formDataToSend.append("employer_email", employerEmail);
      }

      const response = await api.post(
        "/company/profile/create/",
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("Company profile created:", response.data);
      return {
        success: true,
        data: { ...response.data, is_existing: false }
      };

    } catch (err) {
      console.error("Create profile error:", err);
      if (err.code === "ERR_NETWORK") {
        setBackendError("Network error. Please check your connection.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return { success: false, error: "network" };
      }
      if (err.response?.status === 401 && !fromSignup) {
        setBackendError("Session expired. Please login again.");
        return { success: false, error: "unauthorized" };
      }

      if (err.response?.status === 400) {
        const errorData = err.response?.data;
        const errorMsg = errorData?.error || "";

        if (errorMsg.includes("already exists")) {
          setBackendError("Company already exists.");
          setPendingCompanyName(data.companyName);
          setShowPopup(true);
          return { success: false, error: "duplicate_company", pending: true };
        }

        if (errorMsg === "You are already linked to a company") {
          navigate("/Job-portal/employer/login");
          return { success: false, error: "already_linked" };
        }

        const fieldMapping = {
          company_name: "companyName",
          company_moto: "companyMoto",
          contact_person: "contactPerson",
          contact_number: "contactNumber",
          company_email: "companyMail",
          website: "website",
          company_size: "companySize",
          address1: "address1",
          about: "about",
          company_logo: "companyLogo",
        };

        const newErrors = {};
        Object.keys(errorData).forEach((key) => {
          const frontendKey = fieldMapping[key];
          if (frontendKey) {
            newErrors[frontendKey] = Array.isArray(errorData[key]) ? errorData[key][0] : errorData[key];
          }
        });

        if (Object.keys(newErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...newErrors }));
          window.scrollTo({ top: 100, behavior: "smooth" });
          return { success: false, error: "oops! something went wrong" };
        }

        setBackendError(errorMsg || "Invalid data provided.");
        return { success: false, error: "oops! something went wrong" };
      }

      setBackendError(err.response?.data?.error || "Something went wrong. Please try again.");
      return { success: false, error: "failed" };
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmployerProfile = async (data) => {
    setIsLoading(true);
    setBackendError("");
    setErrorType("");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const payload = {
        full_name: data.fullName,
        employee_id: data.employerId,
      };

      if (fromSignup && employerEmail) {
        payload.employer_email = employerEmail;
      }

      await api.patch("/profile/employer/", payload, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("Employer profile updated");
      setErrors(prev => {
        const { employerId, fullName, ...rest } = prev;
        return rest;
      });
      setBackendError("");
      setErrorType("");

      return { success: true };

    } catch (err) {
      console.error("Employer profile update error:", err);
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        const errorMsg = "No internet connection. Please check your network and try again.";
        setBackendError(errorMsg);
        setErrorType("NETWORK_ERROR");
        return { success: false, error: errorMsg, errorType: "NETWORK_ERROR" };
      }
      if (err.name === 'AbortError') {
        const errorMsg = "Request is taking too long. Please check your connection and try again.";
        setBackendError(errorMsg);
        setErrorType("TIMEOUT_ERROR");
        return { success: false, error: errorMsg, errorType: "TIMEOUT_ERROR" };
      }

      if (err.response?.status === 400) {
        const errorData = err.response.data;
        const newErrors = {};
        let specificErrorMsg = "";

        if (errorData.employee_id) {
          const errorMsg = Array.isArray(errorData.employee_id) ? errorData.employee_id[0] : errorData.employee_id;
          newErrors.employerId = errorMsg;
          if (!specificErrorMsg) specificErrorMsg = errorMsg;
        }

        if (errorData.full_name) {
          const errorMsg = Array.isArray(errorData.full_name) ? errorData.full_name[0] : errorData.full_name;
          newErrors.fullName = errorMsg;
          if (!specificErrorMsg) specificErrorMsg = errorMsg;
        }

        if (errorData.error && !specificErrorMsg) specificErrorMsg = errorData.error;

        if (Object.keys(newErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...newErrors }));
          if (specificErrorMsg) {
            setBackendError(specificErrorMsg);
            setErrorType("VALIDATION_ERROR");
          } else {
            setBackendError("Please check your information and try again.");
            setErrorType("VALIDATION_ERROR");
          }
          window.scrollTo({ top: 100, behavior: "smooth" });
          return {
            success: false,
            errorType: "VALIDATION_ERROR",
            validationErrors: newErrors,
            error: specificErrorMsg || "Validation failed"
          };
        }

        const errorMsg = errorData?.error || errorData?.message || "Invalid data. Please check your inputs.";
        setBackendError(errorMsg);
        setErrorType("BAD_REQUEST");
        return { success: false, error: errorMsg, errorType: "BAD_REQUEST" };
      }

      if (err.response?.status === 401 && !fromSignup) {
        const errorMsg = "Your session has expired. Please login again to continue.";
        setBackendError(errorMsg);
        setErrorType("AUTH_ERROR");
        setTimeout(() => navigate("/Job-portal/employer/login"), 2000);
        return { success: false, error: errorMsg, errorType: "AUTH_ERROR" };
      }

      if (err.response?.status === 403) {
        const errorMsg = "You don't have permission to update your profile. Please contact support.";
      setBackendError(errorMsg);
        setErrorType("PERMISSION_ERROR");
        return { success: false, error: errorMsg, errorType: "PERMISSION_ERROR" };
      }

      if (err.response?.status === 404) {
        const errorMsg = "Profile not found. Please refresh the page and try again.";
        setBackendError(errorMsg);
        setErrorType("NOT_FOUND_ERROR");
        return { success: false, error: errorMsg, errorType: "NOT_FOUND_ERROR" };
      }

      if (err.response?.status === 429) {
        const errorMsg = "Too many attempts. Please wait a moment and try again.";
        setBackendError(errorMsg);
        setErrorType("RATE_LIMIT_ERROR");
        return { success: false, error: errorMsg, errorType: "RATE_LIMIT_ERROR" };
      }

      if (err.response?.status >= 500 && err.response?.status < 600) {
        const errorMsg = "Server error. Our team has been notified. Please try again later.";
        setBackendError(errorMsg);
        setErrorType("SERVER_ERROR");
        console.error("Server Error:", err.response.status, err.response.data);
        return { success: false, error: errorMsg, errorType: "SERVER_ERROR" };
      }

      const errorMsg = "An unexpected error occurred. Please try again or contact support.";
      setBackendError(errorMsg);
      setErrorType("UNKNOWN_ERROR");
      console.error("Unknown error:", err);
      return { success: false, error: errorMsg, errorType: "UNKNOWN_ERROR" };

    } finally {
      setIsLoading(false);
    }
  };

  const updateCompanyProfile = async (data) => {
    setIsLoading(true);
    setBackendError("");
    setErrorType("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("company_name", data.companyName);
      formDataToSend.append("company_moto", data.companyMoto);
      formDataToSend.append("contact_person", data.contactPerson);
      formDataToSend.append("contact_number", data.contactNumber);
      formDataToSend.append("company_email", data.companyMail);
      formDataToSend.append("website", data.website);
      formDataToSend.append("company_size", data.companySize);
      formDataToSend.append("address1", data.address1);
      if (data.address2) formDataToSend.append("address2", data.address2);
      formDataToSend.append("about", data.about);
      if (data.companyLogo) formDataToSend.append("company_logo", data.companyLogo);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await api.patch("/company/profile/update/", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("Company profile updated:", response.data);
      setErrors({});
      setBackendError("");
      setErrorType("");

      return { success: true, data: response.data };

    } catch (err) {
      console.error("Update profile error:", err);

      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        const errorMsg = "No internet connection. Please check your network and try again.";
        setBackendError(errorMsg);
        setErrorType("NETWORK_ERROR");
        return { success: false, error: errorMsg, errorType: "NETWORK_ERROR" };
      }

      if (err.name === 'AbortError') {
        const errorMsg = "Request is taking too long. Please check your connection and try again.";
        setBackendError(errorMsg);
        setErrorType("TIMEOUT_ERROR");
        return { success: false, error: errorMsg, errorType: "TIMEOUT_ERROR" };
      }

      if (err.response?.status === 400) {
        const backendErrors = err.response.data;
        const newErrors = {};
        const fieldMapping = {
          company_name: "companyName", company_moto: "companyMoto",
          contact_person: "contactPerson", contact_number: "contactNumber",
          company_email: "companyMail", website: "website",
          company_size: "companySize", address1: "address1",
          address2: "address2", about: "about", company_logo: "companyLogo",
        };

        Object.keys(backendErrors).forEach((key) => {
          const frontendKey = fieldMapping[key];
          if (frontendKey) {
            newErrors[frontendKey] = Array.isArray(backendErrors[key])
              ? backendErrors[key][0] : backendErrors[key];
          }
        });
        setErrors(newErrors);

        const firstErrorField = Object.keys(newErrors)[0];
        if (firstErrorField) {
          const specificError = newErrors[firstErrorField];
          setBackendError(specificError);
          setErrorType("VALIDATION_ERROR");
        } else {
          setBackendError("Please check the form for errors and try again.");
          setErrorType("VALIDATION_ERROR");
        }

        return { success: false, errorType: "VALIDATION_ERROR", validationErrors: newErrors };
      }

      if (err.response?.status === 401) {
        const errorMsg = "Your session has expired. Please login again to continue.";
        setBackendError(errorMsg);
        setErrorType("AUTH_ERROR");
        setTimeout(() => {
          navigate("/Job-portal/employer/login");
        }, 2000);
        return { success: false, error: errorMsg, errorType: "AUTH_ERROR" };
      }

      if (err.response?.status === 403) {
        const errorMsg = "You don't have permission to update this profile. Please contact support.";
        setBackendError(errorMsg);
        setErrorType("PERMISSION_ERROR");
        return { success: false, error: errorMsg, errorType: "PERMISSION_ERROR" };
      }

      if (err.response?.status === 404) {
        const errorMsg = "Company profile not found. Please refresh the page and try again.";
        setBackendError(errorMsg);
        setErrorType("NOT_FOUND_ERROR");
        return { success: false, error: errorMsg, errorType: "NOT_FOUND_ERROR" };
      }

      if (err.response?.status === 413) {
        const errorMsg = "File is too large. Please compress your image to under 5MB and try again.";
        setErrors({ companyLogo: errorMsg });
        setBackendError(errorMsg);
        setErrorType("FILE_SIZE_ERROR");
        return { success: false, error: errorMsg, errorType: "FILE_SIZE_ERROR" };
      }

      if (err.response?.status === 429) {
        const errorMsg = "Too many attempts. Please wait a moment and try again.";
        setBackendError(errorMsg);
        setErrorType("RATE_LIMIT_ERROR");
        return { success: false, error: errorMsg, errorType: "RATE_LIMIT_ERROR" };
      }

      if (err.response?.status >= 500 && err.response?.status < 600) {
        const errorMsg = "Server error. Our team has been notified. Please try again later.";
        setBackendError(errorMsg);
        setErrorType("SERVER_ERROR");
        console.error("Server Error:", err.response.status, err.response.data);
        return { success: false, error: errorMsg, errorType: "SERVER_ERROR" };
      }

      const errorMsg = "An unexpected error occurred. Please try again or contact support if the problem continues.";
      setBackendError(errorMsg);
      setErrorType("UNKNOWN_ERROR");
      return { success: false, error: errorMsg, errorType: "UNKNOWN_ERROR" };

    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinExistingCompany = async () => {
    setShowPopup(false);
    const result = await linkToExistingCompany(pendingCompanyName);

    if (result.success) {
      setCompanyProfile({
        ...formData,
        id: result.data.company_id,
        companyLogo: result.data.company_logo
      });

      navigate("/Job-portal/employer/about-your-company/company-verification", {
        state: { fromSignup: fromSignup, employerEmail: employerEmail, companyName: pendingCompanyName }
      });
    } else if (result.error !== "Validation failed") {
      setBackendError(result.error || "Failed to link to company");
    }
  };

  const handleCancelJoin = () => {
    setShowPopup(false);
    setPendingCompanyName("");
    setErrors({ companyName: "Please use a different company name" });
  };

  const handleNext = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      console.log("Form has errors");
      return;
    }

    console.log("Saving onboarding step content payload maps...");

    const employerResult = await updateEmployerProfile(formData);
    if (!employerResult.success) {
      console.log("Employer update failed:", employerResult.error);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    let result;
    if (fromSignup || !hasExistingProfile) {
      result = await createCompanyProfile(formData);
      if (result.pending) return;
    } else {
      result = await updateCompanyProfile(formData);
    }

    if (result && result.success) {
      console.log("Navigating with state:", {
        fromSignup: fromSignup,
        profileId: result.data.id || result.data.company_id,
        companyName: formData.companyName,
        fromCompanyProfile: true
      });

      setCompanyProfile({
        ...formData,
        id: result.data.id || result.data.company_id,
        companyLogo: result.data.company_logo
      });

      // Passing employerEmail context directly into the verification sub-route loop
      navigate("/Job-portal/employer/about-your-company/company-verification", {
        state: {
          fromSignup: fromSignup,
          employerEmail: employerEmail,
          profileId: result.data.id || result.data.company_id,
          isExistingCompany: result.data.is_existing || false,
          companyName: formData.companyName,
          fromCompanyProfile: true
        }
      });
    } else if (result) {
      if (result.errorType === "VALIDATION_ERROR") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (result.errorType === "NETWORK_ERROR") {
        console.log("Network error - check connection");
      } else if (result.errorType === "AUTH_ERROR") {
        console.log("Auth error - redirecting to login");
      } else if (result.error !== "Validation failed" && result.error !== "duplicate_company") {
        if (!backendError) {
          setBackendError(result.error || "Failed to save company profile");
        }
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    console.log("Saving Company Profile from Dashboard:", formData);

    const employerResult = await updateEmployerProfile(formData);
    if (!employerResult.success) {
      console.log("Employer update failed:", employerResult.error);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    let result;
    if (hasExistingProfile) {
      result = await updateCompanyProfile(formData);
    } else {
      result = await createCompanyProfile(formData);
    }

    if (result.success) {
      setCompanyProfile({
        ...formData,
        id: result.data.id,
        companyLogo: result.data.company_logo
      });

      setExistingLogo(result.data.company_logo);
      setHasExistingProfile(true);

      alert("Company profile saved successfully!");
    } else {
      if (result.errorType === "VALIDATION_ERROR") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (result.errorType === "NETWORK_ERROR") {
        console.log("Network error - check connection");
      } else if (result.errorType === "AUTH_ERROR") {
        console.log("Auth error - redirecting to login");
      } else if (result.error !== "Validation failed" && result.error !== "duplicate_company") {
        if (!backendError) {
          setBackendError(result.error || "Failed to save");
        }
      }
    }
  };

  const PopupModal = () => {
    return (
      <div className="popup-modal-overlay">
        <div className="popup-modal-content">
          <div className="popup-modal-header">
            <h3>Company Already Exists</h3>
          </div>
          <div className="popup-modal-body">
            <p>
              A company with the name <strong>"{pendingCompanyName}"</strong> already exists in our system.
            </p>
            <p>Do you want to join this existing company instead of creating a new one?</p>
          </div>
          <div className="popup-modal-footer">
            <button type="button" className="popup-btn-cancel" onClick={handleCancelJoin}>No, Use Different Name</button>
            <button type="button" className="popup-btn-confirm" onClick={handleJoinExistingCompany}>Yes, Join Existing Company</button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading && !fromSignup) {
    return (
      <>
        {!hideNavigation && <EHeader />}
        <div className="aboutcompany-container">
          <h2 className="aboutcompany-title">About Your Company</h2>
          <div style={{ textAlign: "center", padding: "50px" }}>Loading...</div>
        </div>
        {!hideNavigation && <Footer />}
      </>
    );
  }

  return (
    <>
      {!hideNavigation && <EHeader />}

      {showPopup && <PopupModal />}

      <div className="aboutcompany-container">
        <h2 className="aboutcompany-title">
          About Your Company
          {fromSignup && <span style={{ fontSize: "14px", color: "#666", marginLeft: "10px" }}>(Step 1 of 2)</span>}
        </h2> 

        {backendError && (
          <div className="backend-error-message" style={{
            backgroundColor: "#ffebee", color: "#d32f2f",
            padding: "10px", borderRadius: "5px", marginBottom: "20px", textAlign: "center"
          }}>
            {backendError}
          </div>
        )}

        <form className="aboutcompany-form" onSubmit={(e) => e.preventDefault()}>
          <div className="aboutcompany-form-group">
            <label>Full Name *</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <input
                className={errors.fullName ? "input-error" : ""}
                type="text"
                name="fullName"
                placeholder="e.g., John Doe"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isLoading}
                maxLength={50}
              />
              {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
            </div>
          </div>

          <div className="aboutcompany-form-group">
            <label>Employee ID *</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <input
                className={errors.employerId ? "input-error" : ""}
                type="text"
                name="employerId"
                placeholder="e.g., EMP001"
                value={formData.employerId}
                onChange={handleChange}
                disabled={isLoading}
                maxLength={20}
              />
              {errors.employerId && <span className="error-msg">{errors.employerId}</span>}
            </div>
          </div>

          <div className="aboutcompany-form-group">
            <label>Company Name *</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <input
                className={errors.companyName ? "input-error" : ""}
                type="text"
                name="companyName"
                placeholder="e.g., Tech Solutions Pvt Ltd"
                value={formData.companyName}
                onChange={handleChange}
                disabled={isLoading}
                maxLength={80}
              />
              {errors.companyName && <span className="error-msg">{errors.companyName}</span>}
            </div>
          </div>

          <div className="aboutcompany-form-group">
            <label>Company Moto *</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <input
                className={errors.companyMoto ? "input-error" : ""}
                type="text"
                name="companyMoto"
                placeholder="e.g., Innovating for a better tomorrow"
                value={formData.companyMoto}
                onChange={handleChange}
                disabled={isLoading}
                maxLength={500}
              />
              {errors.companyMoto && <span className="error-msg">{errors.companyMoto}</span>}
            </div>
          </div>

          <div className="aboutcompany-form-group">
            <label>Contact Person *</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <input
                className={errors.contactPerson ? "input-error" : ""}
                type="text"
                name="contactPerson"
                placeholder="e.g., John Doe"
                value={formData.contactPerson}
                onChange={handleChange}
                disabled={isLoading}
                maxLength={40}
              />
              {errors.contactPerson && <span className="error-msg">{errors.contactPerson}</span>}
            </div>
          </div>

          <div className="aboutcompany-form-group">
            <label>Contact Number *</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <input
                className={errors.contactNumber ? "input-error" : ""}
                type="tel"
                name="contactNumber"
                placeholder="e.g., 9876543210"
                value={formData.contactNumber}
                onChange={handleChange}
                disabled={isLoading}
                maxLength={10}
              />
              {errors.contactNumber && <span className="error-msg">{errors.contactNumber}</span>}
            </div>
          </div>

          <div className="aboutcompany-form-group">
            <label>Company Mail Id *</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <input
                className={errors.companyMail ? "input-error" : ""}
                type="email"
                name="companyMail"
                placeholder="e.g., hr@company.com"
                value={formData.companyMail}
                onChange={handleChange}
                disabled={isLoading}
                maxLength={100}
              />
              {errors.companyMail && <span className="error-msg">{errors.companyMail}</span>}
            </div>
          </div>

          <div className="aboutcompany-form-group">
            <label>Company Website *</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <input
                className={errors.website ? "input-error" : ""}
                type="text"
                name="website"
                maxLength={100}
                placeholder="e.g., https://www.company.com"
                value={formData.website}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.website && <span className="error-msg">{errors.website}</span>}
            </div>
          </div>

          <div className="aboutcompany-form-group">
            <label>Company Logo *</label>
            <div style={{ flex: 1 }}>
              <input
                type="file"
                name="companyLogo"
                id="logoUpload"
                hidden
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleChange}
              />

              {!formData.companyLogo && !existingLogo && (
                <div className="upload-box" onClick={() => document.getElementById("logoUpload").click()}>
                  Click here to upload
                </div>
              )}

              {(formData.companyLogo || existingLogo) && (
                <div className="file-card">
                  <div className="aboutcompany-file-left" onClick={handleViewLogo}>
                    <img src={fileIcon} alt="" />
                    <div>
                      <p>{formData.companyLogo ? formData.companyLogo.name : "company-logo"}</p>
                      <span>{formData.companyLogo ? `${(formData.companyLogo.size / 1024 / 1024).toFixed(2)} MB` : existingLogoSize}</span>
                    </div>
                  </div>

                  <div className="menu-wrapper">
                    <button type="button" className="dots-btn" onClick={() => setShowMenu(!showMenu)}>⋮</button>
                    {showMenu && (
                      <div className="file-menu">
                        <button type="button" onClick={handleViewLogo}>View</button>
                        <button type="button" onClick={handleRemoveLogo}>Remove</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {errors.companyLogo && <span className="error-msg">{errors.companyLogo}</span>}
            </div>
          </div>

          <div className="aboutcompany-form-group">
            <label>Company Size *</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <select
                className={errors.companySize ? "input-error" : ""}
                name="companySize"
                value={formData.companySize}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="">Select company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
              {errors.companySize && <span className="error-msg">{errors.companySize}</span>}
            </div>
          </div>

          <div className="aboutcompany-form-group">
            <label>Company Address *</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <input
                className={errors.address1 ? "input-error" : ""}
                type="text"
                name="address1"
                placeholder="e.g., Hyderabad, India"
                value={formData.address1}
                onChange={handleChange}
                disabled={isLoading}
                maxLength={100}
              />
              {errors.address1 && <span className="error-msg">{errors.address1}</span>}
            </div>
          </div>

          <div className="aboutcompany-form-group">
            <label>Company Address 2 (Optional)</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <input
                type="text"
                name="address2"
                placeholder="e.g., Floor 3, Building A"
                value={formData.address2}
                onChange={handleChange}
                disabled={isLoading}
                maxLength={100}
              />
            </div>
          </div>

          <div className="aboutcompany-form-group">
            <label>About Company *</label>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <textarea
                className={errors.about ? "input-error" : ""}
                rows="5"
                name="about"
                placeholder="Tell us about your company, mission, values, and what makes you unique..."
                value={formData.about}
                onChange={handleChange}
                disabled={isLoading}
                maxLength={500}
              />
              {errors.about && <span className="error-msg">{errors.about}</span>}
            </div>
          </div>

          {!hideNavigation && (
            <div className="aboutcompany-form-buttons">
              <button type="button" className="aboutcompany-back-btn" onClick={() => navigate(-1)} disabled={isLoading}>
                Back
              </button>
              <button type="button" className="aboutcompany-next-btn" onClick={handleNext} disabled={isLoading}>
                {isLoading ? "Saving..." : "Next"}
              </button>
            </div>
          )}

          {hideNavigation && (
            <div>
              <button type="button" className="aboutcompany-save-btn" onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </button>
              <button type="button" className="aboutcompany-discard-btn" onClick={handleDiscard} disabled={isLoading}>
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
      {!hideNavigation && <Footer />}
    </>
  );
};