import apiClient from './axiosClient';

export const admissionsApi = {
  admit: (payload) => apiClient.post('/admissions', payload),
  list: (params) => apiClient.get('/admissions', { params }),
  getById: (id) => apiClient.get(`/admissions/${id}`),
  transfer: (id, payload) => apiClient.post(`/admissions/${id}/transfer`, payload),
  discharge: (id, dischargeSummary) => apiClient.post(`/admissions/${id}/discharge`, { dischargeSummary }),
  bedsAvailability: (params) => apiClient.get('/beds/availability', { params }),
};
