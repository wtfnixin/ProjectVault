import { useState, useEffect } from 'react';
import { X, Download, FileText, Image as ImageIcon, Code, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import mammoth from 'mammoth';
import './FilePreviewModal.css';

export default function FilePreviewModal({ file, projectId, onClose }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fileType, setFileType] = useState('unknown'); // image, code, pdf, docx, other

  useEffect(() => {
    if (!file) return;

    const loadPreview = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Determine type based on mime or extension
        const isImage = file.mime_type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(file.original_name);
        const isPdf = file.mime_type === 'application/pdf' || /\.pdf$/i.test(file.original_name);
        const isDocx = file.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || /\.docx$/i.test(file.original_name);
        
        // Expanded code/text extensions
        const codeExtensions = /\.(js|jsx|ts|tsx|css|html|json|py|md|txt|sql|xml|yml|yaml|ini|env|gitignore|java|c|cpp|h|hpp|cs|rb|go|rs|php|sh|bat|ps1|dockerfile|conf|cfg|toml|properties|gradle|groovy)$/i;
        const isCode = codeExtensions.test(file.original_name) || 
                       file.mime_type?.startsWith('text/') || 
                       file.mime_type === 'application/json' ||
                       file.mime_type === 'application/javascript' ||
                       file.original_name === 'Dockerfile' ||
                       file.original_name === 'Makefile' ||
                       file.original_name === 'LICENSE';
        
        if (isImage) {
          setFileType('image');
          const response = await api.get(`/projects/${projectId}/files/${file.id}/download`, { responseType: 'blob' });
          const url = URL.createObjectURL(response.data);
          setContent(url);
        } else if (isPdf) {
          setFileType('pdf');
          const response = await api.get(`/projects/${projectId}/files/${file.id}/download`, { responseType: 'blob' });
          const url = URL.createObjectURL(response.data);
          setContent(url);
        } else if (isDocx) {
          setFileType('docx');
          const response = await api.get(`/projects/${projectId}/files/${file.id}/download`, { responseType: 'arraybuffer' });
          const result = await mammoth.convertToHtml({ arrayBuffer: response.data });
          setContent(result.value);
        } else if (isCode) {
          setFileType('code');
          const response = await api.get(`/projects/${projectId}/files/${file.id}/download`, { responseType: 'text' });
          setContent(response.data);
        } else {
          setFileType('other');
        }
      } catch (err) {
        console.error('Preview failed:', err);
        setError('Failed to load preview');
      } finally {
        setLoading(false);
      }
    };

    loadPreview();

    return () => {
      if ((fileType === 'image' || fileType === 'pdf') && content) {
        URL.revokeObjectURL(content);
      }
    };
  }, [file, projectId]);

  const handleDownload = async () => {
    try {
        const response = await api.get(`/projects/${projectId}/files/${file.id}/download`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file.original_name);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (e) {
        console.error("Download failed", e);
    }
  };

  if (!file) return null;

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={e => e.stopPropagation()}>
        <header className="preview-header">
          <div className="preview-title">
            {fileType === 'image' && <ImageIcon size={18} />}
            {fileType === 'code' && <Code size={18} />}
            {fileType === 'pdf' && <FileText size={18} />}
            {fileType === 'docx' && <FileText size={18} />}
            {fileType === 'other' && <FileText size={18} />}
            <h3>{file.original_name}</h3>
          </div>
          <div className="preview-actions">
            <button className="preview-close" onClick={handleDownload} title="Download">
              <Download size={20} />
            </button>
            <button className="preview-close" onClick={onClose} title="Close">
              <X size={20} />
            </button>
          </div>
        </header>
        
        <div className="preview-content">
          {loading ? (
            <div className="loading-spinner"></div>
          ) : error ? (
            <div className="preview-error">
              <AlertCircle size={32} />
              <p>{error}</p>
            </div>
          ) : fileType === 'image' ? (
            <img src={content} alt={file.original_name} className="preview-image" />
          ) : fileType === 'pdf' ? (
            <embed src={content} type="application/pdf" width="100%" height="100%" />
          ) : fileType === 'docx' ? (
             <div className="preview-docx" dangerouslySetInnerHTML={{ __html: content }} />
          ) : fileType === 'code' ? (
            <div className="preview-code-container">
              <pre className="preview-code">
                <code>{content}</code>
              </pre>
            </div>
          ) : (
            <div className="preview-message">
              <FileText size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
              <p>Preview not available for this file type.</p>
              <button className="btn-secondary" onClick={handleDownload} style={{ marginTop: 16 }}>
                Download to view
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
