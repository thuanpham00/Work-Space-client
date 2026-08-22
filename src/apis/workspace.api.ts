import type { CategoryChannel, CategoryChannelBody } from "../types/categoryChannel.type";
import type { SuccessResponse } from "../types/utils.type";
import type { WorkspaceType } from "../types/workspace.type";
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
};
