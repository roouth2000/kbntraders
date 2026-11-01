import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Sends and receives HttpOnly refresh cookies securely
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag and queue to prevent multiple concurrent refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. Request Interceptor: Attach in-memory access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Handle 401 and silent refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is not 401 or request already attempted retry, or it's an auth endpoint itself
    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh-token') ||
      originalRequest.url?.includes('/auth/register')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post(
        `${BASE_URL}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );

      const { accessToken, user } = response.data;
      useAuthStore.getState().setAuth(user, accessToken);

      processQueue(null, accessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Typed API Service Methods
export const api = {
  // Auth
  register: (data: { name: string; email: string; password: string; companyName?: string; role?: string }) =>
    apiClient.post('/auth/register', data),

  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),

  logout: () =>
    apiClient.post('/auth/logout'),

  getCurrentUser: () =>
    apiClient.get('/auth/me'),

  refreshToken: () =>
    apiClient.post('/auth/refresh-token'),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (payload: { email: string; token: string; newPassword: string }) =>
    apiClient.post('/auth/reset-password', payload),

  updateProfile: (profile: { name?: string; companyName?: string; currency?: string; avatar?: string }) =>
    apiClient.put('/auth/profile', profile),

  changePassword: (passwords: { currentPassword: string; newPassword: string }) =>
    apiClient.put('/auth/change-password', passwords),

  getUsers: () =>
    apiClient.get('/auth/users'),

  // Customers
  getCustomers: (params?: { search?: string }) =>
    apiClient.get('/customers', { params }),

  getCustomer: (id: string) =>
    apiClient.get(`/customers/${id}`),

  createCustomer: (customer: { name: string; phone: string; email?: string; address?: string; opening_balance?: number; notes?: string }) =>
    apiClient.post('/customers', customer),

  updateCustomer: (id: string, customer: any) =>
    apiClient.put(`/customers/${id}`, customer),

  deleteCustomer: (id: string) =>
    apiClient.delete(`/customers/${id}`),

  // Varieties (A1, A2, A3, SPL, Loosu, Custom)
  getVarieties: () =>
    apiClient.get('/varieties'),

  createVariety: (variety: {
    fruit?: string;
    origin?: string;
    size_count?: string;
    code: string;
    name: string;
    default_unit?: string;
    default_rate_kg?: number;
    default_rate_box?: number;
  }) =>
    apiClient.post('/varieties', variety),

  updateVariety: (id: string, variety: any) =>
    apiClient.put(`/varieties/${id}`, variety),

  deleteVariety: (id: string) =>
    apiClient.delete(`/varieties/${id}`),

  // Invoices & Multi-Variety Billing
  getInvoices: (params?: { customer_id?: string; status?: string; startDate?: string; endDate?: string; search?: string }) =>
    apiClient.get('/invoices', { params }),

  getInvoice: (id: string) =>
    apiClient.get(`/invoices/${id}`),

  createInvoice: (invoice: any) =>
    apiClient.post('/invoices', invoice),

  updateInvoiceStatus: (id: string, status: string) =>
    apiClient.patch(`/invoices/${id}/status`, { status }),

  // Payments (Cash, UPI, Bank Transfer)
  getPayments: (params?: { customer_id?: string; payment_mode?: string; startDate?: string; endDate?: string; search?: string }) =>
    apiClient.get('/payments', { params }),

  createPayment: (payment: {
    customerId: string;
    customerName?: string;
    invoiceId?: string;
    amount: number;
    paymentMode: 'Cash' | 'UPI' | 'Bank Transfer';
    transactionRef?: string;
    paymentDate?: string;
    notes?: string;
  }) => apiClient.post('/payments', payment),

  // Ledgers
  getCustomerLedger: (customerId: string, params?: { startDate?: string; endDate?: string }) =>
    apiClient.get(`/ledgers/customer/${customerId}`, { params }),

  getLedgerSummary: () =>
    apiClient.get('/ledgers/summary'),

  // Reports & Dashboard
  getDashboardReports: () =>
    apiClient.get('/reports/dashboard'),

  getVarietySalesReport: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get('/reports/variety-sales', { params }),
};
