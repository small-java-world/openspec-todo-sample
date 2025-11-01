'use client';

import { User } from '@/types/todo';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1>📝 TODOアプリ</h1>
          <p className="header-subtitle">Next.js + Hono + PostgreSQL</p>
        </div>
        {user && (
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">👤 {user.username}</span>
              <span className="user-email">{user.email}</span>
            </div>
            <button onClick={onLogout} className="btn-logout">
              ログアウト
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
