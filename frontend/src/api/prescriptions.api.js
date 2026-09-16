import apiClient from './axiosClient';

export const prescriptionsApi = {
  create: (payload) => apiClient.post('/prescriptions', payload),
  getById: (id) => apiClient.get(`/prescriptions/${id}`),
  update: (id, payload) => apiClient.patch(`/prescriptions/${id}`, payload),
};
