---
name: spec-driven-dev
description: 仕様駆動開発スキル。「仕様書を書きたい」「スペックを作成」「仕様駆動で開発」「specを書いて」「実装を始めたい」「tasksに落としたい」などのリクエスト時に使用。仕様書を生成→tasksコマンドに変換→AgentTeamで実装開始する。仕様書はAgent別に分割され、各Agentが自分の担当仕様だけを見て実装できる形にする。マネタイズアプリに限らず、あらゆるプロジェクトで仕様駆動開発を行う際に使用可能。
---

# 仕様駆動開発スキル

仕様書を起点に開発を進めるワークフロー。
仕様書 → tasks → AgentTeam実装 のパイプラインを管理する。

**原則：仕様書に書かれていないものは作らない。仕様書に書かれているものは必ず作る。**

```
monetize-app-plan → agent-team-design → [このスキル] → 実装
 企画・設計        チーム相談          仕様書→tasks
```

※ このスキルは単体でも使用可能。前段スキルなしでも、機能リストさえあれば仕様書を生成できる。

## ワークフロー

### Phase 1: インプット確認

以下が揃っているか確認する：

**必須：**
- プロダクト定義（MVP機能リスト、やること/やらないこと）
- 技術スタック・ディレクトリ構成

**推奨（あればより良い仕様書になる）：**
- 課金設計（`monetize-app-plan` の出力）
- AgentTeam構成（`agent-team-design` の出力）
- CLAUDE.md

前段スキルを経由せず直接呼ばれた場合：
- 「何を作りますか？」「主要機能は？」を聞く
- 最低限の機能リストを整理してからPhase 2へ

### Phase 2: 仕様書の構成決定

`references/spec-format.md` を参照し、仕様書の構成を決定する。

**仕様書は以下の階層で作成：**

```
specs/
├── overview.md              # プロジェクト概要・全体仕様
├── features/                # 機能別仕様
│   ├── auth.md
│   ├── onboarding.md
│   ├── [core-feature].md
│   ├── subscription.md
│   └── settings.md
├── screens/                 # 画面仕様
│   ├── screen-list.md       # 全画面一覧
│   └── [screen-name].md     # 各画面の詳細
├── api/                     # API・データ仕様
│   ├── database.md          # DB スキーマ
│   ├── api-endpoints.md     # APIエンドポイント一覧
│   └── external-services.md # 外部サービス連携
└── shared/                  # 横断仕様
    ├── navigation.md        # ナビゲーション構造
    ├── error-handling.md    # エラーハンドリング方針
    └── analytics-events.md  # イベントトラッキング定義
```

### Phase 3: 仕様書生成

各仕様書を `references/spec-format.md` のフォーマットに従って生成する。

**生成順序（依存関係順）：**
1. `overview.md` — 全体像の確定
2. `screens/screen-list.md` — 全画面の洗い出し
3. `api/database.md` — データモデルの確定
4. `features/*.md` — 機能別仕様（ここが最も重要）
5. `screens/*.md` — 各画面の詳細仕様
6. `api/*.md` — API仕様
7. `shared/*.md` — 横断仕様

**各仕様書に必須の要素：**
- 目的（なぜこの機能が必要か）
- ユーザーストーリー（誰が、何を、なぜ）
- 受け入れ条件（Acceptance Criteria）— テスト可能な形で記述
- 画面仕様（入力/出力、状態遷移）
- エッジケース・エラーケース
- 担当Agent（`agent-team-design` で決定済みの場合）

### Phase 4: 仕様書レビュー

生成した仕様書をユーザーに提示し、レビューを受ける。

**レビューのポイント：**
- 機能の抜け漏れがないか
- 受け入れ条件が明確か
- 優先順位は正しいか
- 「やらないこと」が明記されているか

ユーザーのフィードバックを反映して仕様書を更新する。

### Phase 5: tasks変換

確定した仕様書から `tasks` コマンドに登録するタスクを生成する。

`references/task-conversion.md` を参照。

**変換ルール：**
- 1つの受け入れ条件 ≒ 1つのタスク（粒度は調整可）
- 各タスクに付与する情報：
  - タスク名（動詞で始める：「実装する」「設定する」「テストする」）
  - 参照する仕様書のパス
  - 担当Agent
  - 依存タスク（ブロッカー）
  - 完了条件（仕様書の受け入れ条件から転記）
  - 推定サイズ（S/M/L）

**フェーズ分け：**
```
Phase 0: 基盤（全Agent共通）
Phase 1: 基盤機能（認証、課金SDK、ナビゲーション）
Phase 2: コア機能（Agent別に並列）
Phase 3: 統合・課金最適化
Phase 4: リリース準備
```

### Phase 6: AgentTeamへの引き渡し

tasksの登録が完了したら、以下を出力：

1. **Agent別タスク一覧** — 各Agentが何をやるか一目でわかる表
2. **実行順序図** — どのタスクから着手すべきか
3. **CLAUDE.md 最終更新** — 仕様書パス、タスク管理ルールを追記

```
✅ 完了：仕様書生成 + tasks登録
→ AgentTeamで実装開始！
  各AgentはCLAUDE.mdと自分の担当仕様書を参照して実装する
```

## 仕様書更新ルール

実装中に仕様変更が必要になった場合：
1. まず仕様書を更新する（コードより先に）
2. 変更の影響範囲を確認（他Agentに影響するか）
3. 影響がある場合はユーザーに相談
4. 仕様書の変更履歴を記録する

## 参照

- `references/spec-format.md`: 仕様書のフォーマット定義
- `references/task-conversion.md`: 仕様書→tasks変換のガイド
