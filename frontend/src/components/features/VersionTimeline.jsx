import { Clock, FileText, RotateCcw } from 'lucide-react';
import Button from '../common/Button';
import './VersionTimeline.css';

export default function VersionTimeline({ versions, onRestore }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (versions.length === 0) {
    return (
      <div className="empty-versions">
        <Clock size={32} />
        <p>No versions yet. Upload files to create your first version.</p>
      </div>
    );
  }

  return (
    <div className="version-timeline">
      {versions.map((version, index) => (
        <div key={version.id} className={`timeline-item ${version.is_current ? 'current' : ''}`}>
          <div className="timeline-marker">
            <div className="marker-dot">
              {version.version_number}
            </div>
            {index < versions.length - 1 && <div className="marker-line" />}
          </div>
          <div className="timeline-content">
            <div className="version-header">
              <div className="version-info">
                <h4>
                  Version {version.version_number}
                  {version.is_current && <span className="current-badge">Current</span>}
                </h4>
                <div className="version-meta">
                  <span><FileText size={12} /> {version.file_count} files</span>
                  <span><Clock size={12} /> {formatTimeAgo(version.created_at)}</span>
                </div>
              </div>
              {!version.is_current && (
                <div className="version-actions">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    icon={RotateCcw}
                    onClick={() => onRestore(version.id)}
                  >
                    Restore
                  </Button>
                </div>
              )}
            </div>
            {version.note && <p className="version-description">{version.note}</p>}
            <span className="version-date">{formatDate(version.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
