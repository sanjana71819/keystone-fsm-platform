import api from './client';
import { Facility } from '../types';

export const facilityApi = {
  getAll: async (): Promise<Facility[]> => {
    const res = await api.get<Facility[]>('/facilities');
    return res.data;
  },

  getByCustomer: async (customerId: number): Promise<Facility[]> => {
    const res = await api.get<Facility[]>(`/facilities/customer/${customerId}`);
    return res.data;
  },

  getById: async (id: number): Promise<Facility> => {
    const res = await api.get<Facility>(`/facilities/${id}`);
    return res.data;
  },

  create: async (data: any): Promise<Facility> => {
    const res = await api.post<Facility>('/facilities', data);
    return res.data;
  },

  update: async (id: number, data: any): Promise<Facility> => {
    const res = await api.put<Facility>(`/facilities/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/facilities/${id}`);
  }
};
