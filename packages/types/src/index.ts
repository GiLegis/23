// Base types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: ClientStatus;
  createdAt: Date;
  updatedAt: Date;
  projects?: Project[];
  _count?: {
    projects: number;
  };
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  clientId: string;
  client?: Client;
  createdAt: Date;
  updatedAt: Date;
}

// Enums
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING'
}

export enum ClientStatus {
  LEAD = 'LEAD',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum ProjectStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Request/Response types
export interface CreateClientRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: ClientStatus;
}

export interface UpdateClientRequest {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: ClientStatus;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  clientId: string;
}

export interface UpdateProjectRequest {
  id: string;
  name?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  clientId?: string;
}

export interface UpdateUserRequest {
  id: string;
  name?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface DashboardStats {
  totalClients: number;
  activeProjects: number;
  completedProjects: number;
  newClientsThisMonth: number;
  recentProjects: Project[];
  recentClients: Client[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}