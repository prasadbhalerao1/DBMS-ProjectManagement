# SQL Equivalents Guide — Complete Reference

> This document provides the **exact PostgreSQL SQL equivalent** for every database structure and operation in the codebase. The project uses **Prisma ORM** — every Prisma call below is shown alongside its raw SQL counterpart.

---

## 1. DDL — Schema Creation (CREATE TYPE & CREATE TABLE)

### 1.1 Enum Types

```sql
-- Prisma: enum WorkspaceRole { ADMIN MEMBER }
CREATE TYPE "WorkspaceRole" AS ENUM ('ADMIN', 'MEMBER');

-- Prisma: enum TaskStatus { TODO IN_PROGRESS DONE }
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- Prisma: enum TaskType { TASK BUG FEATURE IMPROVEMENT OTHER }
CREATE TYPE "TaskType" AS ENUM ('TASK', 'BUG', 'FEATURE', 'IMPROVEMENT', 'OTHER');

-- Prisma: enum ProjectStatus { ACTIVE PLANNING COMPLETED ON_HOLD CANCELLED }
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'PLANNING', 'COMPLETED', 'ON_HOLD', 'CANCELLED');

-- Prisma: enum Priority { LOW MEDIUM HIGH }
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
```

### 1.2 User Table

```sql
-- Prisma: model User
CREATE TABLE "User" (
    "id"        TEXT         NOT NULL,
    "name"      TEXT         NOT NULL,
    "email"     TEXT         NOT NULL,
    "image"     TEXT         NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
```

### 1.3 Workspace Table

```sql
-- Prisma: model Workspace
CREATE TABLE "Workspace" (
    "id"          TEXT         NOT NULL,
    "name"        TEXT         NOT NULL,
    "slug"        TEXT         NOT NULL,
    "description" TEXT,
    "settings"    JSONB        NOT NULL DEFAULT '{}',
    "ownerId"     TEXT         NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "image_url"   TEXT         NOT NULL DEFAULT '',
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Workspace_ownerId_fkey"
        FOREIGN KEY ("ownerId") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");
```

### 1.4 WorkspaceMember Table (Junction)

```sql
-- Prisma: model WorkspaceMember
CREATE TABLE "WorkspaceMember" (
    "id"          TEXT            NOT NULL DEFAULT gen_random_uuid(),
    "userId"      TEXT            NOT NULL,
    "workspaceId" TEXT            NOT NULL,
    "message"     TEXT            NOT NULL DEFAULT '',
    "role"        "WorkspaceRole" NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "WorkspaceMember_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkspaceMember_workspaceId_fkey"
        FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "WorkspaceMember_userId_workspaceId_key"
    ON "WorkspaceMember"("userId", "workspaceId");
```

### 1.5 Project Table

```sql
-- Prisma: model Project
CREATE TABLE "Project" (
    "id"          TEXT            NOT NULL DEFAULT gen_random_uuid(),
    "name"        TEXT            NOT NULL,
    "description" TEXT,
    "priority"    "Priority"      NOT NULL DEFAULT 'MEDIUM',
    "status"      "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "start_date"  TIMESTAMP(3),
    "end_date"    TIMESTAMP(3),
    "team_lead"   TEXT            NOT NULL,
    "workspaceId" TEXT            NOT NULL,
    "progress"    INTEGER         NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3)    NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Project_team_lead_fkey"
        FOREIGN KEY ("team_lead") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Project_workspaceId_fkey"
        FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);
```

### 1.6 ProjectMember Table (Junction)

```sql
-- Prisma: model ProjectMember
CREATE TABLE "ProjectMember" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId"    TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ProjectMember_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProjectMember_projectId_fkey"
        FOREIGN KEY ("projectId") REFERENCES "Project"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ProjectMember_userId_projectId_key"
    ON "ProjectMember"("userId", "projectId");
```

### 1.7 Task Table

