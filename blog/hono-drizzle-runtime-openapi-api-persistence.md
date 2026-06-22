# Hono + Drizzle で日記 API を永続化し、hono-openapi で実装から OpenAPI を公開する

日記アプリのバックエンド API は、テスト駆動で Hono のルート、サービス、リポジトリ境界まで実装されていた。ただし、その時点では本番エントリポイントと永続化層の接続が残っており、API 契約も静的な YAML と実装が分かれていた。

今回の作業では、Hono アプリを Drizzle + MySQL の実リポジトリへ接続し、マイグレーションを生成し、さらに `hono-openapi` を使って `/openapi.json` から実装ベースの OpenAPI を公開する形に変えた。

## 何を解決したか

最初の課題は、API の実装と実行時の配線が分かれていたことだった。統合テストは `createApp(deps)` にモックリポジトリを渡して検証できていた一方で、実際に起動される `backend/src/index.ts` はアプリ本体と永続化層を接続する必要があった。

もう一つの課題は、OpenAPI の保守方法だった。静的な `docs/spec/backend/openapi.yaml` を手で持つ方式だと、ルート実装や Zod スキーマとずれやすい。そこで、Hono のルートにメタデータを寄せて、実装から OpenAPI JSON を返す方式にした。

## Drizzle + MySQL の永続化

永続化層では Drizzle の設定とスキーマを追加した。

- `backend/drizzle.config.ts`
- `backend/src/infrastructures/db/client.ts`
- `backend/src/infrastructures/db/schema.ts`
- `backend/src/infrastructures/repositories/drizzle-user.repository.ts`
- `backend/src/infrastructures/repositories/drizzle-diary.repository.ts`

ユーザーと日記のテーブル定義は Drizzle schema に置き、既存の `IUserRepository` / `IDiaryRepository` を実装する形でインフラ層のリポジトリを追加した。サービス層はインターフェースに依存したままなので、テストではこれまで通りモックリポジトリを注入できる。

`backend/src/index.ts` では、環境変数を読み込んで実リポジトリを生成し、`createApp` に渡すようにした。これにより、本番起動時にも `/api/auth/*` と `/api/diaries/*` が実際の DB 接続を使って動く。

## 設定の扱い

DB URL や JWT secret は `process.env` から読むようにし、必須値が欠けている場合は起動時に失敗するようにした。

関連する検証として、`backend/src/infrastructures/config.small.test.ts` で設定読み込みのテストを追加している。`.env` の値そのものはコミット対象にせず、必要な環境変数は `.env.example` などのプレースホルダーで扱う方針を維持した。

## マイグレーション

Drizzle のマイグレーションファイルも生成した。

- `backend/drizzle/0000_gorgeous_morbius.sql`
- `backend/drizzle/meta/0000_snapshot.json`
- `backend/drizzle/meta/_journal.json`

ただし、作業環境では MySQL への接続が `connect ETIMEDOUT` になったため、`db:migrate` による適用完了までは確認できていない。ここは「生成済み」だが「適用済み」とは扱わないのが正確だ。

## hono-openapi への切り替え

OpenAPI は静的 YAML ではなく、`hono-openapi` を使ってルート実装から返す方式にした。

中心になるのは `backend/src/openapi.ts` と `backend/src/app.ts` だ。`createApp` で通常の API ルートを登録したあと、`/openapi.json` に `openAPIRouteHandler(app, openApiOptions)` を追加している。

各コントローラーでは、Hono の handler の前に `describeRoute` を置き、レスポンススキーマには Zod schema を `resolver` で渡す。

これにより、API の契約情報がコントローラーの近くに集まり、実装を変更したときに OpenAPI 側も同じ場所で更新できるようになった。

## 静的 YAML を削除した理由

今回、`docs/spec/backend/openapi.yaml` は削除した。理由は、OpenAPI の正本をファイルとして二重管理しないためだ。

API 利用側が契約を確認したい場合は、バックエンドから `/openapi.json` を取得する。テストも `backend/tests/integrations/openapi.medium.test.ts` で追加し、OpenAPI の基本情報と主要パスが返ることを確認している。

## 検証

今回のバックエンド変更では、以下の検証を通した。

- `bun run test` — 91 tests pass
- `bun run typecheck` — pass
- `bun run lint` — pass
- `bun run db:generate` — pass

一方で、`bun run db:migrate` は MySQL 接続タイムアウトのため完了していない。ローカルまたは CI の DB が到達可能な状態で、改めて適用確認が必要になる。

## まとめ

今回の変更で、日記 API はモック前提の実装から、実際の MySQL 永続化に接続されたバックエンドへ進んだ。さらに OpenAPI を静的ファイルではなく Hono ルートから公開することで、実装と契約の距離を短くした。

残る確認事項は、到達可能な MySQL 環境でマイグレーションを適用することだ。そこが通れば、API 実装、永続化、契約公開の一連の流れが本番運用に近い形でそろう。
