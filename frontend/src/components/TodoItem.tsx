'use client';

import { useState } from 'react';
import { Todo } from '@/types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number, completed: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onUpdate: (id: number, title: string, description: string) => Promise<void>;
}

export default function TodoItem({ todo, onToggle, onDelete, onUpdate }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await onToggle(todo.id, !todo.completed);
    } catch (error) {
      console.error('Error toggling todo:', error);
      alert('更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('このTODOを削除してもよろしいですか？')) {
      return;
    }
    
    setIsLoading(true);
    try {
      await onDelete(todo.id);
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('削除に失敗しました');
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editTitle.trim()) {
      alert('タイトルを入力してください');
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(todo.id, editTitle.trim(), editDescription.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating todo:', error);
      alert('更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="todo-item editing">
        <div className="edit-form">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="edit-input-title"
            disabled={isLoading}
            maxLength={255}
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="edit-input-description"
            disabled={isLoading}
            rows={2}
            placeholder="説明（オプション）"
          />
          <div className="edit-actions">
            <button 
              onClick={handleSave} 
              className="btn-save"
              disabled={isLoading}
            >
              保存
            </button>
            <button 
              onClick={handleCancel} 
              className="btn-cancel"
              disabled={isLoading}
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-content">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          disabled={isLoading}
          className="todo-checkbox"
        />
        <div className="todo-text">
          <h3 className="todo-title">{todo.title}</h3>
          {todo.description && (
            <p className="todo-description">{todo.description}</p>
          )}
          <span className="todo-date">
            作成日: {new Date(todo.created_at).toLocaleString('ja-JP')}
          </span>
        </div>
      </div>
      <div className="todo-actions">
        <button 
          onClick={() => setIsEditing(true)} 
          className="btn-edit"
          disabled={isLoading}
        >
          編集
        </button>
        <button 
          onClick={handleDelete} 
          className="btn-delete"
          disabled={isLoading}
        >
          削除
        </button>
      </div>
    </div>
  );
}
