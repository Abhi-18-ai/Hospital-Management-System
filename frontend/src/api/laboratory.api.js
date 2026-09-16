import apiClient from './axiosClient';

export const laboratoryApi = {
  createOrder: (payload) => apiClient.post('/lab/orders', payload),
  listOrders: (params) => apiClient.get('/lab/orders', { params }),
  getOrderById: (id) => apiClient.get(`/lab/orders/${id}`),
  updateOrderStatus: (id, status) => apiClient.patch(`/lab/orders/${id}/status`, { status }),
  submitResults: (id, results) => apiClient.post(`/lab/orders/${id}/results`, { results }),
  verifyResult: (resultId, decision, comment) =>
    apiClient.post(`/lab/results/${resultId}/verify`, { decision, comment }),
};
