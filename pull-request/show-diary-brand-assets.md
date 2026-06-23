## Title

Show diary brand assets in the app shell

## Summary

This PR makes the diary service identity visible in the browser tab and top navigation by wiring the real favicon, logo image, and service name into the Next.js App Router shell.

The change is needed because the frontend still had leftover starter assets and a temporary text-only brand mark, while the app now has real public assets for the diary service.

## Related Tasks

- Work diary: `diary/20260623.md`
- Article: `blog/Next.js App Routerでfaviconとロゴを実サービス表示に整える.md`

## What was done

- Updated `frontend/app/layout.tsx` metadata with the service application name, title template, description, and `/favicon.ico` icon configuration.
- Updated `frontend/app/providers.tsx` to render `frontend/public/logo-image.png` in the top bar through `next/image`.
- Added localized logo alt text in `frontend/app/i18n/messages.ts`.
- Updated `frontend/app/globals.css` to style the logo image in the header.
- Updated `frontend/app/providers.small.test.tsx` to assert that the logo is visible in both Japanese and English locale states.
- Removed the duplicate `frontend/app/favicon.ico`.
- Removed unused starter SVG assets from `frontend/public/`.
- Added `frontend/public/favicon.ico` and `frontend/public/logo-image.png` as the active brand assets.

## What is not included

- This PR does not change diary API behavior.
- This PR does not change page routing or authentication behavior.
- This PR does not add new Storybook stories for the app shell.

## Impact

- Browser tabs now use the diary service title and favicon.
- The top navigation now displays the real service logo image with localized alt text.
- The public asset directory no longer contains unused Next.js starter SVG files.

## Testing

- `bun run test:small` - passed
- `bun run typecheck` - passed
- `bun run lint` - passed
- `bun run build` - passed

## Notes

- Scope covered: commit `b56b3cc feat: show diary brand assets` plus the follow-up article and work diary entry created for that change.
