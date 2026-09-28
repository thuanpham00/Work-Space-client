# API: Search Users to Invite Workspace

> Tài liệu cho Frontend — dùng để build UI mời thành viên vào Workspace.

---

## 1. Endpoint

```
GET /workspaces/:workspaceId/invite-search
```

**Auth:** Bearer Access Token (bắt buộc).

**Quyền:** Chỉ **ACTIVE member** của workspace mới được gọi. Owner / Admin / Member đều OK (miễn đang `ACTIVE`). Nếu không phải member → trả `403 Forbidden`.

---

## 2. Query Params

| Field    | Type   | Required | Default | Mô tả                                                              |
| -------- | ------ | -------- | ------- | ------------------------------------------------------------------ |
| search   | string | ❌       | `""`    | Tìm theo `username` hoặc `fullName` (case-insensitive, contains) |
| page     | number | ❌       | `1`     | Số trang, bắt đầu từ 1                                            |
| limit    | number | ❌       | `20`    | Số item / trang. Tối đa `100`                                      |

**Lưu ý:**
- Mặc định `search = ""` → trả về **tất cả user** trong hệ thống (trừ chính mình).
- User đã là ACTIVE member của workspace **vẫn hiện trong list** (với `canInvite = false`, `reason = ALREADY_MEMBER`) để UI biết mà hiển thị.

---

## 3. Response

```jsonc
HTTP/1.1 200 OK
{
  "message": "Lấy danh sách user để mời vào workspace thành công",
  "data": {
    "items": [
      {
        "id": "123",
        "username": "nguyenvana",
        "displayName": "Nguyễn Văn A",
        "fullName": "Nguyễn Văn A",
        "avatar": "https://cdn.example.com/avatars/123.png",

        // Quan hệ friend giữa mình và user này
        "friendStatus": "ACCEPTED",  // null | "REQUEST_SENT" | "REQUEST_RECEIVED" | "ACCEPTED"

        // Policy của NGƯỜI ĐƯỢC MỜI (không phải của mình)
        "workspaceInvitePolicy": "FRIENDS_ONLY", // null | "EVERYONE" | "FRIENDS_ONLY"

        // Trạng thái hiện tại của user này trong workspace
        "existingWorkspaceStatus": null,  // null | "ACTIVE" | "PENDING_INVITE" | "PENDING_REQUEST" | "REJECTED" | "LEFT" | "CANCELLED"

        // Kết quả check cuối cùng — đã tính mọi điều kiện
        "canInvite": true,
        "reason": "OK"  // xem bảng ở mục 4
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "workspaceId": "456"
  }
}
```

---

## 4. Bảng `reason` — 7 trường hợp xảy ra

| `reason` | `canInvite` | Ý nghĩa | UI gợi ý |
| --- | :-: | --- | --- |
| `OK` | `true` | Có thể mời được | Hiển thị nút **[Mời]** → enable, click để gửi invite |
| `ALREADY_MEMBER` | `false` | User này đã là thành viên ACTIVE của workspace | Hiển thị badge **"Đã là thành viên"**, disable nút Mời |
| `ALREADY_PENDING_INVITE` | `false` | Bạn (hoặc admin khác) đã gửi lời mời trước đó, đang chờ user accept/reject | Hiển thị badge **"Đã gửi lời mời"** + nút [Hủy lời mời] (nếu bạn là người gửi) |
| `ALREADY_PENDING_REQUEST` | `false` | User này đã chủ động gửi request xin vào workspace → admin cần duyệt | Hiển thị badge **"Đang chờ duyệt"** → bạn vào mục Requests để duyệt |
| `FRIENDS_ONLY_POLICY` | `false` | User chỉ nhận invite từ bạn bè — nhưng mình chưa là bạn, chưa gửi/nhận friend request | Hiển thị **"Chỉ nhận lời mời từ bạn bè"** + nút [Kết bạn] |
| `NO_FRIEND_REQUEST` | `false` | Tương tự `FRIENDS_ONLY_POLICY` (mình thống nhất dùng 1 tên để UI dễ xử lý — gộp vào `FRIENDS_ONLY_POLICY`) | Giống trên |
| `SELF_INVITE` | `false` | Tự mời chính mình — **không bao giờ xảy ra** vì server đã loại user hiện tại khỏi kết quả | (defensive case, không cần handle) |

