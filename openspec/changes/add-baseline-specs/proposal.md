# Baseline Specifications Proposal

## Why

既存のTODOアプリケーションにはDESIGN.mdが存在するが、OpenSpec形式の仕様書が存在しない。今後の変更管理を効率化し、AIアシスタントが仕様を理解して開発を支援できるようにするため、既存機能の仕様をOpenSpec形式で作成する必要がある。

## What Changes

- **user-auth** capability の仕様を作成
  - ユーザー登録機能
  - ログイン機能
  - JWT認証機能
  - パスワードセキュリティ

- **todo-management** capability の仕様を作成
  - TODO作成機能
  - TODO一覧取得機能
  - TODO更新機能
  - TODO削除機能
  - 完了ステータス管理

- 既存のDESIGN.mdとREADME.mdの内容をOpenSpec形式の要件とシナリオに変換

## Impact

- Affected specs: `user-auth`, `todo-management` (新規作成)
- Affected code: なし（既存実装の仕様化のみ、コード変更なし）
- Benefits:
  - 今後の機能追加時に既存仕様との整合性を確認可能
  - AIアシスタントが仕様を参照して正確な実装を支援可能
  - 変更提案時に影響範囲を明確化可能
