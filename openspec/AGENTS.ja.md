# OpenSpec ガイド（日本語版）

OpenSpec は、仕様を先に固めてから開発・レビュー・リリースまでを進めるための軽量なフレームワークです。このファイルは本プロジェクトで作業する AI アシスタントや開発者向けの実践ガイドです。

## TL;DR チェックリスト
- 既存仕様の把握: `openspec spec list --long` や `openspec list --specs` を実行し、重複や競合が無いか確認する（全文検索が必要な場合のみ `rg` を使用）。
- 対応範囲の判断: 目的が新機能の追加か既存機能の改修かを明確にする。軽微なバグ修正や微調整のみなら仕様変更は不要。
- `change-id` の決定: ケバブケースで動詞から始まる名前（例: `add-user-auth`, `update-task-sorting`）。重複は避ける。
- ひな型の作成: `proposal.md`、`tasks.md`、必要に応じて `design.md` と、影響する機能ごとの差分仕様 (`changes/<id>/specs/<capability>/spec.md`) を作る。
- 仕様の書き方: `## ADDED|MODIFIED|REMOVED|RENAMED Requirements` を使い、各要件に最低 1 つの `#### Scenario:` を用意する。要件本文は SHALL/MUST などの規範語を使う。
- バリデーション: `openspec validate <change-id> --strict` を実行し、警告やエラーをゼロにしてから共有する。
- 実装開始は承認後: 提案がレビュー・承認されるまで実装には着手しない。

## OpenSpec の 3 段階ワークフロー

### 1. 変更提案の作成（Planning）
- 提案を作るのは以下の場合：新機能追加、破壊的変更、アーキテクチャ変更、大幅な性能改善、セキュリティ対策。
- 以下のような軽微な作業は提案不要：バグ修正（想定動作への復帰）、コメントや体裁のみの修正、非破壊的な依存更新、設定変更、既存仕様に沿ったテスト追加。
- ワークフロー:
  1. `openspec/project.md`、`openspec list`、`openspec list --specs` を読み、背景と進行中の変更を理解する。
  2. ユニークな `change-id` を決め、`openspec/changes/<id>/` 以下に `proposal.md`、`tasks.md`、必要な `design.md` と差分仕様を作成する。
  3. 仕様差分を `## ADDED|MODIFIED|REMOVED Requirements` 形式で記述し、各要件に対応するシナリオを追加する。
  4. `openspec validate <id> --strict` を実行し、失敗があれば修正したうえでレビューに回す。

### 2. 実装（Delivery）
1. `proposal.md` で目的と背景を把握する。
2. `design.md`（存在する場合）で設計判断や依存関係を確認する。
3. `tasks.md` を TODO として扱い、上から順に着手する。
4. 各タスクを完了させつつ、仕様やコードを整合させる。
5. すべての項目が完了したら `tasks.md` のチェックボックスを `- [x]` に更新する。
6. 実装中に仕様を逸脱しそうな場合は、提案段階に戻って仕様の更新や追加の合意を得る。

### 3. アーカイブ（Release）
- デプロイ後は別途 PR を作成し、`openspec/changes/<id>/` を `openspec/changes/archive/YYYY-MM-DD-<id>/` に移動する。
- 実際に仕様が変わった場合は、差分を `openspec/specs/` に反映させる。
- ツール類のみの変更であれば `openspec archive <change-id> --skip-specs --yes` を利用できる（必ず `change-id` を指定）。
- アーカイブ後も `openspec validate --strict` を実行し、仕様全体が整合していることを確認する。

## タスク着手前の確認事項

### コンテキストチェックリスト
- [ ] 該当機能の仕様 (`openspec/specs/<capability>/spec.md`) を読み、期待動作を把握したか。
- [ ] `openspec/changes/` に競合しそうな提案がないか確認したか。
- [ ] `openspec/project.md` に記載されたコーディング規約や命名規則を確認したか。
- [ ] `openspec list` を実行し、進行中の変更と優先度を把握したか。
- [ ] `openspec list --specs` で既存の能力と名称を再確認したか。

### 仕様作成前のチェック
- 既存の能力（capability）がある場合は可能な限りそれを更新し、重複した仕様を作らない。
- `openspec show <spec-id> --type spec` や `openspec show <change-id> --json --deltas-only` で詳細を確認する。
- 要求が曖昧な場合は、一度質問してから仕様を起こす。

### 検索と調査のヒント
- 仕様一覧: `openspec spec list --long`（スクリプト用途なら `--json`）。
- 変更一覧: `openspec list`（旧形式の `openspec change list --json` も利用可）。
- 詳細表示: `openspec show <対象>`。`--type` や `--json` を組み合わせて使う。
- テキスト検索: `rg -n "Requirement:|Scenario:" openspec/specs` で既存要件を網羅的に探せる。

## CLI リファレンス

### よく使うコマンド
```bash
# アクティブな変更一覧
openspec list

# 仕様一覧
openspec list --specs

# 変更または仕様の詳細表示
openspec show <item>

# 個別または全体の検証
openspec validate <item>
openspec validate --strict

# アーカイブ（対話をスキップする場合は --yes または -y）
openspec archive <change-id> --yes

# 初期化・更新
openspec init .
openspec update .
```

