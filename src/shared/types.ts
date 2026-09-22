// Shared types for the LMS platform

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    requestId?: string;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    username?: string | null;
    role: string;
    emailVerified: boolean;
    mustChangePassword?: boolean;
  };
  session: {
    id: string;
    token: string;
    expiresAt: Date;
  };
}
