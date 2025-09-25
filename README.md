# MainFix API

MainFix API est le backend de gestion technique du produit MainFix. Il centralise les informations de referentiel (entreprises, sites, batiments, taxonomie), le cycle de vie des tickets d''intervention et les modules operationnels (couts, approbations, satisfaction, confort, reporting et SLA) au sein d''une architecture NestJS moderne.

## Apercu
- API REST NestJS 11 ecrite en TypeScript 5.7 et structuree en modules metiers coherents.
- Persistance via Sequelize et PostgreSQL avec migrations et modeles `sequelize-typescript` maintenus dans `src/modules/**/models`.
- Mise a disposition d''une base Redis (BullMQ) pour les traitements asynchrones et des controles d''acces avances (JWT + portees d''administration).
- Suite de tests Jest (unitaires et end-to-end) activant les memes modules que l''application.

## Stack principale
- **Framework** : NestJS 11, adaptateur Express, `ValidationPipe` global, Helmet et CORS actifs (`src/main.ts`).
- **Langage & tooling** : TypeScript 5.7, ts-node, tsconfig strict (module NodeNext) et `class-validator`/`class-transformer` pour les DTO.
- **Base de donnees** : PostgreSQL gere par Sequelize + `sequelize-typescript`, migrations dans `migrations/`, configuration CLI dans `config/config.js` et `sequelize.config.ts`.
- **Cache & jobs** : Redis (via BullMQ) declare, pret pour les traitements differes.
- **AuthN/AuthZ** : JWT (`@nestjs/jwt`), Bcrypt, scopes d''administration hierarchiques (`AdminScope`) et decorateurs personnalises.
- **Tests** : Jest, Supertest, base de tests isolee (`.env.test`, `docker-compose.yml`).

## Structure du depot
| Dossier / fichier | Role |
| --- | --- |
| `src/app.module.ts`, `src/main.ts` | Bootstrap NestJS, enregistrement des modules metier et configuration globale. |
| `src/modules/` | Modules fonctionnels (auth, catalog, tickets, cost, approvals, satisfaction, etc.). Chaque module regroupe `controllers`, `services`, `dto` et `models`. |
| `migrations/` | Scripts Sequelize CLI decrivant le schema complet (tables, index, jeux initiaux). |
| `seeders/` | Point d''entree pour d''eventuels jeux de donnees initiaux (actuellement vide). |
| `config/` & `sequelize.config.ts` | Configuration Sequelize pour CLI et execution (inclut support `DATABASE_URL`). |
| `test/` | Suites Jest unitaires et e2e, utilitaires de tests et configuration (`jest-e2e.json`, `setup-e2e.ts`). |
| `docker-compose.yml` | Stack locale Postgres (dev/test) + Redis prete a l''emploi. |
| `eslint.config.mjs`, `.prettierrc`, `.editorconfig` | Outils qualite & formatage. |

## Prerequis
- Node.js >= 20 (LTS recommandee) et npm >= 10.
- PostgreSQL 16 et Redis 7 (gerees automatiquement via `docker-compose` si souhaite).
- `sequelize-cli` installe en local (ou via `npx`).
- Acces a un environnement `.env` (voir ci-dessous).

## Installation & demarrage rapide
1. **Installer les dependances**
   ```bash
   npm install
   ```
2. **Configurer les variables d''environnement**
   - Copier/adapter `.env` (un exemple minimal est fourni). Pour les tests, utiliser `.env.test`.
3. **Lancer l''infrastructure locale** (optionnel mais recommande)
   ```bash
   docker compose up -d postgres_dev redis
   ```
4. **Appliquer le schema**
   ```bash
   npm run db:migrate
   ```
   (Ajouter `npm run db:seed` lorsque des seeders seront disponibles.)
5. **Demarrer l''API en mode developpement**
   ```bash
   npm run start:dev
   ```
   L''API est accessible sur `http://localhost:3000/api` (prefixe global `api`).

