import apiClient from './axiosClient';

export const usersApi = {
  list: (params) => apiClient.get('/users', { params }),
  getById: (id) => apiClient.get(`/users/${id}`),
  update: (id, payload) => apiClient.patch(`/users/${id}`, payload),
  updateStatus: (id, status) => apiClient.patch(`/users/${id}/status`, { status }),
};
