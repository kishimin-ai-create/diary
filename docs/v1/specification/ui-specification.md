# UI Specification

## Scope

This document converts the v1 requirements into an implementation-ready UI
specification for the diary application.

Source requirements:

- `docs/v1/requirements/usecase.md`
- `docs/v1/requirements/functinal-requirements.md`
- `docs/v1/requirements/screen_requirements.md`
- `docs/v1/requirements/non-functionnal-requirements.md`
- `docs/v1/requirements/api-requirements.md`

## Requirement Alignment

- The requirements define a login screen, but they do not define a public
  registration screen.
- This specification therefore includes administrator login only.
- Initial administrator registration is handled outside the v1 UI through the
  registration API.

## Information Architecture

| Screen | Suggested Route | Primary Actor | Purpose |
| ------ | --------------- | ------------- | ------- |
| Diary List | `/` | Visitor, Administrator | Browse published diary entries |
| Diary Detail | `/diaries/{id}` | Visitor, Administrator | Read one diary entry |
| Login | `/login` | Administrator | Authenticate administrator access |
| Admin Dashboard | `/admin` | Administrator | Manage diary entries |
| Diary Create | `/admin/diaries/new` | Administrator | Create a diary entry |
| Diary Edit | `/admin/diaries/{id}/edit` | Administrator | Edit a diary entry |

## Common Layout

### Header

Displayed on all screens.

Displayed items:

- Service logo
- Service name: `Tsuzuru Diary`

Behavior:

- Clicking the logo or service name navigates to the diary list page.

### Footer

Displayed on all screens.

Displayed items:

- Copyright line for `kishimin 2026`

### Shared Behavior

- The layout must support desktop and mobile screens.
- Long-form diary content must remain readable without horizontal scrolling.
- Shared header and footer must be implemented as reusable UI components.
- Error states must present a clear message without exposing internal details.

## Screen Specifications

### 1. Diary List

#### Purpose

Show published diary entries and support date-based search.

#### Data Source

- `GET /api/diaries`

#### Main Sections

- Header
- Date search form
- Diary list
- Pagination
- Footer

#### Diary List Item

Each item displays:

- Title
- Content excerpt
- Created date
- Updated date

#### Interactions

- The user can choose a date and submit the search form.
- The user can clear the date and return to the default list.
- Selecting a diary item navigates to the diary detail page.
- Pagination changes the current result set without changing the search rules.

#### States

- Initial state: newest diary entries are shown.
- Loading state: search form and pagination remain visible while results load.
- Empty state: display that no diary entries match the selected date.
- Error state: display a retryable error message.

### 2. Diary Detail

#### Purpose

Show the complete content of one diary entry.

#### Data Source

- `GET /api/diaries/{id}`

#### Main Sections

- Header
- Diary meta information
- Diary content
- Footer

#### Displayed Items

- Title
- Created date
- Updated date
- Full content

#### Interactions

- The screen is reached from the diary list.
- If the diary entry does not exist, the screen shows a not-found message and a
  link back to the diary list.

#### States

- Loading state
- Not-found state
- Error state

### 3. Login

#### Purpose

Authenticate the administrator.

#### Data Source

- `POST /api/auth/login`

#### Main Sections

- Header
- Login form
- Footer

#### Displayed Items

- Email address field
- Password field
- Login button

#### Interactions

- Submitting valid credentials redirects the administrator to the admin
  dashboard.
- Invalid credentials keep the user on the same screen and show an error
  message.
- The login button is disabled while submission is in progress.

#### Validation

- Email is required and must be in a valid format.
- Password is required.

### 4. Admin Dashboard

#### Purpose

Provide diary management features for authenticated administrators.

#### Access Control

- Redirect unauthenticated users to `/login`.
- Hide this route from general public navigation.

#### Data Source

- `GET /api/diaries`
- `DELETE /api/diaries/{id}`

#### Main Sections

- Header
- Page title
- Create button
- Diary management list
- Footer

#### Diary Management Row

Each row displays:

- Title
- Created date
- Updated date
- Edit button
- Delete button

#### Interactions

- Create button navigates to the diary creation page.
- Edit button navigates to the diary edit page.
- Delete button opens a confirmation dialog before deletion.
- After successful deletion, the list refreshes and a success message is shown.

#### States

- Loading state
- Empty state when no diary entries exist
- Error state

### 5. Diary Create

#### Purpose

Allow an administrator to create a diary entry.

#### Data Source

- `POST /api/diaries`

#### Main Sections

- Header
- Page title
- Diary form
- Footer

#### Displayed Items

- Title input
- Content textarea
- Save button

#### Validation

- Title is required and must be 1 to 100 characters.
- Content is required.

#### Interactions

- Successful submission redirects to the admin dashboard.
- Validation errors are displayed near the relevant field and as a form-level
  summary if needed.
- The save button is disabled while submission is in progress.

### 6. Diary Edit

#### Purpose

Allow an administrator to update an existing diary entry.

#### Data Source

- `GET /api/diaries/{id}`
- `PUT /api/diaries/{id}`

#### Main Sections

- Header
- Page title
- Diary form prefilled with current values
- Footer

#### Displayed Items

- Title input
- Content textarea
- Update button

#### Validation

- Title is required and must be 1 to 100 characters.
- Content is required.

#### Interactions

- Successful submission redirects to the admin dashboard.
- If the diary entry does not exist, show a not-found message instead of the
  form.
- The update button is disabled while submission is in progress.

## Confirmation Dialog

The delete action uses a confirmation dialog.

Displayed items:

- Short confirmation message
- Confirm button
- Cancel button

Behavior:

- Confirm executes `DELETE /api/diaries/{id}`.
- Cancel closes the dialog without changing data.

## Shared Validation and Feedback

- Validation messages must be written in plain language and attached to the
  relevant field when possible.
- Form submission errors that are not field-specific must appear near the top of
  the form.
- Loading indicators must not block the entire page when a smaller scoped
  loading state is enough.
- Success feedback should be brief and disappear automatically or on the next
  page transition.

## Responsive Behavior

- On mobile, forms and list content stack vertically in a single column.
- Pagination remains usable on narrow screens without horizontal scrolling.
- Diary content uses readable line length and spacing on both desktop and
  mobile.
- Buttons and form fields must remain large enough for touch interaction.

## Accessibility

- All interactive elements must be keyboard accessible.
- Inputs must have visible labels.
- Focus styles must remain visible on all screens.
- Error messages must be readable by assistive technologies.
- The delete confirmation dialog must trap focus while it is open.
