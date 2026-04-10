import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Bell, 
  ChevronDown,
  LogOut,
  User,
  Settings
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ThemeToggleButton } from '../common/DarkTheme';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <img src="/logo.png" alt="ProjectVault" className="navbar-logo" />
          <span className="navbar-title">ProjectVault</span>
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </form>

        <div className="navbar-actions">
          <ThemeToggleButton variant="circle" start="top-right" className="navbar-icon-btn" />
          <button className="navbar-icon-btn">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>

          <div className="user-menu" ref={dropdownRef}>
            <button 
              className="user-menu-trigger"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="user-avatar">
                {user?.profile_picture_url ? (
                  <img src={user.profile_picture_url.startsWith('http') ? user.profile_picture_url : `http://localhost:8000${user.profile_picture_url}`} alt="Avatar" />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <span className="user-name">{user?.name || 'User'}</span>
              <ChevronDown size={16} className={showDropdown ? 'rotate' : ''} />
            </button>

            {showDropdown && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <div className="user-avatar-lg">
                    {user?.profile_picture_url ? (
                      <img src={user.profile_picture_url.startsWith('http') ? user.profile_picture_url : `http://localhost:8000${user.profile_picture_url}`} alt="Avatar" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="dropdown-user-info">
                    <span className="dropdown-name">{user?.name}</span>
                    <span className="dropdown-email">{user?.email}</span>
                  </div>
                </div>
                <div className="dropdown-divider" />
                <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                  <User size={16} />
                  <span>Profile</span>
                </Link>
                <Link to="/settings" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                  <Settings size={16} />
                  <span>Settings</span>
                </Link>
                <div className="dropdown-divider" />
                <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
