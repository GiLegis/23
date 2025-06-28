export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  status: 'active' | 'completed' | 'on-hold';
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}