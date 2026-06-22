# CI の small test で drizzle.config.small.test.ts が落ちた原因と修正

CI の `bun test small.test` で、`drizzle.config.small.test.ts` が 1 件失敗していた。

ローカルでは同じコマンドが通っていたため、最初は Bun のバージョン差や PostgreSQL 接続まわりを疑いたくなる。しかし今回の原因はもっと手前で、テストが `drizzle.config.ts` を import した瞬間に runtime 用の default export が評価されていたことだった。

## 何が起きていたか

`drizzle.config.ts` は Drizzle CLI が読む設定ファイルなので、default export で `createDrizzleConfig()` を実行していた。

この関数は `DATABASE_URL` または `DB_*` を探し、見つからなければ `DATABASE_URL is required.` を投げる。

ローカルには `backend/.env` があるため問題にならない。一方、CI の small test 環境では `.env` を置かないため、テストが設定生成関数を import しただけで module evaluation が失敗する。

つまり、テストしたかったのは「fake env を渡したときの設定生成」なのに、テストファイルの import が先に runtime env を要求していた。

## 修正方針

Drizzle CLI 用の `drizzle.config.ts` は strict なままにした。migration 実行時に DB 接続設定がないなら失敗するべきだからだ。

その代わり、設定生成ロジックを副作用のない `backend/drizzle.config.factory.ts` に分離した。

- `backend/drizzle.config.ts` は CLI 用に `export default createDrizzleConfig()` だけを持つ
- `backend/drizzle.config.factory.ts` は `createDrizzleConfig(env, cwd)` を export する
- `backend/drizzle.config.small.test.ts` は factory を import し、fake env を渡して検証する

これで CI の small test は `.env` に依存せず、Drizzle CLI の runtime 設定チェックも維持できる。

## 検証

以下を確認した。

- `bun test small.test` — pass
- `.env` のない一時ディレクトリから `drizzle.config.factory.ts` を import して fake env で設定生成 — pass
- `bun run typecheck` — pass
- `bun run lint` — pass
- `bun run test` — 93 tests pass
- `bun run db:migrate` — pass

## 学び

設定ファイルの default export は、テストから見ると module import 時の副作用になりやすい。

CLI 用の entrypoint と、テスト可能な pure factory を分けると、runtime では strict に失敗させながら、unit test では fake env を渡して安定して検証できる。
