import api from './client';
import { Part } from '../types';

export const inventoryApi = {
  getAll: async (): Promise<Part[]> => {
    const res = await api.get<Part[]>('/parts');
    return res.data;
  },

  getLowStock: async (): Promise<Part[]> => {
    const res = await api.get<Part[]>('/parts/low-stock');
    return res.data;
  },

  getById: async (id: number): Promise<Part> => {
    const res = await api.get<Part>(`/parts/${id}`);
    return res.data;
  },

  create: async (data: any): Promise<Part> => {
    const res = await api.post<Part>('/parts', data);
    return res.data;
  },

  update: async (id: number, data: any): Promise<Part> => {
    const res = await api.put<Part>(`/parts/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/parts/${id}`);
  }
};
