export class DomainError extends Error { constructor(public readonly code: string, msg?: string) { super(msg ?? code) } }
export class ForbiddenError extends DomainError { constructor(code='reports.forbidden', msg?: string){ super(code,msg)} }
export class NotFoundError extends DomainError { constructor(code='reports.not_found', msg?: string){ super(code,msg)} }
export class InvalidInputError extends DomainError { constructor(code='reports.invalid', msg?: string){ super(code,msg)} }

