export interface ZodIssue {
  code?: string;
  expected?: string;
  received?: string;
  path: (string | number)[];
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message?: string;
  errors?: ZodIssue[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
