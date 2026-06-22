# drizzle-kit migrate の ETIMEDOUT を PostgreSQL 方言の不一致として直す

`bun run db:migrate` を実行すると、`drizzle-kit migrate` が `Error: connect ETIMEDOUT` で失敗していた。

原因はネットワークだけではなく、Drizzle の設定と実際の DB の種類が食い違っていたことだった。プロジェクトの DB 仕様は PostgreSQL で、接続先も PostgreSQL だった一方、バックエンド実装は MySQL 方言、`mysql2` ドライバ、`mysql-core` schema を使っていた。

つまり、Drizzle は PostgreSQL の接続先に MySQL として接続しようとしていた。

## 再現テスト

まず `backend/drizzle.config.small.test.ts` を追加し、Drizzle 設定が PostgreSQL 方言と PostgreSQL URL を使うことをテストにした。

最初は現在の設定が `mysql` を返すため、このテストは失敗した。これで、単なる接続先の一時障害ではなく、設定の方言不一致を再現できた。

## 修正内容

修正では、永続化層を仕様に合わせて PostgreSQL へ切り替えた。

- `backend/drizzle.config.ts` の dialect を `postgresql` に変更
- `DB_*` から組み立てる URL を `postgresql://...` に変更
- `mysql2` を削除し、`pg` と `@types/pg` を追加
- Drizzle client を `drizzle-orm/node-postgres` に変更
- schema を `drizzle-orm/pg-core` に変更
- `uuid` と `timestamp with time zone` を使うように修正
- PostgreSQL 用 migration を再生成

生成された migration には、仕様で必須になっている `pgcrypto` extension も追加した。`gen_random_uuid()` を使うため、migration の先頭で `CREATE EXTENSION IF NOT EXISTS "pgcrypto";` を実行する。

## なぜこれで直るか

失敗していた根本原因は、DB 接続先に到達できないことそのものではなく、接続先の DBMS と Drizzle の dialect/driver が一致していないことだった。

PostgreSQL 用の `pg` driver と `postgresql` dialect に合わせることで、`drizzle-kit migrate` は PostgreSQL として接続し、生成 SQL も PostgreSQL 方言になる。

実際に修正後の `bun run db:migrate` は成功し、migration が適用された。

## 検証

以下を確認した。

- `bun test drizzle.config.small.test.ts` — pass
- `bun run db:migrate` — pass
- `bun run typecheck` — pass
- `bun run lint` — pass
- `bun run test` — 93 tests pass

## 学び

DB 接続エラーが `ETIMEDOUT` として出ると、まずネットワークや firewall を疑いたくなる。ただし ORM や migration tool では、dialect と driver の不一致でも接続段階で分かりにくい失敗になることがある。

今回のように、仕様、`.env`、Drizzle config、schema import、driver dependency を一列に並べて確認すると、どこで DBMS がずれているかを見つけやすい。