### 主なフラグ
- `--json`: 機械可読出力。
- `--type change|spec`: `openspec show` で対象を明示。
- `--strict`: 厳格なフォーマット検証を実施。
- `--no-interactive`: プロンプトを無効化。
- `--skip-specs`: アーカイブ時に仕様への反映をスキップ。
- `--yes` / `-y`: 確認プロンプトを省略。

## ディレクトリ構造ガイド

```
openspec/
|- AGENTS.md         # 英語版の指針
|- AGENTS.ja.md      # このファイル（日本語版ガイド）
|- project.md        # プロジェクト固有の文脈（要更新）
|- specs/            # 正本仕様（デプロイ済みの真実）
|- changes/
|  |- <change-id>/   # 進行中の提案
|  |  |- proposal.md # 目的と変更内容、影響範囲
|  |  |- tasks.md    # 実装タスクリスト
|  |  |- design.md   # 必要な場合のみ設計記録
|  |  |- specs/      # capability ごとの差分仕様
|  |- archive/       # アーカイブ済みの提案
```

複数の能力にまたがる場合は `changes/<change-id>/specs/` 配下に機能単位のサブフォルダ（例: `auth/`, `billing/`）を作成し、それぞれに `spec.md` を配置する。

## ベストプラクティス

### シンプルさを優先
- まずは 100 行未満の変更・単一ファイルの実装で解決できないかを検討する。
- 複雑なフレームワークや抽象化は明確な根拠がある場合にのみ導入する。

### 複雑度を上げる判断基準
- パフォーマンス要件が現状では満たせないと示すデータがある。
- 対応対象のユーザーやデータ規模が大きく、スケールを見据えた設計が必要。
- 複数のユースケースが存在し、抽象化が実際のコスト削減につながる。

### 参照の明確化
- コードの参照は `path/to/file.ts:42` の形式で記載する。
- 仕様は `specs/<capability>/spec.md` の形で参照する。
- 関連する変更 ID や PR があれば必ずリンクする。

### capability / change-id の命名
- 能力名は動詞+名詞（例: `user-auth`, `payment-capture`）で 1 つの責務に集中させる。
- `change-id` は短く明確にし、動詞から始める（例: `add-two-factor-auth`）。
- 名前が衝突する場合は末尾に `-2`, `-3` を付けて調整する。

## エラー時の対応

### 変更の競合
1. `openspec list` で重複する提案がないか確認。
2. 同じ仕様に影響する差分があれば連携して統合を検討。
3. 必要に応じて `openspec show <change-id> --json --deltas-only` で差分を比較する。

### バリデーション失敗
1. `openspec validate <change-id> --strict` を実行し、詳細を把握する。
2. JSON 出力を利用して問題箇所を特定する。
3. 要件ヘッダとシナリオ形式が正しいか確認し、修正する。

### 情報不足
1. `openspec/project.md` を先に読み、プロジェクトの前提条件を把握する。
2. 関連する既存仕様とアーカイブを確認する。
3. 不明点が残る場合は質問を行い、曖昧さを排除する。

## クイックガイド（実践的な使い方）

### 新機能を追加したいとき
1. `openspec spec list --long` と `openspec list` で既存仕様と進行中の変更を把握する。
2. 影響する能力を洗い出し、既存仕様を更新すべきか新規 capability を追加すべきか判断する。
3. ユニークな `change-id` を決め、`openspec/changes/<change-id>/` に `proposal.md` と `tasks.md`（必要なら `design.md`）を用意する。
4. 差分仕様を `specs/<capability>/spec.md` に記述し、要件とシナリオを揃える。
5. `openspec validate <change-id> --strict` でエラーを解消し、レビューに回す。
6. 承認後、`tasks.md` に沿って実装し、完了したタスクにチェックを入れる。
7. デプロイ後は `openspec archive <change-id> --yes` を実行し、正本仕様 (`openspec/specs/`) を更新する。

### 既存機能を改修するとき
1. 対象 capability の正本仕様を読み、現状の想定動作を理解する。
2. 行動変更が必要なら `## MODIFIED Requirements` を使って差分を記述し、変更点を明示する。
3. 既存シナリオが不足していれば追加し、期待する挙動を文章化する。

### バグ修正のみ行うとき
- 仕様に定められた動作へ戻すだけなら新たな提案は不要。既存仕様への言及を根拠とし、修正内容とテスト結果をまとめる。
- 必要に応じて `tasks.md` の未完了タスクが残っていないか確認する。

### 日常運用のヒント
- 新しいメンバーやエージェントが参加したら `openspec update` を実行し、`AGENTS.md` と `.augment/commands` が最新化されているか確かめる。
- Slash コマンド対応エディタ（Claude Code、Cursor など）では `openspec-proposal` / `openspec-apply` / `openspec-archive` を利用することで、対話から仕様テンプレートを素早く生成できる。
- レビュー時は `openspec show <change-id> --json --deltas-only` で差分を把握し、仕様・実装・テストが揃っているか確認する。

---

仕様 (`openspec/specs/`) は常にシステムの真実を表し、`openspec/changes/` は提案と進行中の作業を示します。提案 → 実装 → アーカイブのフローを守り、両者が乖離しないよう運用してください。
