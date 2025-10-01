import { InvalidInputError } from './errors';

export function assertValidPeriod(start: Date, end: Date) {
  if (!(start instanceof Date) || isNaN(start.getTime()) || !(end instanceof Date) || isNaN(end.getTime())) {
    throw new InvalidInputError('well_being.period.invalid');
  }
  if (start.getTime() > end.getTime()) throw new InvalidInputError('well_being.period.order');
}

