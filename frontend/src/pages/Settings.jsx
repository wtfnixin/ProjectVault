import { useState, useRef } from 'react';
import { User, Mail, Lock, Save, Camera, Building, MapPin, Github, Twitter, BookOpen, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import './Settings.css';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    company: user?.company || '',
    location: user?.location || '',
    github_username: user?.github_username || '',
    twitter_username: user?.twitter_username || ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setUploadingAvatar(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Need to stringify URL since we're using multipart/form-data, axial does this easily
      const response = await api.post('/auth/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // The response returns the updated user object
      updateUser(response.data);
      setSuccess('Profile picture updated successfully!');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to upload profile picture');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.put('/auth/profile', profileData);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await api.put('/auth/password', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });
      setSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences</p>
      </header>

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <nav className="settings-nav">
            <button
              className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} />
              Profile
            </button>
            <button
              className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Lock size={18} />
              Security
            </button>
          </nav>
        </aside>

        <main className="settings-content">
          {success && <div className="settings-success">{success}</div>}
          {error && <div className="settings-error">{error}</div>}

          {activeTab === 'profile' && (
            <Card>
              <div className="settings-section">
                <h2>Profile Information</h2>
                <p className="section-desc">Update your personal information</p>
                
                <div className="avatar-section">
                  <div 
                    className={`avatar-large ${uploadingAvatar ? 'uploading' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {user?.profile_picture_url ? (
                      <img src={user.profile_picture_url.startsWith('http') ? user.profile_picture_url : `http://localhost:8000${user.profile_picture_url}`} alt="Avatar" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                    <div className="avatar-overlay">
                      <Camera size={24} />
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleAvatarUpload} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                  />
                  <div className="avatar-info">
                    <h3>{user?.name}</h3>
                    <p>{user?.email}</p>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="settings-form">
                  <Input
                    label="Full Name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    icon={User}
                    required
                  />
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    icon={Mail}
                    required
                  />
                  <Input
                    label="Bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    icon={BookOpen}
                    placeholder="Tell us a little about yourself"
                  />
                  <Input
                    label="Company / University"
                    name="company"
                    value={profileData.company}
                    onChange={handleProfileChange}
                    icon={Building}
                    placeholder="Where do you work or study?"
                  />
                  <Input
                    label="Location"
                    name="location"
                    value={profileData.location}
                    onChange={handleProfileChange}
                    icon={MapPin}
                    placeholder="City, Country"
                  />
                  <Input
                    label="GitHub Username"
                    name="github_username"
                    value={profileData.github_username}
                    onChange={handleProfileChange}
                    icon={Github}
                    placeholder="johndoe"
                  />
                  <Input
                    label="Twitter Username"
                    name="twitter_username"
                    value={profileData.twitter_username}
                    onChange={handleProfileChange}
                    icon={Twitter}
                    placeholder="@johndoe"
                  />
                  <div className="form-actions">
                    <Button type="submit" variant="primary" loading={loading} icon={Save}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <div className="settings-section">
                <h2>Change Password</h2>
                <p className="section-desc">Update your password to keep your account secure</p>

                <form onSubmit={handlePasswordSubmit} className="settings-form">
                  <Input
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    icon={Lock}
                    required
                  />
                  <Input
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    icon={Lock}
                    required
                  />
                  <Input
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    icon={Lock}
                    required
                  />
                  <div className="form-actions">
                    <Button type="submit" variant="primary" loading={loading} icon={Save}>
                      Update Password
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
