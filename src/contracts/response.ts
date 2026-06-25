export interface PagedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ZodErrorResponse {
  error: 'ValidationError';
  issues: {
    path: string;
    message: string;
  }[];
}

export interface ApiErrorResponse {
  error: string;
  message: string;
}