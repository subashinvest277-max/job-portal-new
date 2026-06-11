
import React from 'react'
import './EHeader.css'
import search from '../assets/icon_search.png'
import chat from '../assets/header_message.png'
import bell from '../assets/header_bell.png'
import belldot from '../assets/header_bell_dot.png'
import { Link, useLocation } from 'react-router-dom'
import { ENotification } from './ENotification'
import { useJobs } from '../JobContext'

export const EHeader = () => {

    // FIXED: Match the exact variable name from JobContext
    const { employershowNotification, setEmployerShowNotification, employerNotifications, chats = [] } = useJobs();
    const location = useLocation();

    const newNotificationsCount = employerNotifications.filter(n => !n.is_read).length;

    const unreadMessagesCount = chats.filter(
        chat => (chat.unread_count || 0) > 0
    ).length;

    const toggleNotification = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setEmployerShowNotification(!employershowNotification);
    };

    return (
        <header className="header">
            <Link
                to="/Job-portal/Employer/Dashboard"
                className="logo"
                state={{ fromFooter: true, targetTab: 'Dashboard' }}
            >
                <span className="logo-text">Job portal</span>
            </Link>

            {/* <div className='E-Header-search'>
                <img className="E-searchicon" src={search} alt="search icon" />
                <input className="input" type="text" placeholder='Search for jobs and applicants' />
            </div> */}

            <div className="auth-links">
                <div style={{ position: "relative" }}>
                    <Link to="/Job-portal/Employer/Chat">
                        <img
                            className={
                                location.pathname === "/Job-portal/Employer/Chat"
                                    ? 'jheader-icons-active'
                                    : 'jheader-icons'
                            }
                            src={chat}
                            width={40}
                            alt='Chat'
                            title='Messenger'
                        />
                    </Link>
                    {unreadMessagesCount > 0 && (
                        <span
                            style={{
                                position: "absolute",
                                top: "-5px",
                                right: "-5px",
                                background: "blue",
                                color: "white",
                                borderRadius: "50%",
                                minWidth: "20px",
                                height: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                fontWeight: "bold",
                                padding: "2px"
                            }}
                        >
                            {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                        </span>
                    )}
                </div>

                {/* Notification Bell Icon */}
                <div className="notification-wrapper" style={{ position: 'relative' }}>
                    <Link to="#" onClick={toggleNotification}>
                        <img
                            className={employershowNotification ? 'jheader-icons-active' : 'jheader-icons'}
                            src={newNotificationsCount > 0 ? belldot : bell}
                            width={40}
                            alt='Notifications'
                            title='Notifications'
                        />
                    </Link>

                    {/* Only show notification dropdown when employershowNotification is true */}
                    {employershowNotification && (
                        <ENotification
                            notifications={employerNotifications}
                            onClose={() => setEmployerShowNotification(false)}
                        />
                    )}
                </div>
            </div>
        </header>
    )
}