```sql
-- Prisma: model Task
CREATE TABLE "Task" (
    "id"          TEXT         NOT NULL DEFAULT gen_random_uuid(),
    "projectId"   TEXT         NOT NULL,
    "title"       TEXT         NOT NULL,
    "description" TEXT,
    "status"      "TaskStatus" NOT NULL DEFAULT 'TODO',
    "type"        "TaskType"   NOT NULL DEFAULT 'TASK',
    "priority"    "Priority"   NOT NULL DEFAULT 'MEDIUM',
    "assigneeId"  TEXT         NOT NULL,
    "due_date"    TIMESTAMP(3) NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Task_projectId_fkey"
        FOREIGN KEY ("projectId") REFERENCES "Project"("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Task_assigneeId_fkey"
        FOREIGN KEY ("assigneeId") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);
```

### 1.8 Comment Table

```sql
-- Prisma: model Comment
CREATE TABLE "Comment" (
    "id"        TEXT         NOT NULL DEFAULT gen_random_uuid(),
    "content"   TEXT         NOT NULL,
    "userId"    TEXT         NOT NULL,
    "taskId"    TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Comment_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_taskId_fkey"
        FOREIGN KEY ("taskId") REFERENCES "Task"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);
```

---

## 2. DML — Query Equivalents (SELECT / INSERT / UPDATE / DELETE)

### 2.1 User Operations

#### Upsert User (syncWorkspaces & Inngest sync)

```javascript
// Prisma
await prisma.user.upsert({
  where: { id: userId },
  update: { name, email, image },
  create: { id: userId, name, email, image },
});
```

```sql
-- SQL equivalent (PostgreSQL UPSERT)
INSERT INTO "User" ("id", "name", "email", "image", "updatedAt")
VALUES ('user_123', 'John Doe', 'john@example.com', 'https://example.com/pic.jpg', NOW())
ON CONFLICT ("id")
DO UPDATE SET
    "name"      = EXCLUDED."name",
    "email"     = EXCLUDED."email",
    "image"     = EXCLUDED."image",
    "updatedAt" = NOW();
```

#### Create User (Inngest: clerk/user.created)

```javascript
await prisma.user.create({
  data: { id: data.id, email, name, image },
});
```

```sql
INSERT INTO "User" ("id", "name", "email", "image", "createdAt", "updatedAt")
VALUES ('user_123', 'John Doe', 'john@example.com', 'https://example.com/pic.jpg', NOW(), NOW());
```

#### Update User (Inngest: clerk/user.updated)

```javascript
await prisma.user.update({
  where: { id: data.id },
  data: { email, name, image },
});
```

```sql
UPDATE "User"
SET "name" = 'John Updated', "email" = 'newemail@example.com', "image" = 'https://example.com/new.jpg', "updatedAt" = NOW()
WHERE "id" = 'user_123';
```

#### Delete User (Inngest: clerk/user.deleted)

```javascript
await prisma.user.delete({ where: { id: data.id } });
```

```sql
-- Cascades delete all WorkspaceMembers, ProjectMembers, Tasks, Comments owned by this user
DELETE FROM "User" WHERE "id" = 'user_123';
```

#### Find User by Email (addMember)

```javascript
await prisma.user.findUnique({ where: { email } });
```

```sql
SELECT * FROM "User" WHERE "email" = 'john@example.com' LIMIT 1;
```

---

### 2.2 Workspace Operations

#### Find Workspaces for User (getUserWorkspaces)

```javascript
await prisma.workspace.findMany({
  where: { members: { some: { userId } } },
  include: {
    members: { include: { user: true } },
    projects: {
      include: {
        tasks: {
          include: { assignee: true, comments: { include: { user: true } } },
        },
        members: { include: { user: true } },
      },
    },
    owner: true,
  },
});
```

