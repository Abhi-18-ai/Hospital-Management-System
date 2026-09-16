import apiClient from './axiosClient';

export const medicalRecordsApi = {
  create: (payload) => apiClient.post('/medical-records', payload),
  getById: (id) => apiClient.get(`/medical-records/${id}`),
  update: (id, payload) => apiClient.patch(`/medical-records/${id}`, payload),
};
