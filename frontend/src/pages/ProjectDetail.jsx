import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Download, FileText, History, Folder } from 'lucide-react';
import api from '../services/api';
import Button from '../components/common/Button';
import FileUploader from '../components/features/FileUploader';
import FileList from '../components/features/FileList';
import VersionTimeline from '../components/features/VersionTimeline';
import './ProjectDetail.css';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('files');
  const [showUploader, setShowUploader] = useState(false);

  const fetchProjectData = async () => {
    try {
      const [projectRes, filesRes, versionsRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/files`),
        api.get(`/projects/${id}/versions`)
      ]);
      setProject(projectRes.data);
      setFiles(filesRes.data);
      setVersions(versionsRes.data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleUpload = async ({ files: uploadFiles, versionNote }) => {
    const formData = new FormData();
    uploadFiles.forEach(f => formData.append('files', f.file));
    if (versionNote) formData.append('version_note', versionNote);
    
    try {
      await api.post(`/projects/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchProjectData();
      setShowUploader(false);
    } catch (error) {
      console.error('Upload failed:', error);
      throw error; // Propagate error to FileUploader
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get(`/projects/${id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${project.name}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleRestore = async (versionId) => {
    try {
      await api.post(`/projects/${id}/versions/${versionId}/restore`);
      fetchProjectData();
    } catch (error) {
      console.error('Restore failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-detail-page">
        <p>Project not found</p>
        <Link to="/projects">Back to Projects</Link>
      </div>
    );
  }

  return (
    <div className="project-detail-page">
      <header className="detail-header">
        <Link to="/projects" className="back-link">
          <ArrowLeft size={16} />
          Back to Projects
        </Link>
      </header>

      <div className="project-banner">
        <div className="project-icon-lg">
          <Folder size={32} />
        </div>
        <div className="project-meta">
          <h1>{project.name}</h1>
          <p>{project.description || 'No description'}</p>
          <div className="project-stats-row">
            <span><FileText size={14} /> {project.file_count} files</span>
            <span><History size={14} /> {project.version_count} versions</span>
          </div>
        </div>
        <div className="project-actions">
          <Button variant="secondary" icon={Download} onClick={handleDownload} disabled={files.length === 0}>
            Download All
          </Button>
          <Button variant="primary" icon={Upload} onClick={() => setShowUploader(true)}>
            Upload Files
          </Button>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            <FileText size={16} />
            Files
            <span className="tab-count">{files.length}</span>
          </button>
          <button
            className={`tab ${activeTab === 'versions' ? 'active' : ''}`}
            onClick={() => setActiveTab('versions')}
          >
            <History size={16} />
            Version History
            <span className="tab-count">{versions.length}</span>
          </button>
        </div>
      </div>

      {showUploader && (
        <FileUploader 
          onClose={() => setShowUploader(false)}
          onUpload={handleUpload}
        />
      )}

      <div className="tab-content">
        {activeTab === 'files' && (
          <FileList files={files} projectId={id} onRefresh={fetchProjectData} />
        )}
        {activeTab === 'versions' && (
          <VersionTimeline versions={versions} onRestore={handleRestore} />
        )}
      </div>
    </div>
  );
}
