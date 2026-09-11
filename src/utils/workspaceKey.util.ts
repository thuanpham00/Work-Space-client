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
 * Tạo key menu từ slug + id
 * VD: slug="workspace-mac-dinh", id="2"
 *  → "workspace-mac-dinh-i-2"
 */
export function buildWorkspaceKey(slug: string, id: string): string {
  return `${slug}-i-${id}`;
}

/**
 * Parse key workspace từ menu
 * Format: "{slug}-i-{id}"
 * VD: "workspace-mac-dinh-i-2"
 *  → { slug: "workspace-mac-dinh", id: "2" }
 */
export function parseWorkspaceKey(key: string): {
  slug: string;
  id: string;
} | null {
  // Match: {slug}-i-{id} (lấy phần cuối cùng làm id)
  const match = key.match(/^(.*?)-i-(.+)$/);
  if (!match) return null;

  return {
    slug: match[1],
    id: match[2],
  };
}

/**
 * Tạo route path: /workspaces/{slug}-i-{id}
 * VD: /workspaces/workspace-mac-dinh-i-2
 */
export function buildWorkspacePath(slug: string, id: string): string {
  return `/workspaces/${slug}-i-${id}`;
}

/**
 * Parse route path
 * VD: /workspaces/workspace-mac-dinh-i-2
 *  → { slug: "workspace-mac-dinh", id: "2" }
 */
export function parseWorkspacePath(pathname: string): {
  slug: string;
  id: string;
} | null {
  const match = pathname.match(/^\/workspaces\/(.+)-i-(.+)$/);
  if (!match) return null;

  return {
    slug: match[1],
    id: match[2],
  };
}

/**
 * Tạo key menu từ workspace name + id (one-liner)
 * VD: name="Workspace Mặc Định", id="2"
 *  → "workspace-mac-dinh-i-2"
 */
export function getWorkspaceMenuKey(name: string, id: string): string {
  const slug = generateSlug(name);
  return buildWorkspaceKey(slug, id);
}

/**
 * Lấy slug từ workspace name
 * (alias ngắn gọn hơn cho generateSlug)
 */
export const toSlug = generateSlug;