```sql
-- Main query
SELECT w.* FROM "Workspace" w
INNER JOIN "WorkspaceMember" wm ON wm."workspaceId" = w."id"
WHERE wm."userId" = 'user_123';

-- Related data (Prisma fetches these as separate queries)
SELECT u.* FROM "User" u
INNER JOIN "WorkspaceMember" wm ON wm."userId" = u."id"
WHERE wm."workspaceId" IN ('workspace_abc', 'workspace_xyz');

SELECT p.* FROM "Project" p WHERE p."workspaceId" IN ('workspace_abc', 'workspace_xyz');
SELECT t.* FROM "Task" t WHERE t."projectId" IN ('project_1', 'project_2');
SELECT c.* FROM "Comment" c WHERE c."taskId" IN ('task_1', 'task_2');
SELECT u.* FROM "User" u WHERE u."id" IN ('user_123', 'user_456');  -- owners, assignees, comment authors
```

#### Upsert Workspace (syncWorkspaces)

```javascript
await prisma.workspace.upsert({
  where: { id: orgId },
  update: { name, slug, image_url },
  create: { id: orgId, name, slug, image_url, ownerId },
});
```

```sql
INSERT INTO "Workspace" ("id", "name", "slug", "image_url", "ownerId", "settings", "createdAt", "updatedAt")
VALUES ('workspace_456', 'Engineering Team', 'engineering-team', 'https://example.com/logo.jpg', 'user_123', '{}', NOW(), NOW())
ON CONFLICT ("id")
DO UPDATE SET
    "name"      = EXCLUDED."name",
    "slug"      = EXCLUDED."slug",
    "image_url" = EXCLUDED."image_url",
    "updatedAt" = NOW();
```

#### Create Workspace (Inngest: clerk/organization.created)

```javascript
await prisma.workspace.create({
  data: { id, name, slug, ownerId, image_url },
});
```

```sql
INSERT INTO "Workspace" ("id", "name", "slug", "ownerId", "image_url", "settings", "createdAt", "updatedAt")
VALUES ('workspace_456', 'Design Team', 'design-team', 'user_123', 'https://example.com/logo.jpg', '{}', NOW(), NOW());
```

#### Update Workspace (Inngest: clerk/organization.updated)

```javascript
await prisma.workspace.update({
  where: { id },
  data: { name, slug, image_url },
});
```

```sql
UPDATE "Workspace"
SET "name" = 'Product Team', "slug" = 'product-team', "image_url" = 'https://example.com/new-logo.jpg', "updatedAt" = NOW()
WHERE "id" = 'workspace_456';
```

#### Delete Workspace (Inngest: clerk/organization.deleted)

```javascript
await prisma.workspace.delete({ where: { id } });
```

```sql
-- Cascades: deletes all Projects, WorkspaceMembers, and their children
DELETE FROM "Workspace" WHERE "id" = 'workspace_456';
```

---

### 2.3 WorkspaceMember Operations

#### Upsert Member (syncWorkspaces)

```javascript
await prisma.workspaceMember.upsert({
  where: { userId_workspaceId: { userId, workspaceId } },
  update: { role },
  create: { userId, workspaceId, role },
});
```

```sql
INSERT INTO "WorkspaceMember" ("id", "userId", "workspaceId", "role", "message")
VALUES (gen_random_uuid(), 'user_123', 'workspace_456', 'ADMIN', '')
ON CONFLICT ("userId", "workspaceId")
DO UPDATE SET "role" = EXCLUDED."role";
```

#### Create Member (Inngest: invitation accepted)

```javascript
await prisma.workspaceMember.create({
  data: { userId, workspaceId, role },
});
```

```sql
INSERT INTO "WorkspaceMember" ("id", "userId", "workspaceId", "role", "message")
VALUES (gen_random_uuid(), 'user_789', 'workspace_456', 'MEMBER', '');
```

#### Find Member for Permission Check

```javascript
await prisma.workspaceMember.findFirst({
  where: { userId, workspaceId, role: "ADMIN" },
});
```

