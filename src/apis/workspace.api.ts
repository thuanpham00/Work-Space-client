import type { CategoryChannel, CategoryChannelBody } from "../types/categoryChannel.type";
import type { QueryBase } from "../types/query.type";
import type { SuccessResponse } from "../types/utils.type";
import type {
  InviteSearchResponse,
  WorkspaceMember,
  WorkspaceMemberItem,
  WorkspaceRequestItem,
  WorkspaceType,
} from "../types/workspace.type";
import Http from "../utils/http";

export const workspaceAPI = {
  getWorkspaces: () => {
    return Http.get<SuccessResponse<{ workspaces: WorkspaceType[]; total: number }>>("/workspaces");
  },

  getWorkspaceById: (workspaceId: string) => {
    return Http.get<SuccessResponse<{ workspace: WorkspaceType }>>(`/workspaces/${workspaceId}`);
  },

  getCategoryById: (categoryId: string) => {
    return Http.get<SuccessResponse<{ categories: CategoryChannel }>>(`/workspaces/categories/${categoryId}`);
  },

  getMembersWorkspace: (workspaceId: string, params: QueryBase) => {
    return Http.get<
      SuccessResponse<{
        members: WorkspaceMemberItem[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>
    >(`/workspaces/${workspaceId}/members`, { params });
  },

  getMemberWorkspaceRequests: (workspaceId: string) => {
    return Http.get<
      SuccessResponse<{ requests: WorkspaceRequestItem[]; joinCount: number; inviteCount: number }>
    >(`/workspaces/${workspaceId}/requests`);
  },

  searchInviteMembers: (workspaceId: string, params: QueryBase) => {
    return Http.get<SuccessResponse<InviteSearchResponse>>(`/workspaces/${workspaceId}/invite-search`, {
      params,
    });
  },

  createCategory: (data: CategoryChannelBody) => {
    return Http.post<SuccessResponse<{ category: CategoryChannel }>>(`/workspaces/categories`, data);
  },

  updateCategory: (categoryId: string, data: CategoryChannelBody) => {
    return Http.put<SuccessResponse<{ category: CategoryChannel }>>(
      `/workspaces/categories/${categoryId}`,
      data,
    );
  },

  deleteCategory: (categoryId: string) => {
    return Http.delete<SuccessResponse<{ category: CategoryChannel }>>(
      `/workspaces/categories/${categoryId}`,
    );
  },

  infoWorkspaceStatus: (workspaceId: string) => {
    return Http.get<SuccessResponse<{ workspace: WorkspaceType }>>(`/workspaces/${workspaceId}/status`);
  },

  // dành cho user
  requestInvite: (workspaceId: string) => {
    return Http.post<SuccessResponse<{ workspaceMember: WorkspaceMember }>>(
      `/workspaces/${workspaceId}/request-invite`,
    );
  },

  // dành cho user
  requestCancel: (workspaceId: string) => {
    return Http.delete<SuccessResponse<{ workspaceMember: WorkspaceMember }>>(
      `/workspaces/${workspaceId}/request-invite`,
    );
  },

  // dành cho owner/admin
  inviteUser: (workspaceId: string, userId: string) => {
    return Http.post<SuccessResponse<{ workspaceMember: WorkspaceMember }>>(
      `/workspaces/${workspaceId}/invite`,
      { userId },
    );
  },

  // dành cho owner/admin
  cancelInvite: (workspaceId: string, userId: string) => {
    return Http.delete<SuccessResponse<{ workspaceMember: WorkspaceMember }>>(
      `/workspaces/${workspaceId}/invite`,
      { data: { userId } },
    );
  },

  // lấy link workspace
  getWorkspaceLink: (workspaceId: string) => {
    return Http.get<SuccessResponse<{ url: string; expiresAt: string }>>(`/workspaces/${workspaceId}/link`);
  },
};
