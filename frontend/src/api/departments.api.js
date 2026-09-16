import apiClient from './axiosClient';

export const departmentsApi = {
  create: (payload) => apiClient.post('/departments', payload),
  list: (params) => apiClient.get('/departments', { params }),
  getById: (id) => apiClient.get(`/departments/${id}`),
  update: (id, payload) => apiClient.patch(`/departments/${id}`, payload),
};
