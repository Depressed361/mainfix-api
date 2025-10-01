export class DomainError extends Error { constructor(public readonly code: string, msg?: string) { super(msg ?? code) } }
export class ForbiddenError extends DomainError { constructor(code='approvals.forbidden', msg?: string){ super(code,msg)} }
export class NotFoundError extends DomainError { constructor(code='approvals.not_found', msg?: string){ super(code,msg)} }
export class ConflictError extends DomainError { constructor(code='approvals.conflict', msg?: string){ super(code,msg)} }
export class InvalidInputError extends DomainError { constructor(code='approvals.invalid', msg?: string){ super(code,msg)} }

export class AlreadyDecidedError extends ConflictError { constructor(){ super('approvals.already_decided') } }
export class ApprovalRequiredError extends ConflictError { constructor(){ super('approvals.required') } }

