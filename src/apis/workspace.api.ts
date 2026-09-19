import type { CategoryChannel, CategoryChannelBody } from "../types/categoryChannel.type";
import type { QueryBase } from "../types/query.type";
import type { SuccessResponse } from "../types/utils.type";
import type {
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

  requestInvite: (workspaceId: string) => {
    return Http.post<SuccessResponse<{ workspaceMember: WorkspaceMember }>>(
      `/workspaces/${workspaceId}/request-invite`,
    );
  },

  cancelRequest: (workspaceId: string) => {
    return Http.delete<SuccessResponse<{ workspaceMember: WorkspaceMember }>>(
      `/workspaces/${workspaceId}/request-invite`,
    );
  },
};
