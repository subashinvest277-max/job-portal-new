import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EHeader } from './EHeader';
import { Footer } from '../Components-LandingPage/Footer';
import './PostJobForm.css';
import { locationsList } from "../Locations";

const availableSkills = ["UI & UX", "UI/UX Design", "UI Design", "UX Design", "User Interface", "User Experience", "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator", "InDesign", "Wireframing", "Prototyping",
  "HTML", "HTML5", "CSS", "CSS3", "JavaScript", "TypeScript", "React", "React Native", "Angular", "Vue.js", "Next.js", "Nuxt.js", "Svelte", "SASS", "LESS", "Tailwind CSS", "Bootstrap", "Material UI", "Redux", "Webpack", "Babel", "DOM Manipulation", "AJAX", "JSON",
  "Node.js", "Express.js", "Python", "Django", "Flask", "FastAPI", "Java", "Spring Boot", "Hibernate", "C", "C++", "C#", ".NET", "ASP.NET", "PHP", "Laravel", "Symfony", "Ruby", "Ruby on Rails", "Go", "Rust", "Swift", "Kotlin", "Scala", "Elixir", "Erlang",
  "SQL", "MySQL", "PostgreSQL", "SQLite", "MongoDB", "Mongoose", "Redis", "Cassandra", "DynamoDB", "Firebase", "Oracle", "Microsoft SQL Server", "GraphQL", "REST API", "Prisma",
  "AWS", "Azure", "Google Cloud Platform (GCP)", "Docker", "Kubernetes", "Linux", "Unix", "Ubuntu", "CentOS", "Jenkins", "Travis CI", "CircleCI", "GitLab CI/CD", "Terraform", "Ansible", "Puppet", "Chef", "Bash", "Shell Scripting", "Nginx", "Apache",
  "Data Analysis", "Data Science", "Machine Learning", "Artificial Intelligence", "Deep Learning", "NLP", "Computer Vision", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Scikit-Learn", "TensorFlow", "Keras", "PyTorch", "Tableau", "Power BI", "Excel", "R", "Hadoop", "Spark", "Kafka",
  "Android SDK", "iOS Development", "Flutter", "Dart", "Objective-C", "Xamarin", "Ionic", "Service Now", "Automation Testing", "Manual Testing", "Test Cases", "Test Plans",
  "Agile", "Scrum", "Kanban", "Jira", "Trello", "Asana", "Git", "GitHub", "GitLab", "Bitbucket", "Postman", "Swagger",
  "Cybersecurity", "Penetration Testing", "Ethical Hacking", "Cryptography", "Blockchain", "Web3", "Smart Contracts", "Solidity", "QA Testing", "Selenium", "Jest", "Mocha", "Chai", "Cypress", "Puppeteer", "Project Management", "Product Management", "Digital Marketing", "SEO", "SEM", "Content Writing", "Copywriting", "Sales", "Business Development", "Customer Success", "Technical Support"];

