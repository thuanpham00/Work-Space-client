# API: Invite User to Workspace & Cancel Invite

> Tài liệu cho Frontend — dùng để build UI mời thành viên và hủy lời mời trong Workspace.

---

## 1. Endpoint

### 1.1 Mời user vào workspace

```
POST /workspaces/:workspaceId/invite
```

**Auth:** Bearer Access Token (bắt buộc).

**Quyền:** Chỉ **OWNER / ADMIN ACTIVE** của workspace mới được gọi. Member thường → trả `403 Forbidden`.

---

### 1.2 Hủy lời mời đã gửi

```
DELETE /workspaces/:workspaceId/invite
```

**Auth:** Bearer Access Token (bắt buộc).

**Quyền:** Chỉ **OWNER / ADMIN ACTIVE** của workspace mới được gọi. Member thường → trả `403 Forbidden`.

---

## 2. Request Headers

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## 3. Path Params

| Field | Type | Required | Mô tả |
| --- | --- | --- | --- |
| `workspaceId` | string (bigint) | ✅ | ID của workspace |

---

## 4. Request Body

Cả 2 endpoint đều nhận cùng body:

```json
{
  "userId": "1234567890"
}
```

| Field | Type | Required | Mô tả |
| --- | --- | --- | --- |
| `userId` | string (bigint) | ✅ | ID của user được mời / bị hủy lời mời |

**Lưu ý:**
- `userId` truyền dạng **string** (số lớn), server sẽ tự cast sang `bigint`.
- Nếu `userId` không phải số dương → Zod validation trả `400`.

---

## 5. Response

### 5.1 Thành công — POST Invite

```jsonc
HTTP/1.1 200 OK
{
  "message": "Gửi lời mời tham gia workspace thành công",
  "data": {
    "workspaceMember": {
      "id": "9876543210",
      "workspaceId": "1234567890",
      "userId": "1112223334",
      "role": "MEMBER",
      "status": "PENDING_INVITE",
      "invitedById": "1234567890",
      "invitedAt": "2026-09-27T23:30:00.000Z",
      "requestedById": null,
      "approvedById": null,
      "approvedByType": null,
      "acceptedAt": null,
      "rejectedAt": null,
      "joinedAt": null
    }
  }
}
```

### 5.2 Thành công — DELETE Cancel

```jsonc
HTTP/1.1 200 OK
{
  "message": "Hủy lời mời tham gia workspace thành công",
  "data": {
    "workspaceMember": {
      "id": "9876543210",
      "workspaceId": "1234567890",
      "userId": "1112223334",
      "role": "MEMBER",
      "status": "CANCELLED",
      "invitedById": null,
      "invitedAt": null,
      "requestedById": null,
      "approvedById": null,
      "approvedByType": null,
      "acceptedAt": null,
      "rejectedAt": null,
      "joinedAt": null
    }
  }
}
```

---

## 6. WorkspaceMember fields

| Field | Type | Mô tả |
| --- | --- | --- |
| `id` | string | ID của workspaceMember record |
| `workspaceId` | string | ID workspace |
| `userId` | string | ID user được mời / bị hủy |
| `role` | `OWNER` \| `ADMIN` \| `MEMBER` | Role trong workspace (luôn là `MEMBER` khi invite) |
| `status` | string | Trạng thái membership (xem bảng bên dưới) |
| `invitedById` | string \| null | ID của admin/owner đã gửi lời mời |
| `invitedAt` | string \| null | Thời gian gửi lời mời |
| `requestedById` | string \| null | (null khi invite) |
| `approvedById` | string \| null | (null khi invite) |
| `approvedByType` | string \| null | (null khi invite) |
| `acceptedAt` | string \| null | (null khi invite) |
| `rejectedAt` | string \| null | (null khi invite) |
| `joinedAt` | string \| null | Thời gian user accept invite và trở thành ACTIVE |

---

## 7. Trạng thái Membership

