import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DomainError } from '../domain/errors';

export function mapDomainError(error: unknown): never {
  if (error instanceof DomainError) {
    const code = error.code || '';
    if (code.includes('invalid_rule')) throw new UnprocessableEntityException(error.message);
    if (code.includes('not_found')) throw new NotFoundException(error.message);
    if (code.includes('forbidden') || code.includes('company_scope')) throw new ForbiddenException(error.message);
    if (code.includes('conflict')) throw new ConflictException(error.message);
  }
  throw error as any;
}

