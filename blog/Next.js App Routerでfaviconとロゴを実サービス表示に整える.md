# Next.js App Routerでfaviconとロゴを実サービス表示に整える

## 対象読者

- Next.js App Routerでアプリのブランド表示を整えたい人
- 初期テンプレートのfaviconやSVG素材を、実サービス用の見た目に置き換えたい人
- UI変更にテストを添えて小さく安全に反映したい人

## この記事で扱うこと

この記事では、日記アプリのフロントエンドでfavicon、ロゴ画像、サービス名をブラウザタブとトップバーに表示できるようにした変更をまとめます。

対象の主な変更は `b56b3cc feat: show diary brand assets` です。バックエンドAPIや日記機能そのものの挙動変更は扱いません。

## 背景

日記UIはすでにOrval生成のAPIクライアントやStorybook、テストを備えた状態になっていました。一方で、アプリの顔になる部分にはまだNext.js初期テンプレート由来の素材が残っていました。

具体的には、トップバーのブランドマークは文字だけの表示で、`frontend/public/` には `next.svg` や `vercel.svg` などのスターター素材が残っていました。また、faviconも `frontend/app/favicon.ico` と `frontend/public/favicon.ico` が併存していました。

サービスとして見せる画面では、ユーザーがブラウザタブやトップバーを見たときに同じ名前とロゴを認識できることが大切です。そこで、アプリ側のmetadataとトップバー表示を実サービス用のアセットに寄せました。

## 変更内容

`frontend/app/layout.tsx` では、Next.jsのmetadataをサービス名基準に更新しました。

- `applicationName` に `つづる日記` を設定
- タブタイトルのデフォルトを `つづる日記` に設定
- ページタイトルのテンプレートを `%s | つづる日記` に設定
- `icons` で `/favicon.ico` を明示

これにより、ブラウザタブやメタ情報がサービス名と一致します。

トップバー側は `frontend/app/providers.tsx` を更新し、文字だけのブランドマークから `next/image` を使ったロゴ画像表示に変更しました。

ロゴ画像の代替テキストは `frontend/app/i18n/messages.ts` に追加しています。日本語では `つづる日記のロゴ`、英語では `Daybook logo` として、言語切り替え後もアクセシブルな名前が保たれるようにしました。

スタイルは `frontend/app/globals.css` で `.brand-logo` として整理し、トップバー内で一定サイズに収まるようにしています。

## 不要ファイルの整理

実サービス用のアセットに切り替えたため、使っていない初期ファイルを削除しました。

- `frontend/app/favicon.ico`
- `frontend/public/file.svg`
- `frontend/public/globe.svg`
- `frontend/public/next.svg`
- `frontend/public/vercel.svg`
- `frontend/public/window.svg`

一方で、実際に使うファイルとして以下を `frontend/public/` に置いています。

- `frontend/public/favicon.ico`
- `frontend/public/logo-image.png`

これで、公開アセット配下には現在のUIで必要なものだけが残る形になりました。

## テストで確認したこと

UIの変更に合わせて `frontend/app/providers.small.test.tsx` も更新しました。

確認しているのは、トップバーにサービス名だけでなくロゴ画像も表示されることです。

- 日本語表示では `つづる日記のロゴ` が見える
- 英語表示では `Daybook logo` が見える

ロゴのaltテキストをテストしているので、単に画像が差し込まれたかだけでなく、言語切り替え後のアクセシビリティ情報も確認できます。

## 検証

今回の変更後、フロントエンドで以下を実行しました。

- `bun run test:small`
- `bun run typecheck`
- `bun run lint`
- `bun run build`

いずれも成功しています。

## まとめ

favicon、ロゴ画像、サービス名は小さなUI要素ですが、アプリの識別性に直結します。

今回の変更では、Next.js App Routerのmetadata、トップバーのロゴ表示、i18nメッセージ、不要アセットの削除をまとめて行いました。あわせて小さなテストも更新したことで、サービス名とロゴがトップバーに表示され続けることを確認できるようになりました。
