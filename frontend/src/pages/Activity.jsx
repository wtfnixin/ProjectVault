import { useState, useEffect } from 'react';
import { 
  Activity as ActivityIcon,
  FileUp,
  History,
  FolderPlus,
  RotateCcw,
  Trash2,
  Download
} from 'lucide-react';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import './Activity.css';

const getActivityIcon = (type) => {
  switch (type) {
    case 'upload': return FileUp;
    case 'version': return History;
    case 'create': return FolderPlus;
    case 'restore': return RotateCcw;
    case 'delete': return Trash2;
    case 'download': return Download;
    default: return ActivityIcon;
  }
};

const getActivityColor = (type) => {
  switch (type) {
    case 'upload': return 'var(--success)';
    case 'version': return 'var(--primary-600)';
    case 'create': return 'var(--warning)';
    case 'restore': return '#8b5cf6';
    case 'delete': return 'var(--error)';
    case 'download': return 'var(--info)';
    default: return 'var(--text-muted)';
  }
};

export default function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const fetchActivities = async () => {
    try {
      const response = await api.get('/activity');
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear all activity history? This cannot be undone.')) {
      return;
    }
    
    setClearing(true);
    try {
      await api.delete('/activity');
      setActivities([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    } finally {
      setClearing(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
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

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.created_at).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(activity);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading activity...</p>
      </div>
    );
  }

  return (
    <div className="activity-page">
      <header className="activity-header">
        <div className="activity-header-left">
          <h1><ActivityIcon size={28} /> Activity Log</h1>
          <p>Track all your actions across projects</p>
        </div>
        {activities.length > 0 && (
          <Button 
            variant="ghost" 
            icon={Trash2} 
            onClick={handleClearHistory}
            loading={clearing}
          >
            Clear History
          </Button>
        )}
      </header>

      {activities.length === 0 ? (
        <Card>
          <div className="empty-activity">
            <p>No activity yet. Start by creating a project and uploading files!</p>
          </div>
        </Card>
      ) : (
        <div className="activity-feed">
          {Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <div key={date} className="activity-group">
              <div className="group-date">{formatDate(date)}</div>
              <Card padding="none">
                {dateActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  const color = getActivityColor(activity.type);
                  
                  return (
                    <div key={activity.id} className="activity-item">
                      <div 
                        className="activity-icon"
                        style={{ background: `${color}22`, color }}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="activity-content">
                        <p>
                          {activity.action} <strong>{activity.project_name}</strong>
                        </p>
                        <span className="activity-time">
                          {formatTime(activity.created_at)} • {formatTimeAgo(activity.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