| Status | Mô tả | Khi nào xuất hiện |
| --- | --- | --- |
| `ACTIVE` | User là thành viên chính thức | Sau khi accept invite / được approve request |
| `PENDING_INVITE` | Đã được mời, đang chờ accept/reject | Sau khi admin gửi invite |
| `PENDING_REQUEST` | Đã gửi yêu cầu, đang chờ approve/reject | Sau khi user gửi request-invite |
| `REJECTED` | Bị từ chối | Bị admin reject invite / request |
| `LEFT` | Đã rời workspace | User chủ động rời |
| `CANCELLED` | Lời mời / request đã bị hủy | Admin hủy invite / user hủy request |

---

## 8. Bảng lỗi (Error codes)

### 8.1 Lỗi chung (cả 2 API)

| HTTP Code | Message | Nguyên nhân |
| --- | --- | --- |
| `400` | `Thiếu thông tin workspaceId hoặc userId` | Body / param bị thiếu |
| `400` | (Zod) `Required` | Body không có `userId` |
| `400` | (Zod) `Expected bigint, received ...` | `userId` không phải số dương |
| `401` | `AccessToken bắt buộc!` | Chưa có token |
| `401` | `AccessToken đã hết hạn!` | Token hết hạn |
| `403` | `Bạn không đủ quyền cho thao tác này` | Không phải OWNER/ADMIN |
| `404` | `Workspace không tồn tại` | `workspaceId` không tồn tại |

### 8.2 Lỗi chỉ POST Invite

| HTTP Code | Message | Nguyên nhân |
| --- | --- | --- |
| `404` | `Người dùng không tồn tại` | `userId` trong body không tồn tại |
| `400` | `Bạn không thể tự mời chính mình` | Self-invite |
| `400` | `Người dùng này đã là thành viên workspace` | User đã ACTIVE |
| `400` | `Người dùng này đang có lời mời pending` | Đã có PENDING_INVITE |
| `400` | `Người dùng này đang có yêu cầu tham gia pending` | Đã có PENDING_REQUEST |
| `400` | `Người dùng này chỉ nhận lời mời từ bạn bè` | User policy = FRIENDS_ONLY, chưa là bạn |
| `400` | `Không thể mời người dùng này` | Lỗi không xác định (defensive) |

### 8.3 Lỗi chỉ DELETE Cancel

| HTTP Code | Message | Nguyên nhân |
| --- | --- | --- |
| `404` | `Không tìm thấy lời mời để hủy` | User không có record PENDING_INVITE nào |
| `400` | `Không thể hủy lời mời vì trạng thái không hợp lệ` | Record tồn tại nhưng không phải PENDING_INVITE |

---

## 9. Flow đề xuất cho Frontend

### 9.1. Gửi lời mời (POST)

```
1. User chọn user từ danh sách invite-search
2. Click button "Mời" → gọi POST /:workspaceId/invite
3. Response thành công → hiển thị toast "Đã gửi lời mời"
4. Update UI: user chuyển sang trạng thái "Đã gửi lời mời" (badge)
```

### 9.2. Hủy lời mời (DELETE)

```
1. User thấy user đang ở trạng thái "Đã gửi lời mời"
2. Click button "Hủy lời mời" → gọi DELETE /:workspaceId/invite
3. Response thành công → hiển thị toast "Đã hủy lời mời"
4. Update UI: user không còn hiển thị trong danh sách pending
```

---

## 10. Example calls

### 10.1 Gửi lời mời

```bash
curl -X POST \
  'http://localhost:3000/workspaces/1234567890/invite' \
  -H 'Authorization: Bearer eyJhbGciOi...' \
  -H 'Content-Type: application/json' \
  -d '{"userId": "1112223334"}'
```

