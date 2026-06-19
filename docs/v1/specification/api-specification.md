# API Specification

## Scope

This document converts the v1 requirements into an implementation-ready API
contract for the diary application.

Source requirements:

- `docs/v1/requirements/usecase.md`
- `docs/v1/requirements/functinal-requirements.md`
- `docs/v1/requirements/screen_requirements.md`
- `docs/v1/requirements/data-requirements.md`
- `docs/v1/requirements/api-requirements.md`

## Requirement Alignment

- The requirements define a registration API, but they do not define a public
  registration screen.
- In v1, the registration API is treated as an administrator bootstrap
  operation, not a general user-facing flow.

## Common Conventions

| Item | Rule |
| ---- | ---- |
| Base path | `/api` |
| Content type | `application/json` |
| Authentication | `Authorization: Bearer <accessToken>` for protected endpoints |
| Identifier format | UUID |
| Timestamp format | ISO 8601 UTC string |
| Success without body | `204 No Content` |
| Error payload | `{ "message": "..." }` |

## Resource Models

### Diary Summary

```json
{
  "id": "uuid",
  "title": "Diary Title",
  "contentPreview": "Diary content...",
  "createdAt": "2026-06-19T00:00:00Z",
  "updatedAt": "2026-06-19T00:00:00Z"
}
```

### Diary Detail

```json
{
  "id": "uuid",
  "title": "Diary Title",
  "content": "Diary Content",
  "createdAt": "2026-06-19T00:00:00Z",
  "updatedAt": "2026-06-19T00:00:00Z"
}
```

## Authentication APIs

### POST /api/auth/register

Creates the first and only administrator account.

#### Authorization

- Public

#### Request Body

| Field | Type | Required | Rules |
| ----- | ---- | -------- | ----- |
| `name` | string | Yes | 1 to 50 characters |
| `email` | string | Yes | Valid email format, max 255 characters, unique |
| `password` | string | Yes | At least 8 characters |

#### Success Response

```http
201 Created
```

```json
{
  "id": "uuid"
}
```

#### Error Responses

| Status | Condition |
| ------ | --------- |
| `400 Bad Request` | Validation failure |
| `400 Bad Request` | Administrator account already exists |
| `500 Internal Server Error` | Unexpected server-side failure |

### POST /api/auth/login

Authenticates the administrator and returns a bearer token.

#### Authorization

- Public

#### Request Body

| Field | Type | Required | Rules |
| ----- | ---- | -------- | ----- |
| `email` | string | Yes | Valid email format |
| `password` | string | Yes | Non-empty |

#### Success Response

```http
200 OK
```

```json
{
  "accessToken": "jwt-token"
}
```

#### Error Responses

| Status | Condition |
| ------ | --------- |
| `400 Bad Request` | Validation failure |
| `401 Unauthorized` | Invalid email or password |
| `500 Internal Server Error` | Unexpected server-side failure |

## Diary APIs

### GET /api/diaries

Returns the published diary list ordered by newest first.

#### Authorization

- Public

#### Query Parameters

| Name | Type | Required | Rules |
| ---- | ---- | -------- | ----- |
| `page` | number | No | Integer, minimum `1`, default `1` |
| `pageSize` | number | No | Integer, minimum `1`, default `10` |
| `date` | string | No | `YYYY-MM-DD` |

#### Success Response

```http
200 OK
```

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

#### Behavior

- Results are sorted by `createdAt` descending.
- If `date` is provided, only entries created on that calendar date are
  returned.
- Pagination applies to both the default list and date search results.

#### Error Responses

| Status | Condition |
| ------ | --------- |
| `400 Bad Request` | Invalid query parameter or date format |
| `500 Internal Server Error` | Unexpected server-side failure |

### GET /api/diaries/{id}

Returns the full content for a single diary entry.

#### Authorization

- Public

#### Path Parameters

| Name | Type | Required | Rules |
| ---- | ---- | -------- | ----- |
| `id` | string | Yes | UUID |

#### Success Response

```http
200 OK
```

```json
{
  "id": "uuid",
  "title": "Diary Title",
  "content": "Diary Content",
  "createdAt": "2026-06-19T00:00:00Z",
  "updatedAt": "2026-06-19T00:00:00Z"
}
```

#### Error Responses

| Status | Condition |
| ------ | --------- |
| `400 Bad Request` | Invalid diary identifier |
| `404 Not Found` | Diary entry does not exist |
| `500 Internal Server Error` | Unexpected server-side failure |

### POST /api/diaries

Creates a new diary entry.

#### Authorization

- Administrator only

#### Request Body

| Field | Type | Required | Rules |
| ----- | ---- | -------- | ----- |
| `title` | string | Yes | 1 to 100 characters |
| `content` | string | Yes | Non-empty |

#### Success Response

```http
201 Created
```

```json
{
  "id": "uuid"
}
```

#### Behavior

- The server associates the entry with the authenticated administrator account.
- The server records `createdAt` and `updatedAt` automatically.

#### Error Responses

| Status | Condition |
| ------ | --------- |
| `400 Bad Request` | Validation failure |
| `401 Unauthorized` | Missing or invalid token |
| `403 Forbidden` | Authenticated user is not an administrator |
| `500 Internal Server Error` | Unexpected server-side failure |

### PUT /api/diaries/{id}

Updates an existing diary entry.

#### Authorization

- Administrator only

#### Path Parameters

| Name | Type | Required | Rules |
| ---- | ---- | -------- | ----- |
| `id` | string | Yes | UUID |

#### Request Body

| Field | Type | Required | Rules |
| ----- | ---- | -------- | ----- |
| `title` | string | Yes | 1 to 100 characters |
| `content` | string | Yes | Non-empty |

#### Success Response

```http
204 No Content
```

#### Behavior

- The server updates `updatedAt` automatically.

#### Error Responses

| Status | Condition |
| ------ | --------- |
| `400 Bad Request` | Invalid identifier or validation failure |
| `401 Unauthorized` | Missing or invalid token |
| `403 Forbidden` | Authenticated user is not an administrator |
| `404 Not Found` | Diary entry does not exist |
| `500 Internal Server Error` | Unexpected server-side failure |

### DELETE /api/diaries/{id}

Permanently deletes a diary entry.

#### Authorization

- Administrator only

#### Path Parameters

| Name | Type | Required | Rules |
| ---- | ---- | -------- | ----- |
| `id` | string | Yes | UUID |

#### Success Response

```http
204 No Content
```

#### Behavior

- Deletion is physical and not recoverable.

#### Error Responses

| Status | Condition |
| ------ | --------- |
| `400 Bad Request` | Invalid diary identifier |
| `401 Unauthorized` | Missing or invalid token |
| `403 Forbidden` | Authenticated user is not an administrator |
| `404 Not Found` | Diary entry does not exist |
| `500 Internal Server Error` | Unexpected server-side failure |

## Shared Error Responses

### Validation Error

```http
400 Bad Request
```

```json
{
  "message": "Validation failed."
}
```

### Unauthorized

```http
401 Unauthorized
```

```json
{
  "message": "Authentication required."
}
```

### Forbidden

```http
403 Forbidden
```

```json
{
  "message": "Access denied."
}
```

### Not Found

```http
404 Not Found
```

```json
{
  "message": "Resource not found."
}
```

### Internal Server Error

```http
500 Internal Server Error
```

```json
{
  "message": "An unexpected error occurred."
}
```
