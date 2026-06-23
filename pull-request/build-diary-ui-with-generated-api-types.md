## Title

Build diary UI with generated API types

## Summary

This PR connects the frontend diary screens to the runtime backend API contract through Orval-generated React Query hooks, then adds a tested and Storybook-covered UI for browsing, viewing, creating, editing, deleting, and logging in as an admin user.

The change is needed so the frontend can use the same API shape exposed by the backend instead of relying on handwritten request and response types. It also adds a local safety net around the main diary UI behavior so future changes can be reviewed against tests, stories, and coverage results.

## Related Tasks

- Review context: `review/orval-ui-20260623.md`
- Test and Storybook review: `review/frontend-diary-test-storybook-coverage-20260623.md`
- Review response: `review/responses/frontend-diary-test-storybook-coverage-20260623-responses.md`

## What was done

- Added Orval-generated frontend API clients, models, and Zod schemas under `frontend/app/api/generated/`.
- Added the frontend API mutator, auth token helpers, providers, i18n messages, and Next.js rewrite configuration needed by the diary UI.
- Implemented diary list, detail, login, admin list, create, and edit pages in the Next.js App Router.
- Added reusable diary feature components under `frontend/app/features/diary/`.
- Narrowed the root `.gitignore` diary rule so `frontend/app/features/diary/` can be tracked.
- Added nearby small tests for page behavior, auth helpers, providers, API mutator behavior, and diary feature components.
- Added Storybook stories for the main diary UI components and their loading, empty, error, editing, and deleting states.
- Added follow-up coverage tests so statements, branches, functions, and lines all exceed the configured 80% threshold.
- Added article, work diary, code review, and review-response documents for the frontend UI and coverage work.

## What is not included

- This PR does not change backend API behavior or persistence.
- This PR does not add new production API endpoints.
- This PR does not include deployment configuration for the frontend.
- This PR does not include end-to-end browser flows beyond the existing frontend test setup.

## Impact

- The frontend now depends on `/openapi.json` as the source for generated API types.
- Diary users can browse public diary entries and open individual diary detail pages from the frontend.
- Admin users can log in and manage diary entries through the frontend UI.
- Future diary UI changes have nearby small tests, Storybook coverage, and coverage threshold enforcement.

## Testing

- `bun run test:small` - passed
- `bun run typecheck` - passed
- `bun run lint` - passed
- `bun run build-storybook` - passed
- `bun run test:coverage` - passed

Final coverage summary:

- Statements: 95.48%
- Branches: 87.03%
- Functions: 94.33%
- Lines: 95.40%

## Notes

- The PR draft covers the latest frontend diary UI work represented by commits `0a9452e`, `59c28c7`, `e5c7d93`, `a0eb746`, `499a355`, and `67cac82`.
- Existing PR drafts under `pull-request/` cover earlier setup, backend persistence, and custom agent support separately.
