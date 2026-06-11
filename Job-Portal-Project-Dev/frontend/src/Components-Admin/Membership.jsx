import React, { useRef, useState } from "react";
import "./Membership.css";
import Eye from '../assets/show_password.png';
import Tick from '../assets/AdminAssets/GreenTick.png';
import Delete from '../assets/DeleteIcon.png';
import SixDots from '../assets/AdminAssets/SixDots.png';
import UPI from '../assets/Billing/UpiIcon.png';
import Visa from '../assets/Billing/VisaIcon.png';
import NetBanking from '../assets/Billing/NetBankingIcon.png';
import Save from '../assets/AdminAssets/SaveDraft.png';
import Publish from '../assets/AdminAssets/PublishPlan.png';
import LinkIcon from '../assets/AdminAssets/LinkIcon.png';
import NumberList from '../assets/AdminAssets/NumberList.png';
import PointList from '../assets/AdminAssets/PointList.png';
import RedCross from '../assets/AdminAssets/RedCross.png';

export const Membership = () => {
  const editorRef = useRef(null);
  const [isDefault, setIsDefault] = useState(false);
  const [isTrialEnabled, setIsTrialEnabled] = useState(false);
  const [isAutoRenewal, setIsAutoRenewal] = useState(false)
  const [isAdding, setIsAdding] = useState(false);

  //Form Data
  const [formData, setFormData] = useState({
    planName: "Premier Employer Plan",
    planType: "Professional Plan",
    description: "",
    price: "999",
    billingCycle: "Monthly",
    duration: "30",
    discount: "10",
    tax: "18",
    planStatus: "Active",
    features: [
      { id: 1, label: "Number Of Jobs Post", val: "100", active: true },
      { id: 2, label: "Featured Job Listings", val: "5", active: true },
      { id: 3, label: "Resume Access Limit", val: "100", active: true },
      { id: 4, label: "Applicant View Limit", val: "100", active: true },
      { id: 5, label: "Priority Support", val: "Yes", active: true },
    ],
    isDefault: isDefault,
    isTrialEnabled: isTrialEnabled,
    TrailDuration: "7",
    GraceTime: "",
    planTags: ["popular", "Recommended"],
    isAutoRenewal: isAutoRenewal,

  });

  console.log(formData)

  const handleToggle = () => {
    const newValue = !isDefault;
    setIsDefault(newValue);
    setFormData((prevData) => ({
      ...prevData,
      isDefault: newValue,
    }));
  };

  const handleTrailToggle = () => {
    const newValue = !formData.isTrialEnabled;
    setFormData((prevData) => ({
      ...prevData,
      isTrialEnabled: newValue,
      TrailDuration: newValue ? prevData.TrailDuration : 7,
    }));
  };
  const handleAutoRenewalToggle = () => {
    const newValue = !formData.isAutoRenewal;
    setIsAutoRenewal(newValue)
    setFormData((prevData) => ({
      ...prevData,
      isAutoRenewal: newValue,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDurationChange = (e) => {
    const value = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      TrailDuration: value,
    }));
  };

  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleEditorInput();
  };

  const handleEditorInput = () => {
    setFormData(prev => ({ ...prev, description: editorRef.current.innerHTML }));
  };
  const handleAddTag = (e) => {
    const value = e.target.value.trim();
    if (value && !formData.planTags.includes(value)) {
      setFormData({
        ...formData,
        planTags: [...formData.planTags, value]
      });
    }
    setIsAdding(false);
  };

  const addFeature = () => {
    const newFeature = {
      id: Date.now(),
      label: "New Feature",
      val: "0",
      active: true
    };
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, newFeature]
    }));
  };

  // Delete Feature
  const deleteFeature = (id) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f.id !== id)
    }));
  };
  const removeTag = (tagToRemove) => {
    setFormData((prevData) => ({
      ...prevData,
      planTags: prevData.planTags.filter(tag => tag !== tagToRemove),
    }));
  };

  // Toggle Active Status
  const toggleFeature = (id) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map(f =>
        f.id === id ? { ...f, active: !f.active } : f
      )
    }));
  };

  // Update Feature Label or Value
  const updateFeature = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map(f =>
        f.id === id ? { ...f, [field]: value } : f
      )
    }));
  };


  // Calculation for Total Payable
  const basePrice = parseFloat(formData.price) || 0;
  const discountAmt = (basePrice * (parseFloat(formData.discount) || 0)) / 100;
  const priceAfterDiscount = basePrice - discountAmt;
  const taxAmt = (priceAfterDiscount * (parseFloat(formData.tax) || 0)) / 100;
  const totalPayable = (priceAfterDiscount + taxAmt).toFixed(2);

  return (
    <div className="membership-cr-membership-container">
      <div className="membership-cr-membership-header">
        <h1>Create Membership Plan</h1>
      </div>

      <div className="membership-cr-membership-content">
        <div className="membership-cr-form-sections">

          <section className="membership-cr-form-card">
            <div className="membership-cr-section-title">
              <span className="membership-cr-step-num">1</span> Basic plan details
            </div>
            <div className="membership-cr-row">
              <div className="membership-cr-input-group">
                <label>Plan name*</label>
                <input
                  type="text"
                  name="planName"
                  value={formData.planName}
                  onChange={handleInputChange}
                  placeholder="Premier Employer Plan"
                />
              </div>
              <div className="membership-cr-input-group">
                <label>Plan type*</label>
                <select name="planType" value={formData.planType} onChange={handleInputChange}>
                  <option value="Professional Plan">Professional Plan</option>
                  <option value="Employer Plan">Employer Plan</option>
                </select>
              </div>
            </div>

            <div className="membership-cr-row">
              <div className="membership-cr-input-group">
                <label>Description*</label>
                <div className="membership-cr-rich-text-editor">
                  <div className="membership-cr-editor-toolbar">
                    <div className="membership-cr-toolbar-left">
                      <span className="membership-cr-text-type">Normal <span className="membership-cr-dropdown-arrow"></span></span>
                      <div className="membership-cr-vertical-divider"></div>
                      <div className="membership-cr-format-group">
                        <button type="button" onClick={() => handleFormat('bold')} className="membership-cr-toolbar-btn">B</button>
                        <button type="button" onClick={() => handleFormat('italic')} className="membership-cr-toolbar-btn membership-cr-italic-text">I</button>
                        <button type="button" onClick={() => handleFormat('underline')} className="membership-cr-toolbar-btn membership-cr-underline-text">U</button>
                      </div>
                      <div className="membership-cr-vertical-divider"></div>
                      <div className="membership-cr-format-group">
                        <button type="button" onClick={() => handleFormat('insertUnorderedList')} className="membership-cr-toolbar-btn">
                          <img src={PointList} alt="points" className="membership-cr-toolbar-icon" />
                        </button>
                        <button type="button" onClick={() => handleFormat('insertOrderedList')} className="membership-cr-toolbar-btn">
                          <img src={NumberList} alt="numbers" className="membership-cr-toolbar-icon" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div
                    ref={editorRef}
                    className="membership-cr-editable-div"
                    contentEditable="true"
                    onInput={handleEditorInput}
                    data-placeholder="A premium plan for employers..."
                  ></div>
                </div>
              </div>

              <div className="membership-cr-input-group">
                <label>Plan status</label>

                <div className="membership-cr-status-dropdown-wrapper">
                  <div className={`membership-cr-status-dot ${formData.planStatus.toLowerCase()}`}></div>
                  <select
                    name="planStatus"
                    value={formData.planStatus}
                    onChange={handleInputChange}
                    className="membership-cr-status-select"
                  >
                    <option value="Active">Active</option>
                    <option value="Hold">Hold</option>
                  </select>

                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Pricing */}
          <section className="membership-cr-form-card">
            <div className="membership-cr-section-title">
              <span className="membership-cr-step-num">2</span> Pricing & Duration
            </div>
            <div className="membership-cr-row">
              <div className="membership-cr-input-group">
                <label>Price (₹)*</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} />
              </div>
              <div className="membership-cr-input-group">
                <label>Billing Cycle*</label>
                <select name="billingCycle" value={formData.billingCycle} onChange={handleInputChange}>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
              <div className="membership-cr-input-group">
                <label>Duration (Days)*</label>
                <input type="number" name="duration" value={formData.duration} onChange={handleInputChange} />
              </div>
            </div>
            <div className="membership-cr-row">
              <div className="membership-cr-input-group">
                <label>Discount (%)</label>
                <input type="number" name="discount" value={formData.discount} onChange={handleInputChange} />
              </div>
              <div className="membership-cr-input-group">
                <label>Tax (%)</label>
                <input type="number" name="tax" value={formData.tax} onChange={handleInputChange} />
              </div>
              <div className="membership-cr-total-payable">
                <p style={{ textAlign: "start", margin: "5px 0", fontWeight: "600" }}>Total Payable</p>
                <h3 style={{ textAlign: "start", fontSize: "24px" }}>₹ {totalPayable} <span >/ {formData.billingCycle.toLowerCase()}</span></h3>
                <p style={{ textAlign: "start", margin: "5px 0", fontSize: "12px" }}>(incl. tax after discount)</p>
              </div>
            </div>
          </section>

          {/* Section 3: Features */}
          <section className="membership-cr-form-card">
            <div className="membership-cr-section-title">
              <span className="membership-cr-step-num">3</span> Features & Limits
            </div>
            <table className="membership-cr-features-table">
              <thead>
                <tr>
                  <th>Feature Name</th>
                  <th>Value</th>
                  <th>Included</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.features.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={SixDots} alt="" className="membership-cr-drag-dots" />
                        <input
                          type="text"
                          value={item.label}
                          className="membership-cr-feature-label-input"
                          onChange={(e) => updateFeature(item.id, 'label', e.target.value)}
                          style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
                        />
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.val}
                        onChange={(e) => updateFeature(item.id, 'val', e.target.value)}
                        style={{ width: '60px', textAlign: 'center' }}
                      />
                    </td>
                    <td>
                      <div
                        className={`membership-cr-toggle-switch ${item.active ? "membership-cr-active" : ""}`}
                        onClick={() => toggleFeature(item.id)}
                      ></div>
                    </td>
                    <td>
                      <img
                        src={Delete}
                        className="membership-cr-delete-icon"
                        alt="delete"
                        onClick={() => deleteFeature(item.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="membership-cr-add-feature-btn" onClick={addFeature}>
              + Add Custom Features
            </button>
          </section>

          <div className="membership-cr-form-card membership-cr-mini-section">
            <div className="membership-cr-section-title"><span className="membership-cr-step-num">4</span> Visibility & Targeting</div>
            <div className="membership-cr-row">
              <div className="membership-cr-input-group">
                <label>Show Plan to*</label>
                <select><option>Employers Only</option></select>
              </div>
              <div className="membership-cr-input-group">
                <label>Country / Region</label>
                <select><option>All Countries</option></select>
              </div>
              <div className="membership-cr-input-group">
                <label>Default Plan</label>
                <div className={`membership-cr-toggle-switch ${isDefault ? 'membership-cr-active' : ''}`} onClick={handleToggle}
                ></div>

              </div>
            </div>
          </div>

          <div className="membership-cr-form-card membership-cr-mini-section">
            <div className="membership-cr-section-title"><span className="membership-cr-step-num">5</span> Trial Settings</div>
            <div className="membership-cr-row membership-cr-align-center">
              <div className="membership-cr-toggle-group" onClick={handleTrailToggle}>
                <span>Free Trial Available</span>
                <div className={`membership-cr-toggle-switch ${formData.isTrialEnabled ? "membership-cr-active" : ""}`}></div>
              </div>
              <div className="membership-cr-input-group">
                <label>Total Duration (Days)</label>
                <input type="number" name="TrailDuration" value={formData.TrailDuration} onChange={handleInputChange} disabled={!formData.isTrialEnabled} />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="membership-cr-form-card">
            <div className="membership-cr-section-title"><span className="membership-cr-step-num">6</span> Payment Integration</div>
            <div className="membership-cr-payment-options">
              <div className="membership-cr-pay-card membership-cr-active">
                <input type="checkbox" />
                <span>UPI</span>
                <img src={UPI} alt="upi" className="membership-cr-pay-icon" />
              </div>
              <div className="membership-cr-pay-card membership-cr-active">
                <input type="checkbox" />
                <span>Credit / Debit Card</span>
                <img src={Visa} alt="visa" className="membership-cr-pay-icon" />
              </div>
              <div className="membership-cr-pay-card membership-cr-active">
                <input type="checkbox" />
                <span>Net Banking</span>
                <img src={NetBanking} alt="bank" className="membership-cr-pay-icon" />
              </div>
            </div>
          </div>

          {/* Advanced */}
          <div className="membership-cr-form-card">
            <div className="membership-cr-section-title"><span className="membership-cr-step-num">7</span> Advanced Settings</div>
            <div className="membership-cr-row membership-cr-align-center">
              <div className="membership-cr-toggle-group" onClick={handleAutoRenewalToggle}>
                <span>Auto Renewal</span>
                <div className={`membership-cr-toggle-switch ${formData.isAutoRenewal ? 'membership-cr-active' : ''}`}></div>
              </div>
              <div className="membership-cr-input-group">
                <label>Grace Period (Days)</label>
                <input type="number" name="GraceTime" value={formData.GraceTime} onChange={handleInputChange} disabled={!formData.isAutoRenewal} />
              </div>

              <div className="membership-cr-input-group">
                <label>Plan Tags</label>
                <div className="membership-cr-tags-input">
                  {formData.planTags.map((tag, index) => (
                    <span key={index} className="membership-cr-tag">
                      {tag}
                      <span
                        onClick={() => removeTag(tag)}
                        style={{ cursor: 'pointer', marginLeft: '8px' }}
                      >
                        ✕
                      </span>
                    </span>
                  ))}

                  {isAdding ? (
                    <input
                      type="text"
                      autoFocus
                      placeholder="Enter tag..."
                      className="membership-cr-tag-input-field"
                      onBlur={handleAddTag}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddTag(e);
                        if (e.key === 'Escape') setIsAdding(false);
                      }}
                    />
                  ) : (
                    <span
                      className="membership-cr-add-tag"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setIsAdding(true)}
                    >
                      +
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="membership-cr-action-buttons">
            <button className="membership-cr-btn-save"><img src={Save} alt="" className="membership-cr-btn-icon" /> Save Draft</button>
            <button className="membership-cr-btn-publish"><img src={Publish} alt="" className="membership-cr-btn-icon" /> Publish Plan</button>
          </div>
        </div>


        <div className="membership-cr-preview-sidebar">
          <div className="membership-cr-preview-header">
            <img src={Eye} alt="" className="membership-cr-preview-eye" /> Preview Plan
          </div>
          <div className="membership-cr-preview-card">
            <div className="membership-cr-plan-badge">{formData.planName.toUpperCase()}</div>
            <div className="membership-cr-plan-price">
              <h2>₹ {totalPayable}<span>/{formData.billingCycle === "Monthly" ? "month" : "year"}</span></h2>
              <p style={{ marginTop: "10px" }}>{formData.planType}</p>
              <div className="membership-cr-divider"></div>

              <ul className="membership-cr-plan-features">
                {formData.features.filter(f => f.active).map((feature) => {
                  const isNo = feature.val.toLowerCase() === 'no';
                  return (
                    <li key={feature.id}>
                      <img
                        src={isNo ? RedCross : Tick}
                        alt=""
                        className="membership-cr-tick-icon"
                      />
                      {isNo ? "" : `${feature.val} `}{feature.label}
                    </li>
                  )
                })}

              </ul>
            </div>
            <button className="membership-cr-btn-get-started">Get started</button>
          </div>
        </div>
      </div>
    </div>
  );
};