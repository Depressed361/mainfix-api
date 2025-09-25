# Dependency Inventory

Captured on 2025-09-21.

## Runtime and Tooling
| Component | Current version | Source | Compatibility references |
| --- | --- | --- | --- |
| Node.js | 22.1.0 | `node -v` | https://docs.nestjs.com/cli/compatibility |
| npm | 9.5.0 | `npm -v` | https://docs.npmjs.com/about-npm |
| TypeScript | 5.7.3 | `package.json` | https://www.typescriptlang.org/docs/ |
| ts-node | 10.9.2 | `package.json` | https://typestrong.org/ts-node/docs/ |

## NestJS Stack
| Package | Current version | Source | Release notes / compat |
| --- | --- | --- | --- |
| @nestjs/common | 11.1.6 | `package.json` | https://github.com/nestjs/nest/releases |
| @nestjs/core | 11.1.6 | `package.json` | https://github.com/nestjs/nest/releases |
| @nestjs/platform-express | 11.1.6 | `package.json` | https://github.com/nestjs/nest/releases |
| @nestjs/config | 4.0.2 | `package.json` | https://github.com/nestjs/config/releases |
| @nestjs/sequelize | 11.0.0 | `package.json` | https://github.com/nestjs/sequelize/releases |
| @nestjs/jwt | 11.0.0 | `package.json` | https://github.com/nestjs/jwt/releases |
| @nestjs/terminus | 11.0.0 | `package.json` | https://github.com/nestjs/terminus/releases |

## Data and Persistence Layer
| Component | Current version | Source | Release notes / compat |
| --- | --- | --- | --- |
| Sequelize | 6.37.7 | `package.json` | https://github.com/sequelize/sequelize/releases |
| sequelize-typescript | 2.1.6 | `package.json` | https://github.com/sequelize/sequelize-typescript/releases |
| sequelize-cli | 6.6.3 | `package.json` | https://github.com/sequelize/cli/releases |
| pg (Postgres driver) | 8.16.3 | `package.json` | https://github.com/brianc/node-postgres/releases |
| Postgres service | 16 (docker image) | `docker-compose.yml` | https://www.postgresql.org/docs/release/ |

## Caching and Messaging
| Component | Current version | Source | Release notes / compat |
| --- | --- | --- | --- |
| BullMQ | 5.58.5 | `package.json` | https://github.com/taskforcesh/bullmq/releases |
| Redis service | 7 (docker image) | `docker-compose.yml` | https://redis.io/docs/latest/ |
| ioredis | 5.7.0 | `package.json` | https://github.com/luin/ioredis/releases |

## Testing Stack
| Component | Current version | Source | Release notes / compat |
| --- | --- | --- | --- |
| Jest | 30.1.3 | `package.json` | https://github.com/jestjs/jest/releases |
| ts-jest | 29.4.1 | `package.json` | https://kulshekhar.github.io/ts-jest/ |
| Supertest | 7.0.0 | `package.json` | https://github.com/ladjs/supertest/releases |

## Dependency mapping
| Component | Depends on | Used by | Notes |
| --- | --- | --- | --- |
| Node.js | - | TypeScript, NestJS runtime, Sequelize CLI, BullMQ workers, Jest | Base runtime. Validate Node upgrades before raising any major framework or tooling version. |
| TypeScript | Node.js | NestJS compilation, ts-node, ts-jest, sequelize-typescript | Keep aligned with NestJS and ts-jest requirements. |
| ts-node | Node.js, TypeScript | Local dev scripts, hot migrations | Must follow Node and TypeScript versions to avoid CLI crashes. |
| NestJS core (@nestjs/common, @nestjs/core, @nestjs/platform-express) | Node.js, TypeScript, Express adapter | All application modules (auth, tickets, catalog, etc.) | Raising NestJS implies revalidating Node, TypeScript, guards, and decorators. |
| @nestjs/config | NestJS core | App bootstrap, env management | Watch for parsing or validation changes when upgrading. |
| @nestjs/sequelize | NestJS core, Sequelize | Database-backed modules (tickets, catalog, auth, etc.) | Upgrade in sync with Sequelize and sequelize-typescript to avoid ORM breakage. |
| Sequelize | Node.js, pg driver | @nestjs/sequelize, sequelize-typescript, runtime migrations | Verify migration compatibility and Postgres features on every upgrade. |
| sequelize-typescript | Sequelize, TypeScript | Models in `src/modules/**/models` | Upgrading may require decorator/config adjustments in modules. |
| sequelize-cli | Node.js, Sequelize config | `npm run db:*` scripts, CI pipelines | Must match Sequelize/pg versions so migrations run consistently. |
| pg (node-postgres) | Node.js | Sequelize, sequelize-cli, health scripts | Confirm compatibility with Postgres service version before bumping. |
| Postgres service (docker) | - | Sequelize, CLI, e2e tests | Upgrades require replaying migrations/tests and validating extensions. |
| BullMQ | Node.js, ioredis, Redis >= 6 | Future background jobs, queues | Coordinate with Redis and ioredis versions to keep worker features available. |
| Redis service (docker) | - | BullMQ, cache layers | Align upgrades with BullMQ/ioredis configuration and persistence needs. |
| ioredis | Node.js | BullMQ | Check option compatibility (TLS, cluster, scripts) during upgrades. |
| Jest | Node.js | Unit and e2e test suites | Keep synchronized with ts-jest and ensure scripts still pass. |
| ts-jest | Jest, TypeScript | TypeScript-aware tests | Needs compatible Jest/TypeScript versions to avoid compile errors. |
| Supertest | Node.js | HTTP e2e tests | Relies on Nest/Express adapter; retest after NestJS or Express upgrades. |

## Cross dependency notes
- NestJS 11 requires Node 18+ and TypeScript 5.4+; verify Node upgrades remain compatible before bumping NestJS.
- The Sequelize stack couples `sequelize`, `sequelize-typescript`, `sequelize-cli`, and the `pg` driver; upgrade them in tandem and confirm database migrations on Postgres 16.
- BullMQ features depend on Redis 6+; keep the Redis service >= 6 when raising BullMQ.
- ts-jest 29.x supports Jest 30.x and TypeScript 5.x; align upgrades across the testing stack to avoid compiler mismatches.

Update this inventory whenever dependencies change, and attach release note highlights or internal test evidence for each upgrade.