> ⚠️ **Lưu ý:** Type `InviteDenialReason` hiện tại trong code có 6 giá trị (`OK`, `ALREADY_MEMBER`, `ALREADY_PENDING_INVITE`, `ALREADY_PENDING_REQUEST`, `FRIENDS_ONLY_POLICY`, `NO_FRIEND_REQUEST`). `SELF_INVITE` là giá trị defensive có thể xuất hiện trong tương lai nhưng **không bao giờ được trả về** vì user hiện tại đã bị loại khỏi query. Frontend có thể ignore hoặc fallback về "Không thể mời".

---

## 5. Bảng `friendStatus` — quan hệ bạn bè với mình

| Value | Ý nghĩa | UI gợi ý |
| --- | --- | --- |
| `null` | Chưa có quan hệ friend, chưa gửi/nhận request | Hiển thị nút **[Kết bạn]** (nếu muốn) |
| `REQUEST_SENT` | Mình đã gửi lời mời kết bạn, đang chờ họ accept | Hiển thị **"Đã gửi lời mời kết bạn"** |
| `REQUEST_RECEIVED` | User này đã gửi lời mời kết bạn cho mình, đang chờ mình accept | Hiển thị nút **[Chấp nhận kết bạn]** |
| `ACCEPTED` | Hai bên đã là bạn bè | Hiển thị badge **"Bạn bè"** (icon ✓) |

---

## 6. Bảng `workspaceInvitePolicy` — policy của NGƯỜI ĐƯỢC MỜI

| Value | Ý nghĩa |
| --- | --- |
| `null` / `EVERYONE` | User chấp nhận lời mời từ **bất kỳ ai** trong workspace |
| `FRIENDS_ONLY` | User **chỉ chấp nhận** lời mời từ bạn bè (`friendStatus` ∈ {`ACCEPTED`, `REQUEST_SENT`, `REQUEST_RECEIVED`}) |

---

## 7. Bảng `existingWorkspaceStatus` — trạng thái user này trong workspace hiện tại

| Value | Ý nghĩa |
| --- | --- |
| `null` | User chưa từng có record trong workspace này |
| `ACTIVE` | Đã là thành viên |
| `PENDING_INVITE` | Đã được mời, đang chờ accept |
| `PENDING_REQUEST` | Đã chủ động xin vào, đang chờ admin duyệt |
| `REJECTED` | Đã bị từ chối trước đó |
| `LEFT` | Đã rời khỏi workspace trước đó |
| `CANCELLED` | Đã hủy request join trước đó |

---

## 8. Flow đề xuất cho Frontend

### 8.1. Mở modal "Mời vào Workspace"

```
1. User mở modal → debounce search input → gọi API với search term
2. Render list user từ response
3. Với mỗi user, kiểm tra canInvite để enable/disable nút
```

### 8.2. Decision tree cho UI

```text
canInvite = true?
├── YES  → [Mời] button enabled
│
└── NO   → reason là gì?
    ├── ALREADY_MEMBER           → "Đã là thành viên" (badge xanh, disable button)
    ├── ALREADY_PENDING_INVITE   → "Đã gửi lời mời" (badge vàng, button [Hủy lời mời])
    ├── ALREADY_PENDING_REQUEST  → "Đang chờ duyệt" (badge xanh dương, link tới Requests)
    └── FRIENDS_ONLY_POLICY      → "Chỉ nhận invite từ bạn bè" (button [Kết bạn])
```

### 8.3. Gợi ý hiển thị kết hợp

| Can invite? | Friend? | Policy | UI Suggestion |
| :-: | :-: | :-: | --- |
| ✅ | ✅ | ANY | `[Mời]` + badge "Bạn bè" |
| ✅ | ❌ | EVERYONE | `[Mời]` |
| ❌ (POLICY) | ❌ | FRIENDS_ONLY | `[Kết bạn]` + tooltip "User này chỉ nhận invite từ bạn bè" |
| ❌ (POLICY) | ⏳ (REQUEST_SENT) | FRIENDS_ONLY | `[Mời]` (request đang pending được tính như đủ điều kiện) |
| ❌ (MEMBER) | — | — | Badge "Đã là thành viên" |
| ❌ (PENDING_INVITE) | — | — | Badge "Đã gửi lời mời" + nút `Hủy lời mời` |
| ❌ (PENDING_REQUEST) | — | — | Badge "Đang chờ duyệt" + link sang Requests |

