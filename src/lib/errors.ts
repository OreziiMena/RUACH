export class BadRequestError extends Error {
  status: number;
  error: string;

  constructor(message: string) {
    super(message);
    this.error = 'BadRequestError';
    this.status = 400;
  }
}

export class UnAuthorizedError extends Error {
  status: number;
  error: string;

  constructor(message: string) {
    super(message);
    this.error = 'UnAuthorizedError';
    this.status = 401;
  }
}

export class ForbiddenError extends Error {
  status: number;
  error: string;

  constructor(message: string) {
    super(message);
    this.error = 'ForbiddenError';
    this.status = 403;
  }
}

export class NotFoundError extends Error {
  status: number;
  error: string;

  constructor(message: string) {
    super(message);
    this.error = 'NotFoundError';
    this.status = 404;
  }
}