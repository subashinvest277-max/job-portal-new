import { useEffect, useState, useMemo, useRef } from 'react'
import './SearchResults.css'
import { SearchResultsCard } from './SearchResultsCard'
import { Footer } from '../Components-LandingPage/Footer'
import { useLocation } from 'react-router-dom'
import { SearchBar } from './SearchBar'
import { Header } from '../Components-LandingPage/Header'
import { useJobs } from '../JobContext'

export const SearchResults = () => {
    const { jobs } = useJobs()

    // --- UI STATES (These control the checkboxes visually) ---
    const [minVal, setMinVal] = useState(0);
    const [maxVal, setMaxVal] = useState(100);
    const [minExp, setMinExp] = useState(0);
    const [maxExp, setMaxExp] = useState(30);
    const location = useLocation();

    const isFirstLoad = useRef(true);
    // ... [Helper functions remain unchanged] ...
    const getPercent = (value) => Math.round(((value - 0) / (100 - 0)) * 100);
    const countPropertyOccurrences = (data, property) => {
        return data.reduce((acc, item) => {
            let value = item[property];

            // 🔥 FIX HERE
            if (typeof value === "object" && value !== null) {
                value = value.company_name || value.name;
            }

            const key = typeof value === "string"
                ? value.toLowerCase()
                : `Unknown ${property}`;

            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    };

    const formatPostedDate = (dateString) => {
        const postedDate = new Date(dateString);
        const today = new Date();
        const diffInMs = today - postedDate;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        if (diffInDays === 0) return "Today";
        if (diffInDays === 1) return "Yesterday";
        if (diffInDays > 1 && diffInDays <= 7) return `${diffInDays} days ago`;
        if (diffInDays > 8 && diffInDays <= 14) return `1 Week ago`;
        if (diffInDays > 15 && diffInDays <= 21) return `2 Week ago`;
        if (diffInDays > 22 && diffInDays <= 29) return `3 Week ago`;
        if (diffInDays > 30 && diffInDays <= 60) return `1 month ago`;
        return `Long ago`;
    }
    const countPostedDate = (data, property) => {
        return data.reduce((acc, item) => {
            const value = item[property];
            const key = value ? formatPostedDate(value) : `Unknown ${property}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    };

    const locationCounts = countPropertyOccurrences(
        jobs.flatMap((item) =>
            Array.isArray(item.location)
                ? item.location.map((loc) => ({ ...item, location: loc }))
                : [{ ...item, location: item.location }]
        ),
        'location'
    );

    // Update educationCounts - jobs might have 'job_category' or 'education'
    const educationCounts = jobs.reduce((acc, item) => {
        // Check multiple possible property names
        let educationData = item.education || item.EducationRequired || item.job_category || item.category;

        if (!educationData) return acc;

        // If it's a string, convert to array
        let educationArray = Array.isArray(educationData) ? educationData : [educationData];

        educationArray.forEach((edu) => {
            if (edu) {
                const degree = edu.toLowerCase();
                acc[degree] = (acc[degree] || 0) + 1;
            }
        });

        return acc;
    }, {});

    // Update IndustryType calculation
    const InduntryCounts = jobs.reduce((acc, item) => {
        // Check multiple possible property names
        let industries = item.industry_type || item.industry || item.IndustryType || item.job_type;

        if (!industries) return acc;

        // Handle stringified array
        if (typeof industries === "string" && industries.startsWith("[")) {
            try {
                industries = JSON.parse(industries);
            } catch {
                industries = [industries];
            }
        }

        // Handle normal string
        if (typeof industries === "string") {
            industries = [industries];
        }

        // Handle array
        if (Array.isArray(industries)) {
            industries.forEach((int) => {
                if (int && typeof int === 'string') {
                    const val = int.toLowerCase();
                    acc[val] = (acc[val] || 0) + 1;
                }
            });
        }

        return acc;
    }, {});

    // ... [Data Prep] ...
    // const locationCounts = countPropertyOccurrences(jobs, 'location');
    const workTypeCounts = countPropertyOccurrences(jobs, 'work_type');
    const CompanyCounts = countPropertyOccurrences(
        jobs.map(job => ({
            ...job,
            company: job.company?.company_name || "unknown"
        })),
        'company'
    );
    const PostedbyCounts = countPropertyOccurrences(jobs, 'PostedBy');
    const PostedDtCounts = countPostedDate(jobs, 'posted_date');


    const locationArray = Object.entries(locationCounts);
    const WorkTypeArray = Object.entries(workTypeCounts);
    const PostedbyArray = Object.entries(PostedbyCounts);
    const TopcompanyArray = Object.entries(CompanyCounts);
    const checkboxList = Object.entries(educationCounts);
    const PostedDateArray = Object.entries(PostedDtCounts);
    const IndustryType = Object.entries(InduntryCounts);

    useEffect(() => {
        if (jobs.length > 0) {
            setLocationFilters(locationArray.slice(0, 5));
            setWorkTypeFilters(WorkTypeArray);
            setCompanyFilter(TopcompanyArray.slice(0, 5));
            setEducationFilter(checkboxList.slice(0, 5));
            setPostedDateFilter(PostedDateArray);
            setIndustryTypeFilter(IndustryType.slice(0, 5));
        }
    }, [jobs]);

    const [locationFilters, setLocationFilters] = useState([]);
    const [workTypeFilters, setWorkTypeFilters] = useState([]);
    const [CompanyFilter, setCompanyFilter] = useState([]);
    const [EducationFilter, setEducationFilter] = useState([]);
    const [PostedDateFilter, setPostedDateFilter] = useState([]);
    const [IndustryTypeFilter, setIndustryTypeFilter] = useState([]);

    const [TopCompanyExpanded, setTopCompanyExpanded] = useState(false);
    const [LocationExpanded, setLocationExpanded] = useState(false);
    const [IndustryTypeExpanded, setIndustryTypeExpanded] = useState(false);
    const [openSort, setOpenSort] = useState(false);
    const [sortBy, setSortBy] = useState("");
    const [hasSearched, setHasSearched] = useState(false);

    const [searchQuery, setSearchQuery] = useState(location.state?.query || "");
    const [searchLocation, setSearchLocation] = useState(location.state?.location || "");
    const [searchExp, setSearchExp] = useState(location.state?.experience || "");

    const [appliedFilters, setAppliedFilters] = useState({
        query: location.state?.query || "",
        location: location.state?.location || "",
        experience: location.state?.experience || ""
    });

    // --- SELECTION STATES (User checks these, but they don't filter immediately) ---
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [selectedWorkType, setselectedWorkType] = useState([]);
    const [SelectedCompany, setSelectedCompany] = useState([]);
    const [SelectedEducation, setSelectedEducation] = useState([]);
    const [SelectedPostDate, setSelectedPostDate] = useState([]);
    const [SelectedIndustryType, setSelectedIndustryType] = useState([]);

    useEffect(() => {
        const saved = sessionStorage.getItem("filters");

        if (saved && jobs.length > 0) {
            const data = JSON.parse(saved);

            setSelectedLocations(data.selectedLocations || []);
            setselectedWorkType(data.selectedWorkType || []);
            setSelectedCompany(data.SelectedCompany || []);
            setSelectedEducation(data.SelectedEducation || []);
            setSelectedPostDate(data.SelectedPostDate || []);
            setSelectedIndustryType(data.SelectedIndustryType || []);

            setMinVal(data.minVal || 0);
            setMaxVal(data.maxVal || 100);
            setMinExp(data.minExp || 0);
            setMaxExp(data.maxExp || 30);

            setAppliedSidebarFilters({
                locations: data.selectedLocations || [],
                workType: data.selectedWorkType || [],
                company: data.SelectedCompany || [],
                education: data.SelectedEducation || [],
                postedDate: data.SelectedPostDate || [],
                industryType: data.SelectedIndustryType || [],
                minSalary: data.minVal || 0,
                maxSalary: data.maxVal || 100,
                minExp: data.minExp || 0,
                maxExp: data.maxExp || 30
            });
        }
    }, [jobs]);

    useEffect(() => {
        if (searchExp) {
            if (searchExp === "fresher") {
                setMinExp(0);
                setMaxExp(0);
            } else if (searchExp === "1-3") {
                setMinExp(1);
                setMaxExp(3);
            } else if (searchExp === "3-5") {
                setMinExp(3);
                setMaxExp(5);
            } else if (searchExp === "5+") {
                setMinExp(5);
                setMaxExp(30);
            }
        }
    }, [searchExp]);

    useEffect(() => {
        if (location.state?.query || location.state?.location) {
            setHasSearched(true);
            handleSearchButtonClick();
        }
    }, []);

    useEffect(() => {
        if (searchLocation === "" && !isFirstLoad.current) {
            setSelectedLocations([]);
            setAppliedSidebarFilters(prev => ({
                ...prev,
                locations: []
            }));
            handleSearchButtonClick();
        }
    }, [searchLocation]);

    useEffect(() => {
        if (location.state?.query || location.state?.location) {
            setHasSearched(true);
            handleSearchButtonClick();
            isFirstLoad.current = false;
        }
    }, []);

    useEffect(() => {
        if (location.state?.query || location.state?.location) {
            setHasSearched(true);
        }
    }, []);
    // --- APPLIED STATE (This is what actually filters the list) ---
    const [appliedSidebarFilters, setAppliedSidebarFilters] = useState({
        locations: [],
        workType: [],
        company: [],
        education: [],
        postedDate: [],
        industryType: [],
        minSalary: 0,
        maxSalary: 100,
        minExp: 0,
        maxExp: 30
    });



    const handleSearchButtonClick = () => {
        setHasSearched(true);

        let min = 0;
        let max = 30;
        if (searchExp === "fresher") {
            min = 0;
            max = 0;
        } else if (searchExp === "1-3") {
            min = 1;
            max = 3;
        } else if (searchExp === "3-5") {
            min = 3;
            max = 5;
        } else if (searchExp === "5+") {
            min = 5;
            max = 30;
        }

        setMinExp(min);
        setMaxExp(max);

        // Handle comma-separated locations
        const locationInput = searchLocation.trim();
        let locationsArray = [];

        if (locationInput !== "") {
            // Split by comma and clean up each location
            locationsArray = locationInput
                .split(',')
                .map(loc => loc.trim().toLowerCase())
                .filter(loc => loc !== "");

            // Optional: Show warning if no valid locations found
            if (locationsArray.length === 0) {
                console.warn("No valid locations found in input");
            }
        }

        // Set all locations at once (replace, not append)
        setSelectedLocations(locationsArray);

        setAppliedFilters({
            query: searchQuery,
            location: searchLocation,
            experience: searchExp
        });

        setAppliedSidebarFilters(prev => ({
            ...prev,
            minExp: min,
            maxExp: max,
            locations: locationsArray
        }));
    };

    // --- THE APPLY FUNCTION ---
    const HandleApplyFilter = () => {
        setAppliedSidebarFilters({
            // ...appliedSidebarFilters,
            locations: selectedLocations,
            workType: selectedWorkType,
            company: SelectedCompany,
            education: SelectedEducation,
            postedDate: SelectedPostDate,
            industryType: SelectedIndustryType,
            minSalary: minVal,
            maxSalary: maxVal,
            minExp: minExp,
            maxExp: maxExp
        });
        setSearchLocation("");
        setSearchExp("");

        setAppliedFilters((prev) => ({
            ...prev,
            location: "",
            experience: ""
        }));
        sessionStorage.setItem("filters", JSON.stringify({
            selectedLocations,
            selectedWorkType,
            SelectedCompany,
            SelectedEducation,
            SelectedPostDate,
            SelectedIndustryType,
            minVal,
            maxVal,
            minExp,
            maxExp
        }));
    };

    const HandleClear = () => {
        sessionStorage.removeItem("filters");

        //  Reset search bar states
        setSearchQuery("");
        setSearchLocation("");
        setSearchExp("");

        //  Reset applied search filters
        setAppliedFilters({
            query: "",
            location: "",
            experience: ""
        });
        //  Reset visual checkboxes
        setSelectedLocations([]);
        setselectedWorkType([]);
        setSelectedCompany([]);
        setSelectedEducation([]);
        setSelectedPostDate([]);
        setSelectedIndustryType([]);
        setMinVal(0);
        setMaxVal(100);
        setMinExp(0);
        setMaxExp(30);

        // 2. Reset the actual filter logic immediately
        setAppliedSidebarFilters({
            locations: [],
            workType: [],
            postedBy: [],
            company: [],
            education: [],
            postedDate: [],
            industryType: [],
            minSalary: 0,
            maxSalary: 100,
            minExp: 0,
            maxExp: 30
        });
    }

    const handleSort = (type) => {
        setSortBy(type);
        setOpenSort(false);
    }

    const handleLocationViewMore = () => {
        if (LocationExpanded) { setLocationFilters(locationArray.slice(0, 5)); }
        else { setLocationFilters(locationArray) } setLocationExpanded(!LocationExpanded);
    }
    const handleCompanyViewMore = () => {
        if (TopCompanyExpanded) { setCompanyFilter(TopcompanyArray.slice(0, 5)); }
        else { setCompanyFilter(TopcompanyArray) } setTopCompanyExpanded(!TopCompanyExpanded);
    }
    const handleIndustryViewMore = () => {
        if (IndustryTypeExpanded) { setIndustryTypeFilter(IndustryType.slice(0, 5)); }
        else { setIndustryTypeFilter(IndustryType) } setIndustryTypeExpanded(!IndustryTypeExpanded);
    }

    // --- CHECKBOX HANDLERS (Update UI state only) ---
    const handleLocationChange = (event) => {
        const val = event.target.value.toLowerCase();
        setSelectedLocations((prev) => event.target.checked ? [...prev, val] : prev.filter((item) => item !== val));
    };
    const HandleWorkType = (event) => {
        const val = event.target.value;
        setselectedWorkType(prev => event.target.checked ? [...prev, val] : prev.filter(item => item !== val));
    };
    const HandleCompany = (event) => {
        const val = event.target.value;
        setSelectedCompany(prev => event.target.checked ? [...prev, val] : prev.filter(item => item !== val));
    };
    const HandleEducation = (event) => {
        const val = event.target.value;
        setSelectedEducation(prev => event.target.checked ? [...prev, val] : prev.filter(item => item !== val));
    };
    const HandlePostedDate = (event) => {
        const val = event.target.value;
        setSelectedPostDate(prev => event.target.checked ? [...prev, val] : prev.filter(item => item !== val));
    };
    const HandleIndustryType = (event) => {
        const val = event.target.value;
        setSelectedIndustryType(prev => event.target.checked ? [...prev, val] : prev.filter(item => item !== val));
    };

    // --- FILTER LOGIC (Listens to 'appliedSidebarFilters') ---
    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            const sf = appliedSidebarFilters;
            const af = appliedFilters;

            const matchesSearch = appliedFilters.query === "" ||
                job.job_title?.toLowerCase().includes(appliedFilters.query.toLowerCase()) ||
                job.company?.company_name?.toLowerCase().includes(appliedFilters.query.toLowerCase()) ||
                job.key_skills?.some(skill => skill.toLowerCase().includes(af.query.toLowerCase())) ||
                job.keySkills?.some(skill => skill.toLowerCase().includes(af.query.toLowerCase()))

            const jobExpStr = job.experience || "0";
            const jobExpNum = parseInt(jobExpStr.toString().match(/\d+/) || 0);

            const matchesExperience = jobExpNum >= sf.minExp && jobExpNum <= sf.maxExp;

            const jobLocations = Array.isArray(job.location)
                ? job.location.map(l => l.toLowerCase())
                : [job.location?.toLowerCase() || ""];

            const matchesCombinedLocation = (appliedFilters.location === "" && sf.locations.length === 0) ||
                jobLocations.some(loc => (appliedFilters.location && loc.includes(appliedFilters.location.toLowerCase())) || sf.locations.includes(loc));

            const jobWorkType = job.WorkType ? job.WorkType.toLowerCase() : (job.work_type ? job.work_type.toLowerCase() : 'unknown worktype');
            const matchesWorkType = sf.workType.length === 0 || sf.workType.includes(jobWorkType);

            const jobCompanyName = job.company?.company_name?.toLowerCase().trim() || "";
            const matchesCompany = sf.company.length === 0 ||
                sf.company.map(c => c.toLowerCase()).includes(jobCompanyName);

            const JobPosted = job.posted ? formatPostedDate(job.posted) : (job.posted_date ? formatPostedDate(job.posted_date) : "unknown posted");
            const matchesPostedDate = sf.postedDate.length === 0 || sf.postedDate.includes(JobPosted);

            // Fix: Check multiple possible education fields
            const jobEducation = job.education || job.EducationRequired || job.job_category || [];
            const educationArray = Array.isArray(jobEducation) ? jobEducation : [jobEducation];
            const matchesEducation = sf.education.length === 0 ||
                educationArray.some(edu => edu && sf.education.includes(edu.toLowerCase()));

            // Fix: Check multiple possible industry fields
            const jobIndustry = job.industry_type || job.industry || job.IndustryType || job.job_type || [];
            const industryArray = Array.isArray(jobIndustry) ? jobIndustry : [jobIndustry];
            const matchesIndustryType = sf.industryType.length === 0 ||
                industryArray.some(ind => ind && sf.industryType.includes(ind.toLowerCase()));

            const jobSalaryNum = job.salary ? parseFloat(job.salary) : 0;
            const isAboveMin = jobSalaryNum >= sf.minSalary;
            const isBelowMax = sf.maxSalary >= 100 ? true : jobSalaryNum <= sf.maxSalary;
            const matchesSalary = isAboveMin && isBelowMax;

            return matchesCombinedLocation && matchesWorkType && matchesCompany &&
                matchesEducation && matchesPostedDate && matchesExperience &&
                matchesIndustryType && matchesSalary && matchesSearch;
        });
    }, [jobs, appliedFilters, appliedSidebarFilters]);


    const sortedJobs = useMemo(() => {
        if (!sortBy) return filteredJobs;
        const jobsWithIndex = filteredJobs.map((job, index) => ({
            job, index
        }));
        if (sortBy === "date") {
            jobsWithIndex.sort((a, b) => new Date(b.job.posted_date) - new Date(a.job.posted_date));
        }
        if (sortBy === "ratings") {
            jobsWithIndex.sort((a, b) =>
                (b.job.company?.rating ?? 0) - (a.job.company?.rating ?? 0)
            );
        }

        return jobsWithIndex.map(item => item.job);
    }, [filteredJobs, sortBy]);
    console.log("Jobs:", jobs);
    console.log("Filtered:", filteredJobs);
    console.log("Sorted:", sortedJobs);

    return (
        <>
            <Header />
            <div className='jobs-tab-search-bar'>
                <SearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    searchLocation={searchLocation}
                    setSearchLocation={setSearchLocation}
                    searchExp={searchExp}
                    setSearchExp={setSearchExp}
                    onSearch={handleSearchButtonClick}
                />
            </div>
            <div className='search-result-title'>
                <h1> Jobs Based On Your Search</h1>
            </div>

            <div className='Mainsec-Search-Res'>
                <div className='Aside'>
                    <div className='aside-header'>
                        <p onClick={HandleApplyFilter} className='filter-applied' style={{ cursor: 'pointer' }}>Apply Filters</p>
                        <p onClick={HandleClear} className='filter-applied' style={{ cursor: 'pointer' }}>Clear Filters</p>
                    </div>

                    <div className='Search-Worktype-Container'>
                        <h4>Work Type</h4>
                        {workTypeFilters.map(([work, workc]) => {
                            const WorkType = work.charAt(0).toUpperCase() + work.slice(1);
                            return (
                                <div key={work}>
                                    <label htmlFor={`WorkType-${work}`} className="location-checkbox-label">
                                        <input
                                            type="checkbox"
                                            id={`WorkType-${work}`}
                                            name="WorkType"
                                            value={work}
                                            onChange={HandleWorkType}
                                            checked={selectedWorkType.includes(work)}
                                        />
                                        <span className="location-text">{WorkType}</span>
                                    </label>
                                </div>
                            );
                        })}
                    </div>

                    <div className='Search-Worktype-Container'>
                        <h4>Location</h4>
                        {locationFilters.map(([locationKey, count]) => {
                            const displayLocation = locationKey.charAt(0).toUpperCase() + locationKey.slice(1);
                            return (
                                <div key={locationKey}>
                                    <label htmlFor={`location-${locationKey}`} className="location-checkbox-label">
                                        <input
                                            type="checkbox"
                                            id={`location-${locationKey}`}
                                            name="location"
                                            value={locationKey.toLowerCase()}
                                            onChange={handleLocationChange}
                                            checked={selectedLocations.includes(locationKey.toLowerCase())}
                                        />
                                        <span className="location-text">{displayLocation}</span>
                                    </label>
                                </div>
                            );
                        })}
                        <div className='viewmore-cont'>
                            <button onClick={handleLocationViewMore} className='viewmore-btn'>{LocationExpanded ? 'View Less' : 'View More'}</button>
                        </div>
                    </div>

                    <div className='Search-Worktype-Container'>
                        <h4>Top Companies</h4>
                        {CompanyFilter.map(([com, count]) => {
                            const Company = com.charAt(0).toUpperCase() + com.slice(1);
                            return (
                                <div key={com}>
                                    <label htmlFor={`Company-${com}`} className="location-checkbox-label">
                                        <input
                                            type="checkbox"
                                            id={`Company-${com}`}
                                            name="Company"
                                            value={com}
                                            onChange={HandleCompany}
                                            checked={SelectedCompany.includes(com)}
                                        />
                                        <span className="location-text">{Company}</span>
                                    </label>
                                </div>
                            );
                        })}
                        <div className='viewmore-cont'>
                            <button onClick={handleCompanyViewMore} className='viewmore-btn'>{TopCompanyExpanded ? 'View Less' : 'View More'}</button>
                        </div>
                    </div>

                    <div className='Search-Worktype-Container'>
                        <h4>Education</h4>
                        {EducationFilter.map(([edu, count]) => {
                            const Education = edu.charAt(0).toUpperCase() + edu.slice(1);
                            return (
                                <div key={edu}>
                                    <label htmlFor={`Education-${edu}`} className="location-checkbox-label">
                                        <input
                                            type="checkbox"
                                            id={`Education-${edu}`}
                                            name="Education"
                                            value={edu}
                                            onChange={HandleEducation}
                                            checked={SelectedEducation.includes(edu)}
                                        />
                                        <span className="location-text">{Education} {count > 1 && `(${count})`}</span>
                                    </label>
                                </div>
                            );
                        })}
                    </div>

                    <div className='Search-Worktype-Container'>
                        <h4>Freshness</h4>
                        {PostedDateFilter.map(([Post, count]) => {
                            return (
                                <div key={Post}>
                                    <label htmlFor={`PostedDate-${Post}`} className="location-checkbox-label">
                                        <input
                                            type="checkbox"
                                            id={`PostedDate-${Post}`}
                                            name="PostedDate"
                                            value={Post}
                                            onChange={HandlePostedDate}
                                            checked={SelectedPostDate.includes(Post)}
                                        />
                                        <span className="location-text">{Post}</span>
                                    </label>
                                </div>
                            );
                        })}
                    </div>

                    <div className='Search-Worktype-Container'>
                        <h4>Industry Type</h4>
                        {IndustryTypeFilter.map(([int, count]) => {
                            const IndustryType = int.charAt(0).toUpperCase() + int.slice(1);
                            return (
                                <div key={int}>
                                    <label htmlFor={`IndustryType-${int}`} className="location-checkbox-label">
                                        <input
                                            type="checkbox"
                                            id={`IndustryType-${int}`}
                                            name="IndustryType"
                                            value={int}
                                            onChange={HandleIndustryType}
                                            checked={SelectedIndustryType.includes(int)}
                                        />
                                        <span className="location-text">{IndustryType}</span>
                                    </label>
                                </div>
                            );
                        })}
                        <div className='viewmore-cont'>
                            <button onClick={handleIndustryViewMore} className='viewmore-btn'>
                                {IndustryTypeExpanded ? 'View Less' : 'View More'}
                            </button>
                        </div>
                    </div>
                    <div className="filter-group">
                        <h3 className="section-title">Experience</h3>
                        <div className="range-container">
                            <div className="slider-base-track" />
                            <div className="slider-active-range"
                                style={{
                                    left: `${(minExp / 30) * 100}%`,
                                    width: `${((maxExp - minExp) / 30) * 100}%`
                                }}
                            />
                            <input type="range"
                                className="slider multi thumb-left"
                                min="0"
                                max="30"
                                value={minExp}
                                onChange={(e) => setMinExp(Math.min(Number(e.target.value), maxExp - 1))}
                            />
                            <input
                                className="slider multi thumb-right"
                                type="range"
                                min="0"
                                max="30"
                                value={maxExp}
                                onChange={(e) => setMaxExp(Math.max(Number(e.target.value), minExp + 1))}
                            />
                        </div>
                        <div className="salary-labels">
                            <span>Min: {minExp} yrs</span>
                            <span>Max: {maxExp} yrs</span>
                        </div>

                        <h3 className="section-title">Salary</h3>
                        {/* DOUBLE SLIDER (Salary) */}
                        <div className="range-container">
                            {/* Grey Background Track */}
                            <div className="slider-base-track" />

                            {/* Blue Active Track */}
                            <div
                                className="slider-active-range"
                                style={{
                                    left: `${getPercent(minVal)}%`,
                                    width: `${getPercent(maxVal) - getPercent(minVal)}%`
                                }}
                            />

                            {/* Invisible Inputs with Visible Thumbs */}
                            <input
                                className="slider multi thumb-left"
                                type="range"
                                min="0"
                                max="100"
                                value={minVal}
                                onChange={(e) => setMinVal(Math.min(Number(e.target.value), maxVal - 1))}
                            />
                            <input
                                className="slider multi thumb-right"
                                type="range"
                                min="0"
                                max="100"
                                value={maxVal}
                                onChange={(e) => setMaxVal(Math.max(Number(e.target.value), minVal + 1))}
                            />
                        </div>
                        <div className="salary-labels">
                            <span>Min: {minVal}LPA</span>
                            {maxVal >= 100 ? <span>Max: 1 CPA</span> : <span>Max: {maxVal} LPA</span>}
                        </div>
                    </div>
                </div>

                <div className='maincontent'>
                    <div className='SortbySearch'>
                        <h2 className='NoofJobsCont'>Showing {sortedJobs.length} Jobs</h2>
                        {sortedJobs.length !== 0 && <div className="sort-wrapper">
                            <button className='Sortbutton' onClick={() => setOpenSort(!openSort)}>
                                Sort by ▾
                            </button>
                            {openSort && (
                                <div className="sort-dropdown">
                                    <div onClick={() => handleSort("recommended")}>Recommended</div>
                                    <div onClick={() => handleSort("ratings")}>Ratings</div>
                                    <div onClick={() => handleSort("date")}>Date</div>
                                </div>
                            )}
                        </div>}
                    </div>

                    {sortedJobs.map((jb, index) =>
                        <div key={index} className='jobs-card'>
                            <SearchResultsCard job={jb} />
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    )
}