**Response:**
```json
{
  "message": "Gửi lời mời tham gia workspace thành công",
  "data": {
    "workspaceMember": {
      "id": "9876543210",
      "workspaceId": "1234567890",
      "userId": "1112223334",
      "role": "MEMBER",
      "status": "PENDING_INVITE",
      "invitedById": "1234567890",
      "invitedAt": "2026-09-27T23:30:00.000Z"
    }
  }
}
```

### 10.2 Hủy lời mời

```bash
curl -X DELETE \
  'http://localhost:3000/workspaces/1234567890/invite' \
  -H 'Authorization: Bearer eyJhbGciOi...' \
  -H 'Content-Type: application/json' \
  -d '{"userId": "1112223334"}'
```

**Response:**
```json
{
  "message": "Hủy lời mời tham gia workspace thành công",
  "data": {
    "workspaceMember": {
      "id": "9876543210",
      "workspaceId": "1234567890",
      "userId": "1112223334",
      "role": "MEMBER",
      "status": "CANCELLED",
      "invitedById": null,
      "invitedAt": null
    }
  }
}
```

### 10.3 Lỗi — User đã là thành viên

```bash
curl -X POST \
  'http://localhost:3000/workspaces/1234567890/invite' \
  -H 'Authorization: Bearer eyJhbGciOi...' \
  -H 'Content-Type: application/json' \
  -d '{"userId": "5556667778"}'
```

**Response:**
```jsonc
HTTP/1.1 400 Bad Request
{
  "message": "Người dùng này đã là thành viên workspace"
}
```

### 10.4 Lỗi — Không đủ quyền

```bash
curl -X POST \
  'http://localhost:3000/workspaces/1234567890/invite' \
  -H 'Authorization: Bearer eyJhbGciOi...' \
  -H 'Content-Type: application/json' \
  -d '{"userId": "1112223334"}'
```

**Response (user là MEMBER thường, không phải ADMIN/OWNER):**
```jsonc
HTTP/1.1 403 Forbidden
{
  "message": "Bạn không đủ quyền cho thao tác này"
}
```

---

## 11. Kết hợp với Invite Search API

Các API nên được sử dụng cùng nhau:

```
┌─────────────────────────────────────────────────────────────┐
│  1. GET /workspaces/:workspaceId/invite-search             │
│     → Lấy danh sách user có thể mời                      │
│     → Check canInvite = true để enable button "Mời"       │
├─────────────────────────────────────────────────────────────┤
│  2. POST /workspaces/:workspaceId/invite                   │
│     → Gửi lời mời đến user                                │
│     → Body: { "userId": "..." }                           │
├─────────────────────────────────────────────────────────────┤
│  3. GET /workspaces/:workspaceId/requests                  │
│     → Xem danh sách PENDING_INVITE + PENDING_REQUEST       │
│     → Filter type = "invite" để xem lời mời đã gửi        │
├─────────────────────────────────────────────────────────────┤
│  4. DELETE /workspaces/:workspaceId/invite                │
│     → Hủy lời mời đã gửi                                   │
│     → Body: { "userId": "..." }                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 12. Notes cho Frontend

- **Quyền:** Chỉ OWNER và ADMIN mới thấy button "Mời" / "Hủy lời mời". Member thường không có quyền gọi 2 API này.
- **userId dạng string:** Vì ID có thể rất lớn (bigint), luôn truyền dưới dạng string trong JSON để tránh precision loss.
- **Invite lại user đã bị REJECTED/LEFT/CANCELLED:** Server sẽ tự động update record cũ về `PENDING_INVITE` thay vì tạo mới.
- **Không cần check trùng lời mời phía client:** Server đã validate và trả lỗi nếu user đang có `PENDING_INVITE`.
- **Sau khi invite thành công:** User đã được mời sẽ hiển thị trong `GET /requests?type=invite` để admin có thể quản lý.
- **Hủy lời mời không ảnh hưởng đến user:** Status chuyển sang `CANCELLED`, user không nhận được thông báo gì (backend socket notification chưa implement trong phase này).
