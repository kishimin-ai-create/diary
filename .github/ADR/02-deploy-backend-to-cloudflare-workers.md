# ADR-02 Cloudflare Workersでbackendを実行する

## Status

Accepted

## Context

### 背景

backendはHono API、Bun用サーバー、Drizzle ORM、Supabase PostgreSQLで構成されている。Cloudflare
Workersを本番APIの実行先として利用することになった。

### 変更前の問題

Bun用のエントリーポイントはポートを持つ常駐プロセスと起動時マイグレーションを前提としている。Cloudflare
Workersはリクエストハンドラーを実行するため、そのままでは実行モデルとDB接続のライフサイクルが一致しない。

### 制約

- ローカル開発と既存テストではBunを継続して使用する。
- データ要件で指定されたPostgreSQLと既存のSupabaseデータベースを維持する。
- HonoのAPI契約、Drizzleのスキーマ、Repository境界を維持する。
- DBマイグレーションを通常のAPIリクエストから実行しない。

## Decision

本番APIをCloudflare Workersで実行し、Supabase PostgreSQLへHyperdrive
bindingを通じて接続する。Bunはローカル開発、テスト、DBマイグレーションの実行環境として維持し、Workersの実行境界から分離する。

## What

### 最終的な設計

Frontendのサーバー側API proxyはCloudflare Worker上のHono
APIを呼び出す。WorkerはリクエストごとにHyperdriveの接続文字列を使うDBクライアントを作成し、処理後に解放する。マイグレーションはデプロイ前の独立した運用工程としてSupabaseへ直接実行する。

## Why

### 判断理由

Hono、Drizzle、PostgreSQLという既存のアプリケーション境界とデータ契約を維持したまま、Workersのリクエスト実行モデルへ適合できる。Hyperdriveへ接続管理を委ねることで、Worker内に常駐プロセス向けの接続プールを保持する必要がない。マイグレーションを分離することで、複数のWorker
isolateや通常リクエストから同じマイグレーションが開始される状態を避けられる。

## Alternatives

### 案1

#### 概要

Bunサーバーをコンテナ実行環境へデプロイする。

#### 利点

現在のポート、接続プール、起動時マイグレーションの実行モデルを維持できる。

#### 欠点

Cloudflare Workersへbackendを配置できず、今回選択した実行基盤と一致しない。

#### 採用可否

不採用。backendをCloudflare Workersで運用する方針が選択されたため。

---

### 案2

#### 概要

Supabase PostgreSQLをCloudflare D1へ置き換える。

#### 利点

WorkerからCloudflare bindingだけでデータベースへアクセスできる。

#### 欠点

PostgreSQLを使用するデータ要件と既存スキーマを変更し、データ移行が必要になる。

#### 採用可否

不採用。既存のSupabase PostgreSQLを維持するため。

## Consequences

### 利点

- Bun用とWorkers用のエントリーポイントが同じHonoアプリケーションを共有できる。
- Supabase PostgreSQLと既存のDrizzle Repositoryを維持できる。
- DB接続とWorkerリクエストのライフサイクルが一致する。

### 制約

- デプロイ前にSupabaseのDirect connectionを使ってマイグレーションを実行する必要がある。
- Cloudflare上にHyperdrive設定とJWT Secretを事前登録する必要がある。
- Workers固有コードはWorkers Runtime型でも検証する必要がある。

### トレードオフ

BunとWorkersの2つの実行境界を維持するため、型チェックとエントリーポイントも分けて管理する。

### 未解決事項

本番Hyperdrive ID、Worker公開URL、Frontendの`BACKEND_URL`はCloudflareリソース作成後に確定する。

## AI向け記録

### 今後守るルール

- WorkersではHyperdrive bindingからSupabase接続文字列を取得する。
- Bunの`process.env`設定をWorkersのbinding境界へ持ち込まない。
- DBマイグレーションは通常のWorkerリクエストやモジュール初期化から実行しない。

### 再導入してはいけない設計

- Worker内に常駐プロセス用のDB接続プールを保持しない。
- Workerの起動時やAPIリクエスト中にDBマイグレーションを開始しない。
- Supabaseの接続情報やJWT Secretをリポジトリへ保存しない。

### 判断基準

HTTP処理はWorkersのfetch境界へ配置し、DBスキーマ変更はBunで動く独立したデプロイ工程へ配置する。

## 関連資料

### ADR

- 該当なし

### Pull Request

- 未確認

### Issue

- 未確認

### Commit

- `809d449`
- `91ee749`

### その他

- `backend/src/worker.ts`
- `backend/wrangler.jsonc`
- `docs/deployment/cloudflare-workers.md`
