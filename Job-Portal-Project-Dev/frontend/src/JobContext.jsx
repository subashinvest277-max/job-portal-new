import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import api from "./api/axios";

const JobContext = createContext();

export const JobProvider = ({ children }) => {

    // ================= STATE =================
    const [jobs, setJobs] = useState([]);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [chats, setChats] = useState([]);
    const [notificationsData, setNotificationsData] = useState([]);
    const [showNotification, setShowNotification] = useState(false);

    // Jobseeker
    const [currentUser, setCurrentUser] = useState(null);
    const currentUserId = currentUser?.id || sessionStorage.getItem("user_id") || null;

    // Employer
    const [currentEmployer, setCurrentEmployer] = useState(null);
    const [companyProfile, setCompanyProfile] = useState(null);
    const [employerNotifications, setEmployerNotifications] = useState([]);

    // All jobseekers for employer
    const [Alluser, setAlluser] = useState([]);

    // UI States
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [employeractiveMenuId, setEmployerActiveMenuId] = useState(null);
    const [employershowNotification, setEmployerShowNotification] = useState(false);
    const [isChatEnded, setIsChatEnded] = useState(false);
    const [activeSidebarUsers, setActiveSidebarUsers] = useState([]);
    const [onlineStatus, setOnlineStatus] = useState("yes");

    // Cache for messages to prevent unnecessary updates
    const messagesCache = useRef(new Map());
    const isUpdatingMessages = useRef(false);

    // ================= HELPER FUNCTIONS =================
    const getFormattedDate = () => {
        return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    };

    const formatSavedJobs = (data) => {
        return data.map(item => ({
            ...item.job,
            savedDate: `Saved on ${new Date(item.saved_date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            })}`
        }));
    };

    const refreshAppliedJobs = useCallback(async () => {
        try {
            const appliedRes = await api.get("/jobs/applied/");
            setAppliedJobs(formatAppliedJobs(appliedRes.data));
        } catch (err) {
            console.error("Error refreshing applied jobs:", err);
        }
    }, []);

    const formatAppliedJobs = (jobs) => {
        // Filter out withdrawn applications
        const activeJobs = jobs.filter(job =>
            job.status?.toLowerCase() !== "withdrawn"
        );

        return activeJobs.map(job => ({
            ...job,
            appliedDate:
                job.appliedDate ||
                (job.applied_date
                    ? `Applied on ${new Date(job.applied_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })}`
                    : "")
        }));
    };

    // ================= NOTIFICATIONS =================
    const addNotification = (text) => {
        const newNotif = {
            id: Date.now(),
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: false
        };
        setNotificationsData(prev => [newNotif, ...prev]);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
    };

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await api.get("/notifications/");
            const transformedData = res.data.map(notification => ({
                id: notification.id,
                text: notification.message,
                isRead: notification.is_read,
                time: new Date(notification.created_at).toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }),
                targetId: notification.user
            }));

            const userType = sessionStorage.getItem("user_type");

            if (userType === "jobseeker") {
                setNotificationsData(transformedData);
            } else if (userType === "employer") {
                setEmployerNotifications(transformedData);
            }
        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    }, []);

    // ================= FETCH JOB DATA =================
    const fetchAllJobs = useCallback(async () => {
        try {
            const [jobsRes, savedRes, appliedRes] = await Promise.all([
                api.get("/jobs/all/"),
                api.get("/jobs/saved/"),
                api.get("/jobs/applied/")
            ]);

            setJobs(jobsRes.data.jobs || []);
            setSavedJobs(formatSavedJobs(savedRes.data));
            setAppliedJobs(formatAppliedJobs(appliedRes.data));

        } catch (err) {
            console.error("Jobs fetch error:", err);
            if (err.response?.status === 401) {
                sessionStorage.clear();
                window.location.href = "/";
            }
        }
        finally {
            setLoading(false);
        }
    }, []);

    const fetchEmployerJobs = useCallback(async () => {
        try {
            const res = await api.get("/jobs/my-jobs/");
            return res.data.jobs || [];
        } catch (err) {
            console.error(err);
            return [];
        }
    }, []);

    // ================= JOB ACTIONS =================
    const isJobSaved = (jobId) => {
        return savedJobs.some(item => item.id === jobId);
    };

    const isJobApplied = (jobId) => {
        return appliedJobs.some(item => {
            const id = item.job ? item.job.id : item.id;
            const status = item.status?.toLowerCase?.() || "";
            return Number(id) === Number(jobId) && status !== "withdrawn";
        });
    };

    const saveJob = async (jobId) => {
        try {
            await api.post("/jobs/save/", { job_id: jobId });
            await fetchAllJobs();
            addNotification("Job saved successfully!");
        } catch (err) {
            console.error(err);
        }
    };

    const unsaveJob = async (jobId) => {
        try {
            await api.delete(`/jobs/save/${jobId}/`);
            await fetchAllJobs();
            addNotification("Job removed from saved list!");
        } catch (err) {
            console.error(err);
        }
    };

    const toggleSaveJob = async (originalJob) => {
        if (isJobSaved(originalJob.id)) {
            await unsaveJob(originalJob.id);
        } else {
            await saveJob(originalJob.id);
        }
    };

    const applyForJob = async (jobId, formData) => {
        try {
            await api.post("/jobs/apply/", {
                job: jobId,
                ...formData
            });
            await fetchAllJobs();
            addNotification("Application submitted successfully!");
            return true;
        } catch (err) {
            if (err.response?.status === 409) return "already";
            console.error(err);
            throw err;
        }
    };

    // ================= EMPLOYER JOB ACTIONS =================
    const postJob = async (jobData) => {
        try {
            console.log('📤 Sending job data to PostAJob endpoint:', JSON.stringify(jobData, null, 2));

            const token = sessionStorage.getItem('access');
            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await api.post('/jobs/preview/', jobData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('✅ Job created as draft:', response.data);

            if (response.data.id) {
                try {
                    const publishResponse = await api.patch(`/jobs/publish/${response.data.id}/`,
                        { is_highlighted: jobData.is_highlighted ?? false },
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );
                    console.log('✅ Job published:', publishResponse.data);
                } catch (publishError) {
                    console.warn('Job created but publishing failed:', publishError);
                }
            }

            await fetchAllJobs();
            addNotification(`Job "${response.data.job_title}" posted successfully!`);
            return { success: true, data: response.data };
        } catch (error) {
            console.error("❌ Error posting job:", error);
            addNotification("Failed to post job", "error");
            return { success: false, error: error.message };
        }
    };

    const editJob = async (jobId, data) => {
        try {
            const response = await api.patch(`/jobs/update/${jobId}/`, data);
            await fetchAllJobs();
            addNotification("Job updated successfully!");
            return {
                success: true,
                data: response.data
            };
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const deleteJob = async (jobId) => {
        try {
            await api.delete(`/jobs/delete/${jobId}/`);
            await fetchAllJobs();
            addNotification("Job deleted successfully!");
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    // ================= OPTIMIZED CHAT FUNCTIONS =================
    const fetchChats = useCallback(async () => {
        try {
            const token = sessionStorage.getItem('access');
            const userType = sessionStorage.getItem('user_type');
            const currentUserId = parseInt(sessionStorage.getItem('user_id'), 10);

            const response = await api.get("chat/conversations/");

            const chatsWithMessages = response.data.map(chat => ({
                ...chat,
                messages: chat.messages || []
            }));

            // Only update if data has changed
            setChats(prevChats => {
                const prevStr = JSON.stringify(prevChats);
                const newStr = JSON.stringify(chatsWithMessages);
                if (prevStr === newStr) return prevChats;
                return chatsWithMessages;
            });

            return chatsWithMessages;
        } catch (err) {
            console.error("Error fetching chats:", err);
            throw err;
        }
    }, []);

    const startConversation = useCallback(async (userId, message) => {
        try {
            const jobseekerId = parseInt(userId, 10);
            const res = await api.post("/chat/employer/initiate/", {
                jobseeker_id: jobseekerId,
                message: message
            });

            addChatToSidebar(userId);
            await fetchChats();
            addNotification("Conversation started successfully");

            return res.data.conversation_id;
        } catch (err) {
            console.error("Error response:", err.response?.data);
            throw err;
        }
    }, [fetchChats]);

    const fetchMessages = useCallback(async (conversationId) => {
        try {
            // Check cache first
            const cacheKey = `messages_${conversationId}`;
            const cachedMessages = messagesCache.current.get(cacheKey);

            const response = await api.get(`chat/conversations/${conversationId}/messages/`);
            const newMessages = response.data;

            // Compare with cache to prevent unnecessary updates
            const cachedStr = cachedMessages ? JSON.stringify(cachedMessages) : '';
            const newStr = JSON.stringify(newMessages);

            if (cachedStr === newStr && cachedMessages) {
                return cachedMessages;
            }

            // Update cache
            messagesCache.current.set(cacheKey, newMessages);

            // Update chats state only if messages actually changed
            setChats(prev => {
                const chatIndex = prev.findIndex(c => c.id === conversationId);
                if (chatIndex === -1) return prev;

                const currentMessages = prev[chatIndex].messages;
                const currentStr = JSON.stringify(currentMessages);

                if (currentStr === newStr) return prev;

                const updatedChats = [...prev];
                updatedChats[chatIndex] = {
                    ...updatedChats[chatIndex],
                    messages: newMessages
                };
                return updatedChats;
            });

            return newMessages;
        } catch (err) {
            console.error("Error fetching messages:", err);
            throw err;
        }
    }, []);

    const sendMessage = useCallback(async (conversationId, content) => {
        try {
            const userId = parseInt(sessionStorage.getItem('user_id'), 10);

            if (!conversationId) {
                throw new Error("Conversation ID missing");
            }

            const conversation = chats.find(c => c.id === conversationId);
            let receiverId = null;

            if (conversation) {
                const receiver = conversation.participants?.find(p => p.id !== userId);
                receiverId = receiver?.id;
            }

            let response;
            if (!receiverId) {
                response = await api.post("chat/messages/send/", {
                    conversation_id: conversationId,
                    content: content
                });
            } else {
                response = await api.post("chat/messages/send/", {
                    receiver_id: receiverId,
                    content: content
                });
            }

            const newMessage = response.data;

            // Update cache
            const cacheKey = `messages_${conversationId}`;
            const cachedMessages = messagesCache.current.get(cacheKey) || [];
            messagesCache.current.set(cacheKey, [...cachedMessages, newMessage]);

            // Update chats state
            setChats(prev => prev.map(chat =>
                chat.id === conversationId
                    ? {
                        ...chat,
                        messages: [...(chat.messages || []), newMessage],
                        last_message: newMessage
                    }
                    : chat
            ));

            return { success: true, data: newMessage };
        } catch (err) {
            console.error("Error sending message:", err.response?.data || err);
            return { success: false, error: err.response?.data };
        }
    }, [chats]);

    const addChatToSidebar = (userId) => {
        if (!activeSidebarUsers.includes(parseInt(userId))) {
            setActiveSidebarUsers(prev => [...prev, parseInt(userId)]);
        }
    };

    // ================= EMPLOYER DATA FETCH =================
    // ================= EMPLOYER DATA FETCH =================
    const fetchEmployerData = useCallback(async () => {
        try {
            console.log("📡 Fetching employer data...");
            const employerRes = await api.get("profile/employer/");
            const employerData = employerRes.data;

            let companyData = null;
            try {
                const companyRes = await api.get("company/profile/");
                companyData = companyRes.data;
                console.log("✅ Company profile loaded");
            } catch (err) {
                console.log("No company profile found:", err.response?.status);
            }

            const employerJobs = await fetchEmployerJobs();
            console.log(`📋 Loaded ${employerJobs.length} jobs`);

            // let allJobseekers = [];
            // try {
            //     const jobseekersRes = await api.get("/jobseekers/", { timeout: 10000 });
            //     const allData = jobseekersRes.data;
            //     const jobseekersOnly = allData.filter(item => item.user?.user_type === "jobseeker");
            //     setAlluser(jobseekersOnly);
            //     console.log(`✅ Loaded ${jobseekersOnly.length} jobseekers`);
            //     allJobseekers = jobseekersOnly;
            // } catch (err) {
            //     console.error("Error fetching jobseekers:", err);
            //     setAlluser([]);
            // }

            const employer = {
                id: employerData.user?.id,
                companyId: companyData?.id || "",
                company: companyData?.company_name || "",
                hrName: employerData.full_name || employerData.user?.username || "Employer",
                email: employerData.user?.email || "",
                role: employerData.user?.user_type || "",
                companyLogo: companyData?.company_logo || "",
                companyOverview: companyData?.about || "",
                jobPosted: employerJobs || [],
                messages: [],
            };

            setCurrentEmployer(employer);
            setCompanyProfile(companyData);

            console.log("✅ Employer data set:", employer.hrName);
            return employer;
        } catch (err) {
            console.error("Employer fetch error:", err);
            throw err;
        }
    }, [fetchEmployerJobs]);

    // ================= REFRESH EMPLOYER DATA =================
    const refreshEmployerData = useCallback(async () => {
        const userType = sessionStorage.getItem("user_type");

        if (userType !== "employer") {
            console.log("Not employer, skipping refresh");
            return;
        }

        try {
            console.log("🔄 Refreshing employer data only...");
            await fetchEmployerData();
            await fetchAllJobs();
            await fetchNotifications();
            await fetchChats();
            console.log("✅ Employer data refreshed successfully");
        } catch (err) {
            console.error("Refresh error:", err);
        }
    }, [fetchEmployerData, fetchAllJobs, fetchNotifications, fetchChats]);

    // ================= JOB STATS =================
    const getJobStats = (jobId) => {
        const jobExists = currentEmployer?.jobPosted?.some(j => j.id === jobId);
        if (!jobExists) return { total: 0, new: 0, screening: 0, interview: 0, rejected: 0 };

        const jobApplicants = Alluser.filter(user =>
            user.appliedJobs?.some(aj => aj.id === jobId)
        );

        const getCountByStatus = (statusList) => {
            return jobApplicants.filter(user => {
                const jobInfo = user.appliedJobs.find(aj => aj.id === jobId);
                return statusList.includes(jobInfo?.status);
            }).length;
        };

        return {
            total: jobApplicants.length,
            new: getCountByStatus(["applied"]),
            screening: getCountByStatus(["resume_screening", "recruiter_review"]),
            interview: getCountByStatus(["shortlisted", "interview_called"]),
            rejected: getCountByStatus(["rejected"])
        };
    };

    // ================= INITIAL LOAD =================
    useEffect(() => {
        const token = sessionStorage.getItem("access");
        const userType = sessionStorage.getItem("user_type");

        if (!token) {
            setLoading(false);
            return;
        }

        const load = async () => {
            try {
                console.log("🚀 Initial data load starting...");
                setLoading(true);

                await fetchAllJobs();
                await fetchChats();
                await fetchNotifications();

                if (userType === "jobseeker") {
                    const res = await api.get("profile/jobseeker/");
                    setCurrentUser(res.data);
                    console.log("✅ Jobseeker data loaded");
                }

                if (userType === "employer") {
                    await fetchEmployerData();
                    console.log("✅ Employer data loaded");
                }

                console.log("✅ Initial data load complete");
            } catch (err) {
                console.error("Initial load error:", err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    useEffect(() => {
        const token = sessionStorage.getItem("access");

        if (!token) return;

        const interval = setInterval(() => {
            fetchChats();
        }, 3000);

        return () => clearInterval(interval);
    }, [fetchChats]);

    // =============================Admin support hub==========================
    // ================Admin tickets=================
    const [raisedTickets, setRaisedTickets] = useState([]);
    const [ticketsLoading, setTicketsLoading] = useState(false);

    const fetchTickets = useCallback(async () => {
        try {
            setTicketsLoading(true);
            const response = await api.get('/admin/tickets/');
            console.log("Tickets API Response:", response.data);

            if (response.data.status == true) {
                setRaisedTickets(response.data.data);
                console.log(`Loaded ${response.data.data.length} tickets`);
                return response.data.data;
            } else {
                setRaisedTickets([]);
                return [];
            }
        } catch (error) {
            console.error(" Error fetching tickets:", error);
            alert(error)
            setRaisedTickets([])
            return [];
        } finally {
            setTicketsLoading(false)
        }
    }, [])


    // ================Admin Enquiries=================
    const [enquiries, setEnquiries] = useState([]);
    const [enquiriesLoading, setEnquiriesLoading] = useState(false);

    const fetchEnquiries = useCallback(async () => {
        try {
            setEnquiriesLoading(true);
            console.log("📡 Fetching enquiries from backend...");

            const response = await api.get('/contact/list/');
            console.log("Enquiries API Response:", response.data);

            // Check if response has data (adjust based on your API response structure)
            if (response.data && Array.isArray(response.data)) {
                setEnquiries(response.data);
                console.log(`✅ Loaded ${response.data.length} enquiries`);
                return response.data;
            } else if (response.data && response.data.status === true) {
                setEnquiries(response.data.data || []);
                console.log(`✅ Loaded ${response.data.data?.length || 0} enquiries`);
                return response.data.data || [];
            } else {
                setEnquiries([]);
                return [];
            }
        } catch (error) {
            console.error("❌ Error fetching enquiries:", error);
            setEnquiries([]);
            return [];
        } finally {
            setEnquiriesLoading(false);
        }
    }, []);




    // ================Admin Reports/Escalation=================
    const [reports, setReports] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(false);

    const fetchReports = useCallback(async () => {
        try {
            setReportsLoading(true);
            console.log("📡 Fetching reports/complaints from backend...");

            const response = await api.get('/admin/complaints/');
            console.log("Reports API Response:", response.data);

            // Check response structure - your API returns array directly
            if (Array.isArray(response.data)) {
                setReports(response.data);
                console.log(`✅ Loaded ${response.data.length} reports`);
                return response.data;
            } else if (response.data && response.data.status === true) {
                setReports(response.data.data || []);
                console.log(`✅ Loaded ${response.data.data?.length || 0} reports`);
                return response.data.data || [];
            } else if (response.data && response.data.results) {
                setReports(response.data.results);
                console.log(`✅ Loaded ${response.data.results.length} reports`);
                return response.data.results;
            } else {
                setReports([]);
                return [];
            }
        } catch (error) {
            console.error("❌ Error fetching reports:", error);
            setReports([]);
            return [];
        } finally {
            setReportsLoading(false);
        }
    }, []);

    // ================= PROVIDER =================
    return (
        <JobContext.Provider value={{
            // Jobs
            jobs, setJobs,
            appliedJobs, setAppliedJobs,
            refreshAppliedJobs,
            savedJobs, setSavedJobs,
            loading, setLoading,

            // Jobseeker
            currentUser, setCurrentUser,
            currentUserId,
            isJobSaved,
            isJobApplied,
            saveJob,
            unsaveJob,
            toggleSaveJob,
            applyForJob,

            // Employer
            currentEmployer, setCurrentEmployer,
            companyProfile, setCompanyProfile,
            employerNotifications, setEmployerNotifications,
            fetchEmployerJobs,
            postJob,
            editJob,
            deleteJob,
            getJobStats,
            refreshEmployerData,

            // All users
            Alluser, setAlluser,

            // UI States
            activeMenuId, setActiveMenuId,
            employeractiveMenuId, setEmployerActiveMenuId,
            employershowNotification, setEmployerShowNotification,
            isChatEnded, setIsChatEnded,
            activeSidebarUsers, setActiveSidebarUsers,
            onlineStatus, setOnlineStatus,
            addChatToSidebar,

            // Chat
            chats, setChats,
            fetchChats,
            startConversation,
            fetchMessages,
            sendMessage,

            // Notifications
            notificationsData, setNotificationsData,
            showNotification, setShowNotification,
            addNotification,
            fetchNotifications,

            // Utils
            fetchAllJobs,
            getFormattedDate,
            //admin tickets
            raisedTickets,
            setRaisedTickets,
            ticketsLoading,
            fetchTickets,

            // contact us
            enquiries,
            setEnquiries,
            enquiriesLoading,
            fetchEnquiries,

            // Admin reports (Escalation)
            reports,
            setReports,
            reportsLoading,
            fetchReports,


        }}>
            {children}
        </JobContext.Provider>
    );
};

export const useJobs = () => useContext(JobContext);