# Non-Functional Requirements

## 1. Performance Requirements

The diary list page shall be displayed within 3 seconds under normal operating conditions.

Pagination shall be applied to prevent loading excessive amounts of diary data at once.

Pagination shall also be applied to search results.

An index shall be created on the `created_at` column to support efficient date-based searches and
sorting by newest entries.

---

## 2. Availability Requirements

The application shall remain available under normal operating conditions.

When an unexpected error occurs, the system shall display an appropriate error message.

The application shall continue providing diary viewing functionality except in the event of a
critical system failure.

---

## 3. Security Requirements

Only authenticated administrators shall be allowed to create, update, and delete diary entries.

The administration dashboard and diary management features shall be inaccessible to unauthenticated
users.

Passwords shall never be stored in plain text.

All user inputs shall be validated before processing.

The application shall protect against Cross-Site Scripting (XSS) attacks.

The application shall protect against Cross-Site Request Forgery (CSRF) attacks.

Authentication tokens shall be securely managed.

---

## 4. Maintainability Requirements

Responsibilities shall be separated between the presentation layer, application layer, and data
layer.

Common UI elements such as the header and footer shall be implemented as reusable components.

The application shall be structured to support future enhancements without major architectural
changes.

The following future features shall be supported through an extensible design:

- Tags
- Categories
- Publication status
- Images
- Comments
- Likes

---

## 5. Usability Requirements

The application shall support both desktop and mobile devices.

Diary entries shall remain readable even when they contain long-form content.

The diary list page shall display content excerpts instead of full content.

Users shall be able to find diary entries through date-based search and pagination.

A confirmation dialog shall be displayed before deleting a diary entry.

---

## 6. Design Requirements

The design shall be inspired by modern web applications and diary services.

The application shall maintain a clean and easy-to-read appearance.

The service logo and service name shall be displayed consistently in the header across all pages.

The footer shall display:

```text
© kishimin 2026
```

The application shall support responsive design and provide a consistent user experience across
devices.

---

## 7. Data Integrity Requirements

Diary data shall be stored in PostgreSQL.

All primary keys shall use UUID.

The system shall automatically record creation and update timestamps.

Diary entries shall be permanently deleted when removed.

Deleted diary entries shall not be recoverable.

---

## 8. Operational Requirements

Application errors shall be logged on the server.

Detailed exception information shall not be exposed to end users in production environments.

Sensitive information such as database connection strings, secrets, and authentication settings
shall be managed through environment variables.

The application shall support deployment in cloud-hosted environments.
