# Renderで起動時migrationがポート検出を塞ぐ問題を直す

## 対象読者

- Render の Docker Web Service で Bun/Hono backend を動かしている人
- 起動時に Drizzle migration を実行している人
- `No open ports detected` と DB 接続エラーが同じ deploy log に出ている人

## この記事で扱うこと

この記事では、backend 起動時に Drizzle migration を待っていたことで、Render が Web Service の port を検出できなかった問題を扱う。

既に別の記事で扱っている Bun の二重起動や Drizzle の DB 方言不一致は対象外にする。今回の焦点は、production entrypoint が「いつ port を公開できる状態になるか」だけに絞る。

## 起きたこと

Render の deploy log では、Docker image の build 自体は完了していた。その後、backend の start script が実行されると、Render 側が次のように port 検出を続けていた。

```text
No open ports detected, continuing to scan...
```

その後、Drizzle migrator が migration 履歴用の schema を作ろうとした段階で PostgreSQL 接続が拒否され、process が終了していた。

```text
Failed query: CREATE SCHEMA IF NOT EXISTS "drizzle"
connect ECONNREFUSED ...:5432
```

このログだけを見ると migration ファイルを疑いたくなる。ただし、失敗しているのは migration SQL の中身ではなく、Drizzle が PostgreSQL に接続する最初の段階だった。

## 原因

`backend/src/server.ts` の production server 作成処理が、Bun server config を返す前に migration 完了を待っていた。

そのため、PostgreSQL が一時的に接続を受け付けない間、backend process は port を bind できる server config を Bun に渡せなかった。Render から見ると、Web Service が起動中なのに open port が見えない状態になる。

直前の修正で migration retry を 30 回まで増やしていたが、それだけでは Render の port 検出問題は解消しない。retry で待つ時間が増えるほど、むしろ port 公開も遅れるためだ。

## 対応方針

migration は必要なので削除しない。代わりに、次のように責務を分けた。

- backend 起動時に migration は開始する
- Bun server config は migration 完了を待たずに返す
- テストでは `migrationResult` を await して migration の挙動を確認できるようにする
- `DB_MIGRATE_ON_START=false` の逃げ道は維持する

この形なら、Render は Web Service の port を検出できる。一方で、migration の開始自体は production startup の流れに残せる。

## 実装

`backend/src/server.ts` の `createProductionServer` を同期的に server config を返す関数に変更した。

```ts
const migrationResult =
  env["DB_MIGRATE_ON_START"] === "false"
    ? Promise.resolve()
    : runMigrationsWithRetry(config.databaseUrl, deps);
void migrationResult.catch(() => undefined);
```

`migrationResult` は返却値に含める。これにより、unit test では migration が実行されたこと、retry されたこと、skip されたことを await して確認できる。

```ts
return {
  app,
  defaultExport: {
    fetch: app.fetch,
    port: config.port,
  },
  migrationResult,
};
```

`backend/src/index.ts` も top-level await を外し、Bun が entrypoint の default export をすぐ読めるようにした。

```ts
const productionServer = createProductionServer();

export const { app } = productionServer;

export default productionServer.defaultExport;
```

## テスト

`backend/src/server.small.test.ts` に、migration が pending のままでも Bun server config を返せることを確認するテストを追加した。

```ts
const result = await Promise.race([
  createProductionServer(env, {
    runDatabaseMigrations: (databaseUrl) => {
      calls.push(databaseUrl);
      return new Promise(() => {});
    },
  }),
  Promise.resolve("migration-blocked"),
]);

expect(result).not.toBe("migration-blocked");
```

このテストは、修正前には `migration-blocked` が返って失敗した。つまり、migration が完了しない限り server config が返らない状態を再現できていた。

修正後は、次の検証が通った。

```bash
bun test src/server.small.test.ts
bun run typecheck
bun run lint
bun run test
```

backend 全体では 101 tests が通った。

## 注意点

この修正は「port を先に公開できるようにする」ためのものだ。PostgreSQL 接続そのものを直すものではない。

そのため、Render 側の `DATABASE_URL` が正しいこと、PostgreSQL service が起動していること、必要な migration ファイルが Docker image に含まれていることは別途必要になる。今回の backend Dockerfile では `COPY drizzle ./drizzle` を含めており、その存在は `backend/Dockerfile.medium.test.ts` で固定している。

また、migration が終わる前にリクエストが来た場合、schema 未作成なら API が DB エラーになる可能性は残る。今回の修正は deploy 時の port 検出失敗を避けるためのものであり、migration 完了まで traffic を完全に制御する仕組みではない。

## まとめ

- Render の `No open ports detected` は、migration 待ちで Bun server config を返せていないことが原因だった
- migration ファイル削除ではなく、port 公開と migration 実行の待ち方を分離した
- `createProductionServer` は server config を先に返し、migration は `migrationResult` として追跡できるようにした
- retry 増加だけでは port 検出問題は解決しないため、起動契約そのものを見直した

