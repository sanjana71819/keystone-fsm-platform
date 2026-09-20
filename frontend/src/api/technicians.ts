import api from './client';
import { Technician } from '../types';

export const technicianApi = {
  getAll: async (): Promise<Technician[]> => {
    const res = await api.get<Technician[]>('/technicians');
    return res.data;
  },

  getAvailable: async (): Promise<Technician[]> => {
    const res = await api.get<Technician[]>('/technicians/available');
    return res.data;
  },

  getById: async (id: number): Promise<Technician> => {
    const res = await api.get<Technician>(`/technicians/${id}`);
    return res.data;
  },

  getByUserId: async (userId: number): Promise<Technician> => {
    const res = await api.get<Technician>(`/technicians/user/${userId}`);
    return res.data;
  },

  create: async (data: any): Promise<Technician> => {
    const res = await api.post<Technician>('/technicians', data);
    return res.data;
  },

  update: async (id: number, data: any): Promise<Technician> => {
    const res = await api.put<Technician>(`/technicians/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/technicians/${id}`);
  }
};
