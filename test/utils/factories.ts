import { faker as realFaker } from '@faker-js/faker';

type FakerType = typeof realFaker;

const fallbackFaker: FakerType = {
  string: { uuid: () => '00000000-0000-0000-0000-000000000000' },
  internet: { email: () => 'test@example.com' },
  person: { fullName: () => 'Test User' },
  helpers: { arrayElement: <T>(arr: T[]) => arr[0] },
  // ...ajoute les autres propriétés nécessaires si besoin
} as FakerType;

const faker: FakerType = realFaker ?? fallbackFaker;

interface User {
  companyId: string;
  email: string;
  displayName: string;
  role: 'occupant' | 'maintainer' | 'manager' | 'approver' | 'admin';
  active: boolean;
  // ...autres propriétés si besoin
}

export function userFactory(overrides: Partial<User> = {}): User {
  return {
    companyId: faker.string.uuid(),
    email: faker.internet.email().toLowerCase(),
    displayName: faker.person.fullName(),
    role: faker.helpers.arrayElement([
      'occupant',
      'maintainer',
      'manager',
      'approver',
      'admin',
    ]),
    active: true,
    ...overrides,
  };
}
