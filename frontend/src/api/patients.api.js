import apiClient from './axiosClient';

export const patientsApi = {
  create: (payload) => apiClient.post('/patients', payload),
  getMine: () => apiClient.get('/patients/me'),
  list: (params) => apiClient.get('/patients', { params }),
  getById: (id) => apiClient.get(`/patients/${id}`),
  update: (id, payload) => apiClient.patch(`/patients/${id}`, payload),
  getHistory: (id) => apiClient.get(`/patients/${id}/history`),
  getAppointments: (id, params) => apiClient.get(`/patients/${id}/appointments`, { params }),
  getMedicalRecords: (id, params) => apiClient.get(`/patients/${id}/medical-records`, { params }),
  getPrescriptions: (id, params) => apiClient.get(`/patients/${id}/prescriptions`, { params }),
};