## Variables d''environnement
| Variable | Description | Valeur par defaut |
| --- | --- | --- |
| `NODE_ENV` | Environnement d''execution (`development`, `test`, `production`). | `development` |
| `PORT` | Port HTTP expose par NestJS. | `3000` |
| `DB_HOST`, `DB_PORT` | Hote et port Postgres (dev). | `localhost`, `5432` |
| `DB_USER`, `DB_PASS`, `DB_NAME` | Identifiants Postgres (dev). | `mainfix`, `mainfix`, `mainfix` |
| `DATABASE_URL` | Chaine de connexion Postgres (prod / cloud). | _vide_ |
| `DATABASE_URL_TEST` | Chaine de connexion utilisee par `sequelize.config.ts` pour les tests. | _vide_ |
| `DB_SSL` | Active `ssl` en production (`true`/`false`). | _non defini_ |
| `SEQ_LOG` | Active les logs SQL de Sequelize quand positionne a `true`. | `false` |
| `REDIS_HOST`, `REDIS_PORT` | Acces Redis pour BullMQ. | `localhost`, `6379` |
| `JWT_SECRET` | Cle de signature JWT. | `123` (a remplacer) |
| `JWT_EXPIRES` | Duree de validite des tokens (`7d` par defaut dans `AuthModule`). | `7d` |
| `JWT_EXPIRATION` | Valeur utilisee par certains scripts/tests pour l''expiration (fallback en secondes). | `3600s` |

Variables specifiques aux tests (`.env.test`) :
| Variable | Description | Valeur par defaut |
| --- | --- | --- |
| `TEST_DB_HOST`, `TEST_DB_PORT` | Hote et port Postgres de test. | `localhost`, `5433` |
| `TEST_DB_USER`, `TEST_DB_PASS`, `TEST_DB_NAME` | Identifiants de la base de tests. | `test_user`, `test_pass`, `mainfix_test` |

## Gestion de la base de donnees
- Les migrations Sequelize sont stockees dans `migrations/` (ex. `20250914095502-init_mainfix.js`) et couvrent la creation de l''ensemble du modele relationnel (entreprises, equipes, catalogues, tickets, SLA, couts, rapports, etc.).
- Executer / annuler des migrations :
  ```bash
  npm run db:migrate
  npm run db:migrate:undo       # annule la derniere migration
  npm run db:migrate:undo -- --name <migration.js>
  ```
- Migrations en environnement de test : `npm run db:test:migrate`, puis `npm run db:test:reset` pour reinitialiser la base.
- Seeders : l''infrastructure est prete (`npm run db:seed` / `npm run db:test:seed`), ajouter vos fichiers dans `seeders/`.

## Scripts npm utiles
| Script | Description |
| --- | --- |
| `start`, `start:dev`, `start:prod` | Demarrage standard, mode watch et execution depuis `dist`. |
| `build` | Compilation TypeScript -> `dist/`. |
| `lint` | ESLint + Prettier (`eslint.config.mjs`). |
| `format` | Formatage Prettier (src & tests). |
| `test`, `test:watch`, `test:cov` | Tests unitaires avec Jest. |
| `test:e2e`, `test:e2e:watch` | Tests end-to-end (`test/jest-e2e.json`, bootstrap via `test/setup-e2e.ts`). |
| `test:db:reset`, `test:with-db` | Orchestration automatisee des migrations/seeds de test avant Jest. |
| `db:*` | Commandes Sequelize CLI (migrations/seeders pour dev & test). |

## Tests
- **Unitaires** : services majeurs (catalogue, contrats, tickets, couts, rapports, taxonomie, utilisateurs) sont couverts dans `test/*.spec.ts`.
- **End-to-end** : `test/users.e2e-spec.ts` et `test/app.e2e-spec.ts` demarrent un module Nest complet ; la configuration charge `.env.test` et logge la configuration Postgres pour controle.
- **Preparation** : utiliser `docker compose up -d postgres_test` ou un serveur Postgres local exposant `5433`.
- Les tests utilisent la meme logique d''authentification ; prevoir des fixtures / seeds pour manipuler des `admin_scopes` coherents.

## Authentification & autorisations
- `POST /api/auth/register` : creation d''un utilisateur occupant (hash Bcrypt, role `occupant`).
- `POST /api/auth/login` : authentification par email + mot de passe, delivre un JWT (`access_token`) et un payload utilisateur minimal.
- `GET /api/auth/me` : requiert `JwtAuthGuard`, retourne l''acteur courant injecte en requete (`req.actor`).
- Guards personnalises :
  - `JwtAuthGuard` (charge l''acteur via `AuthActorService` et attache les scopes admin).
  - `RequireAdminRoleGuard` (impose `role === 'admin'`).
  - `RequireAdminScopeGuard` + decorateur `@AdminScope(...)` (verifie la portee sur une entreprise / site / batiment via `AdminScopeEvaluatorService`).
