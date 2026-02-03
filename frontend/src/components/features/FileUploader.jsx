import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import './FileUploader.css';

export default function FileUploader({ onClose, onUpload }) {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [versionNote, setVersionNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, []);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const addFiles = (newFiles) => {
    const filesWithId = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setFiles(prev => [...prev, ...filesWithId]);
    setError(''); // Clear error on file add
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleUpload = async () => {
    setUploading(true);
    setError('');
    
    try {
      await onUpload({ files, versionNote });
      // Determine if successful by assuming onUpload throws on error
      // If we get here, parent will likely close modal or we can reset
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
      setUploading(false); // Stop loading state on error
    }
    // If success, we don't setUploading(false) here because component unmounts
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  return (
    <Card padding="md" className="file-uploader">
      <div className="uploader-header">
        <h3><Upload size={18} /> Upload Files</h3>
        <button className="close-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <div className="drop-zone-content">
          <div className="upload-icon">
            <Upload size={28} />
          </div>
          <p className="drop-text">
            <strong>Click to upload</strong> or drag and drop files here
          </p>
          <p className="drop-hint">PDF, DOC, PPT, code files, and more</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          <div className="file-list-header">
            <span>{files.length} file(s) selected</span>
            <button className="clear-all" onClick={() => setFiles([])}>
              Clear all
            </button>
          </div>
          <ul className="files">
            {files.map(({ id, name, size }) => (
              <li key={id} className="file-item">
                <FileText size={16} className="file-icon" />
                <div className="file-info">
                  <span className="file-name">{name}</span>
                  <span className="file-size">{formatSize(size)}</span>
                </div>
                <button className="remove-file" onClick={() => removeFile(id)}>
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="version-note">
        <label>Version Note (optional)</label>
        <input
          type="text"
          placeholder="e.g., Updated final presentation"
          value={versionNote}
          onChange={(e) => {
            setVersionNote(e.target.value);
            setError('');
          }}
        />
      </div>

      {error && (
        <div className="upload-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="uploader-actions">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          icon={uploading ? null : CheckCircle}
          loading={uploading}
          disabled={files.length === 0}
          onClick={handleUpload}
        >
          Upload & Create Version
        </Button>
      </div>
    </Card>
  );
}
