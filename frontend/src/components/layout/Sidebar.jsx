import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  History, 
  Activity,
  Settings,
  HelpCircle,
  Plus
} from 'lucide-react';
import Button from '../common/Button';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/projects', icon: FolderKanban, label: 'Projects' },
  { path: '/activity', icon: Activity, label: 'Activity' },
];

const bottomItems = [
  { path: '/settings', icon: Settings, label: 'Settings' },
  { path: '/help', icon: HelpCircle, label: 'Help & Support' },
];

export default function Sidebar({ onNewProject }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-section">
          <Button 
            variant="primary" 
            fullWidth 
            icon={Plus}
            onClick={onNewProject}
          >
            New Project
          </Button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-title">Menu</span>
            <ul className="nav-list">
              {navItems.map(({ path, icon: Icon, label }) => (
                <li key={path}>
                  <NavLink 
                    to={path} 
                    className={({ isActive }) => 
                      `nav-link ${isActive ? 'nav-link-active' : ''}`
                    }
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="sidebar-bottom">
          <ul className="nav-list">
            {bottomItems.map(({ path, icon: Icon, label }) => (
              <li key={path}>
                <NavLink 
                  to={path} 
                  className={({ isActive }) => 
                    `nav-link ${isActive ? 'nav-link-active' : ''}`
                  }
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
