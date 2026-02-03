import { useState } from 'react';
import { FolderPlus, Palette } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import './NewProjectModal.css';

const colors = [
  '#3b82f6', '#a855f7', '#22c55e', '#f59e0b', 
  '#ef4444', '#0ea5e9', '#ec4899', '#8b5cf6'
];

export default function NewProjectModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: colors[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }
    
    setLoading(true);
    try {
      await onCreate(formData);
      setFormData({ name: '', description: '', color: colors[0] });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="new-project-form">
      {error && <div className="form-error">{error}</div>}
      
      <Input
        id="name"
        name="name"
        label="Project Name"
        placeholder="e.g., Database Management Project"
        value={formData.name}
        onChange={handleChange}
        icon={FolderPlus}
        required
      />

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          name="description"
          placeholder="What is this project about?"
          value={formData.description}
          onChange={handleChange}
          className="form-textarea"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          <Palette size={16} />
          Project Color
        </label>
        <div className="color-picker">
          {colors.map(color => (
            <button
              key={color}
              type="button"
              className={`color-option ${formData.color === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setFormData({ ...formData, color })}
            />
          ))}
        </div>
      </div>

      <div className="form-preview">
        <div 
          className="preview-icon"
          style={{ background: `linear-gradient(135deg, ${formData.color}, ${formData.color}88)` }}
        >
          {formData.name ? formData.name.charAt(0).toUpperCase() : 'P'}
        </div>
        <div className="preview-info">
          <span className="preview-name">{formData.name || 'Project Name'}</span>
          <span className="preview-desc">
            {formData.description || 'Project description will appear here'}
          </span>
        </div>
      </div>

      <div className="form-actions">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          loading={loading}
          disabled={!formData.name.trim()}
        >
          Create Project
        </Button>
      </div>
    </form>
  );
}
