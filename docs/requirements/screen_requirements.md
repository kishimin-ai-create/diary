# Screen Requirements

## Common Layout

A common header and footer shall be displayed on all screens.

### Header

Displayed items:

- Service Logo
- Service Name (Tsuzuru Diary)

### Footer

Displayed items:

- © kishimin 2026

---

## 1. Diary List Page

### Overview

Displays a list of diary entries available to all users.

### Displayed Items

- Date search form
- Diary list
  - Title
  - Content excerpt
  - Created date
  - Updated date
  - Author

- Pagination

### Behavior

- Display diary entries in descending order by creation date.
- Allow users to search diary entries by date.
- Navigate to the diary detail page when a diary entry is selected.

---

## 2. Diary Detail Page

### Overview

Displays the full content of a diary entry.

### Displayed Items

- Title
- Content
- Created date
- Updated date
- Author

### Behavior

- Accessible from the diary list page.

---

## 3. Login Page

### Overview

Authenticates administrators.

### Displayed Items

- Email address field
- Password field
- Login button

### Behavior

- Redirect authenticated administrators to the admin dashboard.
- Display an error message when authentication fails.

---

## 4. Admin Dashboard

### Overview

Provides administration features for managing diary entries.

### Displayed Items

- Diary entry list
- Create button
- Edit button
- Delete button

### Behavior

- Accessible only to authenticated administrators.
- Allow navigation to the diary creation page.
- Allow navigation to the diary editing page.
- Allow deletion of diary entries.

---

## 5. Diary Creation Page

### Overview

Allows administrators to create a new diary entry.

### Displayed Items

- Title input field
- Content input field
- Save button

### Behavior

- Accessible only to authenticated administrators.
- Redirect to the admin dashboard after successful creation.

---

## 6. Diary Edit Page

### Overview

Allows administrators to edit an existing diary entry.

### Displayed Items

- Title input field
- Content input field
- Update button

### Behavior

- Accessible only to authenticated administrators.
- Redirect to the admin dashboard after a successful update.

---

## Design Requirements

The design shall be freely created while referencing common diary services and modern web
applications.

The following requirements must be satisfied:

- Responsive design must be supported.
- The application must be usable on both desktop and mobile devices.
- Readability must be prioritized.
- Long-form diary content must be easy to read.
- The design should be modern and minimalistic.
- The header and footer must be displayed consistently across all pages.
