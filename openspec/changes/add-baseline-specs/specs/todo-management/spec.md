# TODO Management Specification

## ADDED Requirements

### Requirement: TODO Creation

システムは認証済みユーザーが新しいTODOを作成できなければならない（SHALL）。

#### Scenario: 正常なTODO作成

- **WHEN** 認証済みユーザーがtitleを指定してPOST /api/todosを実行
- **THEN** 新しいTODOがデータベースに作成される
- **AND** 作成されたTODOにはuser_idが自動的に設定される
- **AND** 作成されたTODO情報が返される（id、title、description、completed、created_at、updated_at）
- **AND** completedフィールドのデフォルト値はfalseである

#### Scenario: descriptionを含むTODO作成

- **WHEN** titleとdescriptionを指定してTODOを作成
- **THEN** titleとdescriptionの両方が保存される

#### Scenario: descriptionなしのTODO作成

- **WHEN** titleのみ指定してTODOを作成
- **THEN** descriptionはnullとして保存される
- **AND** TODOは正常に作成される

#### Scenario: タイトルなしでの作成拒否

- **WHEN** titleを指定せずにPOST /api/todosを実行
- **THEN** 400エラーを返す
- **AND** エラーメッセージは「Title is required」を含む

#### Scenario: 空のタイトルでの作成拒否

- **WHEN** 空文字列のtitleでTODOを作成
- **THEN** 400エラーを返す

#### Scenario: 未認証でのTODO作成拒否

- **WHEN** JWTトークンなしでPOST /api/todosを実行
- **THEN** 401エラーを返す

### Requirement: TODO Listing

システムは認証済みユーザーが自分のTODOのみを一覧取得できなければならない（SHALL）。

#### Scenario: 自分のTODO一覧取得

- **WHEN** 認証済みユーザーがGET /api/todosを実行
- **THEN** 自分が作成したTODOのみが返される
- **AND** 他のユーザーのTODOは含まれない
- **AND** TODOは作成日時の降順（新しい順）でソートされる

#### Scenario: TODOが存在しない場合

- **WHEN** TODOを1つも作成していないユーザーがGET /api/todosを実行
- **THEN** 空の配列が返される
- **AND** エラーは発生しない

#### Scenario: 未認証でのTODO一覧取得拒否

- **WHEN** JWTトークンなしでGET /api/todosを実行
- **THEN** 401エラーを返す

### Requirement: Single TODO Retrieval

システムは認証済みユーザーが自分の特定のTODOを取得できなければならない（SHALL）。

#### Scenario: 自分のTODO取得

- **WHEN** 認証済みユーザーが自分のTODOのIDを指定してGET /api/todos/:idを実行
- **THEN** 指定されたTODOの情報が返される

#### Scenario: 他ユーザーのTODO取得拒否

- **WHEN** 他のユーザーが作成したTODOのIDを指定してGET /api/todos/:idを実行
- **THEN** 404エラーを返す

#### Scenario: 存在しないTODO取得

- **WHEN** 存在しないIDを指定してGET /api/todos/:idを実行
- **THEN** 404エラーを返す

### Requirement: TODO Update

システムは認証済みユーザーが自分のTODOのみを更新できなければならない（SHALL）。

#### Scenario: 自分のTODO更新

- **WHEN** 認証済みユーザーが自分のTODOのIDを指定してPUT /api/todos/:idを実行
- **THEN** 指定されたフィールド（title、description、completed）が更新される
- **AND** updated_atが現在時刻に更新される
- **AND** 更新されたTODO情報が返される

#### Scenario: タイトルのみ更新

- **WHEN** titleのみを指定してPUT /api/todos/:idを実行
- **THEN** titleのみが更新される
- **AND** description、completedは変更されない

#### Scenario: 完了ステータスのみ更新

- **WHEN** completedのみを指定してPUT /api/todos/:idを実行
- **THEN** completedのみが更新される
- **AND** title、descriptionは変更されない

#### Scenario: 複数フィールド同時更新

- **WHEN** title、description、completedを指定してPUT /api/todos/:idを実行
- **THEN** 全てのフィールドが更新される

#### Scenario: 他ユーザーのTODO更新拒否

- **WHEN** 他のユーザーが作成したTODOを更新しようとする
- **THEN** 404エラーを返す
- **AND** エラーメッセージは「Todo not found or access denied」を含む

#### Scenario: 存在しないTODO更新拒否

- **WHEN** 存在しないIDでPUT /api/todos/:idを実行
- **THEN** 404エラーを返す

#### Scenario: 未認証でのTODO更新拒否

- **WHEN** JWTトークンなしでPUT /api/todos/:idを実行
- **THEN** 401エラーを返す

### Requirement: TODO Deletion

システムは認証済みユーザーが自分のTODOのみを削除できなければならない（SHALL）。

#### Scenario: 自分のTODO削除

- **WHEN** 認証済みユーザーが自分のTODOのIDを指定してDELETE /api/todos/:idを実行
- **THEN** 指定されたTODOがデータベースから削除される
- **AND** 成功メッセージが返される

#### Scenario: 他ユーザーのTODO削除拒否

- **WHEN** 他のユーザーが作成したTODOを削除しようとする
- **THEN** 404エラーを返す
- **AND** エラーメッセージは「Todo not found or access denied」を含む
- **AND** TODOは削除されない

#### Scenario: 存在しないTODO削除

- **WHEN** 存在しないIDでDELETE /api/todos/:idを実行
- **THEN** 404エラーを返す

#### Scenario: 未認証でのTODO削除拒否

- **WHEN** JWTトークンなしでDELETE /api/todos/:idを実行
- **THEN** 401エラーを返す

### Requirement: Completion Status Management

システムはTODOの完了・未完了ステータスを管理できなければならない（SHALL）。

#### Scenario: TODOを完了にする

- **WHEN** completed: trueを指定してTODOを更新
- **THEN** TODOのcompletedフィールドがtrueに設定される

#### Scenario: TODOを未完了に戻す

- **WHEN** completed: falseを指定してTODOを更新
- **THEN** TODOのcompletedフィールドがfalseに設定される

#### Scenario: 新規作成時のデフォルト状態

- **WHEN** completedを指定せずにTODOを作成
- **THEN** completedのデフォルト値はfalseである

### Requirement: User Data Isolation

システムは各ユーザーのTODOデータを完全に分離しなければならない（SHALL）。

#### Scenario: ユーザー削除時のカスケード削除

- **WHEN** ユーザーがデータベースから削除される
- **THEN** そのユーザーの全てのTODOも自動的に削除される（CASCADE DELETE）

#### Scenario: クロスユーザーアクセス防止

- **WHEN** 全てのTODO操作（取得、更新、削除）を実行
- **THEN** user_idによる所有者チェックが必ず実行される
- **AND** 他のユーザーのTODOにはアクセスできない
