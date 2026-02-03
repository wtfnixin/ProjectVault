import { useState } from 'react';
import { User, Mail, Lock, Save, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import './Settings.css';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
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
                  <div className="avatar-large">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
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
