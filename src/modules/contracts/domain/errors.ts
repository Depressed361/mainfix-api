export class DomainError extends Error {
  constructor(public readonly code: string, msg?: string) { super(msg ?? code); }
}
export class NotFoundError extends DomainError { constructor(code='contracts.not_found', msg?: string){ super(code,msg);} }
export class ConflictError extends DomainError { constructor(code='contracts.conflict', msg?: string){ super(code,msg);} }
export class ForbiddenError extends DomainError { constructor(code='contracts.forbidden', msg?: string){ super(code,msg);} }
export class InvalidInputError extends DomainError { constructor(code='contracts.invalid', msg?: string){ super(code,msg);} }

