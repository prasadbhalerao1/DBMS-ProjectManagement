# Project Documentation Index

> All documentation for the Project Management application. Each guide is exhaustive and verified against the actual codebase.

---

## Documentation Files

| Document                                            | Description                         | Key Contents                                                                                                                                       |
| --------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Database Operations](./Database_Operations.md)     | Complete database reference         | Schema definitions (8 tables, 5 enums), all constraints, cascade rules, API endpoints (10), background jobs (8), middleware, env vars, route table |
| [SQL Equivalents Guide](./SQL_Equivalents_Guide.md) | PostgreSQL SQL for every operation  | CREATE TYPE, CREATE TABLE with indexes/FKs, INSERT/SELECT/UPDATE/DELETE for every Prisma call, migration commands                                  |
| [Data Flow Guide](./Data_Flow_Guide.md)             | Architecture & client documentation | Tech stack, bootstrap flow, auth flow, Redux state, component→API mapping for all 32 client components, error handling                             |
| [SRS](./SRS.md)                                     | Software Requirements Specification | Functional & non-functional requirements                                                                                                           |
| [ERD Diagram](./ERD_Diagram.md)                     | Entity-Relationship Diagram         | Chen's notation ER diagram                                                                                                                         |
| [ERD Guide](./ERD_Guide.md)                         | Detailed ERD explanation            | Comprehensive guide to the data model                                                                                                              |
| [Visual ERD](./Visual_ERD.md)                       | Visual ER Diagram                   | Mermaid-based visual representation                                                                                                                |

---

## Quick Reference

### Database Engine

**PostgreSQL** (hosted on Neon Serverless) via **Prisma ORM**

### Tables

`User` · `Workspace` · `WorkspaceMember` · `Project` · `ProjectMember` · `Task` · `Comment`

### API Endpoints (10 total)

| Method | Endpoint                      |
| ------ | ----------------------------- |
| `GET`  | `/api/workspaces`             |
| `POST` | `/api/workspaces/sync`        |
| `POST` | `/api/projects`               |
| `PUT`  | `/api/projects`               |
| `POST` | `/api/projects/:id/addMember` |
| `POST` | `/api/tasks`                  |
| `PUT`  | `/api/tasks/:id`              |
| `POST` | `/api/tasks/delete`           |
| `POST` | `/api/comments`               |
| `GET`  | `/api/comments/:taskId`       |
