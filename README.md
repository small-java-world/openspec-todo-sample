# TODOアプリ（ユーザー認証付き）

Next.js、Hono、PostgreSQLを使用したユーザー認証機能付きTODOアプリケーションです。各ユーザーは自分のTODOのみを管理できます。

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + TypeScript
- **バックエンド**: Hono + TypeScript
- **データベース**: PostgreSQL
- **認証**: JWT (JSON Web Token)
- **パスワード暗号化**: bcrypt
- **開発環境**: Docker (PostgreSQL用)

## 主な機能

- ✅ ユーザー登録・ログイン（DB認証）
- ✅ ユーザーごとのTODO管理
- ✅ TODOの作成・編集・削除
- ✅ 完了/未完了の切り替え
- ✅ JWT認証によるセキュアなAPI
- ✅ パスワードのハッシュ化

## セットアップ手順

### 1. 必要な環境

- Node.js 18以上
- Docker & Docker Compose
- npm または yarn

### 2. データベースの起動

```bash
# プロジェクトルートで実行
docker-compose up -d
```

### 3. データベースの初期化

```bash
# PostgreSQLに接続してテーブルを作成
docker exec -i todo-postgres psql -U todouser -d tododb < database/init.sql
```

### 4. バックエンドのセットアップ

```bash
cd backend

# .envファイルを作成（.env.exampleをコピー）
cp .env.example .env

# JWT_SECRETを強力なランダム文字列に変更してください
# 例: JWT_SECRET=your-super-secret-key-change-this-in-production

npm install
npm run dev
```

バックエンドは http://localhost:3001 で起動します。

### 5. フロントエンドのセットアップ

```bash
cd frontend

# .env.localファイルを作成
cp .env.local.example .env.local

npm install
npm run dev
```

フロントエンドは http://localhost:3000 で起動します。

## 使い方

1. http://localhost:3000 にアクセス
2. 「新規登録」から新しいアカウントを作成
3. ログイン後、TODOを管理できます
4. ログアウトは右上のボタンから

## API エンドポイント

### 認証
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン
- `GET /api/auth/me` - 現在のユーザー情報取得

### TODO（要認証）
- `GET /api/todos` - TODO一覧取得（自分のTODOのみ）
- `POST /api/todos` - TODO作成
- `PUT /api/todos/:id` - TODO更新（自分のTODOのみ）
- `DELETE /api/todos/:id` - TODO削除（自分のTODOのみ）

## 開発コマンド

### バックエンド
```bash
cd backend
npm run dev    # 開発サーバー起動
npm run build  # ビルド
npm start      # 本番サーバー起動
```

### フロントエンド
```bash
cd frontend
npm run dev    # 開発サーバー起動
npm run build  # ビルド
npm start      # 本番サーバー起動
```

## 環境変数

### バックエンド (.env)
```
DATABASE_URL=postgresql://todouser:todopass@localhost:5432/tododb
PORT=3001
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### フロントエンド (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## セキュリティ

- パスワードはbcryptでハッシュ化して保存
- JWT認証によるステートレスな認証
- ユーザーは自分のTODOのみアクセス可能
- CORSの設定

## データベース構造

### users テーブル
- id (SERIAL)
- username (VARCHAR)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, ハッシュ化済み)
- created_at (TIMESTAMP)

### todos テーブル
- id (SERIAL)
- user_id (INTEGER, FOREIGN KEY)
- title (VARCHAR)
- description (TEXT)
- completed (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## トラブルシューティング

### データベースに接続できない
```bash
# PostgreSQLコンテナの状態を確認
docker ps

# ログを確認
docker logs todo-postgres
```

### JWTエラーが発生する
- バックエンドの `.env` ファイルで `JWT_SECRET` が設定されているか確認
- トークンの有効期限が切れていないか確認

## ライセンス

MIT
