import api from './client';
import { User } from '../types';

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const res = await api.get<User[]>('/users');
    return res.data;
  },

  getById: async (id: number): Promise<User> => {
    const res = await api.get<User>(`/users/${id}`);
    return res.data;
  },

  create: async (data: any): Promise<User> => {
    const res = await api.post<User>('/users', data);
    return res.data;
  },

  update: async (id: number, data: any): Promise<User> => {
    const res = await api.put<User>(`/users/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  }
};
