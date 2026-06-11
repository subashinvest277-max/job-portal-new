import React, { useState } from 'react';
import './Settings.css';
import { Header } from '../Components-LandingPage/Header';
import api from "../api/axios";
import { useEffect } from "react";



export const Settings = () => {
    const [tab, setTab] = useState('Account')
    const [settings, setSettings] = useState({
        account_type: "",
        email: "",
        phone: "",
        show_online_status: true,
        show_read_receipts: true,
    });

    const [online, setOnline] = useState("yes");
    const [read, setRead] = useState("yes");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get("/settings/");
                setSettings(res.data);
                setOnline(res.data.show_online_status ? "yes" : "no");
                setRead(res.data.show_read_receipts ? "yes" : "no");
            } catch (err) {
                console.error("Failed to load settings", err);
            }
        };

        fetchSettings();
    }, []);
    const updateSettings = async (payload) => {
        try {
            await api.patch("/settings/", payload);
        } catch (err) {
            console.error("Failed to save settings", err);
        }
    };




    return (


        <div className="app">
            <Header />
            <div style={{ marginTop: "120px" }} className="JSettings-header-box">
                <h2>{tab === 'Privacy' ? 'Privacy Policy' : tab + ' Settings'}</h2>
            </div>

            <div style={{ marginTop: "50px", padding: "45px" }} className="JSettings-main-layout">
                <aside className="JSettings-sidebar">
                    <button onClick={() => setTab('Account')} className={tab === 'Account' ? 'active' : ''}>Account Settings</button>
                    <button style={{ marginTop: "20px" }} onClick={() => setTab('Communication')} className={tab === 'Communication' ? 'active' : ''}>Communication Settings</button>
                    <button style={{ marginTop: "20px" }} onClick={() => setTab('Security')} className={tab === 'Security' ? 'active' : ''}>Security Settings</button>
                    <button style={{ marginTop: "20px" }} onClick={() => setTab('Privacy')} className={tab === 'Privacy' ? 'active' : ''}>Privacy Policy</button>
                </aside>


                <div className="JSettings-content">
                    {tab === 'Account' && (
                        <div className="JSettings-form">
                            <input
                                placeholder="Account Type"
                                value={settings.account_type || ""}
                                onChange={(e) => {
                                    setSettings({ ...settings, account_type: e.target.value });
                                    updateSettings({ account_type: e.target.value });
                                }}
                            />

                            <input
                                placeholder="Email Id"
                                value={settings.email || ""}
                                disabled
                            />

                            <input
                                placeholder="Phone Number"
                                value={settings.phone || ""}
                                onChange={(e) => {
                                    setSettings({ ...settings, phone: e.target.value });
                                    updateSettings({ phone: e.target.value });
                                }}
                            />


                        </div>
                    )}
                    {tab === 'Communication' && (
                        <div className="JSettings-list">
                            <div className="JSettings-row">
                                <span>Show Online Status</span>
                                <div className="JSettings-btn-group">
                                    <button
                                        className={online === 'yes' ? 'JSettings-active-btn' : 'JSettings-flat-btn'}
                                        onClick={() => {
                                            setOnline('yes');
                                            updateSettings({ show_online_status: true });
                                        }}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        className={online === 'no' ? 'JSettings-active-btn' : 'JSettings-flat-btn'}
                                        onClick={() => {
                                            setOnline('no');
                                            updateSettings({ show_online_status: false });
                                        }}
                                    >
                                        No
                                    </button>
                                </div>
                            </div>

                            <div className="JSettings-row">
                                <span>Show Read Receipts</span>
                                <div className="JSettings-btn-group">
                                    <button
                                        className={read === 'yes' ? 'JSettings-active-btn' : 'JSettings-flat-btn'}
                                        onClick={() => {
                                            setRead('yes');
                                            updateSettings({ show_read_receipts: true });
                                        }}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        className={read === 'no' ? 'JSettings-active-btn' : 'JSettings-flat-btn'}
                                        onClick={() => {
                                            setRead('no');
                                            updateSettings({ show_read_receipts: false });
                                        }}
                                    >
                                        No
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {tab === 'Security' && (
                        <div className="list">
                            <div className="box">Security Settings</div>
                            <div className="box">Account Protection</div>
                            <div className="box">Third Party apps</div>
                            <div className="box">Restrict Duplicate Applications</div>
                        </div>
                    )}
                    {tab === 'Privacy' && (
                        <div style={{ borderRadius: "10px" }} className="privacy">
                            <h2>Type Of Data Collected</h2>
                            <p>We collect different types of data depending on how you interact with us. This includes, for example,
                                when you're on our site, responding to our promotional materials, and using our services to help you find a job.
                                For example, we may collect your email address and resume information when you create your account.
                                As another example, we may collect information about your activity on our site, such as the searches you conduct and jobs you apply to.
                                For more information on the types of data we collect, check out the "Data collection and use" section of our Privacy Policy</p>
                            <hr className="Opportunities-separator" />
                            <h2 style={{ marginTop: "15px" }}>How my data is used and disclosed</h2>
                            <p>Job App uses data to help people get jobs. How we use and disclose your data also depends on how you use our site. We go into much greater detail in the "Data collection and use"
                                and "Who we share your data with" sections of our Privacy Policy explaining our use and disclosure of your data, but this can include to provide our services to you, to protect you when you use our site, and to measure, improve, and promote our services.</p>
                            <hr className="Opportunities-separator" />
                            <h2 style={{ marginTop: "15px" }}>Cookies</h2>
                            <p>Our Cookie Policy explains how we use cookies, web beacons and similar technologies, including some offered by third-parties, to collect data about you. For more information about our use of these technologies and your ability to opt out of them, please check out our Cookie Policy.</p>
                            <hr className="Opportunities-separator" />
                            <h2 style={{ marginTop: "15px" }}>Hide My CV</h2>
                            <p>You can also set your Indeed Resume to "not searchable" by visiting your resume privacy settings. For more information on what it means to have a "searchable" or "not searchable" Indeed Resume, please visit the "Data collection and use" section of our Privacy Policy.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>


    );
}