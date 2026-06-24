# Render の API 503 を migration 責務の分離で直す

## 対象読者

- Render に Docker Web Service をデプロイしている人
- Hono + Bun + Drizzle の backend で migration を扱っている人
- 起動時 migration と readiness の責務分離を考えたい人

## この記事で扱うこと

この記事では、Render 上の diary backend で `/api/diaries` が `503 Service Unavailable` を返し続けた問題と、その修正方針をまとめます。

扱う範囲は backend のデプロイ時 migration と API readiness です。frontend の UI や認証仕様の変更は扱いません。

## 症状

frontend から次の API を呼ぶと、`503 Service Unavailable` が返っていました。

```text
GET https://daybook-0qzn.onrender.com/api/diaries?page=1&pageSize=10
```

一方で、backend の `/openapi.json` は `200` を返していました。つまり、サービス全体が落ちているというより、API パスだけが backend 側の readiness 判定で止められている状態でした。

## 原因

直前の修正では、backend の web プロセス起動時に Drizzle migration を開始し、migration が完了するまで `/api/*` へ `503` を返す仕組みにしていました。

この仕組み自体は「schema が未準備の API を触らせない」ための防御でしたが、Render 本番では migration が ready にならない場合、API がずっと `503` のままになります。

つまり問題は、migration SQL そのものではなく、web プロセスが migration の責務を持っていたことでした。

ローカルの DB 接続確認では、次の状態を確認できました。

- DB 接続に成功する
- `public.users` が存在する
- `public.diaries` が存在する
- `drizzle.__drizzle_migrations` が存在する
- `pgcrypto` extension が存在する

このため、migration ファイルを削除する方向ではなく、実行タイミングを分ける方針にしました。

## 修正方針

Render では、web プロセスが起動する前に migration を済ませる構成にしました。

`render.yaml` の backend service に `preDeployCommand` を追加します。

```yaml
preDeployCommand: bun run db:migrate:runtime
```

さらに、本番 web プロセスでは起動時 migration を止めます。

```yaml
- key: DB_MIGRATE_ON_START
  value: "false"
```

これにより、API リクエスト処理と migration 実行を分離できます。

## runtime migration コマンドを追加する

既存の `db:migrate` は `drizzle-kit migrate` を使っていました。ただし、backend の Docker image は production dependencies だけを install しているため、devDependency の `drizzle-kit` に依存するコマンドは本番 image では使いにくい構成です。

そこで、production dependencies の `drizzle-orm` と `pg` だけで動く runtime 用 migration command を追加しました。

```ts
export async function runMigrationCommand(
  env: Record<string, string | undefined> = process.env,
  deps: MigrationCommandDeps = { runDatabaseMigrations },
): Promise<void> {
  const databaseUrl = readDatabaseUrl(env);
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  await deps.runDatabaseMigrations(databaseUrl);
}
```

この command は `JWT_SECRET` を要求しません。migration に必要なのは DB 接続情報だけなので、API runtime config とは分けています。

## テストで固定したこと

今回の修正では、次の観点をテストにしました。

- `DATABASE_URL` だけで runtime migration が実行できる
- `DB_HOST` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` / `DB_PORT` から DB URL を組み立てて migration できる
- DB 接続情報がない場合は `DATABASE_URL is required.` を返す
- Render Blueprint に `preDeployCommand` と `DB_MIGRATE_ON_START="false"` がある

また、後続で CI の small test が不安定になりました。

原因は、非 API パスが migration を待たないことを確認するテストで、`/openapi.json` の応答と `setTimeout(0)` を競争させていたことです。環境差で 0ms timer が先に勝つと、実装が正しくても失敗します。

そこで、テストは「migration が未解決のまま `/openapi.json` が `200` を返す」ことを直接検証する形に変えました。

## 検証

backend で次を実行し、すべて成功しました。

```bash
bun run db:migrate:runtime
bun run typecheck
bun run lint
bun run test
```

最終的に backend test は 108 tests が通っています。

## まとめ

今回のポイントは、`503` を単なる status code の問題として扱わず、なぜ API readiness が ready にならないのかまで追ったことです。

migration ファイルは問題ではありませんでした。問題は、web プロセスが migration 実行と API readiness の両方を背負っていたことです。

Render の deploy phase で migration を実行し、web runtime では API serving に集中させることで、責務が分かれて挙動も読みやすくなりました。
