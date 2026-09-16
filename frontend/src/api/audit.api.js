import apiClient from './axiosClient';

export const auditApi = {
  search: (params) => apiClient.get('/audit', { params }),
};