export const PostJobForm = ({ onCancel }) => {
  const navigate = useNavigate();
  const formRef = useRef(null);

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };


  const categoryOptions = ["Aerospace & Defense", "Ai/MI", "Analytics", "Artificial Intelligence", "Automotive", "Big Data", "Biotechnology", "Business Consulting", "Business Intelligence", "Cloud Computing", "Cloud Services", "Construction", "Consulting", "Consumer Goods", "Consumer Tech", "Corporate", "Corporate Functions", "Customer Support", "Cybersecurity", "Data Infrastructure", "Data Science", "Design", "Digital Marketing", "Digital Media", "E-Commerce", "Ed-Tech", "Energy", "Enterprise Software", "Entertainment", "Finance", "Financial Services", "Fintech", "Fmcg", "Healthcare", "Hospital", "Hr Services", "Human Resources", "Internet", "It Consulting", "It Networking", "IT Services", "Logistics", "Marketing", "Marketing & Advertising", "Martech", "Mobile App Development", "Mobile Development", "Pharmaceutical", "Pharma", "Product Development", "Project Management", "Real Estate", "Recruitment", "Regional Sales", "Renewable Power", "Research", "Retail", "Retail Tech", "Saas", "Sales", "Site Reliability Engineering", "Software Development", "Software Product", "Software Testing", "Subscription Service", "Supply Chain", "Technology", "Telecommunications"];
  const educationOptions = [
    "BS", "B.A", "CA", "B.Ed", "M.Com", "B.Sc", "MCA", "BCA", "LLM", "MS/M.Sc", "Diploma", "B.Com", "M.Tech", "MBA/PGDM", "PG Diploma", "B.B.A/ B.M.S", "Medical-MS/MD", "B.Tech/B.E.", "Any Graduate", "Other Post Graduate", "ITI Certification", "Any Postgraduate", "Graduation Not Required", "Post Graduation Not Required", "Bachelor Of Science", "Business Economics"
  ];
  const departmentOptions = [
    "Engineering", "Marketing", "Sales", "Human Resources", "Finance",
    "Operations", "Product Management", "Customer Success", "Design",
    "Data Science", "Legal", "Information Technology", "Administrative"
  ];

  const [formData, setFormData] = useState({
    job_title: '',
    industry_type: [],
    department: [],
    education: [],
    work_type: '',
    shift: '',
    work_duration: '',
    salary: '',
    fresher: '',
    experience: '',
    location: [],
    openings: '',
    job_category: '',
    key_skills: [],
    job_highlights: [''],
    job_description: '',
    responsibilities: ['']

  });
  console.log(formData)

  const [skillInput, setSkillInput] = useState(""); // Track what user types
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const handleClickOutside = (event) => {

      if (!event.target.closest('.jobpost-dropdown')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Handle Skill Input Change
  const handleSkillChange = (e) => {
    const value = e.target.value;
    setSkillInput(value);

    if (value.trim()) {
      const filtered = availableSkills.filter(skill =>
        skill.toLowerCase().includes(value.toLowerCase()) &&
        !skillsList.includes(skill)
      );
      setFilteredSkills(filtered);
    } else {
      setFilteredSkills([]);
    }
  };

  // Select Skill from Suggestion
  const selectSkill = (skill) => {
    setSkillsList([...skillsList, skill]);
    setSkillInput("");
    setFilteredSkills([]);
    setErrors({ ...errors, keySkills: "" });
  };

  const validateForm = () => {

    const newErrors = {};
    const jobTitleRegex = /^[a-zA-Z][a-zA-Z0-9\s&/_@.+()!-]{3,}$/;

    const durationRegex = /^(\d+\s*(month|months|year|years)|permanent)$/i;

    const openingsRegex = /^[1-9][0-9]{0,2}$/;

    const contentRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9\s.,-]{5,}$/;

    // Updated experience regex to accept formats like 0, 0-12 (without years)
    const expRegex = /^(\d{1,2})(\s*-\s*(\d{1,2}))?$/;

    // --- VALIDATION LOGIC ---

    // Job Title
    if (!formData.job_title.trim()) {
      newErrors.job_title = "Job title is required";
    } else if (!jobTitleRegex.test(formData.job_title.trim())) {
      newErrors.job_title = "Minimum 3 characters; letters, numbers, and common symbols allowed)";
    }

    // Work Duration
    if (!formData.work_duration.trim()) {
      newErrors.work_duration = "Work duration is required";
    } else if (!durationRegex.test(formData.work_duration.trim())) {
      newErrors.work_duration = "Enter e.g. '6 Months' or 'Permanent'";
    }

    // 5. Salary (Advanced Format Validation)
    const salaryInput = formData.salary.trim();

    const salaryRegex = /^(\d{3,7})(\s?\/-\s?)?\s?(per\s?month|\/month|pm)$|^(\d+(\.\d{1,2})?)\s?(lpa)$|^(\d+(\.\d{1,2})?)\s?(cr|crore)\s?(per\s?year)?$/i;

    if (!salaryInput) {
      newErrors.salary = "Salary is required";
    } else if (!salaryRegex.test(salaryInput)) {

      if (/^\d+$/.test(salaryInput)) {
        newErrors.salary = "Please specify unit (e.g., 'LPA' or 'per month')";
      }
      else if (/[^\w\s./-]/.test(salaryInput)) {
        newErrors.salary = "Invalid characters not allowed";
      }
      else if (/lpa/i.test(salaryInput) && /(month|pm)/i.test(salaryInput)) {
        newErrors.salary = "Do not mix LPA with monthly format";
      }
      else {
        newErrors.salary = "Invalid format (e.g., 15000 per month, 5 LPA, 1 cr per year)";
      }
    }

    if (!formData.fresher) {
      newErrors.fresher = "Please select whether fresher is allowed or not";
    }

    // Experience validation - conditional based on fresher
    const expStr = formData.experience.trim();

    if (formData.fresher === 'no') {
      // Experience is REQUIRED when fresher = no
      if (!expStr) {
        newErrors.experience = "Experience is required";
      } else if (!expRegex.test(expStr)) {
        newErrors.experience = "Invalid format (e.g., '0', '0-6', '3-12')";
      } else {
        // Additional validation for range values
        if (expStr.includes('-')) {
          const [start, end] = expStr.split('-').map(num => parseInt(num.trim()));
          if (end <= start) {
            newErrors.experience = "End value must be greater than start value";
          }
          if (start < 0 || end < 0) {
            newErrors.experience = "Experience cannot be negative";
          }
        } else {
          const value = parseInt(expStr);
          if (value < 0) {
            newErrors.experience = "Experience cannot be negative";
          }
        }
      }
    } else if (formData.fresher === 'yes') {
      // Experience is OPTIONAL when fresher = yes
      // Only validate format if user entered something
      if (expStr && !expRegex.test(expStr)) {
        newErrors.experience = "Invalid format (e.g., '0', '0-6', '3-12')";
      }
    }
    // Openings
    const openingsStr = String(formData.openings).trim();
    if (!openingsStr || openingsStr === '0') {
      newErrors.openings = "Please enter valid openings in numbers only";
    } else if (!openingsRegex.test(openingsStr)) {
      newErrors.openings = "Enter a valid count (max 999)";
    }

    // Job Highlights
    if (!formData.job_highlights[0]?.trim()) {
      newErrors.job_highlights = "First highlight is required";
    } else if (!contentRegex.test(formData.job_highlights[0])) {
      newErrors.job_highlights = "Must contain letters (no symbols)";
    }

    // Responsibilities
    if (!formData.responsibilities[0]?.trim()) {
      newErrors.responsibilities = "First responsibility is required";
    } else if (!contentRegex.test(formData.responsibilities[0])) {
      newErrors.responsibilities = "Must contain letters (no symbols)";
    }

    // Standard checks for the rest
    if (formData.industry_type.length === 0) newErrors.industry_type = "Select industrial type";
    if (formData.department.length === 0) newErrors.department = "Select department";
    if (formData.education.length === 0) newErrors.education = "Select education";
    if (locationList.length === 0) newErrors.location = "Select at least one location";
    if (!formData.work_type) newErrors.work_type = "Select work type";
    if (!formData.shift) newErrors.shift = "Select shift";
    if (!formData.job_category) newErrors.job_category = "Select job category";
    if (skillsList.length === 0) newErrors.key_skills = "Add at least one skill";

    if (!formData.job_description.trim() || formData.job_description.length < 50) {
      newErrors.job_description = "Description must be at least 50 characters";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }

    return Object.keys(newErrors).length === 0;
  };



  const handleCheckboxChange = (name, value, allOptions = []) => {
    setErrors({ ...errors, [name]: "" });

    setFormData(prev => {
      const currentList = prev[name] || [];

      if (value === "all") {
        const isAllSelected = currentList.length === allOptions.length;
        return { ...prev, [name]: isAllSelected ? [] : allOptions };
      }
      const newList = currentList.includes(value)
        ? currentList.filter(i => i !== value)
        : [...currentList, value];
      return { ...prev, [name]: newList };
    });
  };


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setErrors({ ...errors, [name]: "" });

    if (type === 'checkbox') {
      if (name.includes('.')) {
        const [group, field] = name.split('.');
        setFormData((prev) => ({
          ...prev,
          [group]: { ...prev[group], [field]: checked }
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.name === 'key_skills_input') {
      e.preventDefault();
      const newSkill = e.target.value.trim();
      if (newSkill && !skillsList.includes(newSkill)) {
        setSkillsList([...skillsList, newSkill]);
        setFormData({ ...formData, key_skills_input: '' });
        setErrors({ ...errors, key_skills: "" });
      }
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkillsList(skillsList.filter(skill => skill !== skillToRemove));
  };

  const handleHighlightChange = (index, value) => {
    const newHighlights = [...formData.job_highlights];
    newHighlights[index] = value;
    setFormData({ ...formData, job_highlights: newHighlights });
    setErrors({ ...errors, job_highlights: "" });
  };

  const addHighlightField = () => {
    setFormData({
      ...formData,
      job_highlights: [...formData.job_highlights, ""]
    });
  };

  const handleResponsibilityChange = (index, value) => {
    const updatedRes = [...formData.responsibilities];
    updatedRes[index] = value;
    setFormData({ ...formData, responsibilities: updatedRes });
    setErrors({ ...errors, responsibilities: "" });
  };

  const removeHighlightField = (index) => {
    if (formData.job_highlights.length > 1) {
      const newHighlights = formData.job_highlights.filter((_, i) => i !== index);
      setFormData({ ...formData, job_highlights: newHighlights });
    }
  };

  const addResponsibilityField = () => {
    setFormData({
      ...formData,
      responsibilities: [...formData.responsibilities, ""]
    });
  };

  // Handle removing a responsibility
  const removeResponsibilityField = (index) => {
    if (formData.responsibilities.length > 1) {
      const newRes = formData.responsibilities.filter((_, i) => i !== index);
      setFormData({ ...formData, responsibilities: newRes });
    }
  };

  // Function to combine fresher and experience fields
  const combineExperienceData = () => {
    const fresherValue = formData.fresher === 'yes' ? 'Fresher' : '';
    const experienceValue = formData.experience.trim();

    if (fresherValue && experienceValue) {
      return `${fresherValue}, ${experienceValue} years`;
    } else if (fresherValue) {
      return fresherValue;
    } else if (experienceValue) {
      return `${experienceValue} years`;
    }
    return '';
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      return false; // stops form submit if errors
    }

    // Convert location array to comma-separated string
    const locationString = locationList.join(', ');

    // Combine fresher and experience data
    const combinedExperience = combineExperienceData();

    // Prepare data for backend - match PostAJob model exactly
    const submissionData = {
      job_title: formData.job_title,
      industry_type: formData.industry_type,
      department: formData.department,
      work_type: formData.work_type,
      shift: formData.shift,
      work_duration: formData.work_duration,
      salary: formData.salary || 0,
      experience: combinedExperience, // Send combined data
      location: locationList,  // Send as string, not array
      openings: parseInt(formData.openings) || 0,
      job_category: formData.job_category,
      education: formData.education,
      key_skills: skillsList,
      job_highlights: formData.job_highlights.filter(h => h && h.trim()),
      job_description: formData.job_description,
      responsibilities: formData.responsibilities.filter(r => r && r.trim())
    };

    console.log('📤 Submitting job data:', submissionData);
    navigate('/Job-portal/Employer/PostJobpreview', { state: submissionData });
  };

  return (
    <>
      {/* <EHeader />  */}
      <div className="jobpost-page-title">
        <main className="jobpost-main-content">
          <header className="jobpost-form-header">
            <h1>Post a Job</h1>
            <p>Complete the steps below to reach thousands of qualified candidates</p>
          </header>

          <div className="jobpost-form-container">
            <form className="jobpost-form" onSubmit={handleSubmit}>
              <div className="jobpost-form-row">
                <label className="jobpost-label">Job title</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <input className={`jobpost-input ${errors.job_title ? "input-error" : ""}`} type="text" name="job_title" placeholder="e.g., Fullstack Developer" value={formData.job_title} onChange={handleChange} />
                  {errors.job_title && <span className="error-msg">{errors.job_title}</span>}
                </div>
              </div>

              <div className="jobpost-form-row jobpost-top-align">
                <label className="jobpost-label">Industrial type</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className={`jobpost-dropdown ${openDropdown === 'industry_type' ? 'jobpost-is-active' : ''} ${errors.industry_type ? "input-error" : ""}`}>
                    <div className="jobpost-dropdown-trigger" onClick={() => toggleDropdown('industry_type')}>
                      {formData.industry_type.length > 0 ? formData.industry_type.join(', ') : 'Select'}
                      <i className="fas fa-angle-down jobpost-arrow"></i>
                    </div>
                    <div className="jobpost-dropdown-panel">
                      <label className="jobpost-select-all">
                        <input type="checkbox" onChange={() => handleCheckboxChange('industry_type', 'all', categoryOptions)}
                          checked={formData.industry_type.length === categoryOptions.length && categoryOptions.length > 0} />
                        <strong>Select all</strong>
                      </label>
                      <div className="jobpost-options-grid">
                        {categoryOptions.map(cat => (
                          <label key={cat} className="jobpost-option-item">
                            <input type="checkbox" checked={formData.industry_type.includes(cat)} onChange={() => handleCheckboxChange('industry_type', cat)} /> {cat}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  {errors.industry_type && <span className="error-msg">{errors.industry_type}</span>}
                </div>
              </div>

              <div className="jobpost-form-row jobpost-top-align">
                <label className="jobpost-label">Department</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className={`jobpost-dropdown ${openDropdown === 'department' ? 'jobpost-is-active' : ''} ${errors.department ? "input-error" : ""}`}>
                    <div className="jobpost-dropdown-trigger" onClick={() => toggleDropdown('department')}>
                      {formData.department.length > 0 ? formData.department.join(', ') : 'Select'}
                      <i className="fas fa-angle-down jobpost-arrow"></i>
                    </div>
                    <div className="jobpost-dropdown-panel">
                      <label className="jobpost-select-all">
                        <input
                          type="checkbox"
                          onChange={() => handleCheckboxChange('department', 'all', departmentOptions)}
                          checked={formData.department.length === departmentOptions.length}
                        />
                        <strong>Select all Departments</strong>
                      </label>
                      <div className="jobpost-options-grid">
                        {departmentOptions.map(dept => (
                          <label key={dept} className="jobpost-option-item">
                            <input
                              type="checkbox"
                              checked={formData.department.includes(dept)}
                              onChange={() => handleCheckboxChange('department', dept)}
                            />
                            {dept}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  {errors.department && <span className="error-msg">{errors.department}</span>}
                </div>
              </div>

              <div className="jobpost-form-row">
                <label className="jobpost-label">Work type</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className={`jobpost-radio-container ${errors.work_type ? "input-error" : ""}`}>
                    <label className="jobpost-radio-label">
                      <input type="radio" name="work_type" value="Hybrid" checked={formData.work_type === 'Hybrid'} onChange={handleChange} /> Hybrid
                    </label>
                    <label className="jobpost-radio-label">
                      <input type="radio" name="work_type" value="Remote" checked={formData.work_type === 'Remote'} onChange={handleChange} /> Remote
                    </label>
                    <label className="jobpost-radio-label">
                      <input type="radio" name="work_type" value="On-site" checked={formData.work_type === 'On-site'} onChange={handleChange} /> On-site
                    </label>
                  </div>
                  {errors.work_type && <span className="error-msg">{errors.work_type}</span>}
                </div>
              </div>

              <div className="jobpost-form-row">
                <label className="jobpost-label">Shift</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className={`jobpost-radio-container ${errors.shift ? "input-error" : ""}`}>
                    <label className="jobpost-radio-label">
                      <input type="radio" name="shift" value="General" checked={formData.shift === 'General'} onChange={handleChange} /> General
                    </label>
                    <label className="jobpost-radio-label">
                      <input type="radio" name="shift" value="Night" checked={formData.shift === 'Night'} onChange={handleChange} /> Night
                    </label>
                    <label className="jobpost-radio-label">
                      <input type="radio" name="shift" value="Rotational" checked={formData.shift === 'Rotational'} onChange={handleChange} /> Rotational
                    </label>
                  </div>
                  {errors.shift && <span className="error-msg">{errors.shift}</span>}
                </div>
              </div>

              <div className="jobpost-form-row">
                <label className="jobpost-label">Work duration</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <input className={`jobpost-input ${errors.work_duration ? "input-error" : ""}`} type="text" name="work_duration" placeholder='e.g., "3 Months", "6 Months", "permanent"' value={formData.work_duration} onChange={handleChange} />
                  {errors.work_duration && <span className="error-msg">{errors.work_duration}</span>}
                </div>
              </div>

              <div className="jobpost-form-row">
                <label className="jobpost-label">Salary</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <input className={`jobpost-input ${errors.salary ? "input-error" : ""}`} type="text" name="salary" placeholder="Max Annual CTC in LPA" value={formData.salary} onChange={handleChange} />
                  {errors.salary && <span className="error-msg">{errors.salary}</span>}
                </div>
              </div>

              <div className="jobpost-form-row">
                <label className="jobpost-label">Fresher</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className={`jobpost-radio-container ${errors.fresher ? "input-error" : ""}`}>
                    <label className="jobpost-radio-label">
                      <input
                        type="radio"
                        name="fresher"
                        value="yes"
                        checked={formData.fresher === 'yes'}
                        onChange={handleChange}
                      /> Yes
                    </label>
                    <label className="jobpost-radio-label">
                      <input
                        type="radio"
                        name="fresher"
                        value="no"
                        checked={formData.fresher === 'no'}
                        onChange={handleChange}
                      /> No
                    </label>
                  </div>
                  {errors.fresher && <span className="error-msg">{errors.fresher}</span>}
                </div>
              </div>

              {/* Modified Experience Field */}
              <div className="jobpost-form-row">
                <label className="jobpost-label">Experience (in years)</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <input
                    className={`jobpost-input ${errors.experience ? "input-error" : ""}`}
                    type="text"
                    name="experience"
                    placeholder="e.g., 0, 0-12, 6-24 (in months)"
                    value={formData.experience}
                    onChange={handleChange}
                  />
                  {errors.experience && <span className="error-msg">{errors.experience}</span>}
                  <small style={{ color: '#666', marginTop: '5px' }}>Enter single value or range (e.g., 0, 0-12, 3-6). Do not include "years" or "months".</small>
                </div>
              </div>

              <div className="jobpost-form-row jobpost-top-align">
                <label className="jobpost-label">Location</label>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className={`jobpost-dropdown ${openDropdown === 'location' ? 'jobpost-is-active' : ''} ${errors.location ? "input-error" : ""}`}>

                    <div className="jobpost-dropdown-trigger" onClick={() => toggleDropdown('location')}>
                      {locationList.length > 0 ? locationList.join(', ') : 'Select Locations'}
                      <i className="fas fa-angle-down jobpost-arrow"></i>
                    </div>

                    <div className="jobpost-dropdown-panel">
                      <label className="jobpost-select-all">
                        <input
                          type="checkbox"
                          onChange={() => {
                            if (locationList.length === locationsList.length) {
                              setLocationList([]);
                            } else {
                              setLocationList(locationsList);
                            }
                            setErrors({ ...errors, location: "" });
                          }}
                          checked={
                            locationList.length === locationsList.length &&
                            locationsList.length > 0
                          }
                        />
                        <strong>Select all Locations</strong>
                      </label>

                      {/* Options */}
                      <div className="jobpost-options-grid">
                        {locationsList.map((loc) => (
                          <label key={loc} className="jobpost-option-item">
                            <input
                              type="checkbox"
                              checked={locationList.includes(loc)}
                              onChange={() => {
                                const updated = locationList.includes(loc)
                                  ? locationList.filter(l => l !== loc)
                                  : [...locationList, loc];

                                setLocationList(updated);
                                setErrors({ ...errors, location: "" });
                              }}
                            />
                            {loc}
                          </label>
                        ))}

                      </div>
                    </div>
                  </div>

                  {errors.location && <span className="error-msg">{errors.location}</span>}
                </div>
              </div>

              <div className="jobpost-form-row">
                <label className="jobpost-label">Openings</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <input className={`jobpost-input ${errors.openings ? "input-error" : ""}`} type="number" name="openings" placeholder="Total vacant positions" value={formData.openings} onChange={handleChange} min="1" />
                  {errors.openings && <span className="error-msg">{errors.openings}</span>}
                </div>
              </div>

              <div className="jobpost-form-row">
                <label className="jobpost-label">Job category</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className={`jobpost-radio-container ${errors.job_category ? "input-error" : ""}`}>
                    <label className="jobpost-radio-label">
                      <input type="radio" name="job_category" value="Full-time" checked={formData.job_category === 'Full-time'} onChange={handleChange} /> Full-time
                    </label>
                    <label className="jobpost-radio-label">
                      <input type="radio" name="job_category" value="Internship" checked={formData.job_category === 'Internship'} onChange={handleChange} /> Internship
                    </label>
                  </div>
                  {errors.job_category && <span className="error-msg">{errors.job_category}</span>}
                </div>
              </div>

              <div className="jobpost-form-row jobpost-top-align">
                <label className="jobpost-label">Education</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className={`jobpost-dropdown ${openDropdown === 'education' ? 'jobpost-is-active' : ''} ${errors.education ? "input-error" : ""}`}>
                    <div className="jobpost-dropdown-trigger" onClick={() => toggleDropdown('education')}>
                      {formData.education.length > 0 ? formData.education.join(', ') : 'Select Education'}
                      <i className="fas fa-angle-down jobpost-arrow"></i>
                    </div>
                    <div className="jobpost-dropdown-panel">
                      <div className="jobpost-options-grid">
                        {educationOptions.map(edu => (
                          <label key={edu} className="jobpost-option-item">
                            <input type="checkbox" checked={formData.education.includes(edu)} onChange={() => handleCheckboxChange('education', edu)} /> {edu}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  {errors.education && <span className="error-msg">{errors.education}</span>}
                </div>
              </div>

              <div className="jobpost-form-row">
                <label className="jobpost-label">Key skills</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className={`jobpost-skills-titile ${errors.key_skills ? "input-error" : ""}`}>
                    <input
                      className="jobpost-input skills-input"
                      style={errors.key_skills ? { borderColor: '#d93025' } : {}}
                      type="text"
                      name="keySkills"
                      placeholder="Press Enter to add skills  (e.g., Python, AWS, React etc...)"
                      value={skillInput}
                      onChange={handleSkillChange}
                      onKeyDown={handleKeyDown}
                    />
                    {/* SUGGESTIONS LIST */}
                    {filteredSkills.length > 0 && (
                      <ul className="skills-suggestions-list">
                        {filteredSkills.map((skill, index) => (
                          <li key={index} onClick={() => selectSkill(skill)}>
                            {skill}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="jobpost-tags-area" style={errors.keySkills ? { borderColor: '#d93025' } : {}}>
                      {skillsList.map((skill, index) => (
                        <span key={index} className="jobpost-tag">
                          {skill} <button type="button" onClick={() => removeSkill(skill)}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                  {errors.key_skills && <span className="error-msg">{errors.key_skills}</span>}
                </div>
              </div>

              <div className="jobpost-form-row">
                <label className="jobpost-label">Job highlights</label>
                <div className="highlights-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {formData.job_highlights.map((highlight, index) => (
                    <div key={index} className="jobpost-input-icon-titile">

                      <input
                        className={`jobpost-input ${errors.job_highlights && index === 0 ? "input-error" : ""}`}
                        type="text"
                        placeholder="Add top 3-5 selling points of the role"
                        value={highlight}
                        onChange={(e) => handleHighlightChange(index, e.target.value)}
                      />

                      {index === 0 ? (
                        <span
                          className="jobpost-plus-icon"
                          onClick={addHighlightField}
                        >
                          +
                        </span>
                      ) : (
                        /* Every item after the first shows a clean Delete/Minus button */
                        <span
                          className="jobpost-minus-icon"
                          onClick={() => removeHighlightField(index)}
                        >
                          -
                        </span>
                      )}
                    </div>
                  ))}

                  {errors.job_highlights && (
                    <span className="error-msg">{errors.job_highlights}</span>
                  )}
                </div>
              </div>

              <div className="jobpost-form-row">
                <label className="jobpost-label">Job description</label>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <textarea className={`jobpost-textarea ${errors.job_description ? "input-error" : ""}`} name="job_description" placeholder="Describe the role, responsibilities, requirements, and what makes this opportunity unique.... " value={formData.job_description} onChange={handleChange} rows="6"></textarea>
                  {errors.job_description && <span className="error-msg">{errors.job_description}</span>}
                </div>
              </div>

              <div className="jobpost-form-row">
                <label className="jobpost-label">Responsibilities</label>
                <div className="responsibilities-list" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {formData.responsibilities.map((res, index) => (
                    <div key={index} className="jobpost-input-icon-titile">

                      <input
                        className={`jobpost-input ${errors.responsibilities && index === 0 ? "input-error" : ""}`}
                        type="text"
                        placeholder="Specific day-to-day tasks"
                        value={res}
                        onChange={(e) => handleResponsibilityChange(index, e.target.value)}
                      />

                      {index === 0 ? (
                        <span
                          className="jobpost-plus-icon"
                          onClick={addResponsibilityField}
                        >
                          +
                        </span>
                      ) : (
                        /* Sub-fields cleanly shift into place with Minus icon badges */
                        <span
                          className="jobpost-minus-icon"
                          onClick={() => removeResponsibilityField(index)}
                        >
                          -
                        </span>
                      )}
                    </div>
                  ))}

                  {errors.responsibilities && (
                    <span className="error-msg">{errors.responsibilities}</span>
                  )}
                </div>
              </div>
            </form>
          </div>

          <div className="jobpost-actions">
            <button type="button" className="jobpost-btn-cancel" onClick={handleCancel}>Cancel</button>
            <button type="button" className="jobpost-btn-preview" onClick={handleSubmit}>Preview</button>
          </div>
        </main>

      </div>
      {/* <Footer /> */}
    </>
  );
};