import apiClient from './axiosClient';

export const notificationsApi = {
  list: (params) => apiClient.get('/notifications', { params }),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
};
