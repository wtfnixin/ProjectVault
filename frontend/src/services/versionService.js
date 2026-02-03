import api from './api';

export const versionService = {
  getVersions: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/versions`);
    return response.data;
  },

  getVersion: async (projectId, versionId) => {
    const response = await api.get(`/projects/${projectId}/versions/${versionId}`);
    return response.data;
  },

  restore: async (projectId, versionId) => {
    const response = await api.post(`/projects/${projectId}/versions/${versionId}/restore`);
    return response.data;
  },

  compare: async (projectId, version1Id, version2Id) => {
    const response = await api.get(`/projects/${projectId}/versions/compare`, {
      params: { v1: version1Id, v2: version2Id },
    });
    return response.data;
  },

  downloadVersion: async (projectId, versionId) => {
    const response = await api.get(`/projects/${projectId}/versions/${versionId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default versionService;
