import api from './api';

export const projectService = {
  getAll: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/projects/${id}`);
  },

  uploadFiles: async (projectId, files, versionNote = '') => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('versionNote', versionNote);
    
    const response = await api.post(`/projects/${projectId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  downloadAll: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default projectService;
