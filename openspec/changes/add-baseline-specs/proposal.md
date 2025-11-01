# Baseline Specifications Proposal

## Why

既存のTODOアプリケーションにはDESIGN.mdはあるものの、OpenSpec形式の仕様書が存在しません。今後の変更管理を効率化し、AIアシスタントが仕様を参照しながら開発を支援できるようにするため、既存機能の仕様をOpenSpec形式で整理する必要があります。

## What Changes

- **user-auth** capability の仕様を新規作成
  - ユーザー登録
  - ログイン
  - JWT認証
  - パスワードセキュリティ
  - 認証済みユーザー情報取得

- **todo-management** capability の仕様を新規作成
  - TODO作成
  - TODO一覧取得
  - TODO更新
  - TODO削除
  - 完了ステータス管理
  - ユーザーデータ分離

- 既存の DESIGN.md と README.md の内容を OpenSpec の要件・シナリオ表現へ反映

## Impact

- 対象仕様: `user-auth`, `todo-management`（新規作成）
- コード影響: なし（既存機能の仕様化のみでコード変更は行わない）
- 期待効果:
  - 既存機能の仕様と将来の変更内容を照合しやすくなる
  - AIアシスタントが仕様を参照して正確に実装支援できるようになる
  - 変更提案時に影響範囲を明示できる
