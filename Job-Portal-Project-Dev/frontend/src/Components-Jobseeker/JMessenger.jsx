import React, { useCallback, useState, useEffect, useRef } from 'react';
import '../Components-Employer/Chatbox.css';
import { useJobs } from '../JobContext';
import home from "../assets/home_icon.png";
import { Link } from 'react-router-dom';
import api from '../api/axios';

// **JMessenger**
export const JMessenger = () => {

    const {
        chats,
        setChats,
        currentUser,
        fetchMessages,
        fetchChats,
        currentUserId,
        isChatEnded,
        setNotificationsData,
        addEmployerNotification,
        sendMessage
    } = useJobs();

    const [input, setInput] = useState("");
    const [activeChatId, setActiveChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [activeUserName, setActiveUsername] = useState("");
    const [sending, setSending] = useState(false);
    const [pollingInterval, setPollingInterval] = useState(null);

    const scrollRef = useRef(null);
    const activeChatIdRef = useRef(null);

    // Debug: Log current user ID
    useEffect(() => {
        console.log("Current User ID:", currentUserId);
        console.log("Current User:", currentUser);
    }, [currentUserId, currentUser]);

    // Update ref when activeChatId changes
    useEffect(() => {
        activeChatIdRef.current = activeChatId;
    }, [activeChatId]);

    const markAsRead = async (messageId) => {
        try {
            const response = await api.post(`/chat/messages/${messageId}/read/`);
            return response.status === 200;
        } catch (error) {
            console.error('Error marking message as read:', error.response?.data || error);
            return false;
        }
    };

    // Mark multiple messages as read
    const markMultipleAsRead = async (messageIds) => {
        try {
            const promises = messageIds.map(id => markAsRead(id));
            await Promise.all(promises);
            return true;
        } catch (error) {
            console.error('Error marking messages as read:', error);
            return false;
        }
    };

    // Mark all unread messages in active chat as read
    const markAllMessagesAsReadInActiveChat = async (chatId, messageList) => {
        if (!chatId || !messageList || messageList.length === 0) return;

        // Find unread messages that are NOT from current user
        const unreadMessages = messageList.filter(msg =>
            !isMessageFromMe(msg) && !msg.is_read
        );

        if (unreadMessages.length === 0) return;

        // Mark all unread messages as read
        const success = await markMultipleAsRead(unreadMessages.map(m => m.id));

        if (success) {
            // Update local messages state
            setMessages(prev => prev.map(msg =>
                unreadMessages.some(um => um.id === msg.id)
                    ? { ...msg, is_read: true }
                    : msg
            ));

            // Update chats context to reset unread count for this chat
            setChats(prev => prev.map(chat =>
                chat.id === chatId
                    ? { ...chat, unread_count: 0 }
                    : chat
            ));
        }
    };

    // Active Chat
    const activeChat = chats?.find(chat => chat.id === activeChatId);

    // Employer Profile (the other participant)
    const otherParticipant = activeChat?.participants?.find(
        p => p.id !== parseInt(currentUserId)
    );

    const hasMessages = chats && chats.length > 0;

    // Fetch Messages
    const fetchMsg = async () => {
        try {
            if (!activeChat?.id) {
                return;
            }

            const msgs = await fetchMessages(activeChat.id);
            console.log("Fetched messages:", msgs);
            console.log("Current User ID for comparison:", currentUserId);

            // Debug each message
            msgs?.forEach(msg => {
                console.log("Message:", {
                    id: msg.id,
                    content: msg.content,
                    sender_id: msg.sender?.id || msg.sender_id,
                    receiver_id: msg.receiver?.id || msg.receiver_id,
                    is_from_me: isMessageFromMe(msg)
                });
            });

            setMessages(msgs || []);

            // Mark all messages as read when chat is opened/active
            await markAllMessagesAsReadInActiveChat(activeChat.id, msgs || []);

        } catch (err) {
            console.error("Failed to load messages:", err);
        }
    };

    useEffect(() => {
        if (!activeChat?.id) return;
        fetchMsg();
    }, [activeChatId]);

    // Poll for new messages
    useEffect(() => {
        if (!activeChatId) return;

        const interval = setInterval(async () => {
            try {
                const newMessages = await fetchMessages(activeChatId);

                if (newMessages && newMessages.length !== messages.length) {
                    setMessages(newMessages);

                    // If this chat is currently active, mark new messages as read immediately
                    if (activeChatIdRef.current === activeChatId) {
                        await markAllMessagesAsReadInActiveChat(activeChatId, newMessages);
                    } else {
                        // Update unread count in sidebar for inactive chats
                        const unreadCount = newMessages.filter(msg =>
                            !isMessageFromMe(msg) && !msg.is_read
                        ).length;

                        setChats(prev => prev.map(chat =>
                            chat.id === activeChatId
                                ? { ...chat, unread_count: unreadCount }
                                : chat
                        ));
                    }
                }
            } catch (err) {
                console.error("Error polling messages:", err);
            }
        }, 5000);

        setPollingInterval(interval);

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeChatId, messages.length]);

    // Refresh chats periodically to update unread counts in sidebar
    useEffect(() => {
        const refreshChats = setInterval(async () => {
            if (!document.hidden) {
                await fetchChats();
            }
        }, 10000);

        return () => clearInterval(refreshChats);
    }, [fetchChats]);

    // Auto Scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, sending]);

    // Send Message
    const handleSend = async (e) => {
        e.preventDefault();

        if (
            !input.trim() ||
            isChatEnded ||
            !activeChat ||
            !otherParticipant
        ) return;

        const messageText = input.trim();

        setInput("");
        setSending(true);

        try {
            if (!activeChat?.id) {
                setSending(false);
                return;
            }

            const res = await sendMessage(activeChat?.id, messageText);

            if (res.success) {
                const newMsg = res.data;
                console.log("Sent message:", newMsg);
                setMessages(prev => [...prev, newMsg]);
            } else {
                console.error("Failed to send message:", res.error);
                setInput(messageText);
                if (addEmployerNotification) {
                    addEmployerNotification("Failed to send message. Please try again.");
                }
            }
        } catch (error) {
            console.log(error);
            setInput(messageText);
            if (addEmployerNotification) {
                addEmployerNotification("Error sending message");
            }
        } finally {
            setSending(false);
        }
    };

    // Load Chats
    useEffect(() => {
        const loadChats = async () => {
            try {
                await fetchChats();
            } catch (err) {
                console.error("Failed to load chats:", err);
            }
        };

        loadChats();
    }, []);

    const getDateSeparator = (timestamp) => {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        if (messageDate.getTime() === today.getTime()) {
            return 'Today';
        } else if (messageDate.getTime() === yesterday.getTime()) {
            return 'Yesterday';
        } else {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString(undefined, options);
        }
    };

    const groupMessagesByDate = (messages) => {
        if (!messages || messages.length === 0) return [];

        const groups = [];
        let currentDate = null;

        const sortedMessages = [...messages].sort((a, b) => {
            const timeA = new Date(a.timestamp || a.created_at);
            const timeB = new Date(b.timestamp || b.created_at);
            return timeA - timeB;
        });

        sortedMessages.forEach((msg) => {
            const timestamp = msg.timestamp || msg.created_at;
            if (!timestamp) {
                groups.push({ type: 'message', data: msg });
                return;
            }
            const date = new Date(timestamp);
            const dateKey = date.toDateString();
            if (currentDate !== dateKey) {
                currentDate = dateKey;
                groups.push({ type: 'date', data: timestamp });
            }

            groups.push({ type: 'message', data: msg });
        });

        return groups;
    };

    const groupedMessages = groupMessagesByDate(messages);

    // Format timestamp for messages
    const formatWhatsAppTime = (timestamp) => {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    // Check if message is from current user (Jobseeker)
    const isMessageFromMe = (msg) => {
        // Try different possible structures of message object
        const senderId = msg.sender?.id || msg.sender_id || msg.senderId;
        const senderIdNum = parseInt(senderId);
        const currentUserIdNum = parseInt(currentUserId);

        console.log(`Comparing: sender=${senderIdNum}, currentUser=${currentUserIdNum}, result=${senderIdNum === currentUserIdNum}`);

        return senderIdNum === currentUserIdNum;
    };

    // Get correct unread count for a chat
    const getUnreadCount = (chat) => {
        // If chat is active, return 0
        if (activeChat?.id === chat.id) return 0;

        // Use unread_count from backend if available
        if (chat.unread_count !== undefined) return chat.unread_count;

        // Fallback: calculate from messages
        if (chat.messages) {
            return chat.messages.filter(msg =>
                !isMessageFromMe(msg) && !msg.is_read
            ).length;
        }

        return 0;
    };

    return (
        <div className="messages-container">

            {/* Sidebar */}
            <div className="E-chat-name">
                <div className="web-sidebar" style={{ height: "100vh" }}>

                    <Link to="/Job-portal/jobseeker/">
                        <img src={home} alt="home" style={{ height: "20px" }} />
                    </Link>

                    <div className="sidebar-header">
                        <h2 style={{ color: "#007bff", textAlign: "center" }}>
                            Messages
                        </h2>
                    </div>

                    {hasMessages && chats.map(chat => {
                        const unreadCount = getUnreadCount(chat);
                        const isActive = activeChat?.id === chat.id;
                        // Get the other participant's name
                        const otherUser = chat.participants?.find(p => p.id !== parseInt(currentUserId));
                        const displayName = otherUser?.username || chat.initiated_by?.username || 'Unknown User';

                        return (
                            <div
                                key={chat.id}
                                className={`sidebar-item ${isActive ? 'active' : ''}`}
                                style={{ cursor: 'pointer' }}
                                onClick={async () => {
                                    setActiveChatId(chat.id);
                                    const otherUser = chat.participants?.find(p => p.id !== parseInt(currentUserId));
                                    setActiveUsername(otherUser?.username || chat.initiated_by?.username || 'Unknown User');
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                    <strong>
                                        {displayName}
                                    </strong>
                                    {unreadCount > 0 && !isActive && (
                                        <span style={{
                                            background: "#007bff",
                                            color: "white",
                                            borderRadius: "50%",
                                            padding: "2px 8px",
                                            fontSize: "11px",
                                            fontWeight: "bold",
                                            minWidth: "20px",
                                            textAlign: "center"
                                        }}>
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Window */}
            <div className="web-main-chat">
                {hasMessages && activeChat ? (
                    <>
                        <header className="web-chat-header">
                            <strong>
                                {activeUserName || otherParticipant?.username || 'User'}
                            </strong>
                        </header>

                        <div className="web-chat-window" ref={scrollRef}>
                            {groupedMessages.length > 0 ? (
                                groupedMessages.map((item, index) => {
                                    if (item.type === 'date') {
                                        return (
                                            <div key={`date-${index}`} style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                                <div
                                                    style={{
                                                        backgroundColor: '#e9ecef',
                                                        padding: '4px 12px',
                                                        borderRadius: '12px',
                                                        width: 'max-content',
                                                        fontSize: '12px',
                                                        color: '#666'
                                                    }}
                                                    className="date-separator"
                                                >
                                                    {getDateSeparator(item.data)}
                                                </div>
                                            </div>
                                        );
                                    }

                                    const m = item.data;
                                    const isFromMe = isMessageFromMe(m);
                                    const timestamp = m.timestamp || m.created_at;
                                    const timeString = formatWhatsAppTime(timestamp);
                                    const messageContent = m.content || m.text;
                                    const isRead = m.is_read;

                                    return (
                                        <div
                                            key={m.id || index}
                                            className="web-msg-row"
                                            style={{
                                                display: "flex",
                                                justifyContent: isFromMe ? "flex-end" : "flex-start",
                                                marginBottom: "12px",
                                                width: "100%"
                                            }}
                                        >
                                            <div style={{
                                                maxWidth: "70%",
                                                minWidth: "60px",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: isFromMe ? "flex-end" : "flex-start"
                                            }}>
                                                <div
                                                    className={`web-bubble ${isFromMe ? 'web-me' : 'web-friend'}`}
                                                    style={{
                                                        wordWrap: "break-word",
                                                        wordBreak: "break-word",
                                                        whiteSpace: "pre-wrap",
                                                        maxWidth: "100%",
                                                        display: "inline-block",
                                                        padding: "10px 14px"
                                                    }}
                                                >
                                                    {messageContent}
                                                </div>
                                                <div style={{
                                                    fontSize: "10px",
                                                    marginTop: "4px",
                                                    color: "#888",
                                                    display: "flex",
                                                    gap: "4px",
                                                    alignItems: "center"
                                                }}>
                                                    <span>{timeString}</span>
                                                    {isFromMe && isRead && (
                                                        <span style={{ color: "#34b7f1" }}>✓✓</span>
                                                    )}
                                                    {isFromMe && !isRead && (
                                                        <span style={{ color: "#888" }}>✓</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                                    No messages yet. Start the conversation!
                                </div>
                            )}

                            {/* Sending indicator */}
                            {sending && (
                                <div style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    marginBottom: "12px",
                                    width: "100%"
                                }}>
                                    <div style={{
                                        maxWidth: "70%",
                                        padding: "10px 14px",
                                        borderRadius: "18px",
                                        background: "#e9ecef",
                                        color: "#666",
                                        opacity: 0.8
                                    }}>
                                        Sending...
                                    </div>
                                </div>
                            )}

                            {isChatEnded && (
                                <div className="chat-end-label">
                                    --- Conversation Ended ---
                                </div>
                            )}
                        </div>

                        <form className="web-input-bar" onSubmit={handleSend}>
                            <input
                                className="web-text-input"
                                value={input}
                                disabled={isChatEnded}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isChatEnded ? "Conversation ended" : "Reply to employer..."}
                            />
                            <button
                                type="submit"
                                className="web-send-button"
                                disabled={isChatEnded || !input.trim()}
                            >
                                SEND
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-messages-view"
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100vh"
                        }}>
                        <div className="no-msg-content"
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                            <h3>No Messages</h3>
                            <p>Waiting for the employer to start the conversation.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};