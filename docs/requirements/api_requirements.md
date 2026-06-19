# API Requirements

## Authentication APIs

### User Registration

#### Request

```http
POST /api/auth/register
```

#### Request Body

```json
{
  "name": "kishimin",
  "email": "admin@example.com",
  "password": "password"
}
```

#### Response

```json
{
  "id": "uuid"
}
```

#### Authorization

- Public

#### Constraints

- `name` must be between 1 and 50 characters.
- `email` must not exceed 255 characters.
- `email` must be unique.
- `password` must be at least 8 characters long.
- Registered users shall be assigned `is_admin = true`.
- Registration shall be rejected if an administrator account already exists.
- Only one administrator account may be created.

---

### Login

#### Request

```http
POST /api/auth/login
```

#### Request Body

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

#### Response

```json
{
  "accessToken": "jwt-token"
}
```

#### Authorization

- Public

---

## Diary APIs

### Get Diary List

#### Request

```http
GET /api/diaries
```

#### Query Parameters

| Name     | Type   | Required | Description                |
| -------- | ------ | -------- | -------------------------- |
| page     | number | No       | Page number                |
| pageSize | number | No       | Number of records per page |
| date     | string | No       | Search date (YYYY-MM-DD)   |

#### Response

```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Diary Title",
      "contentPreview": "Diary content...",
      "createdAt": "2026-06-19T00:00:00Z",
      "updatedAt": "2026-06-19T00:00:00Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "totalCount": 100
}
```

#### Authorization

- Public

---

### Get Diary Detail

#### Request

```http
GET /api/diaries/{id}
```

#### Response

```json
{
  "id": "uuid",
  "title": "Diary Title",
  "content": "Diary Content",
  "createdAt": "2026-06-19T00:00:00Z",
  "updatedAt": "2026-06-19T00:00:00Z"
}
```

#### Authorization

- Public

---

### Create Diary

#### Request

```http
POST /api/diaries
```

#### Request Body

```json
{
  "title": "Diary Title",
  "content": "Diary Content"
}
```

#### Response

```json
{
  "id": "uuid"
}
```

#### Authorization

- Administrator Only

---

### Update Diary

#### Request

```http
PUT /api/diaries/{id}
```

#### Request Body

```json
{
  "title": "Updated Title",
  "content": "Updated Content"
}
```

#### Response

```http
204 No Content
```

#### Authorization

- Administrator Only

---

### Delete Diary

#### Request

```http
DELETE /api/diaries/{id}
```

#### Response

```http
204 No Content
```

#### Authorization

- Administrator Only

---

## Error Responses

### Validation Error

```http
400 Bad Request
```

```json
{
  "message": "Validation failed."
}
```

---

### Unauthorized

```http
401 Unauthorized
```

```json
{
  "message": "Authentication required."
}
```

---

### Forbidden

```http
403 Forbidden
```

```json
{
  "message": "Access denied."
}
```

---

### Not Found

```http
404 Not Found
```

```json
{
  "message": "Resource not found."
}
```

---

### Internal Server Error

```http
500 Internal Server Error
```

```json
{
  "message": "An unexpected error occurred."
}
```
