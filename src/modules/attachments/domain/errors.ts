export class DomainError extends Error { constructor(public readonly code: string, msg?: string) { super(msg ?? code) } }
export class ForbiddenError extends DomainError { constructor(code='attachments.forbidden', msg?: string){ super(code,msg)} }
export class NotFoundError extends DomainError { constructor(code='attachments.not_found', msg?: string){ super(code,msg)} }
export class ConflictError extends DomainError { constructor(code='attachments.conflict', msg?: string){ super(code,msg)} }
export class InvalidInputError extends DomainError { constructor(code='attachments.invalid', msg?: string){ super(code,msg)} }

