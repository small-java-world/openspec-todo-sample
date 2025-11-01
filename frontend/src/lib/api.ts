import { Todo, CreateTodoInput, UpdateTodoInput } from '@/types/todo';
import { getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// 認証ヘッダー付きfetchのラッパー
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // トークンが無効な場合はログアウト
    throw new Error('Unauthorized');
  }

  return response;
};

// TODO一覧取得
export const getTodos = async (): Promise<Todo[]> => {
  const response = await fetchWithAuth(`${API_URL}/api/todos`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch todos');
  }
  
  const data = await response.json();
  return data.todos;
};

// TODO作成
export const createTodo = async (input: CreateTodoInput): Promise<Todo> => {
  const response = await fetchWithAuth(`${API_URL}/api/todos`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to create todo');
  }

  const data = await response.json();
  return data.todo;
};

// TODO更新
export const updateTodo = async (id: number, input: UpdateTodoInput): Promise<Todo> => {
  const response = await fetchWithAuth(`${API_URL}/api/todos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to update todo');
  }

  const data = await response.json();
  return data.todo;
};

// TODO削除
export const deleteTodo = async (id: number): Promise<void> => {
  const response = await fetchWithAuth(`${API_URL}/api/todos/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete todo');
  }
};
