import React, { useState, useEffect } from 'react'
import UsermanageSet from '../assets/AdminAssets/UserManageSetting.png'
import JobManageSetting from '../assets/AdminAssets/JobManageSetting.png'
import ApplicationSet from '../assets/AdminAssets/ApplicationSet.png'
import CompanySetting from '../assets/AdminAssets/CompanySetting.png'
import ReportsandAnalytics from '../assets/AdminAssets/Reports and Analytics.png'
import GeneralSetting from '../assets/AdminAssets/GeneralSetting.png'
import EmailNotif from '../assets/AdminAssets/EmailNotif.png'
import InAppNotify from '../assets/AdminAssets/InAppNotify.png'
import SmsNotify from '../assets/AdminAssets/SmsNotify.png'
import PushNotify from '../assets/AdminAssets/PushNotify.png'
import Clock from '../assets/AdminAssets/Clock.png'
import api from '../api/axios/'

export const AdminNotificationSettings = () => {

  const notificationTypes = [
    { id: 'user_mgmt', title: 'User Management', description: 'New user signups, role changes, user updates and deactivations', iconClass: UsermanageSet },
    { id: 'job_mgmt', title: 'Job Management', description: 'New jobs, job updates, expirations and approval requests', iconClass: JobManageSetting },
    { id: 'apps', title: 'Applications', description: 'New applications, Application update and status changes', iconClass: ApplicationSet },
    { id: 'companies', title: 'Companies', description: 'New Company registration and company updates', iconClass: CompanySetting },
    { id: 'reports', title: 'Reports & Analytics', description: 'Daily/weekly reports and important analytics update', iconClass: ReportsandAnalytics },
    { id: 'general', title: 'General Updates', description: 'Product updates, new features and announcement', iconClass: GeneralSetting }
  ];

  const mainChannels = ['Email', 'In-App', 'SMS', 'Push'];

  const quickChannels = [
    { id: 'email_notif', title: 'Email Notifications', description: 'Receive notification via email', iconClass: EmailNotif },
    { id: 'inapp_notif', title: 'In-App Notification', description: 'Receive notification in admin panel', iconClass: InAppNotify },
    { id: 'sms_notif', title: 'SMS Notification', description: 'Receive important alerts via SMS', iconClass: SmsNotify },
    { id: 'push_notif', title: 'Push Notification', description: 'Receive push notification in browser', iconClass: PushNotify }
  ];

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // ── State ────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [startTime, setStartTime] = useState("22:00");
  const [endTime, setEndTime] = useState("07:00");
  const [activeDays, setActiveDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  const [tablePreferences, setTablePreferences] = useState(
    notificationTypes.reduce((acc, type) => {
      acc[type.id] = mainChannels.reduce((chAcc, channel) => {
        chAcc[channel] = false;
        return chAcc;
      }, {});
      return acc;
    }, {})
  );

  const [quickSetup, setQuickSetup] = useState(
    quickChannels.reduce((acc, channel) => {
      acc[channel.id] = false;
      return acc;
    }, {})
  );

  // ── Fetch on mount ────────────────────────────────────────
  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prefsRes, quietRes, channelsRes] = await Promise.all([
        api.get('notification-preferences/'),
        api.get('quiet-hours/'),
        api.get('notification-channels/'),
      ]);

      // ── Table preferences ─────────────────────────────────
      // Backend returns: { table_preferences: { user_mgmt: { Email, "In-App", SMS, Push }, ... } }
      const backendPrefs = prefsRes.data?.table_preferences || {};
      const mapped = notificationTypes.reduce((acc, type) => {
        const fromBackend = backendPrefs[type.id] || {};
        acc[type.id] = {
          Email: fromBackend['Email'] ?? false,
          'In-App': fromBackend['In-App'] ?? false,
          SMS: fromBackend['SMS'] ?? false,
          Push: fromBackend['Push'] ?? false,
        };
        return acc;
      }, {});
      setTablePreferences(mapped);

      // ── Quiet hours ───────────────────────────────────────
      const qh = quietRes.data?.quiet_hours || {};
      if (qh.start_time) setStartTime(qh.start_time.slice(0, 5));
      if (qh.end_time) setEndTime(qh.end_time.slice(0, 5));
      if (qh.timezone) setTimezone(qh.timezone);
      if (qh.active_days) setActiveDays(qh.active_days);

      // ── Channel settings ──────────────────────────────────
      // Backend returns: { quick_setup: { email_notif, inapp_notif, sms_notif, push_notif } }
      const qs = channelsRes.data?.quick_setup || {};
      setQuickSetup({
        email_notif: qs.email_notif ?? false,
        inapp_notif: qs.inapp_notif ?? false,
        sms_notif: qs.sms_notif ?? false,
        push_notif: qs.push_notif ?? false,
      });

    } catch (err) {
      console.error('Error fetching notification settings:', err);
      setError('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await Promise.all([
        // 1. Notification preferences (table)
        api.patch('notification-preferences/update/', {
          table_preferences: tablePreferences
        }),

        // 2. Quiet hours
        api.patch('quiet-hours/update/', {
          quiet_hours: {
            start_time: startTime,
            end_time: endTime,
            timezone: timezone,
            active_days: activeDays,
          }
        }),

        // 3. Notification channel settings
        api.patch('notification-channels/update/', {
          quick_setup: quickSetup
        }),
      ]);

      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving notification settings:', err);
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to save settings.';
      setError(msg);
      alert(`Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Handlers ──────────────────────────────────────────────
  const toggleDay = (day) => {
    setActiveDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // const handleTableChange = (typeId, channelName) => {
  //   setTablePreferences(prev => ({
  //     ...prev,
  //     [typeId]: {
  //       ...prev[typeId],
  //       [channelName]: !prev[typeId][channelName]
  //     }
  //   }));
  // };


  // added this on  29-05-26
  const handleTableChange = (typeId, channelName) => {
    // Add this if condition at the very beginning
    if (channelName === 'SMS' || channelName === 'Push') {
      return;
    }

    setTablePreferences(prev => ({
      ...prev,
      [typeId]: {
        ...prev[typeId],
        [channelName]: !prev[typeId][channelName]
      }
    }));
  };
  // const handleQuickChange = (channelId) => {
  //   setQuickSetup(prev => ({
  //     ...prev,
  //     [channelId]: !prev[channelId]
  //   }));
  // };
  

    // added this on  29-05-26

  const handleQuickChange = (channelId) => {
    // Disable SMS and Push toggling
    if (channelId === 'sms_notif' || channelId === 'push_notif') {
      return;
    }

    setQuickSetup(prev => ({
      ...prev,
      [channelId]: !prev[channelId]
    }));
  };

  // ── Timezone display helper ───────────────────────────────
  // Backend stores "Asia/Kolkata" but the select shows "(UTC +05:30) Asia/Kolkata"
  const timezoneOptions = [
    { value: 'Asia/Kolkata', label: '(UTC +05:30) Asia/Kolkata' },
    { value: 'America/Los_Angeles', label: '(UTC -08:00) America/Los_Angeles' },
    { value: 'UTC', label: '(UTC +00:00) UTC' },
    { value: 'Europe/London', label: '(UTC +01:00) Europe/London' },
    { value: 'Europe/Berlin', label: '(UTC +02:00) Europe/Berlin' },
  ];

  // ── Render ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="Adm-Not-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <p>Loading notification settings...</p>
      </div>
    );
  }

  return (
    <div className="Adm-Not-container">
      <header className="Adm-Not-header">
        <div className="Adm-Not-header-text">
          <h1 className="Adm-Not-title">Notification preferences</h1>
          <p className="Adm-Not-subtitle">Choose what notification you want to receive and how.</p>
        </div>
        <button
          className="Adm-Not-save-btn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </header>

      {error && (
        <div style={{ color: 'red', marginBottom: 12, padding: '8px 12px', background: '#fff0f0', borderRadius: 6 }}>
          {error}
        </div>
      )}

      <div className="Adm-Not-main-content">
        {/* ── Notification preferences table ─────────────── */}
        <div className="Adm-Not-table-section">
          <table className="Adm-Not-table">
            <thead>
              <tr>
                <th className="Adm-Not-th-type">Notification type</th>
                {mainChannels.map(channel => (
                  <th key={channel} className="Adm-Not-th-channel">{channel}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notificationTypes.map(type => (
                <tr key={type.id} className="Adm-Not-row">
                  <td className="Adm-Not-td-type">
                    <div style={{ display: "flex", alignItems: "center" }} className="Adm-Not-type-info">
                      <img src={type.iconClass} width={30} height={30} alt="" />
                      <div>
                        <div className="Adm-Not-item-title">{type.title}</div>
                        <div className="Adm-Not-item-desc">{type.description}</div>
                      </div>
                    </div>
                  </td>
                  {/* {mainChannels.map(channel => (
                    <td key={channel} className="Adm-Not-td-switch">
                      <label className="Adm-Not-switch">
                        <input
                          type="checkbox"
                          checked={tablePreferences[type.id]?.[channel] ?? false}
                          onChange={() => handleTableChange(type.id, channel)}
                        />
                        <span className="Adm-Not-slider"></span>
                      </label>
                    </td>
                  ))} */}


                  {mainChannels.map(channel => {
                    // Add this line to check if disabled
                    const isDisabled = channel === 'SMS' || channel === 'Push';

                    return (
                      <td key={channel} className="Adm-Not-td-switch">
                        {/* Add span with title for tooltip */}
                        <span title={isDisabled ? "Under Implementation" : ""}>
                          <label className="Adm-Not-switch">
                            <input
                              type="checkbox"
                              checked={tablePreferences[type.id]?.[channel] ?? false}
                              onChange={() => handleTableChange(type.id, channel)}
                              disabled={isDisabled}
                            />
                            <span className="Adm-Not-slider"></span>
                          </label>
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Sidebar ────────────────────────────────────── */}
        <div className="Adm-Not-sidebar">

          {/* Notification Channels panel */}
          <div className="Adm-Not-panel Adm-Not-channels-panel">
            <h2 className="Adm-Not-panel-title">Notification Channels</h2>
            <p className="Adm-Not-panel-subtitle">Choose your preferred communication channel</p>
            <div className="Adm-Not-channel-list">
              {/* {quickChannels.map(channel => (
                <div key={channel.id} className="Adm-Not-channel-item">
                  <div style={{ display: "flex", alignItems: "center" }} className="Adm-Not-item-info">
                    <img src={channel.iconClass} alt="" width={25} height={25} />
                    <div>
                      <div className="Adm-Not-item-title">{channel.title}</div>
                      <div className="Adm-Not-item-desc">{channel.description}</div>
                    </div>
                  </div>
                  <label className="Adm-Not-switch">
                    <input
                      type="checkbox"
                      checked={quickSetup[channel.id] ?? false}
                      onChange={() => handleQuickChange(channel.id)}
                    />
                    <span className="Adm-Not-slider"></span>
                  </label>
                </div>
              ))} */}


              
              {quickChannels.map(channel => {
                // Check if this channel should be disabled
                const isDisabled = channel.id === 'sms_notif' || channel.id === 'push_notif';

                return (
                  <div key={channel.id} className="Adm-Not-channel-item">
                    <div style={{ display: "flex", alignItems: "center" }} className="Adm-Not-item-info">
                      <img src={channel.iconClass} alt="" width={25} height={25} />
                      <div>
                        <div className="Adm-Not-item-title">{channel.title}</div>
                        <div className="Adm-Not-item-desc">{channel.description}</div>
                      </div>
                    </div>
                    <span title={isDisabled ? "Under Implementation" : ""}>
                      <label className="Adm-Not-switch" style={{ opacity: isDisabled ? 0.5 : 1 }}>
                        <input
                          type="checkbox"
                          checked={quickSetup[channel.id] ?? false}
                          onChange={() => handleQuickChange(channel.id)}
                          disabled={isDisabled}
                        />
                        <span className="Adm-Not-slider"></span>
                      </label>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quiet Hours panel */}
          <div className="Adm-Not-panel Adm-Not-quiet-hours-panel">
            <h2 className="Adm-Not-panel-title">Quiet Hours</h2>
            <p className="Adm-Not-panel-subtitle">Set quiet hours to avoid notification at certain times</p>

            <div className="Adm-Not-time-inputs">
              <div className="Adm-Not-time-group">
                <label>Start time</label>
                <div className="Adm-Not-time-select-wrapper">
                  <img src={Clock} alt="" className="Adm-Not-input-icon icon-clock" />
                  <input
                    className="Adm-Not-time-select"
                    type="time"
                    onChange={(e) => setStartTime(e.target.value)}
                    value={startTime}
                  />
                </div>
              </div>
              <div className="Adm-Not-time-group">
                <label>End time</label>
                <div className="Adm-Not-time-select-wrapper">
                  <img src={Clock} width={25} alt="" className="Adm-Not-input-icon icon-clock" />
                  <input
                    className="Adm-Not-time-select"
                    type="time"
                    onChange={(e) => setEndTime(e.target.value)}
                    value={endTime}
                  />
                </div>
              </div>
            </div>

            <div className="Adm-Not-day-picker">
              {daysOfWeek.map(day => (
                <button
                  key={day}
                  className={activeDays.includes(day) ? "day-btn active" : "day-btn"}
                  onClick={() => toggleDay(day)}
                >
                  {day}
                </button>
              ))}
            </div>

            <div className="Adm-Not-timezone-select-wrapper">
              <select
                className="Adm-Not-timezone-select"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                {timezoneOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};