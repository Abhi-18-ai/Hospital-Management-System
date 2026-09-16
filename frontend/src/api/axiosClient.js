import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// In-memory access token. Never persisted to localStorage: an XSS payload
// that can run JS can already read localStorage, so keeping the access
// token in memory (and the refresh token in an HTTP-only cookie set by the
// backend) is the safer pattern the backend was built to support.
let accessToken = null;
let onUnauthorized = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends the HTTP-only refresh-token cookie
});

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const code = error.response?.data?.error?.code;

    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/refresh');

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        // De-duplicate concurrent refresh calls: if five requests 401 at
        // once, we only want to hit /auth/refresh a single time.
        if (!refreshPromise) {
          refreshPromise = apiClient.post('/auth/refresh').finally(() => {
            refreshPromise = null;
          });
        }
        const refreshResponse = await refreshPromise;
        const newToken = refreshResponse.data?.data?.accessToken;
        setAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        if (onUnauthorized) onUnauthorized();
        return Promise.reject(refreshError);
      }
    }

    if (status === 401 && code && code !== 'INVALID_CREDENTIALS') {
      if (onUnauthorized) onUnauthorized();
    }

    return Promise.reject(error);
  }
);

/** Extracts a human-readable message from any API error shape. */
export function getErrorMessage(error) {
  const details = error?.response?.data?.error?.details;
  if (Array.isArray(details) && details.length > 0) {
    return details.map((d) => d.message).join(' ');
  }
  return error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.';
}

export default apiClient;
