import apiClient from './axiosClient';

export const pharmacyApi = {
  createMedicine: (payload) => apiClient.post('/pharmacy/medicines', payload),
  searchMedicines: (params) => apiClient.get('/pharmacy/medicines', { params }),
  createBatch: (payload) => apiClient.post('/pharmacy/batches', payload),
  stockView: (params) => apiClient.get('/pharmacy/stock', { params }),
  dispense: (payload) => apiClient.post('/pharmacy/dispense', payload),
  lowStock: (params) => apiClient.get('/pharmacy/low-stock', { params }),
};
