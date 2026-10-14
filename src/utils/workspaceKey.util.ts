/**
 * Chuyển tên workspace thành slug URL-friendly (bỏ khoảng trắng, ký tự đặc biệt)
 * VD: "Workspace Mặc Định" → "workspace-mac-dinh"
 * VD: "Công ty TNHH ABC 123" → "cong-ty-tnhh-abc-123"
 */
export function generateSlug(name: string): string {
  if (!name) return "";

  return name
    .toLowerCase()
    .trim()
    .normalize("NFD") // Tách các dấu ra khỏi ký tự gốc
    .replace(/[\u0300-\u036f]/g, "") // Xóa các dấu
    .replace(/đ/g, "d") // Thay đặc biệt cho tiếng Việt
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "") // Xóa ký tự đặc biệt (chỉ giữ chữ cái, số, space, dấu -)
    .replace(/\s+/g, "-") // Khoảng trắng → dấu -
    .replace(/-+/g, "-") // Nhiều dấu - liên tiếp → 1 dấu -
    .replace(/^-+|-+$/g, ""); // Xóa dấu - ở đầu/cuối
}

/**
 * Tạo route path dạng id thuần: /workspaces/{id}
 * VD: id="2" → "/workspaces/2"
 */
export function buildWorkspaceIdPath(id: string | number): string {
  return `/workspaces/${id}`;
}

/**
 * Parse route path dạng id thuần
 * VD: "/workspaces/2" → "2"
 * Trả về null nếu path không đúng format "/workspaces/{id}"
 */
export function parseWorkspaceIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/workspaces\/([^/?#]+)$/);
  if (!match) return null;
  return match[1];
}