---

## 9. Error codes

| HTTP Code | Message | Nguyên nhân |
| --- | --- | --- |
| `400` | `Thiếu thông tin workspaceId hoặc userId` | Thiếu param / token không hợp lệ |
| `401` | `AccessToken bắt buộc!` / `AccessToken đã hết hạn!` | Chưa đăng nhập / token hết hạn |
| `403` | `Bạn không phải thành viên của workspace này` | Không phải ACTIVE member → không có quyền search |
| `404` | (không có — workspace không tồn tại thì `me` trả null → sẽ nhận `403`) | |
| `422` | (Zod validation) Query sai kiểu (`page < 1`, `limit > 100`, ...) | Validate query trước khi vào controller |

---

## 10. Example calls

### Request cơ bản
```bash
curl -X GET \
  'http://localhost:3000/workspaces/456/invite-search' \
  -H 'Authorization: Bearer eyJhbGciOi...'
```

### Search có keyword
```bash
curl -X GET \
  'http://localhost:3000/workspaces/456/invite-search?search=nguyen&page=1&limit=10' \
  -H 'Authorization: Bearer eyJhbGciOi...'
```

### Response mẫu (đầy đủ các case)
```json
{
  "message": "Lấy danh sách user để mời vào workspace thành công",
  "data": {
    "items": [
      {
        "id": "1", "username": "alice", "displayName": "Alice",
        "fullName": "Alice Nguyễn", "avatar": null,
        "friendStatus": "ACCEPTED",
        "workspaceInvitePolicy": "FRIENDS_ONLY",
        "existingWorkspaceStatus": null,
        "canInvite": true,
        "reason": "OK"
      },
      {
        "id": "2", "username": "bob", "displayName": "Bob",
        "fullName": "Bob Trần", "avatar": null,
        "friendStatus": null,
        "workspaceInvitePolicy": "FRIENDS_ONLY",
        "existingWorkspaceStatus": null,
        "canInvite": false,
        "reason": "FRIENDS_ONLY_POLICY"
      },
      {
        "id": "3", "username": "charlie", "displayName": "Charlie",
        "fullName": null, "avatar": null,
        "friendStatus": null,
        "workspaceInvitePolicy": "EVERYONE",
        "existingWorkspaceStatus": null,
        "canInvite": true,
        "reason": "OK"
      },
      {
        "id": "4", "username": "dave", "displayName": "Dave",
        "fullName": null, "avatar": null,
        "friendStatus": null,
        "workspaceInvitePolicy": null,
        "existingWorkspaceStatus": "ACTIVE",
        "canInvite": false,
        "reason": "ALREADY_MEMBER"
      },
      {
        "id": "5", "username": "eve", "displayName": "Eve",
        "fullName": null, "avatar": null,
        "friendStatus": "REQUEST_SENT",
        "workspaceInvitePolicy": "EVERYONE",
        "existingWorkspaceStatus": "PENDING_INVITE",
        "canInvite": false,
        "reason": "ALREADY_PENDING_INVITE"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "workspaceId": "456"
  }
}
```

---

## 11. Notes cho Frontend

- **Không cần tự check `canInvite`** — đã có sẵn trong response. Nhưng nếu muốn tối ưu UI (vd hiển thị tooltip lý do), đọc `reason` để hiển thị message phù hợp.
- **Loading state:** nên debounce input search **300-500ms** để tránh spam request.
- **Empty state khi `search = ""`:** API trả về tất cả user (trừ mình) → khi mở modal lần đầu, cân nhắc hiển thị gợi ý "Tìm kiếm bạn bè để mời" thay vì dump cả trăm user.
- **User bị block (`FriendStatus.BLOCKED`)** sẽ không hiển thị trong list (do logic `buildFriendStatusMap` chỉ trả `null` cho user bị block hoặc không có record friend).
- **`workspaceId` trong response** để confirm lại context cho client (phòng trường hợp cache stale).