- Donnees d''admin scope stockees dans `admin_scopes` (modele `AdminScope`) avec hierarchie `platform > company > site > building`.

## Domaines fonctionnels principaux (routes prefixees par `/api`)
### Referentiel & catalogue
- **Entreprises** (`CompaniesModule`) : `GET/POST/PATCH/DELETE /companies`.
- **Utilisateurs & equipes** (`DirectoryModule`, `UsersModule`) : gestion CRUD `users`, desactivation logique, jointures avec `companies` et `admin_scopes`.
- **Sites, batiments, localisations, assets** (`CatalogModule`) : `POST/GET/DELETE` sur `/sites`, `/buildings`, `/locations`, `/assets` avec filtres `companyId`.
- **Taxonomie & competences** (`TaxonomyModule`) : `POST/GET/DELETE /categories` et `/skills` pour qualifier les tickets.

### Cycle de vie des tickets
- **Tickets** (`TicketsModule`) : creation et consultation detaillee (`getWithTimeline`) via `POST /tickets`, `GET /tickets/:id`, filtrage par `siteId` et `status`.
- **Timeline** : evenements, commentaires, pieces jointes et liens de tickets charges en parallele (`TicketEvent`, `TicketComment`, `TicketAttachment`, `TicketLink`).
- **Routes imbriquees** :
  - `tickets/:id/approvals` (`ApprovalsModule`) pour la validation multi-niveaux.
  - `tickets/:id/costs` (`CostModule`) pour les couts & pieces (`TicketCost`, `TicketPart`).
  - `tickets/:id/surveys` (`SatisfactionModule`) pour les enquetes de satisfaction post-incident.

### Contrats, routage & SLA
- **Contrats & versions** (`ContractsModule`) : `POST/GET/DELETE /contracts`, associations aux sites et snapshots.
- **Routage** (`RoutingModule`) : `POST/GET/DELETE /routing_rules` pour aiguiller les tickets selon les contrats actifs.
- **SLA** (`SlaModule`) : modeles `SlaTarget` & `SlaBreach` disponibles pour calculer les delais d''accuse/resolution.

### Confort, bien-etre & reporting
- **Indicateurs de confort** (`ComfortModule`) : `POST /comfort_indicators`, `GET /comfort_indicators?location_id=`.
- **Scores de bien-etre** (`WellBeingModule`) : `GET /well_being_scores?site_id=`.
- **Rapports RSE** (`ReportsModule`) : `POST /rse_reports` (DTO `CreateRseReportDto`) pour consolider tickets fermes et moyenne de satisfaction par entreprise.

### Modules transverses
- `AttachmentsModule`, `CommentsModule`, `CalendarModule`, `CompetencyModule` : services utilitaires prets a etre exposes.
- Types Express personnalises (`src/types/express.d.ts`) pour typer `req.actor`.

## Conventions & qualite
- ESLint + Prettier : executer `npm run lint` et `npm run format` avant commit. Les regles specifiques gerent la compatibilite Windows (CRLF) et tolerent certains `any` controles.
- DTO valides automatiquement grace au `ValidationPipe` global (`whitelist`, `transform`).
- Les modeles Sequelize utilisent `underscored` et `timestamps` coherents pour assurer la conformite avec les migrations.
- Logger Nest (`bufferLogs`, niveaux complets) actif au demarrage : surveiller la console pour les diagnostics.

## Deploiement
- Construire : `npm run build`.
- Lancer en production : `NODE_ENV=production npm run start:prod` (necessite `DATABASE_URL` et `JWT_SECRET` configures).
- Activer `DB_SSL=true` pour une base managee necessitant TLS.
- Prevoir un Redis accessible si des workers BullMQ sont ajoutes.

## Ressources utiles
- [Documentation NestJS](https://docs.nestjs.com)
- [Sequelize + sequelize-typescript](https://docs.nestjs.com/recipes/sql-sequelize)
- [BullMQ](https://docs.bullmq.io/) pour la mise en place future de workers
- [Jest](https://jestjs.io/) & [Supertest](https://www.npmjs.com/package/supertest) pour l''outillage de tests

---

> Astuce : gardez `docker compose up -d postgres_dev postgres_test redis` actif pour developper, lancer les tests E2E et preparer les futures taches BullMQ sans reconfiguration.



