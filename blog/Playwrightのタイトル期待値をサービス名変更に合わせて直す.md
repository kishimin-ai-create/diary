# Playwrightのタイトル期待値をサービス名変更に合わせて直す

## 対象読者

- PlaywrightでNext.js App Routerの画面タイトルを検証している人
- branding変更後にE2Eだけが古い期待値で落ちた状況を整理したい人
- 実装を直すべきか、テストを直すべきかを切り分けたい人

## エラー概要

PlaywrightのE2Eで、トップページのタイトル検証が失敗しました。

失敗していたテストは `frontend/e2e/example.medium.test.ts` です。

エラー内容は、テストが `/diary/i` を期待している一方で、実際のタイトルが `つづる日記` になっているというものでした。

```text
Expected pattern: /diary/i
Received string: "つづる日記"
```

## 原因

原因は実装の不具合ではなく、E2Eテストの期待値が古くなっていたことです。

直前のbranding対応で、`frontend/app/layout.tsx` のmetadataは実サービス名である `つづる日記` をブラウザタブに表示するように変更されました。これはfavicon、ロゴ画像、サービス名を実サービス表示にそろえるための意図した変更です。

そのため、E2Eが引き続き英語の汎用ラベル `diary` を期待するのは、現在の仕様とずれていました。

## 対応

`frontend/e2e/example.medium.test.ts` のテスト名と期待値を、現在のサービス名に合わせました。

変更前は、タイトルに `diary` が含まれることを見ていました。

```ts
await expect(page).toHaveTitle(/diary/i);
```

変更後は、ブラウザタブに表示されるサービス名そのものを確認します。

```ts
await expect(page).toHaveTitle("つづる日記");
```

この修正により、E2Eは「古い仮タイトルが残っているか」ではなく、「実サービス名がタブに表示されるか」を検証するようになりました。

## 検証

修正後、以下を確認しました。

- `bun run e2e -- e2e/example.medium.test.ts`
- `bun run typecheck`
- `bun run lint`
- `bun run test`

ローカルでは最初にPlaywrightブラウザが未インストールだったため、`bunx playwright install chromium webkit` を実行してからE2Eを再確認しました。最終的にChromiumとWebKitの2件が成功しています。

## まとめ

UIのbranding変更では、実装だけでなくE2Eの期待値も仕様に合わせて更新する必要があります。

今回の失敗は、アプリが壊れていたのではなく、テストが過去のタイトル仕様を見続けていたことが原因でした。`FixTestAgent` の判断基準どおり、実装ではなくテストを修正することで、E2Eが現在のサービス表示を正しく検証する状態になりました。
