export class DomainError extends Error {
  public readonly code: string;
  constructor(code: string, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export class NotFoundError extends DomainError {
  constructor(code = 'routing.not_found', message?: string) {
    super(code, message);
  }
}
export class ConflictError extends DomainError {
  constructor(code = 'routing.conflict', message?: string) {
    super(code, message);
  }
}
export class ForbiddenError extends DomainError {
  constructor(code = 'routing.forbidden', message?: string) {
    super(code, message);
  }
}
export class InvalidRuleError extends DomainError {
  constructor(code = 'routing.invalid_rule', message?: string) {
    super(code, message);
  }
}

