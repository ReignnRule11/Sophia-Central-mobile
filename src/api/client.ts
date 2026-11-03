// Keep a single Axios instance for every mobile API request.
// Authentication cookies and CSRF headers are configured in ../config/api.
export { apiClient as default, apiClient, clearAuthState } from '../config/api';
