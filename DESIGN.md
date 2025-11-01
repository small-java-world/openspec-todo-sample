# TODOアプリ設計書（ユーザー認証付き）

## 1. システム概要

Next.js、Hono、PostgreSQLを使用したユーザー認証機能付きTODOアプリケーション。各ユーザーは自分のTODOのみを管理できます。

### 技術スタック
- **フロントエンド**: Next.js 14 (App Router)
- **バックエンド**: Hono (Node.js)
- **データベース**: PostgreSQL
- **認証**: JWT (JSON Web Token)
- **パスワード暗号化**: bcrypt
- **言語**: TypeScript

## 2. アーキテクチャ

```
┌─────────────────┐
│   Next.js App   │ (Port 3000)
│  (フロントエンド)  │
│   + JWT Token   │
└────────┬────────┘
         │ HTTP Requests (with JWT)
         ↓
┌─────────────────┐
│   Hono API      │ (Port 3001)
│  (バックエンド)    │
│ + Auth Middleware│
└────────┬────────┘
         │ SQL Queries
         ↓
┌─────────────────┐
│  PostgreSQL DB  │ (Port 5432)
│   users, todos  │
└─────────────────┘
```

## 3. データベース設計

### テーブル: users

| カラム名      | 型           | 制約                    | 説明              |
|--------------|--------------|------------------------|-------------------|
| id           | SERIAL       | PRIMARY KEY            | ユーザーID         |
| username     | VARCHAR(50)  | UNIQUE, NOT NULL       | ユーザー名         |
| email        | VARCHAR(255) | UNIQUE, NOT NULL       | メールアドレス      |
| password     | VARCHAR(255) | NOT NULL               | パスワード(ハッシュ) |
| created_at   | TIMESTAMP    | NOT NULL DEFAULT NOW() | 作成日時          |

### テーブル: todos

| カラム名      | 型           | 制約                    | 説明              |
|--------------|--------------|------------------------|-------------------|
| id           | SERIAL       | PRIMARY KEY            | TODO ID           |
| user_id      | INTEGER      | NOT NULL, FOREIGN KEY  | ユーザーID         |
| title        | VARCHAR(255) | NOT NULL               | TODOタイトル       |
| description  | TEXT         |                        | TODO詳細          |
| completed    | BOOLEAN      | NOT NULL DEFAULT false | 完了フラグ         |
| created_at   | TIMESTAMP    | NOT NULL DEFAULT NOW() | 作成日時          |
| updated_at   | TIMESTAMP    | NOT NULL DEFAULT NOW() | 更新日時          |

**外部キー制約:**
- `todos.user_id` → `users.id` (CASCADE DELETE)

## 4. API設計

### ベースURL: `http://localhost:3001/api`

#### 認証エンドポイント

##### 1. ユーザー登録
- **エンドポイント**: `POST /auth/register`
- **リクエストボディ**:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```
- **レスポンス**:
```json
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

##### 2. ログイン
- **エンドポイント**: `POST /auth/login`
- **リクエストボディ**:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
- **レスポンス**:
```json
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

##### 3. 現在のユーザー情報取得
- **エンドポイント**: `GET /auth/me`
- **ヘッダー**: `Authorization: Bearer <token>`
- **レスポンス**:
```json
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

#### TODOエンドポイント（全て認証が必要）

##### 1. TODO一覧取得（自分のTODOのみ）
- **エンドポイント**: `GET /todos`
- **ヘッダー**: `Authorization: Bearer <token>`
- **レスポンス**:
```json
{
  "todos": [
    {
      "id": 1,
      "user_id": 1,
      "title": "買い物に行く",
      "description": "牛乳とパンを買う",
      "completed": false,
      "created_at": "2025-11-01T10:00:00Z",
      "updated_at": "2025-11-01T10:00:00Z"
    }
  ]
}
```

##### 2. TODO作成
- **エンドポイント**: `POST /todos`
- **ヘッダー**: `Authorization: Bearer <token>`
- **リクエストボディ**:
```json
{
  "title": "新しいTODO",
  "description": "説明（オプション）"
}
```

##### 3. TODO更新（自分のTODOのみ）
- **エンドポイント**: `PUT /todos/:id`
- **ヘッダー**: `Authorization: Bearer <token>`
- **リクエストボディ**:
```json
{
  "title": "更新されたタイトル",
  "description": "更新された説明",
  "completed": true
}
```

##### 4. TODO削除（自分のTODOのみ）
- **エンドポイント**: `DELETE /todos/:id`
- **ヘッダー**: `Authorization: Bearer <token>`

## 5. セキュリティ設計

### パスワード管理
- bcryptを使用してハッシュ化（salt rounds: 10）
- 平文パスワードはデータベースに保存しない

### JWT（JSON Web Token）
- 有効期限: 7日間
- ペイロード: `{ userId: number, email: string }`
- 署名アルゴリズム: HS256
- シークレットキー: 環境変数で管理

### 認証フロー
1. ユーザーがログイン
2. サーバーがJWTトークンを発行
3. クライアントがトークンをlocalStorageに保存
4. 以降のリクエストでAuthorizationヘッダーにトークンを含める
5. サーバーがミドルウェアでトークンを検証

## 6. 画面設計

### ログイン/登録画面
- メールアドレス入力フィールド
- パスワード入力フィールド
- ログインボタン
- 登録画面への切り替えリンク

### 登録画面
- ユーザー名入力フィールド
- メールアドレス入力フィールド
- パスワード入力フィールド
- 登録ボタン
- ログイン画面への切り替えリンク

### TODOメイン画面（認証後）
- ユーザー情報表示
- ログアウトボタン
- TODOリストの表示
- 新規TODO作成フォーム
- 各TODOに対する操作ボタン

## 7. ディレクトリ構造

```
todo-app/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── register/
│   │   │   │       └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── TodoList.tsx
│   │   │   ├── TodoItem.tsx
│   │   │   ├── TodoForm.tsx
│   │   │   └── Header.tsx
│   │   ├── lib/
│   │   │   ├── auth.ts
│   │   │   └── api.ts
│   │   └── types/
│   │       └── todo.ts
│   ├── package.json
│   └── tsconfig.json
│
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── db.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   └── routes/
│   │       ├── auth.ts
│   │       └── todos.ts
│   ├── package.json
│   └── tsconfig.json
│
├── database/
│   └── init.sql
│
└── docker-compose.yml
```

## 8. セットアップ手順

1. PostgreSQLの起動（Docker使用）
2. データベースの初期化（users, todosテーブル作成）
3. バックエンドの環境変数設定（JWT_SECRET等）
4. バックエンド（Hono）の起動
5. フロントエンド（Next.js）の起動

## 9. 今後の拡張案

- メール認証機能
- パスワードリセット機能
- ソーシャルログイン（Google, GitHub等）
- TODOのカテゴリ分け
- TODOの共有機能
- 期限設定機能
- リマインダー機能
