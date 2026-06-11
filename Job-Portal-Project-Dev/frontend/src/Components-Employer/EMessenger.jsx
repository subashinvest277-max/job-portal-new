import React, { useCallback, useState, useEffect, useRef } from 'react';
import './Chatbox.css';
import { useJobs } from '../JobContext';
import home from "../assets/home_icon.png";
import { Link } from 'react-router-dom';
import api from '../api/axios';

export const EMessenger = () => {
  const context = useJobs();

  // Safety check
  if (!context) {
    console.error("JobContext is not available");
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading chat...</div>;
  }

  const {
    chats,
    setChats,
    Alluser,
    currentEmployer,
    addNotification,
    activeSidebarUsers,
    setActiveSidebarUsers,
    fetchMessages,
    sendMessage,
    fetchChats,
    startConversation,
    currentUserId,
    isChatEnded,
    setIsChatEnded
  } = context;

  const [input, setInput] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);
  const pollingRef = useRef(null);
  const isComponentMounted = useRef(true);

  // Cleanup
  useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const markAsRead = async (messageId) => {
    try {
      await api.post(`/chat/messages/${messageId}/read/`);
      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  };

  const markMultipleAsRead = async (messageIds) => {
    if (!messageIds || messageIds.length === 0) return true;
    try {
      const promises = messageIds.map(id => markAsRead(id));
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  };

  const getConversationForUser = useCallback((userId) => {
    if (!userId) return null;
    const conversation = chats.find(chat =>
      chat.participants?.some(p => p.id === parseInt(userId))
    );
    return conversation;
  }, [chats]);

  const activeConversation = getConversationForUser(selectedUserId);
  const activeUser = Alluser?.find(u => parseInt(u.user?.id) === selectedUserId);

  const sidebarDisplayUsers = Alluser?.filter(user => {
    const hasConversation = chats.some(chat =>
      chat.participants?.some(p => p.id === parseInt(user.user?.id))
    );
    return hasConversation || activeSidebarUsers?.includes(parseInt(user.user?.id));
  }) || [];

  // Fetch messages when conversation is selected
  const fetchMsg = useCallback(async () => {
    if (!activeConversation?.id) return;
    try {
      const msgs = await fetchMessages(activeConversation.id);
      if (isComponentMounted.current) {
        setMessages(msgs || []);
        // Mark unread messages as read
        const unreadMessages = (msgs || []).filter(msg => {
          const receiverId = msg.receiver?.id || msg.receiver_id;
          return receiverId === parseInt(currentUserId) && !msg.is_read;
        });
        if (unreadMessages.length > 0) {
          await markMultipleAsRead(unreadMessages.map(m => m.id));
          setChats(prev => prev.map(chat =>
            chat.id === activeConversation.id
              ? { ...chat, unread_count: 0 }
              : chat
          ));
        }
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, [activeConversation?.id, fetchMessages, markMultipleAsRead, currentUserId, setChats]);

  useEffect(() => {
    if (selectedUserId && activeConversation?.id) {
      fetchMsg();
    }
  }, [selectedUserId, activeConversation?.id, fetchMsg]);

  // Load chats on mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        await fetchChats();
      } catch (err) {
        console.error("Failed to load chats:", err);
      }
    };
    loadChats();
  }, [fetchChats]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedUserId) return;

    const messageText = input.trim();
    setInput("");
    setSending(true);

    if (activeConversation?.id) {
      try {
        const result = await sendMessage(activeConversation.id, messageText);
        if (result.success && isComponentMounted.current) {
          setMessages(prev => [...prev, result.data]);
        } else {
          setInput(messageText);
        }
      } catch (err) {
        console.error("Error sending message:", err);
        setInput(messageText);
      } finally {
        setSending(false);
      }
    } else {
      setSending(false);
      setInput(messageText);
    }
  };

  const handleStartConversation = async (initialMessage = "") => {
    if (!selectedUserId) return;
    setLoading(true);
    try {
      const conversationId = await startConversation(selectedUserId, initialMessage);
      if (conversationId) {
        setActiveSidebarUsers(prev =>
          prev.includes(selectedUserId) ? prev : [...prev, selectedUserId]
        );
        await fetchChats();
        if (initialMessage) {
          setTimeout(async () => {
            await fetchMessages(conversationId);
          }, 500);
        }
      }
    } catch (err) {
      console.error("Error starting conversation:", err);
    } finally {
      setLoading(false);
    }
  };

  const isMessageFromMe = useCallback((msg) => {
    const senderId = msg.sender?.id || msg.sender_id;
    return parseInt(senderId) === parseInt(currentUserId);
  }, [currentUserId]);

  const formatWhatsAppTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const getDateSeparator = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (messageDate.getTime() === today.getTime()) return 'Today';
    if (messageDate.getTime() === yesterday.getTime()) return 'Yesterday';
    return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const groupMessagesByDate = (messagesList) => {
    if (!messagesList || messagesList.length === 0) return [];
    const groups = [];
    let currentDate = null;
    const sortedMessages = [...messagesList].sort((a, b) => {
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

  return (
    <div className="messages-container">
      <div className="EChat-Mainsec">
        <div className="E-chat-name">
          <div className="web-sidebar">
            <div className="sidebar-header">
              <Link to="/Job-portal/Employer/Dashboard">
                <img src={home} style={{ height: "20px" }} alt="home" />
              </Link>
              <h3 style={{ color: "#007bff", textAlign: "center" }}>Active Chats</h3>
            </div>
            {sidebarDisplayUsers.length > 0 ? (
              sidebarDisplayUsers.map(user => {
                const userConversation = getConversationForUser(parseInt(user.user?.id));
                const isActive = selectedUserId === parseInt(user.user?.id);
                const unreadCount = userConversation?.unread_count || 0;
                const displayName = user.profile?.fullName || user.full_name || 'Unknown';

                return (
                  <div
                    key={user.id}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedUserId(parseInt(user.user?.id))}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <strong>{displayName}</strong>
                        <p style={{ fontSize: '11px', margin: 0, color: '#666' }}>
                          {user.currentDetails?.jobTitle || user.current_job_title || ''}
                        </p>
                      </div>
                      {unreadCount > 0 && !isActive && (
                        <span style={{
                          background: "#007bff",
                          color: "white",
                          borderRadius: "50%",
                          padding: "2px 8px",
                          fontSize: "11px",
                          fontWeight: "bold"
                        }}>
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '20px', color: '#888', textAlign: 'center' }}>
                No active chats
                <p style={{ fontSize: '12px', marginTop: '10px' }}>
                  Click on a job seeker profile to start a conversation
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="web-main-chat">
          {selectedUserId ? (
            <>
              <header className="web-chat-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{activeUser?.profile?.fullName || activeUser?.full_name || 'Job Seeker'}</strong>
                {!activeConversation && (
                  <button
                    onClick={() => handleStartConversation(input)}
                    disabled={loading}
                    className="E-Start-Convo-Button"
                  >
                    {loading ? "Starting..." : "START CHAT"}
                  </button>
                )}
              </header>

              <div className="web-chat-window" ref={scrollRef}>
                {groupedMessages.length > 0 ? (
                  groupedMessages.map((item, index) => {
                    if (item.type === 'date') {
                      return (
                        <div key={`date-${index}`} style={{ display: 'flex', justifyContent: 'center', margin: '20px 0', width: '100%' }}>
                          <span style={{ backgroundColor: '#e9ecef', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', color: '#666' }}>
                            {getDateSeparator(item.data)}
                          </span>
                        </div>
                      );
                    }
                    const msg = item.data;
                    const isFromMe = isMessageFromMe(msg);
                    const timestamp = msg.timestamp || msg.created_at;
                    const timeString = formatWhatsAppTime(timestamp);
                    const messageContent = msg.content || msg.text;
                    const isRead = msg.is_read;

                    return (
                      <div
                        key={msg.id || index}
                        className="web-msg-row"
                        style={{ display: "flex", justifyContent: isFromMe ? "flex-end" : "flex-start", marginBottom: "12px", width: "100%" }}
                      >
                        <div style={{ maxWidth: "70%", minWidth: "60px", display: "flex", flexDirection: "column", alignItems: isFromMe ? "flex-end" : "flex-start" }}>
                          <div className={`web-bubble ${isFromMe ? 'web-me' : 'web-friend'}`} style={{ wordWrap: "break-word", wordBreak: "break-word", whiteSpace: "pre-wrap", maxWidth: "100%", display: "inline-block", padding: "10px 14px" }}>
                            {messageContent}
                          </div>
                          <div style={{ fontSize: "10px", marginTop: "4px", color: "#888", display: "flex", gap: "4px", alignItems: "center" }}>
                            <span>{timeString}</span>
                            {isFromMe && isRead && <span style={{ color: "#34b7f1" }}>✓✓</span>}
                            {isFromMe && !isRead && <span style={{ color: "#888" }}>✓</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', color: '#888', marginTop: '50px', fontSize: '14px' }}>
                    {activeConversation ? "No messages yet" : "Start a conversation to begin messaging"}
                  </div>
                )}
                {sending && (
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px", width: "100%" }}>
                    <div style={{ maxWidth: "70%", padding: "10px 14px", borderRadius: "18px", background: "#e9ecef", color: "#666", opacity: 0.8 }}>Sending...</div>
                  </div>
                )}
              </div>

              <form className="web-input-bar" onSubmit={handleSend}>
                <input
                  className="web-text-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                />
                <button type="submit" className="web-send-button" disabled={!input.trim()}>SEND</button>
              </form>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#888', flexDirection: 'column' }}>
              <h3>Chat Section</h3>
              <p>Select a job seeker from the sidebar to start a conversation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};