import React, { useState, useRef, useEffect } from 'react'
import './AdminHeader.css'
import { useNavigate } from 'react-router-dom'
import ProfileIcon from "../assets/icon_profile.png"
import Arrow from "../assets/AdminAssets/DownArrow.png"
import UploadIcon from "../assets/AdminAssets/UserManage.png" 
import AdminLogout from '../assets/AdminAssets/Logout.png'
import DeleteIcon from "../assets/DeleteIcon.png"
import api from '../api/axios'

export const AdminHeader = ({ onLogoutClick }) => {
    const [showDropdown, setShowDropdown] = useState(false)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(() => {
        return sessionStorage.getItem('admin_avatar') || null
    })
    const [fileError, setFileError] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    
    const dropdownRef = useRef(null)
    const fileInputRef = useRef(null)
    const navigate = useNavigate()

    // Get auth token from storage
    const getAuthToken = () => {
        return localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
    }

    // Fetch profile photo from API on component mount
    useEffect(() => {
        fetchProfilePhoto()
    }, [])

    const fetchProfilePhoto = async () => {
        try {
            const token = getAuthToken()
            if (!token) return

            const response = await api.get('/admin/profile/photo/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            
            if (response.data.photo_url) {
                setPreviewUrl(response.data.photo_url)
                sessionStorage.setItem('admin_avatar', response.data.photo_url)
            }
        } catch (error) {
            console.error('Error fetching profile photo:', error)
            const cachedAvatar = sessionStorage.getItem('admin_avatar')
            if (cachedAvatar) {
                setPreviewUrl(cachedAvatar)
            }
        }
    }
    
    const today = new Date()
    const day = today.toLocaleDateString('en-US', { weekday: 'long' })
    const date = `${today.getDate()}${getDaySuffix(today.getDate())} ${today.toLocaleString('en-US', { month: 'long' })} ${today.getFullYear()}`

    function getDaySuffix(day) {
        if (day > 3 && day < 21) return 'th'
        switch (day % 10) {
            case 1: return "st"
            case 2: return "nd"
            case 3: return "rd"
            default: return "th"
        }
    }

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => { document.removeEventListener("mousedown", handleClickOutside) }
    }, [])

    // Handle File validation logic
    const handleFileChange = (e) => {
        const file = e.target.files[0]
        setFileError('')

        if (!file) return

        // Validate File Type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            setFileError('Invalid file format. Please upload JPG, JPEG, PNG, or WEBP.')
            return
        }

        // Validate File Size (5MB)
        const maxFileSize = 5 * 1024 * 1024
        if (file.size > maxFileSize) {
            setFileError('File is too large. Maximum allowed size is 5MB.')
            return
        }

        setSelectedImage(file)
        
        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreviewUrl(reader.result)
        }
        reader.readAsDataURL(file)
    }

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    // Delete photo from server when delete icon is clicked
    const handleDeletePhoto = async (e) => {
        e.stopPropagation()
        
        if (!window.confirm('Are you sure you want to remove your profile photo?')) {
            return
        }

        setIsUploading(true)
        
        try {
            const token = getAuthToken()
            if (!token) {
                throw new Error('No authentication token found')
            }

            await api.delete('/admin/profile/photo/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            // Reset to default icon
            setPreviewUrl(null)
            setSelectedImage(null)
            sessionStorage.removeItem('admin_avatar')
            window.dispatchEvent(new Event('avatarChanged'))
            setShowUploadModal(false)
            setFileError('')
            
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        } catch (error) {
            console.error('Error deleting photo:', error)
            if (error.response) {
                setFileError(error.response.data.error || 'Failed to remove photo. Please try again.')
            } else {
                setFileError('An error occurred. Please try again.')
            }
        } finally {
            setIsUploading(false)
        }
    }

    // Upload to server
    const handleUploadSubmit = async (e) => {
        e.preventDefault()
        
        if (!selectedImage) {
            setFileError('Please select an image file first.')
            return
        }
        
        setIsUploading(true)
        setFileError('')

        try {
            const token = getAuthToken()
            if (!token) {
                throw new Error('No authentication token found')
            }

            const formData = new FormData()
            formData.append('photo', selectedImage)

            const response = await api.post('/admin/profile/photo/', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (response.data.photo_url) {
                setPreviewUrl(response.data.photo_url)
                sessionStorage.setItem('admin_avatar', response.data.photo_url)
                window.dispatchEvent(new Event('avatarChanged'))
                setShowUploadModal(false)
                setSelectedImage(null)
            }
        } catch (error) {
            console.error('Error uploading photo:', error)
            if (error.response) {
                setFileError(error.response.data.error || 'Failed to upload photo. Please try again.')
            } else if (error.request) {
                setFileError('Network error. Please check your connection.')
            } else {
                setFileError('An error occurred. Please try again.')
            }
        } finally {
            setIsUploading(false)
        }
    }

    const closeUploadModal = () => {
        setShowUploadModal(false)
        setSelectedImage(null)
        setFileError('')
        // Restore the saved image or fetch from API
        const cachedAvatar = sessionStorage.getItem('admin_avatar')
        if (cachedAvatar) {
            setPreviewUrl(cachedAvatar)
        } else {
            fetchProfilePhoto()
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleLogoutAction = () => {
        setShowDropdown(false)
        if (typeof onLogoutClick === 'function') {
            onLogoutClick()
        } else {
            sessionStorage.clear()
            localStorage.removeItem('access_token')
            navigate("/")
        }
    }

    const handleLogoClick = () => {
        sessionStorage.setItem('adminActiveTab', 'Dashboard');
        navigate('/Job-portal/admin/Dashboard');
        window.location.reload(); 
    }

    return (
        <div className="Admin-header">
            <div className="Admin-header-left">
                <div className="logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
                    Job Portal
                </div>
            </div>

            <div className="Admin-header-right">
                <div className="Admin-date-section">
                    <div className="Admin-header-day">
                        {day}, {date}
                    </div>
                </div>

                <div className="Admin-profile-section" ref={dropdownRef}>
                    <img 
                        onClick={() => setShowDropdown(!showDropdown)} 
                        src={previewUrl || ProfileIcon} 
                        alt="Profile" 
                        className="Admin-profile-icon" 
                    />

                    <div className="Admin-dropdown-arrow" onClick={() => setShowDropdown(!showDropdown)}>
                        <img src={Arrow} alt="Dropdown" className={showDropdown ? "arrow-rotate" : ""} />
                    </div>

                    {showDropdown && (
                        <div className="Admin-profile-dropdown">
                            <div className="Admin-dropdown-item" onClick={() => { setShowUploadModal(true); setShowDropdown(false); }}>
                                <img src={ProfileIcon} alt="Upload Profile" />
                                <span>Upload Photo</span>
                            </div>

                            <div className="Admin-dropdown-item Admin-logout" onClick={handleLogoutAction}>
                                <img src={AdminLogout} alt="Logout" />
                                <span>Logout</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* PROFILE PHOTO UPLOAD MODAL POPUP */}
            {showUploadModal && (
                <div className="admin-modal-overlay" onClick={closeUploadModal}>
                    <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>Upload Profile Picture</h3>
                            <button type="button" className="admin-modal-close-btn" onClick={closeUploadModal}>&times;</button>
                        </div>
                        <form onSubmit={handleUploadSubmit}>
                            <div className="admin-modal-body">
                                <div className="admin-upload-dropzone" onClick={triggerFileInput}>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange} 
                                        accept="image/jpeg,image/png,image/jpg,image/webp" 
                                        style={{ display: 'none' }} 
                                    />
                                    {previewUrl && !fileError ? (
                                        <div className="admin-image-preview-container" onClick={(e) => e.stopPropagation()}>
                                            <img 
                                                src={previewUrl} 
                                                alt="Preview" 
                                                className="admin-uploaded-image-preview" 
                                                onClick={triggerFileInput} 
                                                title="Click to change image"
                                            />
                                            {/* Delete Icon - Calls API directly */}
                                            <button 
                                                type="button" 
                                                className="admin-delete-image-btn" 
                                                onClick={handleDeletePhoto} 
                                                title="Remove image"
                                                disabled={isUploading}
                                            >
                                                <img src={DeleteIcon} alt="Delete" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="admin-upload-placeholder">
                                            <img src={UploadIcon} alt="Placeholder" className="admin-placeholder-svg" />
                                            <p>Click to browse images</p>
                                            <span>Supports JPG, JPEG, PNG, WEBP (Max 5MB)</span>
                                        </div>
                                    )}
                                </div>
                                
                                {fileError && <div className="admin-upload-error-msg">{fileError}</div>}
                            </div>
                            <div className="admin-modal-footer">
                                <button 
                                    type="button" 
                                    className="admin-modal-btn cancel-btn" 
                                    onClick={closeUploadModal}
                                    disabled={isUploading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="admin-modal-btn save-btn" 
                                    disabled={!!fileError || !selectedImage || isUploading}
                                >
                                    {isUploading ? 'Uploading...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}