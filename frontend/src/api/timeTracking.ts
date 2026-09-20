import api from './client';
import { TimeEntry } from '../types';

export const timeTrackingApi = {
  getAll: async (): Promise<TimeEntry[]> => {
    const res = await api.get<TimeEntry[]>('/time-entries');
    return res.data;
  },

  getByWorkOrder: async (workOrderId: number): Promise<TimeEntry[]> => {
    const res = await api.get<TimeEntry[]>(`/time-entries/work-order/${workOrderId}`);
    return res.data;
  },

  getByTechnician: async (techId: number): Promise<TimeEntry[]> => {
    const res = await api.get<TimeEntry[]>(`/time-entries/technician/${techId}`);
    return res.data;
  },

  getActiveClockIn: async (techId: number): Promise<TimeEntry | null> => {
    const res = await api.get<TimeEntry>(`/time-entries/active/technician/${techId}`);
    return res.status === 204 ? null : res.data;
  },

  clockIn: async (data: { workOrderId: number; technicianId?: number; notes?: string }): Promise<TimeEntry> => {
    const res = await api.post<TimeEntry>('/time-entries/clock-in', data);
    return res.data;
  },

  clockOut: async (entryId: number, notes?: string): Promise<TimeEntry> => {
    const res = await api.post<TimeEntry>(`/time-entries/${entryId}/clock-out`, { notes });
    return res.data;
  },

  createManual: async (data: any): Promise<TimeEntry> => {
    const res = await api.post<TimeEntry>('/time-entries/manual', data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/time-entries/${id}`);
  }
};
