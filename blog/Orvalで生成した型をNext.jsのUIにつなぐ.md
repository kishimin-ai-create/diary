# Orvalで生成した型をNext.jsのUIにつなぐ

## 対象読者

- OpenAPI から TypeScript の API クライアントを生成したい人
- Next.js App Router で React Query と生成 hook を組み合わせたい人
- API 実装と UI 実装のずれを小さくしたい人

## 範囲

この記事では、バックエンドの runtime OpenAPI から Orval で型と React Query hooks を生成し、日記アプリの UI に接続した変更を扱います。バックエンド API の実装や DB マイグレーションの詳細は扱いません。

## 何をしたか

フロントエンド側で `frontend/orval.config.ts` の OpenAPI 入力先を `/openapi.json` に合わせ、`bun run api:generate` で API クライアントを生成しました。

生成された主な hook は次の通りです。

- `useListDiaries`
- `useGetDiary`
- `useCreateDiary`
- `useUpdateDiary`
- `useDeleteDiary`
- `useLoginAdmin`

これらを Next.js App Router の画面に接続し、以下のルートを実装しました。

- `/` 日記一覧
- `/diaries/[id]` 日記詳細
- `/login` 管理ログイン
- `/admin` 管理一覧
- `/admin/create` 日記作成
- `/admin/edit/[id]` 日記編集

## なぜ Orval を使うのか

今回の API は Hono 側で OpenAPI を runtime 生成しています。UI が手書きのリクエスト型を持つと、API 変更に追従し忘れる余地が残ります。

Orval で OpenAPI から型と hook を生成することで、UI は API のレスポンス形状や request body をコード生成物として受け取れます。たとえば作成・更新フォームは `CreateDiaryBody` / `UpdateDiaryBody` と同じ形の値を送るため、UI と API 契約の距離が短くなります。

## 実装上のポイント

### API 接続は Next.js rewrite に寄せる

`frontend/next.config.ts` に `/api/:path*` の rewrite を追加しました。ブラウザからは相対パスで API にアクセスし、開発時の接続先は `BACKEND_URL` で切り替えます。

これにより、UI 側の `customInstance` は固定の production URL を持たずに済みます。

### 認証トークンは sessionStorage に閉じる

管理 API へは Bearer token が必要です。`frontend/app/auth.ts` に読み書きを集約し、Orval の mutator である `frontend/app/api/mutator/custom-instance.ts` から request interceptor 経由で `Authorization` header を付与します。

UI コンポーネント側へ storage 操作を散らさないことで、トークン管理の変更範囲を小さくしています。

### 表示文言は next-intl に寄せる

`frontend/app/i18n/messages.ts` に日本語と英語の文言を置き、`NextIntlClientProvider` で画面全体へ渡しました。初期表示は日本語で、ヘッダーから言語を切り替えられる構成です。

SSR/CSR の時刻表記差を避けるため、provider には `timeZone="Asia/Tokyo"` も明示しています。

### 小テストで UI の表面を固定する

`frontend/app/features/diary/components.small.test.tsx` では、日記一覧、ログインフォーム、編集フォーム、管理一覧の主要な表示と validation を確認しています。

最初にコンポーネント未実装で失敗するテストを置き、その期待に合わせて `frontend/app/features/diary/components.tsx` を実装しました。

## 検証

次のコマンドが通ることを確認しました。

```bash
bun run api:generate
bun run lint
bun run typecheck
bun run test:small
bun run build
```

## まとめ

OpenAPI を runtime 生成している場合、Orval を UI の入口にすると API 契約と画面実装を近づけやすくなります。

今回の実装では、生成 hook を直接使いながら、認証・i18n・API 接続先の責務を小さなモジュールに分けました。これで日記アプリの一覧・詳細・管理編集まで、API 型に沿った UI として動かせる土台ができました。