```sql
SELECT * FROM "WorkspaceMember"
WHERE "userId" = 'user_123' AND "workspaceId" = 'workspace_456' AND "role" = 'ADMIN'
LIMIT 1;
```

---

### 2.4 Project Operations

#### Create Project

```javascript
await prisma.project.create({
  data: {
    workspaceId,
    name,
    description,
    status,
    priority,
    progress,
    team_lead,
    start_date,
    end_date,
  },
});
```

```sql
INSERT INTO "Project" (
    "id", "workspaceId", "name", "description", "status", "priority",
    "progress", "team_lead", "start_date", "end_date", "createdAt", "updatedAt"
)
VALUES (
    gen_random_uuid(), 'workspace_456', 'Website Redesign', 'Redesigning the company landing page',
    'ACTIVE'::"ProjectStatus", 'HIGH'::"Priority",
    0, 'user_123', '2023-01-01 00:00:00', '2023-06-01 00:00:00', NOW(), NOW()
);
```

#### Update Project

```javascript
await prisma.project.update({
  where: { id },
  data: {
    workspaceId,
    description,
    name,
    status,
    priority,
    progress,
    start_date,
    end_date,
  },
});
```

```sql
UPDATE "Project"
SET "workspaceId" = 'workspace_456', "name" = 'Website V2', "description" = 'Phase 2 of redesign',
    "status" = 'PLANNING'::"ProjectStatus", "priority" = 'MEDIUM'::"Priority",
    "progress" = 20, "start_date" = '2023-02-01 00:00:00', "end_date" = '2023-08-01 00:00:00', "updatedAt" = NOW()
WHERE "id" = 'project_789';
```

#### Find Project by ID with Relations

```javascript
await prisma.project.findUnique({
  where: { id },
  include: { members: { include: { user: true } }, owner: true, tasks: true },
});
```

```sql
SELECT p.*, u.* FROM "Project" p
INNER JOIN "User" u ON u."id" = p."team_lead"
WHERE p."id" = 'project_789';

SELECT pm.*, u.* FROM "ProjectMember" pm
INNER JOIN "User" u ON u."id" = pm."userId"
WHERE pm."projectId" = 'project_789';

SELECT * FROM "Task" WHERE "projectId" = 'project_789';
```

#### Check Project Ownership

```javascript
await prisma.project.findFirst({
  where: { id, team_lead: userId },
});
```

```sql
SELECT * FROM "Project"
WHERE "id" = 'project_789' AND "team_lead" = 'user_123'
LIMIT 1;
```

---

### 2.5 ProjectMember Operations

#### Bulk Create Members

```javascript
await prisma.projectMember.createMany({
  data: membersToAdd.map((memberId) => ({
    projectId: project.id,
    userId: memberId,
  })),
});
```

```sql
INSERT INTO "ProjectMember" ("id", "userId", "projectId")
VALUES
    (gen_random_uuid(), 'user_123', 'project_789'),
    (gen_random_uuid(), 'user_456', 'project_789');
```

#### Add Single Member

```javascript
await prisma.projectMember.create({
  data: { userId: user.id, projectId },
});
```

```sql
INSERT INTO "ProjectMember" ("id", "userId", "projectId")
VALUES (gen_random_uuid(), 'user_789', 'project_789');
```

#### Check Project Membership

```javascript
await prisma.projectMember.findFirst({
  where: { userId, projectId },
});
```

```sql
SELECT * FROM "ProjectMember"
WHERE "userId" = 'user_123' AND "projectId" = 'project_789'
LIMIT 1;
```

---

### 2.6 Task Operations

#### Create Task

```javascript
await prisma.task.create({
  data: {
    projectId,
    title,
    description,
    type,
    priority,
    assigneeId,
    status,
    due_date: new Date(due_date),
  },
});
```

