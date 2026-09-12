import type { QueryBase } from "../types/query.type";
import type { SearchResponse } from "../types/search.type";
import type { SuccessResponse } from "../types/utils.type";
import Http from "../utils/http";

export const searchApi = {
  search: (params: QueryBase) => {
    return Http.get<SuccessResponse<SearchResponse>>("/search", {
      params,
    });
  },
};
