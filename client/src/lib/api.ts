import { 
  User, 
  Client, 
  Project, 
  CreateClientRequest, 
  UpdateClientRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  UpdateUserRequest,
  DashboardStats,
  ApiResponse 
} from '@synergia/types';

const API_BASE_URL = 'http://localhost:3001/api';

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem('supabase_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: this.getAuthHeaders(),
        ...options
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ user: User; session: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getCurrentUser() {
    return this.request<User>('/auth/me');
  }

  // Dashboard
  async getDashboardStats() {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  // Users
  async getUsers() {
    return this.request<User[]>('/users');
  }

  async inviteUser(email: string, name: string, role: string) {
    return this.request<User>('/users/invite', {
      method: 'POST',
      body: JSON.stringify({ email, name, role })
    });
  }

  async updateUser(data: UpdateUserRequest) {
    return this.request<User>(`/users/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  }

  // Clients
  async getClients() {
    return this.request<Client[]>('/clients');
  }

  async getClient(id: string) {
    return this.request<Client>(`/clients/${id}`);
  }

  async createClient(data: CreateClientRequest) {
    return this.request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateClient(data: UpdateClientRequest) {
    return this.request<Client>(`/clients/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteClient(id: string) {
    return this.request(`/clients/${id}`, { method: 'DELETE' });
  }

  // Projects
  async getProjects() {
    return this.request<Project[]>('/projects');
  }

  async getProject(id: string) {
    return this.request<Project>(`/projects/${id}`);
  }

  async createProject(data: CreateProjectRequest) {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateProject(data: UpdateProjectRequest) {
    return this.request<Project>(`/projects/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, { method: 'DELETE' });
  }
}

export const api = new ApiClient();