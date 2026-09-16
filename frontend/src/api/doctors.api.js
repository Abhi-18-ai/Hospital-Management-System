import apiClient from './axiosClient';

export const doctorsApi = {
  create: (payload) => apiClient.post('/doctors', payload),
  list: (params) => apiClient.get('/doctors', { params }),
  getById: (id) => apiClient.get(`/doctors/${id}`),
  update: (id, payload) => apiClient.patch(`/doctors/${id}`, payload),
  getAvailability: (id, date) => apiClient.get(`/doctors/${id}/availability`, { params: { date } }),
  updateSchedule: (id, schedule) => apiClient.patch(`/doctors/${id}/schedule`, { schedule }),
};
