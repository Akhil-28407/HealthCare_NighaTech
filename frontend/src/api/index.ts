import api from './axios';

export const authApi = {
  sendOtp: (mobile: string) => api.post('/auth/send-otp', { mobile }),
  verifyOtp: (mobile: string, otp: string, deviceInfo?: string) =>
    api.post('/auth/verify-otp', { mobile, otp, deviceInfo }),
  register: (data: { name: string; email: string; password: string; mobile?: string }) =>
    api.post('/auth/register', data),
  login: (email: string, password: string, deviceInfo?: string) =>
    api.post('/auth/login', { email, password, deviceInfo }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  logout: (sessionId?: string) => api.post('/auth/logout', { sessionId }),
  getSessions: () => api.get('/auth/sessions'),
  revokeSession: (id: string) => api.delete(`/auth/sessions/${id}`),
  revokeAllSessions: () => api.delete('/auth/sessions/all'),
};

export const usersApi = {
  getAll: (params?: any) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const branchesApi = {
  getAll: (params?: any) => api.get('/branches', { params }),
  getById: (id: string) => api.get(`/branches/${id}`),
  create: (data: any) => api.post('/branches', data),
  update: (id: string, data: any) => api.patch(`/branches/${id}`, data),
  delete: (id: string) => api.delete(`/branches/${id}`),
};

export const clientsApi = {
  getAll: (params?: any) => api.get('/clients', { params }),
  getById: (id: string) => api.get(`/clients/${id}`),
  create: (data: any) => api.post('/clients', data),
  update: (id: string, data: any) => api.patch(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
};

export const testMasterApi = {
  getAll: (params?: any) => api.get('/test-master', { params }),
  getById: (id: string) => api.get(`/test-master/${id}`),
  create: (data: any) => api.post('/test-master', data),
  update: (id: string, data: any) => api.patch(`/test-master/${id}`, data),
  delete: (id: string) => api.delete(`/test-master/${id}`),
};

export const testOrdersApi = {
  getAll: (params?: any) => api.get('/test-orders', { params }),
  getById: (id: string) => api.get(`/test-orders/${id}`),
  create: (data: any) => api.post('/test-orders', data),
  collectSample: (id: string) => api.patch(`/test-orders/${id}/collect-sample`),
};

export const labReportsApi = {
  getAll: (params?: any) => api.get('/lab-reports', { params }),
  getById: (id: string) => api.get(`/lab-reports/${id}`),
  updateResults: (id: string, results: any[]) =>
    api.patch(`/lab-reports/${id}/results`, { results }),
  verify: (id: string) => api.post(`/lab-reports/${id}/verify`),
  downloadPdf: (id: string) =>
    api.get(`/lab-reports/${id}/pdf`, { responseType: 'blob' }),
};

export const invoicesApi = {
  getAll: (params?: any) => api.get('/invoices', { params }),
  getById: (id: string) => api.get(`/invoices/${id}`),
  create: (data: any) => api.post('/invoices', data),
  send: (id: string) => api.post(`/invoices/${id}/send`),
  markPaid: (id: string) => api.post(`/invoices/${id}/mark-paid`),
  downloadPdf: (id: string) =>
    api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
};

export const quotationsApi = {
  getAll: (params?: any) => api.get('/quotations', { params }),
  getById: (id: string) => api.get(`/quotations/${id}`),
  create: (data: any) => api.post('/quotations', data),
  send: (id: string) => api.post(`/quotations/${id}/send`),
  convert: (id: string) => api.post(`/quotations/${id}/convert`),
  downloadPdf: (id: string) =>
    api.get(`/quotations/${id}/pdf`, { responseType: 'blob' }),
};

export const templatesApi = {
  getAll: (params?: any) => api.get('/templates', { params }),
  getById: (id: string) => api.get(`/templates/${id}`),
  create: (data: any) => api.post('/templates', data),
  update: (id: string, data: any) => api.patch(`/templates/${id}`, data),
  delete: (id: string) => api.delete(`/templates/${id}`),
  preview: (id: string, data?: any) => api.post(`/templates/${id}/preview`, data || {}),
};

export const auditLogsApi = {
  getAll: (params?: any) => api.get('/audit-logs', { params }),
};
