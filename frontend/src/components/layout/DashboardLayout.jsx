import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Modal from '../common/Modal';
import NewProjectModal from '../features/NewProjectModal';
import api from '../../services/api';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const [showNewProject, setShowNewProject] = useState(false);
  const navigate = useNavigate();

  const handleCreateProject = async (projectData) => {
    try {
      const response = await api.post('/projects', projectData);
      const newProject = response.data;
      setShowNewProject(false);
      // Navigate to the newly created project
      navigate(`/projects/${newProject.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      <Sidebar onNewProject={() => setShowNewProject(true)} />
      <main className="dashboard-main">
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
      
      <Modal 
        isOpen={showNewProject} 
        onClose={() => setShowNewProject(false)}
        title="Create New Project"
      >
        <NewProjectModal 
          onClose={() => setShowNewProject(false)}
          onCreate={handleCreateProject}
        />
      </Modal>
    </div>
  );
}
