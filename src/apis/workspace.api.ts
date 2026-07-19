import type { SuccessResponse } from "../types/utils.type";
import type { WorkspaceType } from "../types/workspace.type";
import Http from "../utils/http";

export const workspaceAPI = {
  getWorkspaces: () => {
    return Http.get<SuccessResponse<{ workspaces: WorkspaceType[]; total: number }>>("/users/workspaces");
  },
};
