import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FolderKanban, Search, LayoutGrid, List, Plus, Folder } from 'lucide-react';
import api from '../services/api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import ProjectCard from '../components/features/ProjectCard';
import NewProjectModal from '../components/features/NewProjectModal';
import ProjectCardSkeleton from '../components/common/skeletons/ProjectCardSkeleton';
import './Projects.css';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState('grid');
  const [showNewModal, setShowNewModal] = useState(false);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Sync state when URL params change (e.g., from Navbar search)
  useEffect(() => {
    const query = searchParams.get('search') || '';
    setSearchQuery(query);
  }, [searchParams]);

  // Sync URL when local search query changes
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (value) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      await api.post('/projects', projectData);
      fetchProjects();
      setShowNewModal(false);
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error; // Re-throw so modal can show error
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      fetchProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="projects-page">
        <header className="projects-header">
           <div className="skeleton skeleton-text" style={{ width: 200, height: 32 }}></div>
           <div className="skeleton skeleton-rect" style={{ width: 120, height: 40 }}></div>
        </header>

        <div className="projects-toolbar">
          <div className="skeleton skeleton-rect" style={{ width: '100%', height: 40, maxWidth: 300 }}></div>
        </div>

        <div className={viewMode === 'grid' ? 'projects-grid' : 'projects-list'}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <header className="projects-header">
        <div className="header-left">
          <h1><FolderKanban size={28} /> Projects</h1>
          <p>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowNewModal(true)}>
          New Project
        </Button>
      </header>

      <div className="projects-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        
        <div className="toolbar-actions">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <Card className="empty-state">
          <Folder size={48} className="empty-icon" />
          <h3>{searchQuery ? 'No projects found' : 'No projects yet'}</h3>
          <p>{searchQuery ? 'Try a different search term' : 'Create your first project to get started'}</p>
          {!searchQuery && (
            <Button variant="primary" icon={Plus} onClick={() => setShowNewModal(true)}>
              Create Project
            </Button>
          )}
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'projects-grid' : 'projects-list'}>
          {filteredProjects.map(project => (
            <Link key={project.id} to={`/projects/${project.id}`} className="project-link">
              <ProjectCard 
                project={project} 
                viewMode={viewMode}
                onDelete={() => handleDeleteProject(project.id)}
              />
            </Link>
          ))}
        </div>
      )}

      <Modal isOpen={showNewModal} title="New Project" onClose={() => setShowNewModal(false)}>
        <NewProjectModal
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreateProject}
        />
      </Modal>
    </div>
  );
}
