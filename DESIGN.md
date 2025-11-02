# TODOアプリ設計書（ユーザー認証付き）

> change-id: add-baseline-specs  
> related-specs: openspec/changes/add-baseline-specs/specs/user-auth/spec.md, openspec/changes/add-baseline-specs/specs/todo-management/spec.md  
> related-tasks: openspec/changes/add-baseline-specs/tasks.md  
> scope: Next.js フロントエンドと Hono バックエンドによるベースライン実装の技術設計

## ドキュメント運用方針
- 本ファイル（`DESIGN.md`）はリリース済みの決定を反映した常設のベースライン設計まとめとして維持する。
- 変更ごとの詳細検討は `openspec/changes/<change-id>/design.md` に記述し、実装前レビューと履歴管理を行う。
- change 配下の design.md から本ファイルを参照する場合は `@/DESIGN.md` を利用し、仕様の重複記載は避ける。

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

## 4. API実装ガイド

本節では、仕様書に定義された認証・TODO管理要件（related-specs 参照）を満たすための実装方針を示す。リクエスト／レスポンス形式は spec.md を単一の真実として維持し、ここではコード構造と共通処理の設計に集中する。

### 4.1 ルーティング構成
- `backend/src/routes/auth.ts`    - `POST /auth/register`・`POST /auth/login`・`GET /auth/me` を提供。    - Hono のサブアプリとして切り出し、`app.route('/auth', authRoute)` でマウントする。    - 入力検証は `zod` を使ったスキーマ（`registerSchema` など）で実施し、異常系は `DomainError` を投げて集中処理させる。
- `backend/src/routes/todos.ts`    - `GET/POST/PUT/DELETE /todos` を担当。    - `middleware/auth.ts` で付与した `ctx.get('user')` を利用し、所有者チェックを共通ヘルパー `assertOwner` に切り出す。    - 取得系はユーザー ID とソート条件のみを受け付け、検索条件の拡張は今後の課題とする。

### 4.2 ミドルウェアとエラーハンドリング
- `backend/src/middleware/auth.ts` に JWT 検証とユーザー情報設定を集約し、認証必須ルートでは必ず適用する。    - トークンが無効・期限切れの場合は 401、所有権違反は 403 を返す。    - レスポンス本文は `{ "error": "...", "message": "..." }` のキー構造で統一し、仕様シナリオと齟齬を生まないようにする。
- `app.onError` で例外種別を判定し、`DomainError` はクライアントエラー、想定外の例外は 500 としてログ出力に留める。

### 4.3 データアクセス層
- `backend/src/db.ts` で `pg` のコネクションプールを生成。    - クエリは `repositories/` ディレクトリに切り出し、`authRepository.findByEmail(email)` のような関数経由で呼び出す。    - 更新系は `withTransaction` ヘルパーでラップし、コミット／ロールバックを一元管理する。
- DB スキーマは §3 を参照。仕様で必須と定義されたフィールド以外は NULL を許容せず、NOT NULL と DEFAULT を RDB 側で担保する。

### 4.4 応答フォーマット
- spec.md のシナリオに記載されたキーのみを返し、それ以外の内部フィールドはマスクする。  - タイムスタンプは `toISOString()` で UTC 表記に統一。  - ページングは現状不要だが、`GET /todos` のクエリビルダを抽象化して将来の拡張に備える。

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

## 6. フロントエンドUI構成

本節では、ユーザー操作の詳細を spec.md に委ねつつ、Next.js 実装で担保すべきコンポーネント構成と状態管理の指針を示す。

### 6.1 ページ構成
- `app/(auth)/login/page.tsx`  \
  - `LoginForm` コンポーネントをレンダリングし、`lib/api.ts` の `post('/auth/login')` を利用してログイン処理を行う。  \
  - 成功時は `useRouter().push('/')`、失敗時はフォーム内でエラーを表示。異常系メッセージは仕様のシナリオと整合する文言に合わせる。
- `app/(auth)/register/page.tsx`  \
  - パスワード確認やバリデーションは `react-hook-form` を使用し、`RegisterForm` に集約する。  \
  - 登録後は受信した JWT を `lib/auth.ts` に委譲して保存し、Todo 一覧へ遷移する。
- `app/page.tsx`  \
  - 認証済みユーザー向けの TODO ダッシュボード。`TodoList`・`TodoForm`・`Header` を組み合わせてシナリオに記載された操作を実現する。

### 6.2 コンポーネント責務
- `components/TodoList.tsx`  \
  - `lib/api.ts` の `get('/todos')` を通じて一覧を取得し、`TodoItem` に描画を委譲する。  \
  - フェッチ結果は `useSWR` によるキャッシュで管理し、API 更新後に `mutate('/todos')` を呼ぶ。
- `components/TodoItem.tsx`  \
  - 完了トグルや削除アクションは props で受け取り、UI のみを担当。  \
  - `Todo` 型（`types/todo.ts`）に従って安全に表示する。
- `components/TodoForm.tsx`  \
  - 作成フォームの入力状態を内部 `useState` で保持し、submit 時に `post('/todos')` を呼び出す。  \
  - 送信成功後はフォームをリセットし、`TodoList` から受け取った `onCreated` コールバックで再読み込みを促す。

### 6.3 状態管理とエラー表示
- JWT は `lib/auth.ts` で localStorage に保存し、API 呼び出し時に自動付与する。
- 共通の API エラーは `lib/api.ts` のカスタム例外 `ApiError` としてスローし、各ページは `try/catch` で捕捉してトーストまたはフォーム下に表示する。
- ローディング状態は `useTransition` で制御し、送信中の二重操作を防止する。

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
