import { User, AuthResponse, LoginInput, RegisterInput } from '@/types/todo';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'auth_token';

// トークンをlocalStorageに保存
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

// トークンをlocalStorageから取得
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

// トークンを削除
export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

// ログイン状態チェック
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

// ユーザー登録
export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  const data: AuthResponse = await response.json();
  setToken(data.token);
  return data;
};

// ログイン
export const login = async (input: LoginInput): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data: AuthResponse = await response.json();
  setToken(data.token);
  return data;
};

// ログアウト
export const logout = (): void => {
  removeToken();
};

// 現在のユーザー情報取得
export const getCurrentUser = async (): Promise<User> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
      throw new Error('Token expired or invalid');
    }
    throw new Error('Failed to fetch user');
  }

  const data = await response.json();
  return data.user;
};
