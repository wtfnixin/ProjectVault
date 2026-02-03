import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Modal from '../common/Modal';
import NewProjectModal from '../features/NewProjectModal';
import api from '../../services/api';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const [showNewProject, setShowNewProject] = useState(false);

  const handleCreateProject = async (projectData) => {
    await api.post('/projects', projectData);
    setShowNewProject(false);
    // Trigger a page reload to refresh project list
    window.location.reload();
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
