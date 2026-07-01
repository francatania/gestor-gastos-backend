import { Response } from 'express';

export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export const ok = <T>(res: Response, data: T, message?: string) => {
  return res.status(200).json(buildSuccessResponse(data, message));
};

export const created = <T>(res: Response, data: T, message?: string) => {
  return res.status(201).json(buildSuccessResponse(data, message));
};

export const noContent = (res: Response) => {
  return res.status(204).send();
};

const buildSuccessResponse = <T>(
  data: T,
  message?: string
): ApiSuccessResponse<T> => ({
  data,
  ...(message ? { message } : {}),
});
