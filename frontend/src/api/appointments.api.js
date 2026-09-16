import apiClient from './axiosClient';

export const appointmentsApi = {
  create: (payload) => apiClient.post('/appointments', payload),
  list: (params) => apiClient.get('/appointments', { params }),
  getById: (id) => apiClient.get(`/appointments/${id}`),
  update: (id, payload) => apiClient.patch(`/appointments/${id}`, payload),
  cancel: (id, reason) => apiClient.post(`/appointments/${id}/cancel`, { reason }),
  reschedule: (id, payload) => apiClient.post(`/appointments/${id}/reschedule`, payload),
  checkIn: (id) => apiClient.post(`/appointments/${id}/check-in`),
};
