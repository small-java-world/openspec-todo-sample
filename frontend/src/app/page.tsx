'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import TodoForm from '@/components/TodoForm';
import TodoList from '@/components/TodoList';
import { User, Todo, CreateTodoInput } from '@/types/todo';
import { getCurrentUser, logout, isAuthenticated } from '@/lib/auth';
import { getTodos, createTodo, updateTodo, deleteTodo } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 認証チェックとデータ取得
  useEffect(() => {
    const initialize = async () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        setError(null);
        
        // ユーザー情報を取得
        const userData = await getCurrentUser();
        setUser(userData);

        // TODOリストを取得
        const todosData = await getTodos();
        setTodos(todosData);
      } catch (err) {
        console.error('Error initializing:', err);
        
        if (err instanceof Error && err.message.includes('Token')) {
          // トークンが無効な場合はログインページへ
          router.push('/login');
        } else {
          setError(err instanceof Error ? err.message : 'エラーが発生しました');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [router]);

  // ログアウト処理
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // TODO作成
  const handleCreateTodo = async (input: CreateTodoInput) => {
    try {
      const newTodo = await createTodo(input);
      setTodos([newTodo, ...todos]);
    } catch (err) {
      console.error('Error creating todo:', err);
      throw err;
    }
  };

  // TODO完了/未完了切り替え
  const handleToggleTodo = async (id: number, completed: boolean) => {
    try {
      const updatedTodo = await updateTodo(id, { completed });
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo));
    } catch (err) {
      console.error('Error toggling todo:', err);
      throw err;
    }
  };

  // TODO更新
  const handleUpdateTodo = async (id: number, title: string, description: string) => {
    try {
      const updatedTodo = await updateTodo(id, { title, description });
      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo));
    } catch (err) {
      console.error('Error updating todo:', err);
      throw err;
    }
  };

  // TODO削除
  const handleDeleteTodo = async (id: number) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
      throw err;
    }
  };

  // 統計情報
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.completed).length;
  const incompleteTodos = totalTodos - completedTodos;

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <Header user={user} onLogout={handleLogout} />

      <main>
        <div className="card">
          <TodoForm onSubmit={handleCreateTodo} />
        </div>

        {error && (
          <div className="card error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="card">
          <TodoList
            todos={todos}
            onToggle={handleToggleTodo}
            onDelete={handleDeleteTodo}
            onUpdate={handleUpdateTodo}
          />

          {todos.length > 0 && (
            <div className="stats">
              <div className="stat-item">
                <div className="stat-value">{totalTodos}</div>
                <div className="stat-label">全体</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{incompleteTodos}</div>
                <div className="stat-label">未完了</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{completedTodos}</div>
                <div className="stat-label">完了</div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
