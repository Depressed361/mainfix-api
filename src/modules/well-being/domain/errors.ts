export class DomainError extends Error { constructor(public readonly code: string, msg?: string) { super(msg ?? code) } }
export class ForbiddenError extends DomainError { constructor(code='well_being.forbidden', msg?: string){ super(code,msg)} }
export class NotFoundError extends DomainError { constructor(code='well_being.not_found', msg?: string){ super(code,msg)} }
export class ConflictError extends DomainError { constructor(code='well_being.conflict', msg?: string){ super(code,msg)} }
export class InvalidInputError extends DomainError { constructor(code='well_being.invalid', msg?: string){ super(code,msg)} }

