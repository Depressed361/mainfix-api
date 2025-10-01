export class DomainError extends Error { constructor(public readonly code: string, msg?: string) { super(msg ?? code); } }
export class NotFoundError extends DomainError { constructor(code='directory.not_found', msg?: string){ super(code,msg);} }
export class ConflictError extends DomainError { constructor(code='directory.conflict', msg?: string){ super(code,msg);} }
export class ForbiddenError extends DomainError { constructor(code='directory.forbidden', msg?: string){ super(code,msg);} }
export class InvalidInputError extends DomainError { constructor(code='directory.invalid', msg?: string){ super(code,msg);} }

