# Use Case List

## UC-001 View Diary List

### Actor

- Visitor
- Administrator

### Overview

View a list of published diary entries.

### Main Flow

1. The user accesses the diary list page.
2. The system retrieves diary entries.
3. The system displays the entries in descending order of creation date.

### Result

The diary list is displayed.

---

## UC-002 Search Diaries by Date

### Actor

- Visitor
- Administrator

### Overview

Search diary entries by a specific date.

### Main Flow

1. The user selects a date.
2. The user clicks the search button.
3. The system searches for diary entries created on the specified date.
4. The system displays the search results.

### Result

A list of diary entries matching the selected date is displayed.

---

## UC-003 View Diary Details

### Actor

- Visitor
- Administrator

### Overview

View the full content of a diary entry.

### Main Flow

1. The user selects a diary entry from the diary list.
2. The system retrieves the diary entry.
3. The system displays the diary details.

### Result

The diary details are displayed.

---

## UC-004 Administrator Login

### Actor

- Administrator

### Overview

Log in to access the administration features.

### Main Flow

1. The administrator accesses the login page.
2. The administrator enters an email address and password.
3. The administrator clicks the login button.
4. The system authenticates the credentials.
5. The system redirects the administrator to the admin dashboard.

### Result

The administrator is authenticated and logged in.

---

## UC-005 Create a Diary Entry

### Actor

- Administrator

### Overview

Create a new diary entry.

### Main Flow

1. The administrator accesses the admin dashboard.
2. The administrator clicks the create button.
3. The administrator enters a title and content.
4. The administrator clicks the save button.
5. The system stores the diary entry.

### Result

A new diary entry is created.

---

## UC-006 Edit a Diary Entry

### Actor

- Administrator

### Overview

Edit an existing diary entry.

### Main Flow

1. The administrator accesses the admin dashboard.
2. The administrator selects a diary entry to edit.
3. The administrator modifies the title or content.
4. The administrator clicks the update button.
5. The system saves the changes.

### Result

The diary entry is updated.

---

## UC-007 Delete a Diary Entry

### Actor

- Administrator

### Overview

Delete a diary entry.

### Main Flow

1. The administrator accesses the admin dashboard.
2. The administrator selects a diary entry to delete.
3. The administrator clicks the delete button.
4. The system displays a confirmation dialog.
5. The administrator confirms the deletion.
6. The system permanently removes the diary entry.

### Result

The diary entry is deleted.

---

## UC-008 View Admin Dashboard

### Actor

- Administrator

### Overview

View and manage diary entries.

### Main Flow

1. The administrator logs in.
2. The administrator accesses the admin dashboard.
3. The system displays the list of diary entries for management purposes.

### Result

The admin dashboard is displayed.
