# User Authentication Specification

## ADDED Requirements

### Requirement: User Registration

システムは新規ユーザー登録機能を提供しなければならない（SHALL）。ユーザーはusername、email、passwordを指定してアカウントを作成できる。

#### Scenario: 正常なユーザー登録

- **WHEN** 有効なusername、email、passwordを指定してPOST /api/auth/registerを実行
- **THEN** 新しいユーザーがデータベースに作成される
- **AND** ユーザー情報とJWTトークンが返される
- **AND** パスワードはbcryptでハッシュ化されて保存される

#### Scenario: 重複メールアドレスでの登録拒否

- **WHEN** 既に登録済みのemailで登録を試みる
- **THEN** エラーメッセージを返す
- **AND** 新しいユーザーは作成されない

#### Scenario: 無効な入力での登録拒否

- **WHEN** 必須フィールド（username、email、password）が欠けている
- **THEN** 400エラーを返す
- **AND** エラーの詳細を示す

### Requirement: User Login

システムはemailとpasswordによるログイン機能を提供しなければならない（SHALL）。

#### Scenario: 正常なログイン

- **WHEN** 正しいemailとpasswordを指定してPOST /api/auth/loginを実行
- **THEN** ユーザー情報とJWTトークンが返される
- **AND** トークンは7日間有効である

#### Scenario: 無効な認証情報でのログイン拒否

- **WHEN** 間違ったパスワードを指定してログインを試みる
- **THEN** 401エラーを返す
- **AND** エラーメッセージは具体的な失敗理由を示さない（セキュリティのため）

#### Scenario: 存在しないユーザーでのログイン拒否

- **WHEN** 登録されていないemailでログインを試みる
- **THEN** 401エラーを返す
- **AND** エラーメッセージは具体的な失敗理由を示さない（セキュリティのため）

### Requirement: Password Security

システムはパスワードを安全に管理しなければならない（SHALL）。

#### Scenario: パスワードのハッシュ化

- **WHEN** ユーザーが登録またはパスワード変更を行う
- **THEN** パスワードはbcrypt（salt rounds: 10）でハッシュ化される
- **AND** 平文パスワードはデータベースに保存されない

#### Scenario: パスワード検証

- **WHEN** ログイン時にパスワードを検証する
- **THEN** bcrypt.compareを使用してハッシュと比較する
- **AND** タイミング攻撃に対して安全である

### Requirement: JWT Authentication

システムはJWT（JSON Web Token）による認証を管理しなければならない（SHALL）。

#### Scenario: トークン発行

- **WHEN** ユーザーが正常にログインまたは登録する
- **THEN** JWT トークンが発行される
- **AND** トークンのペイロードには userId と email が含まれる
- **AND** トークンはHS256アルゴリズムで署名される
- **AND** トークンの有効期限は7日間である

#### Scenario: トークン検証

- **WHEN** 認証が必要なエンドポイントにリクエストする
- **THEN** Authorization ヘッダーから Bearer トークンを抽出する
- **AND** トークンの署名と有効期限を検証する
- **AND** 検証成功時、ペイロードのuserIdをリクエストコンテキストに設定する

#### Scenario: 無効なトークンの拒否

- **WHEN** 無効または期限切れのトークンでリクエストする
- **THEN** 401エラーを返す
- **AND** リクエストは処理されない

#### Scenario: トークンなしでの保護エンドポイントアクセス拒否

- **WHEN** Authorization ヘッダーなしで認証が必要なエンドポイントにアクセスする
- **THEN** 401エラーを返す
- **AND** エラーメッセージは認証が必要であることを示す

### Requirement: Current User Information

システムは認証済みユーザーが自分の情報を取得できなければならない（SHALL）。

#### Scenario: ユーザー情報取得

- **WHEN** 有効なJWTトークンを持ってGET /api/auth/meを実行
- **THEN** 現在のユーザー情報（id、username、email）が返される
- **AND** パスワードハッシュは含まれない

#### Scenario: 未認証でのユーザー情報取得拒否

- **WHEN** トークンなしでGET /api/auth/meを実行
- **THEN** 401エラーを返す
