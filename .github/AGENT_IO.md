# Agent I/O Reference

アプリごとに変わる入力・出力・パス設定の一覧。  
別プロジェクトに移植するときはこのファイルを起点に各 `.agent.md` を更新する。

---

## 早見表

| エージェント | 入力（何を渡すか） | 出力ファイル・場所 |
|---|---|---|
| [OrchestratorAgent](#orchestratoragent) | 仕様書 `.md` のパス | `review/`, `blog/`, `diary/` |
| [RedAgent](#redagent) | 仕様書 + ターゲット + スコープ | テストファイル（`*.test.ts`） |
| [GreenAgent](#greenagent) | 失敗テストファイル + 仕様書 + ターゲット | 実装ファイル |
| [RefactorAgent](#refactoragent) | 実装ファイル + テストファイル + ターゲット | リファクタ済み実装ファイル |
| [FixAgent](#fixagent) | バグ報告 + 対象ファイル + 仕様書 | テスト + 修正済み実装ファイル |
| [CodeReviewAgent](#codereviewagent) | ブランチ / ファイル / PR 番号 | `review/{topic}-YYYYMMDD.md` |
| [ReviewResponseAgent](#reviewresponseagent) | `review/` 下のファイルパス（省略可） | `review/` ファイルへ追記 + コード修正 |
| [RegressionTestAgent](#regressiontestagent) | 変更ファイル / バグ説明 / 仕様書 | テストファイル |
| [ArticleWriterAgent](#articlewriteragent) | diff / 仕様書 / PR文脈 | `blog/{title}.md` |
| [WorkSummaryAgent](#worksummaryagent) | スコープヒント / 変更ファイル | `diary/YYYYMMDD.md` |
| [PullRequestWriterAgent](#pullrequestwriteragent) | diff / 仕様書 / タスク文脈 | `pull-request/{title}.md` |
| [OpenApiWriterAgent](#openapiwriteragent) | バックエンド実装ファイル + スコープ | `docs/spec/backend/openapi.yaml` |
| [UIDesignAgent](#uidesignagent) | コンポーネントパス / デザイン参照 / スコープ | フロントエンド `.tsx` + `.stories.tsx` |

---

## OrchestratorAgent

**役割**: Red → Green → Refactor → Review の TDD フルサイクルを指揮する。

### 入力
| 項目 | 内容 |
|---|---|
| 仕様書（必須） | `docs/spec/features/{feature}.md` などの Markdown パス |
| スコープ（任意） | 対象レイヤー（Domain / Usecase / Interface / Component） |
| 設定（任意） | フレームワーク指定など |

### 出力
| 成果物 | パス |
|---|---|
| レビューファイル | `review/{feature-slug}-YYYYMMDD.md` |
| ブログ記事 | `blog/{title}.md` |
| 作業日誌 | `diary/YYYYMMDD.md` |

### アプリごとに変わる設定
- `docs/spec/features/` の仕様書パス構造
- `{feature-slug}` の命名規則

---

## RedAgent

**役割**: 仕様から失敗するテストを生成する。

### 入力
| 項目 | 内容 |
|---|---|
| 仕様書（必須） | `docs/spec/` 以下の Markdown |
| ターゲット（必須） | テスト対象モジュールのパス（例: `createApp usecase`） |
| スコープ（必須） | どのレイヤーにテストを書くか（Domain / Usecase / Interface / Component） |

### 出力
| 成果物 | パス |
|---|---|
| テストファイル | `backend/src/**/*.test.ts` または `frontend/src/**/*.test.tsx` |

### アプリごとに変わる設定
- テストフレームワーク（本プロジェクト: Vitest / React Testing Library）
- テスト配置ディレクトリの慣習
- テスト実行コマンド（本プロジェクト: `npm run test`）

---

## GreenAgent

**役割**: 失敗しているテストを通す最小限の実装を書く。

### 入力
| 項目 | 内容 |
|---|---|
| 失敗テストファイル（必須） | `*.test.ts` / `*.test.tsx` のフルパス |
| 仕様書（必須） | 期待動作の Markdown |
| ターゲット（必須） | 実装を置くモジュールパス |
| ドメイン・技術（任意） | Backend (TypeScript + Hono) / Frontend (React + TypeScript) など |

### 出力
| 成果物 | パス |
|---|---|
| 実装ファイル | ターゲットで指定したパス |

### アプリごとに変わる設定
- フレームワーク（本プロジェクト: Hono / React）
- DB / ORM（本プロジェクト: MySQL + mysql2）
- テスト実行コマンド（本プロジェクト: `npm run test`）

---

## RefactorAgent

**役割**: 外部動作を変えずにコードの内部品質を改善する。

### 入力
| 項目 | 内容 |
|---|---|
| 実装ファイル（必須） | リファクタ対象のフルパス |
| テストファイル（参照用） | 外部契約を定義するテストのパス |
| 仕様書（任意・コンテキスト用） | `docs/spec/` 以下 |
| ターゲット（必須） | 対象ファイルまたはモジュール |
| フォーカスエリア（任意） | 優先的に改善する観点（例: 重複削除、命名改善） |

### 出力
| 成果物 | パス |
|---|---|
| リファクタ済み実装 | 入力と同じパス（上書き） |

### アプリごとに変わる設定
- 検証コマンド（本プロジェクト: `npm run typecheck` → `npm run lint` → `npm run test`）
- バックエンド検証は `backend/` から実行
- フロントエンド検証は `frontend/` から実行

---

## FixAgent

**役割**: バグ・ルール違反・壊れた動作を TDD サイクルで最小限に修正する。

### 入力
| 項目 | 内容 |
|---|---|
| バグ報告 / 症状（必須） | 何が壊れているか・どう現れるか |
| 対象ファイル（必須） | 欠陥を含む実装ファイルのパス |
| テストコード（参照用） | 既存テストスイートのパス |
| 仕様書（任意） | 正しい動作の定義 |
| ルール違反（任意） | 違反しているルールと場所 |

### 出力
| 成果物 | パス |
|---|---|
| 再現テスト + 修正済み実装 | 対象ファイルと同じテストファイルへ追加 |
| コミット（1 fix = 1 commit） | git history |

### アプリごとに変わる設定
- 検証コマンド（本プロジェクト: `npm run typecheck` → `npm run lint` → `npm run test`）
- テスト配置ルール（本プロジェクト: 壊れたレイヤーのテストファイルに追加）

---

## CodeReviewAgent

**役割**: コード変更を分析し、`review/` に構造化レビューファイルを書く。

### 入力
| 項目 | 内容 |
|---|---|
| ブランチ名 / コミット SHA / PR 番号 | レビュー範囲の指定 |
| ファイルまたはディレクトリ（任意） | フォーカスするパス |
| 仕様書（任意） | `docs/spec/` 以下のコンテキスト用ファイル |

### 出力
| 成果物 | パス |
|---|---|
| レビューファイル | `review/{work-description}-YYYYMMDD.md` |

**レビューファイルフォーマット**: 優先度バッジ（🔴 P1 / 🟡 P2 / 🟢 P3）付き指摘 + サマリー

### アプリごとに変わる設定
- `review/` ディレクトリのパス
- 日付取得コマンド（Windows: `Get-Date -Format "yyyyMMdd"` / Unix: `date "+%Y%m%d"`）

---

## ReviewResponseAgent

**役割**: `review/` のレビューコメントにコード修正または文書返答で応答する。

### 入力
| 項目 | 内容 |
|---|---|
| レビューファイルパス（任意） | `review/` 以下のパス。省略時は最新追加ファイルを自動検出 |
| スコープヒント（任意） | ファイル名・コメントタイトル・影響エリア |

**ファイル自動検出コマンド**:
```bash
git --no-pager log --diff-filter=A --name-only --pretty=format: -- review/ | head -1
```

### 出力
| 成果物 | 場所 |
|---|---|
| コード修正 | 対象の実装ファイル（直接編集） |
| 返答テキスト | `review/` ファイルの各指摘直下に追記 |
| Disposition ブロック | 各指摘に `fixed` / `reply only` / `needs clarification` を追記 |

### アプリごとに変わる設定
- `review/` ディレクトリのパス
- レビューファイルの形式（Disposition: ブロックの有無でスキップ判定）

---

## RegressionTestAgent

**役割**: TDD サイクル外で、既実装コードの安全網テストを追加・実行する。

### 入力
| 項目 | 内容 |
|---|---|
| 変更ファイル / ディレクトリ / ブランチ / diff（任意） | 分析対象 |
| バグ説明（任意） | リグレッションカバレッジにしたい問題 |
| 仕様書 / 設計ドキュメント（任意） | 期待動作の参照 |
| スコープヒント（任意） | `backend API` / `usecase layer` / `critical flow` など |

### 出力
| 成果物 | パス |
|---|---|
| テストファイル | 既存テストスタックの慣習に従ったパス |
| テスト実行結果サマリー | エージェント出力 |

### アプリごとに変わる設定
- テストフレームワーク（本プロジェクト: Vitest）
- 実行コマンド（本プロジェクト: `npm run test:unit` / `npm run test:integration`）
- テスト配置の慣習

---

## ArticleWriterAgent

**役割**: 完成した開発作業を日本語技術記事に変換し `blog/` に保存する。

### 入力
| 項目 | 内容 |
|---|---|
| 変更ファイル / diff（主要） | 何が実装されたか |
| 仕様書 / 要件（任意） | なぜ変更が必要だったか |
| PR サマリー / コミット文脈（任意） | 意思決定の背景 |
| 対象読者（任意） | チームメンバー / 初心者 / フロントエンドエンジニア など |
| フォーマット（任意） | ブログ投稿 / devlog / リリースノート / Zenn 記事 など |
| トーン（任意） | フォーマル / カジュアル / 簡潔 / 教育的 |
| 長さ（任意） | 短め / 標準 / 深掘り |
| テーマ種別（任意） | トレンド技術 / 更新機能 / 技術課題 / エラー解決 |

### 出力
| 成果物 | パス |
|---|---|
| 技術記事（日本語 Markdown） | `blog/{title}.md` |

**1 トピック = 1 ファイル**。複数トピックは複数ファイルに分割。

### アプリごとに変わる設定
- `blog/` ディレクトリのパス
- デフォルト言語（本プロジェクト: 日本語）

---

## WorkSummaryAgent

**役割**: リポジトリの変更から作業日誌エントリを生成し `diary/YYYYMMDD.md` に追記する。

### 入力
| 項目 | 内容 |
|---|---|
| スコープヒント（任意） | `this session` / `backend only` / `recent changes` など |
| 変更ファイル（任意） | 対象ファイルリスト |
| タスク文脈（任意） | 直近の作業に関するリポジトリコンテキスト |

### 出力
| 成果物 | パス |
|---|---|
| 作業日誌エントリ（日本語） | `diary/YYYYMMDD.md`（既存なら追記） |

**禁止**: `git commit` / `git push` 不可（ファイル書き込みのみ）

### アプリごとに変わる設定
- `diary/` ディレクトリのパス（本プロジェクトでは `.gitignore` 対象のため `-f` が必要）
- セクション区切りの形式（本プロジェクト: `## セッション N` + `---`）

---

## PullRequestWriterAgent

**役割**: リポジトリ変更から PR 説明 Markdown を生成し `pull-request/` に保存する。

### 入力
| 項目 | 内容 |
|---|---|
| 変更ファイル / diff（主要） | 何が変わったか |
| 仕様書 / タスク文脈（任意） | 変更の意図 |
| 関連 Issue / チケット番号（任意） | リンク用 |
| スコープヒント（任意） | `this session` / `latest changes` / フィーチャー名 |
| 出力ファイル名（任意） | 指定がなければタイトルから自動生成 |

### 出力
| 成果物 | パス |
|---|---|
| PR 説明 Markdown | `pull-request/{title}.md` |

**PR 構成セクション**（順序固定）:
`## Title` → `## Summary` → `## Related Tasks` → `## What was done` → `## What is not included` → `## Impact` → `## Testing` → `## Notes`

**テンプレートファイル**: `.github/pull_request_template.md`

### アプリごとに変わる設定
- PR テンプレートのパス（本プロジェクト: `.github/pull_request_template.md`）
- `pull-request/` ディレクトリのパス

---

## OpenApiWriterAgent

**役割**: 実装済みバックエンド API を OpenAPI 仕様書として `docs/spec/backend/openapi.yaml` に出力する。

### 入力
| 項目 | 内容 |
|---|---|
| バックエンド変更ファイル（主要） | ルート定義・バリデーション・コントローラー |
| 既存仕様書（任意） | `docs/spec/` 以下の現行 OpenAPI |
| スコープヒント（任意） | エンドポイントパス / フィーチャー名 / コミット範囲 |

### 出力
| 成果物 | パス |
|---|---|
| OpenAPI 仕様書（YAML） | `docs/spec/backend/openapi.yaml` |

既存ファイルがある場合は**上書き更新**（新規並行作成しない）。

### アプリごとに変わる設定
- 出力パス（デフォルト: `docs/spec/backend/openapi.yaml`）
- API バージョン・ベースパス

---

## UIDesignAgent

**役割**: フロントエンドの見た目・スタイル・アクセシビリティを Tailwind CSS で改善する。

### 入力
| 項目 | 内容 |
|---|---|
| コンポーネントパス（任意） | 例: `frontend/src/features/todo/TodoItem.tsx` |
| デザイン参照（任意） | 説明文 / スクリーンショット参照 / `docs/design/` 下のドキュメント |
| スコープキーワード（任意） | `"adjust global spacing"` / `"make mobile-friendly"` など |

スコープ未指定時は `frontend/src` 全体を監査して改善。

### 出力
| 成果物 | パス |
|---|---|
| 更新済みコンポーネント | `frontend/src/**/*.tsx`（Tailwind クラス適用） |
| Storybook ストーリー | `frontend/src/**/*.stories.tsx`（新規作成または更新） |

**禁止**: コンポーネントのロジック変更・`style={{}}` インライン・新 npm パッケージ追加

### アプリごとに変わる設定
- CSS フレームワーク（本プロジェクト: Tailwind CSS v4）
- コンポーネント配置パス（本プロジェクト: `frontend/src/features/`）
- ビルド・lint コマンド（本プロジェクト: `cd frontend && npm run build` / `npm run lint`）
- デザインドキュメントパス（本プロジェクト: `docs/design/`）

---

## プロジェクト共通設定（全エージェントに影響）

| 設定項目 | 本プロジェクトの値 | 変更時の影響エージェント |
|---|---|---|
| バックエンドテストコマンド | `cd backend && npm run test` | FixAgent / RefactorAgent / GreenAgent / RegressionTestAgent |
| 型チェックコマンド | `cd backend && npm run typecheck` | FixAgent / RefactorAgent |
| Lint コマンド（BE） | `cd backend && npm run lint` | FixAgent / RefactorAgent |
| フロントエンドビルド | `cd frontend && npm run build` | UIDesignAgent |
| Lint コマンド（FE） | `cd frontend && npm run lint` | UIDesignAgent |
| 設計ドキュメント | `docs/design/` | 全エージェント |
| API 仕様書 | `docs/spec/` | RedAgent / GreenAgent / OrchestratorAgent |
| レビューファイル置き場 | `review/` | CodeReviewAgent / ReviewResponseAgent |
| ブログ記事置き場 | `blog/` | ArticleWriterAgent |
| 作業日誌置き場 | `diary/` | WorkSummaryAgent |
| PR 下書き置き場 | `pull-request/` | PullRequestWriterAgent |
| OpenAPI 仕様書 | `docs/spec/backend/openapi.yaml` | OpenApiWriterAgent |
| PR テンプレート | `.github/pull_request_template.md` | PullRequestWriterAgent |
