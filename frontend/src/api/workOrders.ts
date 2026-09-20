import api from './client';
import { WorkOrder, WorkOrderPart } from '../types';

export const workOrderApi = {
  getAll: async (): Promise<WorkOrder[]> => {
    const res = await api.get<WorkOrder[]>('/work-orders');
    return res.data;
  },

  getByTechnician: async (techId: number): Promise<WorkOrder[]> => {
    const res = await api.get<WorkOrder[]>(`/work-orders/technician/${techId}`);
    return res.data;
  },

  getByCustomer: async (customerId: number): Promise<WorkOrder[]> => {
    const res = await api.get<WorkOrder[]>(`/work-orders/customer/${customerId}`);
    return res.data;
  },

  getById: async (id: number): Promise<WorkOrder> => {
    const res = await api.get<WorkOrder>(`/work-orders/${id}`);
    return res.data;
  },

  create: async (data: { serviceRequestId: number; technicianId?: number; scheduledAt?: string; description?: string; notes?: string }): Promise<WorkOrder> => {
    const res = await api.post<WorkOrder>('/work-orders', data);
    return res.data;
  },

  update: async (id: number, data: any): Promise<WorkOrder> => {
    const res = await api.put<WorkOrder>(`/work-orders/${id}`, data);
    return res.data;
  },

  assignTechnician: async (id: number, technicianId: number, scheduledAt?: string): Promise<WorkOrder> => {
    const res = await api.patch<WorkOrder>(`/work-orders/${id}/assign`, { technicianId, scheduledAt });
    return res.data;
  },

  updateStatus: async (id: number, status: string, notes?: string): Promise<WorkOrder> => {
    const res = await api.patch<WorkOrder>(`/work-orders/${id}/status`, { status, notes });
    return res.data;
  },

  addPart: async (id: number, partId: number, quantity: number): Promise<WorkOrderPart> => {
    const res = await api.post<WorkOrderPart>(`/work-orders/${id}/parts`, { partId, quantity });
    return res.data;
  },

  removePart: async (id: number, partUsageId: number): Promise<void> => {
    await api.delete(`/work-orders/${id}/parts/${partUsageId}`);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/work-orders/${id}`);
  }
};
