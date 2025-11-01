'use client';

import { Todo } from '@/types/todo';
import TodoItem from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number, completed: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onUpdate: (id: number, title: string, description: string) => Promise<void>;
}

export default function TodoList({ todos, onToggle, onDelete, onUpdate }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <p>まだTODOがありません</p>
        <p className="empty-hint">上のフォームから新しいTODOを追加してください</p>
      </div>
    );
  }

  const incompleteTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  return (
    <div className="todo-list">
      {incompleteTodos.length > 0 && (
        <div className="todo-section">
          <h2 className="section-title">
            未完了 ({incompleteTodos.length})
          </h2>
          <div className="todo-items">
            {incompleteTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </div>
      )}

      {completedTodos.length > 0 && (
        <div className="todo-section">
          <h2 className="section-title">
            完了済み ({completedTodos.length})
          </h2>
          <div className="todo-items">
            {completedTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
