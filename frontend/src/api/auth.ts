import api from './client';
import { AuthResponse, User } from '../types';

export const authApi = {
  login: async (credentials: { username: string; password: string }): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', credentials);
    return res.data;
  },

  register: async (data: any): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  }
};
