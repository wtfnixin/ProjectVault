import { useState, useEffect } from 'react';
import { FileText, Download, MoreHorizontal, Eye } from 'lucide-react';
import api from '../../services/api';
import FilePreviewModal from '../common/FilePreviewModal';
import TableSkeleton from '../common/skeletons/TableSkeleton';
import './FileList.css';

export default function FileList({ files, projectId, onRefresh, loading }) {
  const [previewFile, setPreviewFile] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await api.get(`/projects/${projectId}/files/${fileId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await api.delete(`/projects/${projectId}/files/${fileId}`);
      onRefresh();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  if (loading) {
    return <TableSkeleton rows={5} />;
  }

  if (files.length === 0) {
    return (
      <div className="file-list-container">
        <div className="empty-files">
          <FileText size={32} />
          <p>No files uploaded yet. Click "Upload Files" to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-list-container">
      <table className="files-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Size</th>
            <th>Uploaded</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map(file => (
            <tr key={file.id}>
              <td>
                <div className="file-name-cell">
                  <FileText size={18} className="file-type-icon" />
                  <span className="file-name">{file.original_name}</span>
                </div>
              </td>
              <td className="file-size-cell">{formatSize(file.size)}</td>
              <td className="file-date-cell">{formatDate(file.uploaded_at)}</td>
              <td>
                <div className="file-actions">
                  <button 
                    className="action-btn" 
                    title="Preview"
                    onClick={() => setPreviewFile(file)}
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    className="action-btn" 
                    title="Download"
                    onClick={() => handleDownload(file.id, file.original_name)}
                  >
                    <Download size={16} />
                  </button>
                  <div className="action-menu-container">
                    <button 
                      className={`action-btn ${activeMenu === file.id ? 'active' : ''}`}
                      title="More actions"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === file.id ? null : file.id);
                      }}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    
                    {activeMenu === file.id && (
                      <div className="action-dropdown" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="action-dropdown-item delete-item"
                          onClick={() => {
                            handleDelete(file.id);
                            setActiveMenu(null);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {previewFile && (
        <FilePreviewModal 
            file={previewFile}
            projectId={projectId}
            onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}
