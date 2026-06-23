# Review Responses - 20260623-bycodex.md

## Finding 1: Gate editor routes before rendering forms

**Disposition:** fix-delegated

> **Original comment:**
> `docs/v1/requirements/screen_requirements.md` marks the diary creation/edit pages as accessible only to authenticated administrators, but this page renders the editor unconditionally. A logged-out user can browse directly to `/admin/create` (and `/admin/edit/:id` follows the same pattern) and see the admin form, only getting a generic save failure after submitting. Mirror the dashboard token gate or redirect to login before rendering these editor routes.

**Reply:**
Thank you for the feedback. The editor routes now use the same access-token gate as the admin dashboard before rendering form inputs. Logged-out users see the protected-route guidance and login link instead of the create/edit form, and the edit detail query is disabled while unauthenticated.

> Fixed by FixAgent-compatible fallback - updated `frontend/app/admin/create/page.tsx`, `frontend/app/admin/edit/[id]/page.tsx`, and nearby small tests.

---

## Finding 2: Preserve login passwords verbatim

**Disposition:** fix-delegated

> **Original comment:**
> This reads the password through `readFormString`, which trims leading/trailing whitespace before submission. If an admin password intentionally starts or ends with whitespace, the backend login path compares the exact password string and otherwise-valid credentials will always fail from the UI. Keep password fields untrimmed while trimming fields such as email/title separately.

**Reply:**
Thank you for the feedback. The login form now trims the email field while preserving the password field exactly as entered, including leading and trailing whitespace. Title and content fields continue to use the trimmed reader.

> Fixed by FixAgent-compatible fallback - updated `frontend/app/features/diary/components.tsx` and added a login-page small test for whitespace preservation.

---
