const API_BASE_URL = 'https://api-tarefa.justvy.in/api';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage() {
    this.token = localStorage.getItem('access_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      defaultHeaders.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Try to refresh token
        const refreshed = await this.refreshToken();
        if (refreshed && this.token) {
          // Retry the original request
          config.headers = {
            ...defaultHeaders,
            Authorization: `Bearer ${this.token}`,
            ...options.headers,
          };
          const retryResponse = await fetch(url, config);
          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`);
          }
          return retryResponse.json();
        } else {
          // Refresh failed, redirect to login
          this.removeToken();
          window.location.href = '/login';
          throw new Error('Authentication failed');
        }
      }

      // if (!response.ok) {
      //   const errorData = await response.json().catch(() => ({}));
      //   throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      // }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw {
          status: response.status,
          error: errorData,
        };
      }


      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{
      user: any;
      tokens: { access: string; refresh: string };
    }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.setToken(response.tokens.access);
    localStorage.setItem('refresh_token', response.tokens.refresh);

    return response;
  }

  async register(userData: any) {
    const response = await this.request<{
      user: any;
      tokens: { access: string; refresh: string };
    }>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    this.setToken(response.tokens.access);
    localStorage.setItem('refresh_token', response.tokens.refresh);

    return response;
  }

  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      await this.request('/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    }
    this.removeToken();
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setToken(data.access);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  async getCurrentUser() {
    return this.request<any>('/auth/profile/');
  }

  // User methods
  async getUsers(params?: Record<string, any>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/users/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<any>(endpoint);
  }

  async getUserById(id: number) {
    return this.request<any>(`/users/${id}/`);
  }

  async createUser(userData: any) {
    return this.request<any>('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: number, userData: any) {
    return this.request<any>(`/users/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: number) {
    return this.request<any>(`/users/${id}/`, {
      method: 'DELETE',
    });
  }

  async restoreUser(id: number) {
    return this.request<any>(`/users/${id}/restore/`, {
      method: 'POST',
    });
  }

  async getDeletedUsers() {
    return this.request<any>('/users/deleted/');
  }

  async addUserToTeam(userData: { user_id: number; team_id: number }) {
    return this.request<any>('/users/add-to-team/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async searchUsers(query: string) {
    return this.request<any>(`/users/search/?q=${encodeURIComponent(query)}`);
  }

  async getUserStats() {
    return this.request<any>('/users/stats/');
  }

  // Team methods
  async getTeams(params?: Record<string, any>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/teams/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<any>(endpoint);
  }

  async getTeamById(id: number) {
    return this.request<any>(`/teams/${id}/`);
  }

  async createTeam(teamData: any) {
    return this.request<any>('/teams/', {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  }

  async updateTeam(id: number, teamData: any) {
    return this.request<any>(`/teams/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(teamData),
    });
  }

  async deleteTeam(id: number) {
    return this.request<any>(`/teams/${id}/`, {
      method: 'DELETE',
    });
  }

  // Task methods
  async getTasks(params?: Record<string, any>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/tasks/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<any>(endpoint);
  }

  async getTaskById(id: number) {
    return this.request<any>(`/tasks/${id}/`);
  }

  async createTask(taskData: any) {
    return this.request<any>('/tasks/', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(id: number, taskData: any) {
    return this.request<any>(`/tasks/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(id: number) {
    return this.request<any>(`/tasks/${id}/`, {
      method: 'DELETE',
    });
  }

  async getMyTasks() {
    return this.request<any>('/tasks/my-tasks/');
  }

  async getMyCreatedTasks() {
    return this.request<any>('/tasks/my-created-tasks/');
  }

  async completeTask(id: number) {
    return this.request<any>(`/tasks/${id}/complete/`, {
      method: 'POST',
    });
  }

  // Comment methods
  async getComments(params?: Record<string, any>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/comments/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<any>(endpoint);
  }

  async createComment(commentData: any) {
    return this.request<any>('/comments/', {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  async updateComment(id: number, commentData: any) {
    return this.request<any>(`/comments/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(commentData),
    });
  }

  async updateCommentWithFiles(id: number, commentData: any, newFiles?: File[], removeFileUrls?: string[], removeImageUrls?: string[]) {
    // First upload any new files
    const uploadedFiles: any[] = [];
    const uploadedImages: any[] = [];

    if (newFiles && newFiles.length > 0) {
      // Separate images from other files
      const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));
      const otherFiles = newFiles.filter(file => !file.type.startsWith('image/'));

      try {
        // Upload images if any
        if (imageFiles.length > 0) {
          const imageResponse = await this.uploadMultipleImages(imageFiles);
          if (imageResponse.uploaded_images) {
            uploadedImages.push(...imageResponse.uploaded_images);
          }
        }

        // Upload other files if any
        if (otherFiles.length > 0) {
          const fileResponse = await this.uploadMultipleFiles(otherFiles);
          if (fileResponse.uploaded_files) {
            uploadedFiles.push(...fileResponse.uploaded_files);
          }
        }
      } catch (error) {
        console.error('Failed to upload new files:', error);
        throw new Error('Failed to upload new files');
      }
    }

    // Prepare updated file URLs
    const currentFileUrls = commentData.file_urls || [];
    const currentImageUrls = commentData.image_urls || [];

    // Add new uploaded files
    const newFileUrls = [...currentFileUrls, ...uploadedFiles.map(file => file.file)];
    const newImageUrls = [...currentImageUrls, ...uploadedImages.map(image => image.image)];

    // Remove specified files
    const finalFileUrls = newFileUrls.filter(url => !removeFileUrls?.includes(url));
    const finalImageUrls = newImageUrls.filter(url => !removeImageUrls?.includes(url));

    // Update comment with new file URLs
    const updatedCommentData = {
      ...commentData,
      file_urls: finalFileUrls,
      image_urls: finalImageUrls,
    };

    return this.request<any>(`/comments/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(updatedCommentData),
    });
  }

  async deleteComment(id: number) {
    return this.request<any>(`/comments/${id}/`, {
      method: 'DELETE',
    });
  }

  // File Upload Methods
  async uploadSingleFile(file: File, description?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
      formData.append('description', description);
    }

    // Don't use the generic request method for file uploads to avoid Content-Type conflicts
    const url = `${this.baseURL}/uploads/upload-file/`;

    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async uploadSingleImage(image: File, description?: string) {
    const formData = new FormData();
    formData.append('image', image);
    if (description) {
      formData.append('description', description);
    }

    // Don't use the generic request method for file uploads to avoid Content-Type conflicts
    const url = `${this.baseURL}/uploads/upload-image/`;

    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async uploadMultipleFiles(files: File[], descriptions?: string[]) {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('files', file);
    });

    if (descriptions && descriptions.length > 0) {
      formData.append('descriptions', JSON.stringify(descriptions));
    }

    // Don't use the generic request method for file uploads to avoid Content-Type conflicts
    const url = `${this.baseURL}/uploads/upload-files/`;

    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async uploadMultipleImages(images: File[], descriptions?: string[]) {
    const formData = new FormData();

    images.forEach((image) => {
      formData.append('images', image);
    });

    if (descriptions && descriptions.length > 0) {
      formData.append('descriptions', JSON.stringify(descriptions));
    }

    // Don't use the generic request method for file uploads to avoid Content-Type conflicts
    const url = `${this.baseURL}/uploads/upload-images/`;

    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getUserFiles(params?: Record<string, any>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/uploads/files/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<any>(endpoint);
  }

  async getUserImages(params?: Record<string, any>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/uploads/images/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<any>(endpoint);
  }

  async getFileDetails(id: string) {
    return this.request<any>(`/uploads/files/${id}/`);
  }

  async getImageDetails(id: string) {
    return this.request<any>(`/uploads/images/${id}/`);
  }

  async deleteFile(id: string) {
    return this.request<any>(`/uploads/files/${id}/`, {
      method: 'DELETE',
    });
  }

  async deleteImage(id: string) {
    return this.request<any>(`/uploads/images/${id}/`, {
      method: 'DELETE',
    });
  }

  async getUploadStats() {
    return this.request<any>('/uploads/stats/');
  }

  async createCommentWithFiles(commentData: any, files?: File[]) {
    // First upload files if any
    const uploadedFiles: any[] = [];
    const uploadedImages: any[] = [];

    if (files && files.length > 0) {
      // Separate images from other files
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      const otherFiles = files.filter(file => !file.type.startsWith('image/'));

      try {
        // Upload images if any
        if (imageFiles.length > 0) {
          const imageResponse = await this.uploadMultipleImages(imageFiles);
          if (imageResponse.uploaded_images) {
            uploadedImages.push(...imageResponse.uploaded_images);
          }
        }

        // Upload other files if any
        if (otherFiles.length > 0) {
          const fileResponse = await this.uploadMultipleFiles(otherFiles);
          if (fileResponse.uploaded_files) {
            uploadedFiles.push(...fileResponse.uploaded_files);
          }
        }
      } catch (error) {
        console.error('Failed to upload files:', error);
        throw new Error('Failed to upload files');
      }
    }

    // Create comment with file URLs
    const commentWithFiles = {
      ...commentData,
      file_urls: uploadedFiles.map(file => file.file),
      image_urls: uploadedImages.map(image => image.image),
    };

    return this.request<any>('/comments/', {
      method: 'POST',
      body: JSON.stringify(commentWithFiles),
    });
  }

  // Notification methods
  async getNotifications(params?: Record<string, any>) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }

    const endpoint = `/notifications/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request<any>(endpoint);
  }

  async markNotificationAsRead(id: number) {
    return this.request<any>(`/notifications/${id}/mark_read/`, {
      method: 'POST',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request<any>('/notifications/mark_all_read/', {
      method: 'POST',
    });
  }

  async getUnreadCount() {
    return this.request<{ unread_count: number }>('/notifications/unread-count/');
  }
}

export const apiService = new ApiService(API_BASE_URL);