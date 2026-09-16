import apiClient from './axiosClient';

export const billingApi = {
  createInvoice: (payload) => apiClient.post('/billing/invoices', payload),
  listInvoices: (params) => apiClient.get('/billing/invoices', { params }),
  getInvoiceById: (id) => apiClient.get(`/billing/invoices/${id}`),
  recordPayment: (id, payload) => apiClient.post(`/billing/invoices/${id}/payments`, payload),
  refundPayment: (paymentId, reason) => apiClient.post(`/billing/payments/${paymentId}/refund`, { reason }),
};