```sql
INSERT INTO "Task" (
    "id", "projectId", "title", "description", "type", "priority",
    "assigneeId", "status", "due_date", "createdAt", "updatedAt"
)
VALUES (
    gen_random_uuid(), 'project_789', 'Fix Login Bug', 'Users cannot log in via Google',
    'BUG'::"TaskType", 'HIGH'::"Priority",
    'user_456', 'TODO'::"TaskStatus", '2023-01-15 00:00:00', NOW(), NOW()
);
```

#### Update Task

```javascript
await prisma.task.update({
  where: { id },
  data: req.body,
});
```

```sql
-- Example: updating status and priority
UPDATE "Task"
SET "status" = 'IN_PROGRESS'::"TaskStatus", "priority" = 'MEDIUM'::"Priority", "updatedAt" = NOW()
WHERE "id" = 'task_abc';
```

#### Delete Multiple Tasks

```javascript
await prisma.task.deleteMany({
  where: { id: { in: tasksIds } },
});
```

```sql
-- Cascades: deletes all comments on these tasks
DELETE FROM "Task" WHERE "id" IN ('task_abc', 'task_def', 'task_ghi');
```

#### Find Task by ID (for permission checks)

```javascript
await prisma.task.findUnique({ where: { id } });
```

```sql
SELECT * FROM "Task" WHERE "id" = 'task_abc';
```

#### Find Task with Relations (email notification)

```javascript
await prisma.task.findUnique({
  where: { id: taskId },
  include: { assignee: true, project: true },
});
```

```sql
SELECT t.*, u.*, p.*
FROM "Task" t
INNER JOIN "User" u ON u."id" = t."assigneeId"
INNER JOIN "Project" p ON p."id" = t."projectId"
WHERE t."id" = 'task_abc';
```

---

### 2.7 Comment Operations

#### Create Comment

```javascript
await prisma.comment.create({
  data: { taskId, content, userId },
  include: { user: true },
});
```

```sql
INSERT INTO "Comment" ("id", "taskId", "content", "userId", "createdAt")
VALUES (gen_random_uuid(), 'task_abc', 'I am working on this now.', 'user_456', NOW())
RETURNING *;

-- Then join with user
SELECT c.*, u.* FROM "Comment" c
INNER JOIN "User" u ON u."id" = c."userId"
WHERE c."id" = 'comment_xyz';
```

#### Get Comments for Task

```javascript
await prisma.comment.findMany({
  where: { taskId },
  include: { user: true },
});
```

```sql
SELECT c.*, u.*
FROM "Comment" c
INNER JOIN "User" u ON u."id" = c."userId"
WHERE c."taskId" = 'task_abc'
ORDER BY c."createdAt" ASC;
```

---

## 3. Migration Logic

Prisma manages migrations via **`prisma migrate dev`** and **`prisma migrate deploy`**. Migrations are stored as timestamped SQL files in `server/prisma/migrations/`. Each migration is a raw `.sql` file containing the DDL shown in Section 1.

Key migration commands:

```bash
# Generate and apply a new migration during development
npx prisma migrate dev --name <migration_name>

# Apply pending migrations in production
npx prisma migrate deploy

# Generate Prisma Client (after schema changes)
npx prisma generate
```

---

## 4. What This Project Does NOT Have

For full transparency, the following database features are **not implemented** in this project:

| Feature                 | Status                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| Triggers                | ❌ Not used — business logic is in controllers                                                  |
| Stored Procedures       | ❌ Not used — equivalent logic is in JavaScript controllers                                     |
| Custom Indexes          | ❌ Only auto-generated indexes from `@unique` and FK constraints                                |
| Transactions (explicit) | ❌ No explicit `prisma.$transaction()` calls — operations are simple enough to not require them |
| Database Views          | ❌ Not used                                                                                     |
| Database Functions      | ❌ Not used                                                                                     |
| Soft Deletes            | ❌ All deletes are hard deletes with CASCADE                                                    |
