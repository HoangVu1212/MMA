import Config from "../components/config";

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Base API service with centralized error handling
 */
class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = Config.API_BASE_URL;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    name: string;
    email: string;
    phone: string;
    dob: string;
    address?: string;
    password: string;
    avatar?: string;
  }) {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getProfile(userId: string) {
    return this.request(`/api/auth/${userId}`);
  }

  async updateProfile(userId: string, userData: any) {
    return this.request(`/api/auth/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    return this.request(`/api/auth/change-password/${userId}`, {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async sendOTP(email: string, phone?: string) {
    return this.request("/api/auth/sendOTP", {
      method: "POST",
      body: JSON.stringify({ email, phone }),
    });
  }

  async verifyOTP(email: string, phone: string, otp: string) {
    return this.request("/api/auth/verifyOTP", {
      method: "POST",
      body: JSON.stringify({ email, phone, otp }),
    });
  }

  async forgotPassword(email: string, phone: string, otp: string, newPassword: string) {
    return this.request("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email, phone, otp, newPassword }),
    });
  }

  // Product endpoints
  async getAllProducts() {
    return this.request("/api/product");
  }

  async getProductById(productId: number) {
    return this.request(`/api/product/${productId}`);
  }

  async createProduct(productData: any) {
    return this.request("/api/product", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(productId: number, productData: any) {
    return this.request(`/api/product/${productId}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(productId: number) {
    return this.request(`/api/product/${productId}`, {
      method: "DELETE",
    });
  }
}

// Export singleton instance
export default new ApiService();

