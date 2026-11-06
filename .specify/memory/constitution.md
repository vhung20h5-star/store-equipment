# HomeNest Store Equipment Constitution

## Core Principles

### I. Monorepo & Domain-Driven Modularity
The repository MUST maintain strict separation between `/backend` (Spring Boot 3.4.3, Java 21+) and `/frontend` (React 19, Vite 8, TypeScript). Within both applications, code MUST be organized by business domain (`auth`, `catalog`, `cart`, `order`, `promotion`, `content`, `security`, `common`) with clear boundaries and zero circular dependencies.

### II. Role-Based Access Control & Data Ownership
Every endpoint and UI view handling sensitive customer or order data MUST enforce explicit access rules. Authenticated users (`ROLE_USER`) may only view or mutate their own linked records (`user_id`). Guest users may only access or cancel an order by providing both the unique `orderNumber` and matching `customerPhone`. Administrative operations (`ROLE_ADMIN`) MUST be guarded at both the Spring Security filter/method level and the UI layer.

### III. State Machine & Inventory Integrity (NON-NEGOTIABLE)
Order status transitions MUST follow a deterministic, unidirectional state machine (`CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`, with `CANCELLED` permitted only from `CONFIRMED` for customers/guests and from `CONFIRMED` or `PROCESSING` for administrators). All stock deductions and cancellations/restocks MUST execute inside database transactions using pessimistic row-level locking (`PESSIMISTIC_WRITE`) and enforce idempotency to prevent double-deduction or double-restock under concurrent requests.

### IV. Automated Integration Testing
Every new backend domain rule, state transition, permission boundary, and inventory restock path MUST be verified by automated Spring Boot `@SpringBootTest` + `MockMvc` integration tests running against H2 in-memory database. Every frontend change MUST pass strict TypeScript compilation (`tsc`) and ESLint checks (`npm run lint && npm run build`).

### V. Backward Compatibility & Schema Evolution
Database schema changes MUST be delivered strictly as append-only Flyway migrations (`V1`..`Vn`) without mutating historical migration files. API contracts MUST preserve `ApiResponse<T>` envelope semantics and remain backward-compatible with existing guest checkout and lookup flows.

## Architecture & Security Constraints

- **Authentication**: Stateless JWT (`HS256`) carried via `Authorization: Bearer <token>` header.
- **Database**: PostgreSQL 16 in development/production, H2 (PostgreSQL compatibility mode) in automated tests, managed by Flyway.
- **Concurrency**: Product stock mutations (`createOrder`, `cancelOrder`) MUST acquire `PESSIMISTIC_WRITE` locks via `ProductRepository.findByIdWithLock`.

## Development Workflow & Quality Gates

1. **Spec-First**: Features begin with an unambiguous specification (`spec.md`) and quality checklist (`checklists/requirements.md`).
2. **Plan & Contracts**: Technical design (`plan.md`, `data-model.md`, `contracts/`) and dependency-ordered tasks (`tasks.md`) are established before coding.
3. **Verification Gate**: All backend integration tests (`./mvnw clean test`) and frontend build/lint checks (`npm run lint && npm run build`) MUST pass with zero errors prior to PR review.

## Governance

This Constitution governs all architectural, security, and implementation decisions across the HomeNest repository. All specifications, technical plans, task breakdowns, and pull request reviews MUST verify compliance with these principles. Amendments require a semantic version increment and documented rationale.

**Version**: 1.0.0 | **Ratified**: 2026-11-06 | **Last Amended**: 2026-11-06
