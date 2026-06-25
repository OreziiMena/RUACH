import { PagedResponse } from '@/contracts/response';

export const pageResponseMapper = <T>(payload: {
  data: T[];
  page: number;
  limit: number;
  total: number;
}): PagedResponse<T> => ({
  data: payload.data,
  pagination: {
    page: payload.page,
    limit: payload.limit,
    total: payload.total,
    totalPages: Math.ceil(payload.total / payload.limit),
    hasNextPage: payload.page * payload.limit < payload.total,
    hasPreviousPage: payload.page > 1,
  },
});
