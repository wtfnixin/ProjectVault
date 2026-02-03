import { formatDistanceToNow } from 'date-fns';
import { 
  FileText, 
  History, 
  HardDrive,
  MoreVertical,
  Pencil,
  Trash2,
  Download
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Card from '../common/Card';
import './ProjectCard.css';

export default function ProjectCard({ project, viewMode = 'grid', onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Use the correct property names from the API
  const name = project.name || 'Untitled';
  const description = project.description || 'No description';
  const color = project.color || '#3b82f6';
  const fileCount = project.file_count || 0;
  const versionCount = project.version_count || 0;
  const updatedAt = project.updated_at;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleAction = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    if (action === 'delete' && onDelete) {
      onDelete();
    }
  };

  // Safely format time
  let timeAgo = 'Recently';
  try {
    if (updatedAt) {
      timeAgo = formatDistanceToNow(new Date(updatedAt), { addSuffix: true });
    }
  } catch (e) {
    console.error('Error formatting date:', e);
  }

  // Format size
  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (viewMode === 'list') {
    return (
      <Card hover padding="md" className="project-card-list">
        <div className="card-list-left">
          <div 
            className="project-icon" 
            style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="project-info">
            <h3 className="project-name">{name}</h3>
            <p className="project-description">{description}</p>
          </div>
        </div>
        <div className="card-list-stats">
          <div className="stat-item">
            <FileText size={14} />
            <span>{fileCount}</span>
          </div>
          <div className="stat-item">
            <History size={14} />
            <span>v{versionCount}</span>
          </div>
        </div>
        <span className="project-updated">{timeAgo}</span>
        <div className="card-menu" ref={menuRef}>
          <button className="menu-trigger" onClick={handleMenuClick}>
            <MoreVertical size={18} />
          </button>
          {showMenu && (
            <div className="menu-dropdown">
              <button onClick={(e) => handleAction(e, 'edit')}>
                <Pencil size={14} /> Edit
              </button>
              <button onClick={(e) => handleAction(e, 'download')}>
                <Download size={14} /> Download
              </button>
              <button className="danger" onClick={(e) => handleAction(e, 'delete')}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card hover padding="none" className="project-card-grid">
      <div 
        className="card-header" 
        style={{ background: `linear-gradient(135deg, ${color}33, ${color}11)` }}
      >
        <div 
          className="project-icon" 
          style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="card-menu" ref={menuRef}>
          <button className="menu-trigger" onClick={handleMenuClick}>
            <MoreVertical size={18} />
          </button>
          {showMenu && (
            <div className="menu-dropdown">
              <button onClick={(e) => handleAction(e, 'edit')}>
                <Pencil size={14} /> Edit
              </button>
              <button onClick={(e) => handleAction(e, 'download')}>
                <Download size={14} /> Download
              </button>
              <button className="danger" onClick={(e) => handleAction(e, 'delete')}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="card-content">
        <h3 className="project-name">{name}</h3>
        <p className="project-description">{description}</p>
        <div className="project-stats">
          <div className="stat-item">
            <FileText size={14} />
            <span>{fileCount} files</span>
          </div>
          <div className="stat-item">
            <History size={14} />
            <span>{versionCount} versions</span>
          </div>
        </div>
        <div className="card-footer">
          <span className="project-updated">Updated {timeAgo}</span>
        </div>
      </div>
    </Card>
  );
}
