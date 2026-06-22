# Next.js App Router UIに近接テストとStorybookを追加してカバレッジ80パーセントを超える

## 対象読者

- Next.js App Router の画面にどの粒度でテストを置くか迷っている人
- Orval / React Query で生成した hook を UI から使っている人
- Storybook と Vitest の両方で UI の安全網を作りたい人

## この記事の範囲

この記事では、日記アプリのフロントエンド UI に対して、近接小テストと Storybook stories を追加し、coverage threshold を超えるまで調整した作業を扱います。

バックエンド API の実装や OpenAPI 生成そのものは対象外です。

## 背景

日記アプリの UI は、Orval で生成した React Query hook を使って、一覧、詳細、ログイン、管理、作成、編集の画面を構成しています。

UI は実装済みでしたが、画面ファイル、認証 helper、API mutator、表示コンポーネントに対する近接テストと Storybook が不足していました。特に App Router の page component は、router、query string、generated hook、mutation callback が絡むため、壊れたときに気づきにくい領域です。

そこで、`frontend/app` 配下の手書きファイルに近い場所へ `*.small.test.tsx` / `*.small.test.ts` を追加し、表示コンポーネントには Storybook stories を追加しました。

## 追加したテスト

主なテスト対象は次の通りです。

- `frontend/app/auth.ts`
- `frontend/app/api/mutator/custom-instance.ts`
- `frontend/app/providers.tsx`
- `frontend/app/home-page-client.tsx`
- `frontend/app/login/page.tsx`
- `frontend/app/admin/page.tsx`
- `frontend/app/admin/create/page.tsx`
- `frontend/app/admin/edit/[id]/page.tsx`
- `frontend/app/diaries/[id]/page.tsx`
- `frontend/app/features/diary/components.tsx`

テストでは、できるだけ実装詳細ではなくユーザーから見える結果を確認しています。

たとえば `home-page-client.small.test.tsx` では、query string の `page` と `date` が `useListDiaries` に渡ること、検索操作で URL が更新されること、無効な `page` が来たときに 1 ページ目へ fallback することを確認しました。

`login/page.small.test.tsx` では、ログイン成功時に token を保存して `/admin` へ遷移する callback と、失敗時の汎用エラー表示を確認しています。

## Storybook stories

表示コンポーネントには次の stories を追加しました。

- `AdminDiaryList.stories.tsx`
- `DiaryDetailView.stories.tsx`
- `DiaryEditorForm.stories.tsx`
- `DiaryListView.stories.tsx`
- `LoginForm.stories.tsx`

それぞれ、通常状態だけでなく loading、empty、error、editing、deleting など、コンポーネントが持つ主要な状態を見られるようにしました。

画面全体ではなく `features/diary/components.tsx` の表示コンポーネント単位にしたことで、API を実際に叩かずに UI 状態を確認できます。翻訳文言が必要なため、story 内では `NextIntlClientProvider` を使っています。

## Coverage threshold への対応

最初に coverage を実行した時点では、テスト自体は成功していましたが branch coverage が threshold に届きませんでした。

```text
Branches: 75.92%
```

不足していたのは、主に次のような分岐です。

- mutation 成功時の `onSuccess` callback
- query string が無効な場合の fallback
- detail / edit 画面の loading と error
- form title の長さ境界
- pagination と search clear の callback

これらを追加した結果、最終的な coverage は次のようになりました。

```text
Statements : 95.48%
Branches   : 87.03%
Functions  : 94.33%
Lines      : 95.40%
```

全指標で 80% を超え、`bun run test:coverage` が成功する状態になりました。

## 検証したコマンド

```bash
bun run test:small
bun run typecheck
bun run lint
bun run build-storybook
bun run test:coverage
```

## まとめ

今回の変更では、UI の完成後に RegressionTestAgent 的な観点で不足していた安全網を追加しました。

ポイントは、coverage の数字だけを追うのではなく、壊れると困る外部挙動を中心にテストしたことです。App Router の page component、generated hook の接続、mutation callback、token storage、query string の扱いは、どれも UI の実利用に近いリスクがあります。

Storybook は、テストでは見えにくい表示状態を補完する役割として追加しました。Vitest と Storybook を組み合わせることで、振る舞いと見た目の両方を確認しやすい状態になりました。

