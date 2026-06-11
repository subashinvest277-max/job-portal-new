import React, { useMemo, useState, useEffect } from 'react';

import './FindTalent.css';

import { useJobs } from '../JobContext';

import { ProfileCard } from './ProfileCard';

import { useNavigate } from 'react-router-dom';

import api from '../api/axios';

export const FindTalent = () => {

  const normalizeValue = (value) => {

    if (!value || typeof value !== "string") return null;

    let cleaned = value.trim().toLowerCase();

    cleaned = cleaned.replace(/\s+/g, " ");

    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

    return cleaned;

  };

  const isValidValue = (value) => {

    if (!value) return false;

    const cleaned = value.trim();

    if (cleaned.length < 2) return false;

    if (!/^[a-zA-Z\s]+$/.test(cleaned)) return false;

    if (/^(.)\1+$/.test(cleaned)) return false;

    return true;

  };

  // Get data from JobContext

  const { Alluser, setAlluser } = useJobs();

  const navigate = useNavigate();

  // Loading state for jobseekers fetch

  const [loadingJobseekers, setLoadingJobseekers] = useState(true);

  // States for Filters

  const [searchTerm, setSearchTerm] = useState('');

  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const [selectedEdu, setSelectedEdu] = useState([]);

  const [selectedSkills, setSelectedSkills] = useState([]);

  const [maxExp, setMaxExp] = useState(10);

  // States for "View More" toggles

  const [showAllLangs, setShowAllLangs] = useState(false);

  const [showAllEdu, setShowAllEdu] = useState(false);

  const [showAllSkills, setShowAllSkills] = useState(false);

  const [filterSearch, setFilterSearch] = useState({ lang: '', edu: '', skill: '' });

  const [appliedFilters, setAppliedFilters] = useState({

    search: '',

    languages: [],

    education: [],

    skills: [],

    experience: 10

  });

  // Fetch jobseekers only when this page loads

  useEffect(() => {

    const userType = sessionStorage.getItem('user_type');

    if (userType !== 'employer') {

      navigate('/Job-portal/jobseeker/');

      return;

    }

    const fetchJobseekers = async () => {

      try {

        setLoadingJobseekers(true);

        const res = await api.get("/jobseekers/");

        const jobseekersOnly = res.data.filter(

          item => item.user?.user_type === "jobseeker"

        );

        setAlluser(jobseekersOnly);

      } catch (err) {

        console.error("Error fetching jobseekers:", err);

        setAlluser([]);

      } finally {

        setLoadingJobseekers(false);

      }

    };

    fetchJobseekers();

  }, []);

  const jobseekersOnly = useMemo(() => {

    if (!Alluser || Alluser.length === 0) return [];

    return Alluser.filter(user => {

      const userType = user.user?.user_type ||

        user.user_type ||

        user.role ||

        user.profile?.user_type;

      return userType !== 'employer';

    });

  }, [Alluser]);

  // --- Dynamic Data Extraction based on backend structure ---

  const filterOptions = useMemo(() => {

    const languages = new Map();

    const education = new Map();

    const skills = new Map();

    if (!Alluser || Alluser.length === 0) {

      return { languages: [], education: [], skills: [] };

    }

    const processArray = (arr, key, map) => {

      if (!Array.isArray(arr)) return;

      arr.forEach(item => {

        const raw = item[key];

        if (!raw) return;

        const normalized = normalizeValue(raw);

        if (isValidValue(normalized)) {

          map.set(normalized.toLowerCase(), normalized);

        }

      });

    };

    Alluser.forEach(user => {

      processArray(user.profile?.languages, "name", languages);

      processArray(user.profile?.educations, "degree", education);

      processArray(user.profile?.skills, "name", skills);

      // fallback

      processArray(user.languages, "name", languages);

      processArray(user.educations, "degree", education);

      processArray(user.skills, "name", skills);

    });

    return {

      languages: Array.from(languages.values()).sort(),

      education: Array.from(education.values()).sort(),

      skills: Array.from(skills.values()).sort(),

    };

  }, [Alluser]);

  // Handle filter changes

  const handleFilterChange = (value, state, setState) => {

    setState(

      state.includes(value)

        ? state.filter(i => i !== value)

        : [...state, value]

    );

  };

  const handleApplyFilters = () => {

    const term = searchTerm.toLowerCase().trim();

    let newLangs = [...selectedLanguages];

    let newEdu = [...selectedEdu];

    let newSkills = [...selectedSkills];

    if (term) {

      filterOptions.languages.forEach(l => {

        if (l.toLowerCase() === term && !newLangs.includes(l)) newLangs.push(l);

      });

      filterOptions.education.forEach(e => {

        if (e.toLowerCase() === term && !newEdu.includes(e)) newEdu.push(e);

      });

      filterOptions.skills.forEach(s => {

        if (s.toLowerCase() === term && !newSkills.includes(s)) newSkills.push(s);

      });

    }

    setSelectedLanguages(newLangs);

    setSelectedEdu(newEdu);

    setSelectedSkills(newSkills);

    setAppliedFilters({

      search: term,

      languages: newLangs,

      education: newEdu,

      skills: newSkills,

      experience: maxExp

    });

  };

  const handleSearchClick = () => handleApplyFilters();

  const handleKeyPress = (e) => {

    if (e.key === 'Enter') handleApplyFilters();

  };

  const getVisibleItemsWithSearch = (items, showAll, searchKey) => {

    if (!items || items.length === 0) return [];

    const filtered = items.filter(item =>

      item.toLowerCase().includes(filterSearch[searchKey].toLowerCase())

    );

    return (showAll || filterSearch[searchKey]) ? filtered : filtered.slice(0, 5);

  };

  const filteredTalent = useMemo(() => {

    if (!Alluser || Alluser.length === 0) return [];

    return Alluser.filter((user) => {

      const userType = user.user?.user_type || user.user_type || user.role || user.profile?.user_type;

      if (userType === 'employer') return false;

      const userSkills = user.profile?.skills?.map(s => s.name) ||

        user.skills?.map(s => s.name) || [];

      const userLanguages = user.profile?.languages?.map(l => l.name) ||

        user.languages?.map(l => l.name) || [];

      const userEducation = user.profile?.educations?.map(e => e.degree) ||

        user.educations?.map(e => e.degree) || [];

      const searchLower = appliedFilters.search.toLowerCase().trim();

      let matchesSearch = true;

      if (searchLower) {

        const searchableText = [

          user.full_name || '',

          user.current_job_title || user.profile?.current_job_title || '',

          user.current_company || user.profile?.current_company || '',

          ...userSkills,

          ...userEducation

        ].join(' ').toLowerCase();

        matchesSearch = searchableText.includes(searchLower);

      }

      const normalizeArray = (arr) => arr.map(item => normalizeValue(item));

      const matchesLanguage =

        appliedFilters.languages.length === 0 ||

        normalizeArray(userLanguages).some(lang =>

          appliedFilters.languages.map(normalizeValue).includes(lang)

        );

      const matchesEducation =

        appliedFilters.education.length === 0 ||

        normalizeArray(userEducation).some(edu =>

          appliedFilters.education.map(normalizeValue).includes(edu)

        );

      const matchesSkills =

        appliedFilters.skills.length === 0 ||

        appliedFilters.skills.every(skill =>

          normalizeArray(userSkills).includes(normalizeValue(skill))

        );

      let expNumber = 0;

      if (user.total_experience_years !== undefined) {

        expNumber = parseFloat(user.total_experience_years) || 0;

      } else if (user.profile?.total_experience_years) {

        expNumber = parseFloat(user.profile.total_experience_years) || 0;

      }

      const matchesExperience = expNumber <= appliedFilters.experience;

      return matchesSearch && matchesLanguage && matchesEducation && matchesSkills && matchesExperience;

    });

  }, [appliedFilters, Alluser]);

  const clearFilters = () => {

    setSelectedLanguages([]);

    setSelectedEdu([]);

    setSelectedSkills([]);

    setMaxExp(10);

    setSearchTerm('');

    setShowAllLangs(false);

    setShowAllEdu(false);

    setShowAllSkills(false);

    setFilterSearch({ lang: '', edu: '', skill: '' });

    setAppliedFilters({

      search: '',

      languages: [],

      education: [],

      skills: [],

      experience: 10

    });

  };

  return (
    <div className="talent-page-container">

      {/* Search Section */}
      <section className="FindTalent-search-section">
        <div className="FindTalent-search-wrapper">
          <input

            type="text"

            placeholder="Search by Skills, Education, or Job Title"

            className="FindTalent-search-input"

            value={searchTerm}

            // onChange={(e) => setSearchTerm(e.target.value)}

            onChange={(e) => {
              const newValue = e.target.value;
              setSearchTerm(newValue);


              if (newValue.trim() === '') {
                setSelectedLanguages([]);
                setSelectedEdu([]);
                setSelectedSkills([]);
                setAppliedFilters({
                  search: '',
                  languages: [],
                  education: [],
                  skills: [],
                  experience: maxExp
                });
              }
            }}

            onKeyPress={handleKeyPress}

          />
          <button

            className="FindTalent-search-button"

            onClick={handleSearchClick}
          >

            Search
          </button>
        </div>
        <h1 style={{ marginTop: "40px" }} className="FindTalent-results-title">

          {loadingJobseekers

            ? "Loading jobseekers..."

            : `Jobseekers based on your search (${filteredTalent.length})`

          }
        </h1>
      </section>

      <div className="FindTalent-layout-body">

        {/* Filters Sidebar */}
        <div className="FindTalent-filters-sidebar">
          <div className="FindTalent-filter-top">
            <button className="FindTalent-filter-label" onClick={handleApplyFilters}>Apply filters</button>
            <span className="FindTalent-clear-btn" onClick={clearFilters}>

              Clear all
            </span>
          </div>

          {/* Languages Filter */}

          {filterOptions.languages.length > 0 && (
            <div className="FindTalent-filter-category">
              <h3>Languages</h3>
              <input

                type="text"

                placeholder="Search languages..."

                className="FindTalent-filter-search-input"

                value={filterSearch.lang}

                onChange={(e) => setFilterSearch({ ...filterSearch, lang: e.target.value })}

                style={{ width: '100%', padding: '5px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '3px' }}

              />

              {getVisibleItemsWithSearch(filterOptions.languages, showAllLangs, 'lang').map(lang => (
                <div key={lang} className="FindTalent-checkbox-item">
                  <input

                    type="checkbox"

                    id={`lang-${lang}`}

                    checked={selectedLanguages.includes(lang)}

                    onChange={() => handleFilterChange(lang, selectedLanguages, setSelectedLanguages)}

                  />
                  <label htmlFor={`lang-${lang}`}>{lang}</label>
                </div>

              ))}

              {filterOptions.languages.length > 5 && (
                <span className="FindTalent-view-more-link" onClick={() => setShowAllLangs(!showAllLangs)}>

                  {showAllLangs ? "View Less" : `View More (${filterOptions.languages.length - 5}+)`}
                </span>

              )}
            </div>

          )}

          {/* Experience Filter */}
          {/* <div className="FindTalent-filter-category">
            <h3>Experience (Max: {maxExp} years)</h3>
            <input

              type="range"

              min="0"

              max="20"

              value={maxExp}

              onChange={(e) => setMaxExp(parseInt(e.target.value))}

              className="FindTalent-exp-slider"

            />
          </div> */}


          <div className="FindTalent-filter-category">
  <h3>Experience (Max: {maxExp} years)</h3>
  
  <input
    type="range"
    min="0"
    max="20"
    value={maxExp}
    className="FindTalent-exp-slider"
    onChange={(e) => setMaxExp(parseInt(e.target.value))}
  />

  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#64748b',
    marginTop: '4px'
  }}>
    <span>0 yrs</span>
    <span>20 yrs</span>
  </div>
</div>
          {/* Education Filter */}

          {filterOptions.education.length > 0 && (
            <div className="FindTalent-filter-category">
              <h3>Education</h3>
              <input

                type="text"

                placeholder="Search education..."

                className="FindTalent-filter-search-input"

                value={filterSearch.edu}

                onChange={(e) => setFilterSearch({ ...filterSearch, edu: e.target.value })}

                style={{ width: '100%', padding: '5px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '3px' }}

              />

              {getVisibleItemsWithSearch(filterOptions.education, showAllEdu, 'edu').map(edu => (
                <div key={edu} className="FindTalent-checkbox-item">
                  <input

                    type="checkbox"

                    id={`edu-${edu}`}

                    checked={selectedEdu.includes(edu)}

                    onChange={() => handleFilterChange(edu, selectedEdu, setSelectedEdu)}

                  />
                  <label htmlFor={`edu-${edu}`}>{edu}</label>
                </div>

              ))}

              {filterOptions.education.length > 5 && (
                <span className="FindTalent-view-more-link" onClick={() => setShowAllEdu(!showAllEdu)}>

                  {showAllEdu ? "View Less" : `View More (${filterOptions.education.length - 5}+)`}
                </span>

              )}
            </div>

          )}

          {/* Skills Filter */}

          {filterOptions.skills.length > 0 && (
            <div className="FindTalent-filter-category">
              <h3>Skills</h3>
              <input

                type="text"

                placeholder="Search skills..."

                className="FindTalent-filter-search-input"

                value={filterSearch.skill}

                onChange={(e) => setFilterSearch({ ...filterSearch, skill: e.target.value })}

                style={{ width: '100%', padding: '5px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '3px' }}

              />

              {getVisibleItemsWithSearch(filterOptions.skills, showAllSkills, 'skill').map(skill => (
                <div key={skill} className="FindTalent-checkbox-item">
                  <input

                    type="checkbox"

                    id={`skill-${skill}`}

                    checked={selectedSkills.includes(skill)}

                    onChange={() => handleFilterChange(skill, selectedSkills, setSelectedSkills)}

                  />
                  <label htmlFor={`skill-${skill}`}>{skill}</label>
                </div>

              ))}

              {filterOptions.skills.length > 5 && (
                <span className="FindTalent-view-more-link" onClick={() => setShowAllSkills(!showAllSkills)}>

                  {showAllSkills ? "View Less" : `View More (${filterOptions.skills.length - 5}+)`}
                </span>

              )}
            </div>

          )}
        </div>

        {/* Talent List */}
        <div className="FindTalent-talent-list">

          {loadingJobseekers ? (
            <div className="FindTalent-no-results">
              <h3>Loading jobseekers...</h3>
              <p>Please wait while we fetch the data</p>
            </div>

          ) : filteredTalent.length > 0 ? (

            filteredTalent.map((user, index) => (
              <ProfileCard

                key={user.id || index}

                user={user}

                showActions={true}

              />

            ))

          ) : (
            <div className="FindTalent-no-results">
              <h3>No job seekers found</h3>
              <p>Try adjusting your filters or search term</p>
              <button className="FindTalent-clear-filters-btn" onClick={clearFilters}>

                Clear all filters
              </button>
            </div>

          )}

          {filteredTalent.length > 0 && filteredTalent.length >= 10 && (
            <button className="FindTalent-load-more-btn">Load More</button>

          )}
        </div>
      </div>
    </div>

  );

};
