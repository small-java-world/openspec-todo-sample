'use client';

import { useState } from 'react';
import { CreateTodoInput } from '@/types/todo';

interface TodoFormProps {
  onSubmit: (input: CreateTodoInput) => Promise<void>;
}

export default function TodoForm({ onSubmit }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('タイトルを入力してください');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Error submitting todo:', error);
      alert('TODOの作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <div className="form-group">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="TODOのタイトルを入力..."
          className="input-title"
          disabled={isSubmitting}
          maxLength={255}
        />
      </div>
      
      <div className="form-group">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="説明（オプション）"
          className="input-description"
          disabled={isSubmitting}
          rows={3}
        />
      </div>
      
      <button 
        type="submit" 
        className="btn-submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? '追加中...' : 'TODOを追加'}
      </button>
    </form>
  );
}
