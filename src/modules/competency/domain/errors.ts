export class DomainError extends Error {
  constructor(public readonly code: string, message?: string) {
    super(message ?? code);
  }
}
export class InvalidInputError extends DomainError {
  constructor(code = 'competency.invalid_input', message?: string) {
    super(code, message);
  }
}
export class ConflictError extends DomainError {
  constructor(code = 'competency.conflict', message?: string) {
    super(code, message);
  }
}
export class ForbiddenError extends DomainError {
  constructor(code = 'competency.forbidden', message?: string) {
    super(code, message);
  }
}
export class NotFoundError extends DomainError {
  constructor(code = 'competency.not_found', message?: string) {
    super(code, message);
  }
}

