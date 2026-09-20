import api from './client';
import { Customer } from '../types';

export const customerApi = {
  getAll: async (): Promise<Customer[]> => {
    const res = await api.get<Customer[]>('/customers');
    return res.data;
  },

  getById: async (id: number): Promise<Customer> => {
    const res = await api.get<Customer>(`/customers/${id}`);
    return res.data;
  },

  getByUserId: async (userId: number): Promise<Customer> => {
    const res = await api.get<Customer>(`/customers/user/${userId}`);
    return res.data;
  },

  create: async (data: any): Promise<Customer> => {
    const res = await api.post<Customer>('/customers', data);
    return res.data;
  },

  update: async (id: number, data: any): Promise<Customer> => {
    const res = await api.put<Customer>(`/customers/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/customers/${id}`);
  }
};
