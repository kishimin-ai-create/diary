# Data Requirements

## 1. Users Table

Stores administrator account information.

| Column        | Type                     | Required | Description            |
| ------------- | ------------------------ | -------- | ---------------------- |
| id            | UUID                     | Yes      | Unique user identifier |
| name          | VARCHAR(50)              | Yes      | User display name      |
| email         | VARCHAR(255)             | Yes      | Login email address    |
| password_hash | VARCHAR(255)             | Yes      | Hashed password        |
| is_admin      | BOOLEAN                  | Yes      | Administrator flag     |
| created_at    | TIMESTAMP WITH TIME ZONE | Yes      | Creation timestamp     |
| updated_at    | TIMESTAMP WITH TIME ZONE | Yes      | Last updated timestamp |

### Constraints

- `id` shall use UUID.
- `email` shall be unique.
- Passwords shall not be stored in plain text.
- Only users with `is_admin = true` shall be allowed to access administration features.

---

## 2. Diaries Table

Stores diary entries.

| Column     | Type                     | Required | Description             |
| ---------- | ------------------------ | -------- | ----------------------- |
| id         | UUID                     | Yes      | Unique diary identifier |
| user_id    | UUID                     | Yes      | Author identifier       |
| title      | VARCHAR(100)             | Yes      | Diary title             |
| content    | TEXT                     | Yes      | Diary content           |
| created_at | TIMESTAMP WITH TIME ZONE | Yes      | Creation timestamp      |
| updated_at | TIMESTAMP WITH TIME ZONE | Yes      | Last updated timestamp  |

### Constraints

- `id` shall use UUID.
- `user_id` shall reference `users.id`.
- `title` shall be between 1 and 100 characters.
- `content` shall be required.
- Diary entries shall be permanently deleted when removed.
- Deleted diary entries shall not be recoverable.

---

## 3. Relationships

A user can create multiple diary entries.

A diary entry belongs to one user.

```text
users 1 --- * diaries
```

---

## 4. Indexes

The following indexes shall be created.

| Table   | Column     | Purpose                                         |
| ------- | ---------- | ----------------------------------------------- |
| users   | email      | Authentication and uniqueness validation        |
| diaries | user_id    | Retrieve diary entries by author                |
| diaries | created_at | Date-based search and sorting by newest entries |

---

## 5. Future Extensions

The following features are out of scope for the initial release.

- Tags
- Categories
- Publication status
- Images
- Comments
- Likes

These features may be added in future releases through additional tables or columns.

---

## ER Diagram

```text
+---------+
|  users  |
+---------+
| id      |
| name    |
| email   |
| password_hash |
| is_admin |
| created_at |
| updated_at |
+---------+
     |
     | 1
     |
     | *
+----------+
| diaries  |
+----------+
| id       |
| user_id  |
| title    |
| content  |
| created_at |
| updated_at |
+----------+
```
