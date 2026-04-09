import { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import Button from '../common/Button';
import './ProjectDocumentation.css';
import { useTheme } from 'next-themes';

const DEFAULT_README = `# Project Documentation

## Project Overview
Briefly describe the purpose and goals of this project.

## Asset Structure & Guidelines
Explain folder structure, naming conventions, or required formats for files in this vault.

## Setup / Installation
Any requirements, environments, or software needed to work on this project locally.

## Key Links
- [Figma Design](https://figma.com)
- [Jira Board](https://jira.com)

## Roles & Responsibilities
- **Lead:** Name (email@example.com)
`;

export default function ProjectDocumentation({ project, onSave, isSaving }) {
  const [content, setContent] = useState(project?.readme || DEFAULT_README);
  const [isEditing, setIsEditing] = useState(false);
  const { theme, systemTheme } = useTheme();
  
  // Update state when project updates externally
  useEffect(() => {
    if (project?.readme !== undefined) {
      if (project.readme) {
          setContent(project.readme);
      }
    }
  }, [project?.readme]);

  // Determine current color mode for editor
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDarkMode = currentTheme === 'dark';

  const handleCancel = () => {
    setContent(project?.readme || DEFAULT_README);
    setIsEditing(false);
  };

  const handleSave = async () => {
    await onSave(content);
    setIsEditing(false); // Switch to preview mode after saving
  };

  return (
    <div className="project-documentation" data-color-mode={isDarkMode ? 'dark' : 'light'}>
      {!isEditing && (
        <div className="documentation-view-header">
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            Edit Documentation
          </Button>
        </div>
      )}
      <div className="documentation-editor-wrapper">
        {isEditing ? (
          <MDEditor
            value={content}
            onChange={setContent}
            height={600}
            preview="live"
          />
        ) : (
          <div className="markdown-preview-only">
            <MDEditor.Markdown source={content} />
          </div>
        )}
      </div>
      {isEditing && (
        <div className="documentation-actions">
          {content !== project?.readme && (
            <span className="unsaved-warning">Unsaved changes </span>
          )}
          <Button variant="secondary" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={isSaving || content === project?.readme}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
}
