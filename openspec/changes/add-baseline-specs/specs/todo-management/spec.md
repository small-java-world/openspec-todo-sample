# TODO Management Specification

## ADDED Requirements

### Requirement: TODO Creation

システムは認証済みユーザーが新しいTODOを作成できるようにしなければならない (SHALL)。

#### Scenario: 正常なTODO作成
- **WHEN** 認証済みユーザーが `title` を指定して `POST /api/todos` を実行する
- **THEN** 新しいTODOがデータベースに保存される
- **AND** 保存されたTODOには発行ユーザーの `user_id` が紐づく
- **AND** レスポンスには `id`, `title`, `description`, `completed`, `created_at`, `updated_at` が含まれる
- **AND** `completed` フィールドの既定値は `false` である

#### Scenario: description付きTODO作成
- **WHEN** `title` と `description` を指定してTODOを作成する
- **THEN** 両方のフィールドがデータベースに保存される

#### Scenario: descriptionなしTODO作成
- **WHEN** `title` のみ指定してTODOを作成する
- **THEN** `description` は `null` として保存される
- **AND** TODOは正常に作成される

#### Scenario: タイトル未指定での作成拒否
- **WHEN** `title` を指定せずに `POST /api/todos` を実行する
- **THEN** 400エラーが返される
- **AND** エラーメッセージに「Title is required」を含めなければならない

#### Scenario: 空文字タイトルでの作成拒否
- **WHEN** 空文字の `title` でTODO作成を試みる
- **THEN** 400エラーが返される

#### Scenario: 未認証でのTODO作成拒否
- **WHEN** JWTトークンなしで `POST /api/todos` を実行する
- **THEN** 401エラーが返される

### Requirement: TODO Listing

システムは認証済みユーザーが自分のTODOのみを一覧取得できるようにしなければならない (SHALL)。

#### Scenario: 自分のTODO一覧取得
- **WHEN** 認証済みユーザーが `GET /api/todos` を実行する
- **THEN** そのユーザーが作成したTODOだけが返される
- **AND** 他ユーザーのTODOは含まれない
- **AND** TODOは作成日時の降順でソートされて返される

#### Scenario: TODOが存在しない場合
- **WHEN** TODOを一度も作成していないユーザーが `GET /api/todos` を実行する
- **THEN** 空配列が返される
- **AND** エラーは発生しない

#### Scenario: 未認証での一覧取得拒否
- **WHEN** JWTトークンなしで `GET /api/todos` を実行する
- **THEN** 401エラーが返される

### Requirement: Single TODO Retrieval

システムは認証済みユーザーが自分の特定のTODOを取得できるようにしなければならない (SHALL)。

#### Scenario: 自分のTODO取得
- **WHEN** 認証済みユーザーが自分のTODO IDを指定して `GET /api/todos/:id` を実行する
- **THEN** 指定したTODOの詳細が返される

#### Scenario: 他ユーザーのTODO取得拒否
- **WHEN** 他ユーザーが作成したTODO IDで `GET /api/todos/:id` を実行する
- **THEN** 404エラーが返される

#### Scenario: 存在しないTODO取得
- **WHEN** 存在しないIDを指定して `GET /api/todos/:id` を実行する
- **THEN** 404エラーが返される

### Requirement: TODO Update

システムは認証済みユーザーが自分のTODOのみを更新できるようにしなければならない (SHALL)。

#### Scenario: 自分のTODO更新
- **WHEN** 認証済みユーザーが自分のTODO IDを指定して `PUT /api/todos/:id` を実行する
- **THEN** 指定したフィールド（`title`, `description`, `completed`）が更新される
- **AND** `updated_at` が現在時刻に更新される
- **AND** 更新後のTODOがレスポンスとして返される

#### Scenario: タイトルのみ更新
- **WHEN** `title` のみ指定して `PUT /api/todos/:id` を実行する
- **THEN** `title` のみが更新される
- **AND** `description` と `completed` は変更されない

#### Scenario: 完了ステータスのみ更新
- **WHEN** `completed` のみ指定して `PUT /api/todos/:id` を実行する
- **THEN** `completed` のみが更新される
- **AND** `title` と `description` は変更されない

#### Scenario: 複数フィールド同時更新
- **WHEN** `title`, `description`, `completed` を同時に指定して `PUT /api/todos/:id` を実行する
- **THEN** すべての指定フィールドが更新される

#### Scenario: 他ユーザーのTODO更新拒否
- **WHEN** 他ユーザーが作成したTODOを更新しようとする
- **THEN** 404エラーが返される
- **AND** エラーメッセージに「Todo not found or access denied」を含めなければならない

#### Scenario: 存在しないTODO更新拒否
- **WHEN** 存在しないIDで `PUT /api/todos/:id` を実行する
- **THEN** 404エラーが返される

#### Scenario: 未認証でのTODO更新拒否
- **WHEN** JWTトークンなしで `PUT /api/todos/:id` を実行する
- **THEN** 401エラーが返される

### Requirement: TODO Deletion

システムは認証済みユーザーが自分のTODOのみを削除できるようにしなければならない (SHALL)。

#### Scenario: 自分のTODO削除
- **WHEN** 認証済みユーザーが自分のTODO IDを指定して `DELETE /api/todos/:id` を実行する
- **THEN** 指定したTODOがデータベースから削除される
- **AND** 成功メッセージが返される

#### Scenario: 他ユーザーのTODO削除拒否
- **WHEN** 他ユーザーが作成したTODOを削除しようとする
- **THEN** 404エラーが返される
- **AND** エラーメッセージに「Todo not found or access denied」を含めなければならない
- **AND** TODOは削除されない

#### Scenario: 存在しないTODO削除
- **WHEN** 存在しないIDで `DELETE /api/todos/:id` を実行する
- **THEN** 404エラーが返される

#### Scenario: 未認証でのTODO削除拒否
- **WHEN** JWTトークンなしで `DELETE /api/todos/:id` を実行する
- **THEN** 401エラーが返される

### Requirement: Completion Status Management

システムはTODOの完了・未完了ステータスを管理できるようにしなければならない (SHALL)。

#### Scenario: TODOを完了にする
- **WHEN** `completed: true` を指定してTODOを更新する
- **THEN** TODOの `completed` フィールドが `true` に設定される

#### Scenario: TODOを未完了に戻す
- **WHEN** `completed: false` を指定してTODOを更新する
- **THEN** TODOの `completed` フィールドが `false` に設定される

#### Scenario: 新規作成時の既定値
- **WHEN** `completed` を指定せずにTODOを作成する
- **THEN** `completed` の既定値は `false` でなければならない

### Requirement: User Data Isolation

システムはユーザーごとにTODOデータを厳密に分離しなければならない (SHALL)。

#### Scenario: ユーザー削除時のカスケード削除
- **WHEN** ユーザーがデータベースから削除される
- **THEN** そのユーザーに紐づくTODOはすべて自動的に削除される（CASCADE DELETE）

#### Scenario: クロスユーザーアクセス防止
- **WHEN** TODOの取得・更新・削除を実行する
- **THEN** `user_id` による所有者チェックを必ず行わなければならない
- **AND** 他ユーザーのTODOにはアクセスできない
