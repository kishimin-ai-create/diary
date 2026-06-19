# Functional Requirements

## 1. Diary Viewing

Users shall be able to browse diary entries without logging in.

The diary list shall display:

- Title
- Excerpt of the content
- Created date
- Updated date

Diary entries shall be displayed in descending order by creation date.

Pagination shall be applied to support a large number of diary entries.

Users shall be able to view the details of a diary entry.

---

## 2. Search Diaries by Date

Users shall be able to search diary entries by date.

Date shall be the only search criterion.

The system shall display diary entries created on the specified date.

If multiple diary entries match the search criteria, they shall be displayed in descending order by
creation date.

Pagination shall also be applied to search results.

---

## 3. Create Diary Entry

Administrators shall be able to create diary entries.

A diary entry shall contain:

- Title
- Content

The system shall associate the diary entry with the administrator account that
created it.

The system shall automatically record the creation timestamp.

---

## 4. Edit Diary Entry

Administrators shall be able to edit existing diary entries.

Editable fields shall include:

- Title
- Content

The system shall automatically update the last modified timestamp.

---

## 5. Delete Diary Entry

Administrators shall be able to delete diary entries.

Deletion shall be performed as a permanent physical deletion.

Deleted diary entries shall not be recoverable.

---

## 6. Authentication

Administrators shall be able to log in.

Unauthenticated users shall be allowed to view diary entries only.

Only authenticated administrators shall be able to create, edit, or delete diary entries.

---

## 7. Administration

The system shall provide an administration dashboard.

Administrators shall be able to:

- View diary entries
- Create diary entries
- Edit diary entries
- Delete diary entries

All Create, Read, Update, and Delete (CRUD) operations shall be accessible only through the
administration dashboard.

---

## 8. Authorization

Diary viewing shall be available to all users.

Diary creation, editing, and deletion shall be restricted to authenticated administrators.

The system shall prevent unauthorized access to administration features.
