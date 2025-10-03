import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DomainError } from '../domain/errors';

export function mapDomainError(error: unknown): never {
  if (error instanceof DomainError || (typeof error === 'object' && error !== null && 'code' in (error as any))) {
    const code = (error as any).code as string | undefined;
    const msg = (error as any).message as string | undefined;
    if (code) {
      if (code.includes('invalid') || code.includes('validation')) {
        throw new UnprocessableEntityException(msg ?? code);
      }
      if (code.includes('not_found')) {
        throw new NotFoundException(msg ?? code);
      }
      if (code.includes('forbidden') || code.includes('scope')) {
        throw new ForbiddenException(msg ?? code);
      }
      if (code.includes('conflict') || code.includes('duplicate')) {
        throw new ConflictException(msg ?? code);
      }
    }
  }
  throw error as any;
}

