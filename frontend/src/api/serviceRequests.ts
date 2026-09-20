import api from './client';
import { ServiceRequest } from '../types';

export const serviceRequestApi = {
  getAll: async (): Promise<ServiceRequest[]> => {
    const res = await api.get<ServiceRequest[]>('/service-requests');
    return res.data;
  },

  getByCustomer: async (customerId: number): Promise<ServiceRequest[]> => {
    const res = await api.get<ServiceRequest[]>(`/service-requests/customer/${customerId}`);
    return res.data;
  },

  getOverdue: async (): Promise<ServiceRequest[]> => {
    const res = await api.get<ServiceRequest[]>('/service-requests/overdue');
    return res.data;
  },

  getById: async (id: number): Promise<ServiceRequest> => {
    const res = await api.get<ServiceRequest>(`/service-requests/${id}`);
    return res.data;
  },

  create: async (data: { customerId?: number; facilityId?: number; title: string; description?: string; priority: string; slaHours?: number }): Promise<ServiceRequest> => {
    const res = await api.post<ServiceRequest>('/service-requests', data);
    return res.data;
  },

  update: async (id: number, data: any): Promise<ServiceRequest> => {
    const res = await api.put<ServiceRequest>(`/service-requests/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/service-requests/${id}`);
  }
};
