import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  FileText, 
  History, 
  HardDrive,
  Clock,
  FileUp,
  FolderPlus,
  Folder,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Card from '../components/common/Card';
import ProjectCardSkeleton from '../components/common/skeletons/ProjectCardSkeleton';
import ActivitySkeleton from '../components/common/skeletons/ActivitySkeleton';
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap';
import { motion } from 'framer-motion';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total_projects: 0, total_files: 0, total_versions: 0, storage_used: 0 });
  const [activities, setActivities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [heatmapData, setHeatmapData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activitiesRes, projectsRes, heatmapRes] = await Promise.all([
          api.get('/activity/stats'),
          api.get('/activity?limit=5'),
          api.get('/projects'),
          api.get('/activity/heatmap')
        ]);
        setStats(statsRes.data);
        setActivities(activitiesRes.data);
        setProjects(projectsRes.data.slice(0, 4));
        setHeatmapData(heatmapRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const containerAnimations = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemAnimations = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const formatStorage = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'upload': return FileUp;
      case 'version': return History;
      case 'create': return FolderPlus;
      case 'restore': return RotateCcw;
      default: return FileText;
    }
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

  if (loading) {
    return (
      <div className="dashboard-page">
        <header className="dashboard-header">
          <div className="skeleton skeleton-text" style={{ width: 200, height: 32 }}></div>
          <div className="skeleton skeleton-text" style={{ width: 300, height: 20, marginTop: 8 }}></div>
        </header>

        <div className="stats-grid">
           {[1, 2, 3, 4].map(i => (
             <div key={i} className="card" style={{ height: 100, display: 'flex', alignItems: 'center', padding: 24, gap: 16 }}>
               <div className="skeleton skeleton-circle" style={{ width: 48, height: 48 }}></div>
               <div style={{ flex: 1 }}>
                 <div className="skeleton skeleton-text" style={{ width: '40%', height: 24, marginBottom: 8 }}></div>
                 <div className="skeleton skeleton-text" style={{ width: '70%', height: 14 }}></div>
               </div>
             </div>
           ))}
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-section">
            <div className="section-header">
               <div className="skeleton skeleton-text" style={{ width: 150, height: 24 }}></div>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <ActivitySkeleton />
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
               <div className="skeleton skeleton-text" style={{ width: 150, height: 24 }}></div>
            </div>
            <div className="projects-list">
              {[1, 2, 3, 4].map(i => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="dashboard-page"
      initial="hidden"
      animate="show"
      variants={containerAnimations}
    >
      <motion.header className="dashboard-header" variants={itemAnimations}>
        <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
        <p>Here's what's happening with your projects</p>
      </motion.header>

      <motion.div className="stats-grid" variants={containerAnimations}>
        {[
          { title: 'Total Projects', value: stats.total_projects, icon: FolderKanban },
          { title: 'Files Uploaded', value: stats.total_files, icon: FileText },
          { title: 'Total Versions', value: stats.total_versions, icon: History },
          { title: 'Storage Used', value: formatStorage(stats.storage_used), icon: HardDrive }
        ].map((stat, i) => (
          <motion.div key={i} variants={itemAnimations}>
            <Card>
              <div className="stat-card">
                <div className="stat-icon">
                  <stat.icon size={22} />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.title}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="dashboard-section" style={{ marginBottom: 'var(--spacing-6)' }} variants={itemAnimations}>
        <div className="section-header">
          <h2>Activity Heatmap</h2>
        </div>
        <ActivityHeatmap data={heatmapData} />
      </motion.div>

      <motion.div className="dashboard-grid" variants={containerAnimations}>
        <motion.div className="dashboard-section" variants={itemAnimations}>
          <div className="section-header">
            <h2><Clock size={18} /> Recent Activity</h2>
            <Link to="/activity" className="view-all-link">View all</Link>
          </div>
          <Card padding="none">
            {activities.length === 0 ? (
              <div className="empty-activity">
                <p>No recent activity. Start by creating a project!</p>
              </div>
            ) : (
              <div className="activity-list">
                {activities.map(activity => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="activity-item">
                      <div className={`activity-icon activity-${activity.type}`}>
                        <Icon size={16} />
                      </div>
                      <div className="activity-content">
                        <p>{activity.action} <strong>{activity.project_name}</strong></p>
                        {activity.details && (
                          <div className="activity-details">
                            {activity.details.added && activity.details.added.length > 0 && (
                              <div className="detail-item detail-added">
                                <span className="detail-label">Added:</span> {activity.details.added.join(', ')}
                              </div>
                            )}
                            {activity.details.modified && activity.details.modified.length > 0 && (
                              <div className="detail-item detail-modified">
                                <span className="detail-label">Modified:</span> {activity.details.modified.join(', ')}
                              </div>
                            )}
                            {activity.details.deleted && activity.details.deleted.length > 0 && (
                              <div className="detail-item detail-deleted">
                                <span className="detail-label">Deleted:</span> {activity.details.deleted.join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                        <span className="activity-time">{formatTimeAgo(activity.created_at)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div className="dashboard-section" variants={itemAnimations}>
          <div className="section-header">
            <h2><FolderKanban size={18} /> Recent Projects</h2>
            <Link to="/projects" className="view-all-link">View all</Link>
          </div>
          <div className="projects-list">
            {projects.length === 0 ? (
              <Card>
                <div className="empty-projects">
                  <p>No projects yet. Create your first project to get started!</p>
                  <Link to="/projects" className="create-link">Create Project</Link>
                </div>
              </Card>
            ) : (
              projects.map(project => (
                <Link key={project.id} to={`/projects/${project.id}`} className="project-link">
                  <Card hover clickable>
                    <div className="project-mini-header">
                      <div className="project-mini-icon">
                        <Folder size={20} />
                      </div>
                      <div className="project-mini-info">
                        <h3>{project.name}</h3>
                        <span className="project-mini-updated">
                          Updated {formatTimeAgo(project.updated_at)}
                        </span>
                      </div>
                    </div>
                    <div className="project-mini-stats">
                      <span>{project.file_count} files</span>
                      <span>•</span>
                      <span>{project.version_count} versions</span>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
