# User Authentication Specification

## ADDED Requirements

### Requirement: User Registration

システムは新規ユーザー登録機能を提供しなければならない (SHALL)。ユーザーは `username`、`email`、`password` を指定してアカウントを作成できる必要がある。

#### Scenario: 正常なユーザー登録
- **WHEN** 有効な `username`、`email`、`password` を指定して `POST /api/auth/register` を実行する
- **THEN** 新しいユーザーがデータベースに保存される
- **AND** レスポンスにユーザー情報とJWTトークンが含まれる
- **AND** パスワードは bcrypt でハッシュ化されて保存される

#### Scenario: 重複メールアドレスでの登録拒否
- **WHEN** 既に登録済みの `email` で登録を試みる
- **THEN** エラーメッセージを返し、新しいユーザーは作成されない

#### Scenario: 無効な入力での登録拒否
- **WHEN** 必須フィールド（`username`、`email`、`password`）が欠けている
- **THEN** 400エラーを返し、エラー詳細を含めなければならない

### Requirement: User Login

システムは `email` と `password` によるログイン機能を提供しなければならない (SHALL)。

#### Scenario: 正常なログイン
- **WHEN** 正しい `email` と `password` を指定して `POST /api/auth/login` を実行する
- **THEN** ユーザー情報とJWTトークンが返される
- **AND** トークンは7日間有効である

#### Scenario: 無効な認証情報でのログイン拒否
- **WHEN** 間違ったパスワードでログインを試みる
- **THEN** 401エラーを返す
- **AND** セキュリティのため、エラーメッセージは具体的な失敗理由を明かしてはならない

#### Scenario: 存在しないユーザーでのログイン拒否
- **WHEN** 登録されていない `email` でログインを試みる
- **THEN** 401エラーを返す
- **AND** セキュリティのため、エラーメッセージは具体的な失敗理由を明かしてはならない

### Requirement: Password Security

システムはパスワードを安全に管理しなければならない (MUST)。

#### Scenario: パスワードのハッシュ化
- **WHEN** ユーザーが登録またはパスワード変更を行う
- **THEN** パスワードは bcrypt（salt rounds: 10）でハッシュ化される
- **AND** 平文パスワードはデータベースに保存されてはならない

#### Scenario: パスワード検証
- **WHEN** ログイン時にパスワードを検証する
- **THEN** `bcrypt.compare` を使用してハッシュと照合する
- **AND** タイミング攻撃に耐える実装でなければならない

### Requirement: JWT Authentication

システムはJWT（JSON Web Token）による認証を管理しなければならない (SHALL)。

#### Scenario: トークン発行
- **WHEN** ユーザーが正常にログインまたは登録する
- **THEN** JWTトークンを発行する
- **AND** トークンのペイロードには `userId` と `email` を含める
- **AND** トークンはHS256アルゴリズムで署名し、有効期限は7日間とする

#### Scenario: トークン検証
- **WHEN** 認証が必要なエンドポイントにリクエストが送られる
- **THEN** AuthorizationヘッダーからBearerトークンを抽出する
- **AND** トークンの署名と有効期限を検証する
- **AND** 検証に成功した場合、ペイロードの `userId` をリクエストコンテキストに設定する

#### Scenario: 無効なトークンの拒否
- **WHEN** 無効または期限切れのトークンでリクエストする
- **THEN** 401エラーを返し、リクエストは処理しない

#### Scenario: トークンなしでの保護エンドポイントアクセス拒否
- **WHEN** Authorizationヘッダーなしで認証が必要なエンドポイントへアクセスする
- **THEN** 401エラーを返し、認証が必要であることを示す

### Requirement: Current User Information

システムは認証済みユーザーが自分の情報を取得できるようにしなければならない (SHALL)。

#### Scenario: ユーザー情報取得
- **WHEN** 有効なJWTトークンを送って `GET /api/auth/me` を実行する
- **THEN** 現在のユーザー情報（`id`, `username`, `email`）が返される
- **AND** パスワードハッシュなどの機密情報は含めてはならない

#### Scenario: 未認証でのユーザー情報取得拒否
- **WHEN** トークンなしで `GET /api/auth/me` を実行する
- **THEN** 401エラーが返される
