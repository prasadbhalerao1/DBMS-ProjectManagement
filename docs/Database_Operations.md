# Database Operations — Complete Reference

> **Database Engine:** PostgreSQL (via Neon Serverless)
> **ORM:** Prisma Client (`@prisma/client` v6.18.0)
> **Schema File:** [`server/prisma/schema.prisma`](file:///d:/Programming/Projects/Project%20Management/project-management/server/prisma/schema.prisma)

---

## 1. Complete Schema Definition

### 1.1 Enum Types

The schema defines 5 enum types used across multiple tables:

| Enum            | Values                                                    | Used By                             |
| --------------- | --------------------------------------------------------- | ----------------------------------- |
| `WorkspaceRole` | `ADMIN`, `MEMBER`                                         | `WorkspaceMember.role`              |
| `TaskStatus`    | `TODO`, `IN_PROGRESS`, `DONE`                             | `Task.status`                       |
| `TaskType`      | `TASK`, `BUG`, `FEATURE`, `IMPROVEMENT`, `OTHER`          | `Task.type`                         |
| `ProjectStatus` | `ACTIVE`, `PLANNING`, `COMPLETED`, `ON_HOLD`, `CANCELLED` | `Project.status`                    |
| `Priority`      | `LOW`, `MEDIUM`, `HIGH`                                   | `Project.priority`, `Task.priority` |

---

### 1.2 Table: `User`

| Column      | Type           | Constraints          | Default             |
| ----------- | -------------- | -------------------- | ------------------- |
| `id`        | `TEXT`         | `PRIMARY KEY`        | — (set by Clerk)    |
| `name`      | `TEXT`         | `NOT NULL`           | —                   |
| `email`     | `TEXT`         | `NOT NULL`, `UNIQUE` | —                   |
| `image`     | `TEXT`         | `NOT NULL`           | `""`                |
| `createdAt` | `TIMESTAMP(3)` | `NOT NULL`           | `CURRENT_TIMESTAMP` |
| `updatedAt` | `TIMESTAMP(3)` | `NOT NULL`           | Auto-updated        |

**Relationships (1:N):**

- `User` → `WorkspaceMember[]` (a user can be a member of many workspaces)
- `User` → `Project[]` via `team_lead` (a user can lead many projects)
- `User` → `Task[]` via `assigneeId` (a user can be assigned many tasks)
- `User` → `Comment[]` (a user can write many comments)
- `User` → `Workspace[]` via `ownerId` (a user can own many workspaces)
- `User` → `ProjectMember[]` (a user can be a member of many projects)

---

### 1.3 Table: `Workspace`

| Column        | Type           | Constraints                          | Default                 |
| ------------- | -------------- | ------------------------------------ | ----------------------- |
| `id`          | `TEXT`         | `PRIMARY KEY`                        | — (set by Clerk Org ID) |
| `name`        | `TEXT`         | `NOT NULL`                           | —                       |
| `slug`        | `TEXT`         | `NOT NULL`, `UNIQUE`                 | —                       |
| `description` | `TEXT`         | Nullable                             | —                       |
| `settings`    | `JSON`         | `NOT NULL`                           | `"{}"`                  |
| `ownerId`     | `TEXT`         | `NOT NULL`, `FOREIGN KEY → User(id)` | —                       |
| `createdAt`   | `TIMESTAMP(3)` | `NOT NULL`                           | `CURRENT_TIMESTAMP`     |
| `image_url`   | `TEXT`         | `NOT NULL`                           | `""`                    |
| `updatedAt`   | `TIMESTAMP(3)` | `NOT NULL`                           | Auto-updated            |

**Foreign Keys:**

- `ownerId` → `User(id)` — `ON DELETE CASCADE`

**Relationships:**

- `Workspace` → `WorkspaceMember[]`
- `Workspace` → `Project[]`

---

### 1.4 Table: `WorkspaceMember` (Junction Table — User ↔ Workspace)

| Column        | Type            | Constraints                      | Default  |
| ------------- | --------------- | -------------------------------- | -------- |
| `id`          | `TEXT`          | `PRIMARY KEY`                    | `uuid()` |
| `userId`      | `TEXT`          | `NOT NULL`, `FK → User(id)`      | —        |
| `workspaceId` | `TEXT`          | `NOT NULL`, `FK → Workspace(id)` | —        |
| `message`     | `TEXT`          | `NOT NULL`                       | `""`     |
| `role`        | `WorkspaceRole` | `NOT NULL`                       | `MEMBER` |

**Unique Constraint:** `@@unique([userId, workspaceId])` — prevents duplicate membership.
**Cascade Rules:** Both `userId` and `workspaceId` — `ON DELETE CASCADE`.

---

### 1.5 Table: `Project`

| Column        | Type            | Constraints                      | Default             |
| ------------- | --------------- | -------------------------------- | ------------------- |
| `id`          | `TEXT`          | `PRIMARY KEY`                    | `uuid()`            |
| `name`        | `TEXT`          | `NOT NULL`                       | —                   |
| `description` | `TEXT`          | Nullable                         | —                   |
| `priority`    | `Priority`      | `NOT NULL`                       | `MEDIUM`            |
| `status`      | `ProjectStatus` | `NOT NULL`                       | `ACTIVE`            |
| `start_date`  | `TIMESTAMP(3)`  | Nullable                         | —                   |
| `end_date`    | `TIMESTAMP(3)`  | Nullable                         | —                   |
| `team_lead`   | `TEXT`          | `NOT NULL`, `FK → User(id)`      | —                   |
| `workspaceId` | `TEXT`          | `NOT NULL`, `FK → Workspace(id)` | —                   |
| `progress`    | `INTEGER`       | `NOT NULL`                       | `0`                 |
| `createdAt`   | `TIMESTAMP(3)`  | `NOT NULL`                       | `CURRENT_TIMESTAMP` |
| `updatedAt`   | `TIMESTAMP(3)`  | `NOT NULL`                       | Auto-updated        |

**Foreign Keys:**

- `team_lead` → `User(id)` — `ON DELETE CASCADE`
- `workspaceId` → `Workspace(id)` — `ON DELETE CASCADE`

**Relationships:**

- `Project` → `ProjectMember[]`
- `Project` → `Task[]`

---

### 1.6 Table: `ProjectMember` (Junction Table — User ↔ Project)

| Column      | Type   | Constraints                    | Default  |
| ----------- | ------ | ------------------------------ | -------- |
| `id`        | `TEXT` | `PRIMARY KEY`                  | `uuid()` |
| `userId`    | `TEXT` | `NOT NULL`, `FK → User(id)`    | —        |
| `projectId` | `TEXT` | `NOT NULL`, `FK → Project(id)` | —        |

**Unique Constraint:** `@@unique([userId, projectId])` — prevents duplicate membership.
**Cascade Rules:** Both FKs — `ON DELETE CASCADE`.

---

### 1.7 Table: `Task`

| Column        | Type           | Constraints                    | Default             |
| ------------- | -------------- | ------------------------------ | ------------------- |
| `id`          | `TEXT`         | `PRIMARY KEY`                  | `uuid()`            |
| `projectId`   | `TEXT`         | `NOT NULL`, `FK → Project(id)` | —                   |
| `title`       | `TEXT`         | `NOT NULL`                     | —                   |
| `description` | `TEXT`         | Nullable                       | —                   |
| `status`      | `TaskStatus`   | `NOT NULL`                     | `TODO`              |
| `type`        | `TaskType`     | `NOT NULL`                     | `TASK`              |
| `priority`    | `Priority`     | `NOT NULL`                     | `MEDIUM`            |
| `assigneeId`  | `TEXT`         | `NOT NULL`, `FK → User(id)`    | —                   |
| `due_date`    | `TIMESTAMP(3)` | `NOT NULL`                     | —                   |
| `createdAt`   | `TIMESTAMP(3)` | `NOT NULL`                     | `CURRENT_TIMESTAMP` |
| `updatedAt`   | `TIMESTAMP(3)` | `NOT NULL`                     | Auto-updated        |

**Foreign Keys:**

- `projectId` → `Project(id)` — `ON DELETE CASCADE`
- `assigneeId` → `User(id)` — `ON DELETE CASCADE`

**Relationships:**

- `Task` → `Comment[]`

---

### 1.8 Table: `Comment`

| Column      | Type           | Constraints                 | Default             |
| ----------- | -------------- | --------------------------- | ------------------- |
| `id`        | `TEXT`         | `PRIMARY KEY`               | `uuid()`            |
| `content`   | `TEXT`         | `NOT NULL`                  | —                   |
| `userId`    | `TEXT`         | `NOT NULL`, `FK → User(id)` | —                   |
| `taskId`    | `TEXT`         | `NOT NULL`, `FK → Task(id)` | —                   |
| `createdAt` | `TIMESTAMP(3)` | `NOT NULL`                  | `CURRENT_TIMESTAMP` |

**Foreign Keys:**

- `userId` → `User(id)` — `ON DELETE CASCADE`
- `taskId` → `Task(id)` — `ON DELETE CASCADE`

---

### 1.9 Relationship Summary Diagram

```
User (1) ──────── (N) WorkspaceMember (N) ──────── (1) Workspace
User (1) ──────── (N) ProjectMember   (N) ──────── (1) Project
User (1) ──────── (N) Task
User (1) ──────── (N) Comment
User (1) ──────── (N) Project          (via team_lead)
User (1) ──────── (N) Workspace        (via ownerId)
Workspace (1) ─── (N) Project
Project (1) ───── (N) Task
Task (1) ──────── (N) Comment
```

**Note:** There are no database triggers, stored procedures, or custom indexes defined in this schema. Prisma auto-generates indexes for `@unique` constraints and foreign keys.

---

## 2. API Operations (Controllers)

### 2.1 Workspace Controller (`server/controllers/workspaceController.js`)

#### `getUserWorkspaces` — `GET /api/workspaces`

**Auth:** Required (via `protect` middleware)
**Request Body:** None
**Response:** `200` — Array of workspace objects with nested members, projects, tasks, comments, and owner.
**Failure Scenarios:**

- `401 Unauthorized`: Missing or invalid Bearer token.
- `500 Server Error`: Database connection failure or query error.

```javascript
const workspaces = await prisma.workspace.findMany({
  where: { members: { some: { userId: userId } } },
  include: {
    members: { include: { user: true } },
    projects: {
      include: {
        tasks: {
          include: {
            assignee: true,
            comments: { include: { user: true } },
          },
        },
        members: { include: { user: true } },
      },
    },
    owner: true,
  },
});
```

#### `syncWorkspaces` — `POST /api/workspaces/sync`

**Auth:** Required
**Request Body:** None (uses `req.auth.userId`)
**Response:** `200` — Full workspaces list (same structure as `getUserWorkspaces`)
**Failure Scenarios:**

- `401 Unauthorized`: Missing or invalid Bearer token.
- `500 Server Error`: Clerk API failure (rate limit/timeout) or database upsert failure.

**Logic:** Fetches user data and organization memberships from Clerk API, then upserts:

```javascript
// 1. Upsert the authenticated User
await prisma.user.upsert({
  where: { id: userId },
  update: { name, email, image },
  create: { id: userId, name, email, image },
});

// 2. For each Clerk organization membership:
for (const membership of memberships.data) {
  // Upsert the org owner
  await prisma.user.upsert({ ... });
  // Upsert the Workspace
  await prisma.workspace.upsert({
    where: { id: org.id },
    update: { name, slug, image_url },
    create: { id: org.id, name, slug, image_url, ownerId },
  });
  // Upsert the WorkspaceMember
  await prisma.workspaceMember.upsert({
    where: { userId_workspaceId: { userId, workspaceId: org.id } },
    update: { role },
    create: { userId, workspaceId: org.id, role },
  });
}
```

---

### 2.2 Project Controller (`server/controllers/projectController.js`)

#### `createProject` — `POST /api/projects`

**Auth:** Required
**Request Body:**

```json
{
  "workspaceId": "string",
  "name": "string",
  "description": "string (optional)",
  "status": "ProjectStatus",
  "priority": "Priority",
  "progress": "number",
  "team_lead": { "id": "string", "name": "string", "email": "string" },
  "start_date": "ISO date string (optional)",
  "end_date": "ISO date string (optional)",
  "team_members": ["userId1", "userId2"]
}
```

**Permission Check:** User must be `ADMIN` in the workspace.
**Response:** `201` — `{ project }` (with members and owner included)
**Errors:** `403` — Not admin | `500` — Server error

**Failure Scenarios:**

- `401 Unauthorized`: Missing or invalid token.
- `404 Not Found`: "Workspace not found" if `workspaceId` is invalid.
- `403 Forbidden`: "You don't have permission to create projects in this workspace" (User is not `ADMIN`).
- `500 Server Error`: Database constraint violation or connection error.

```javascript
// 1. Check workspace admin role
const workspaceMember = await prisma.workspaceMember.findFirst({
  where: { userId, workspaceId, role: "ADMIN" },
});

// 2. Create project
const project = await prisma.project.create({
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

// 3. Add team members (bulk)
await prisma.projectMember.createMany({
  data: membersToAdd.map((memberId) => ({
    projectId: project.id,
    userId: memberId,
  })),
});

// 4. Fetch and return with relations
const updatedProject = await prisma.project.findUnique({
  where: { id: project.id },
  include: { members: { include: { user: true } }, owner: true, tasks: true },
});
```

#### `updateProject` — `PUT /api/projects`

**Auth:** Required
**Request Body:**

```json
{
  "id": "string",
  "workspaceId": "string",
  "name": "string",
  "description": "string",
  "status": "ProjectStatus",
  "priority": "Priority",
  "progress": "number",
  "start_date": "ISO date string (optional)",
  "end_date": "ISO date string (optional)"
}
```

**Permission Check:** User must be `ADMIN` in the workspace OR `team_lead` of the project.
**Response:** `200` — `{ project }` (with tasks, members, owner)
**Errors:** `403` — Not authorized | `500` — Server error

**Failure Scenarios:**

- `404 Not Found`: "Workspace not found" (invalid `workspaceId`).
- `404 Not Found`: "Project not found" (invalid `id`).
- `403 Forbidden`: "You don't have permission to update projects in this workspace" (Not Admin AND Not Team Lead).
- `500 Server Error`: Database error.

```javascript
// Permission check
const workspaceMember = await prisma.workspaceMember.findFirst({ where: { userId, workspaceId, role: "ADMIN" } });
const projectOwner = await prisma.project.findFirst({ where: { id, team_lead: userId } });
if (!workspaceMember && !projectOwner) return res.status(403)...

const project = await prisma.project.update({
  where: { id },
  data: { workspaceId, description, name, status, priority, progress, start_date, end_date },
});
```

#### `addMember` — `POST /api/projects/:projectId/addMember`

**Auth:** Required
**Request Body:** `{ "email": "string" }`
**Permission Check:** User must be `ADMIN` in the project's workspace.
**Response:** `200` — `{ member, message }`
**Failure Scenarios:**

- `404 Not Found`: "Project not found".
- `404 Not Found`: "Only project lead can add members" (Technically a permission error, but returns 404 in code).
- `400 Bad Request`: "User is already a member".
- `404 Not Found`: "User not found" (Email doesn't exist in system).
- `500 Server Error`: Database error.

```javascript
// 1. Find user by email
const user = await prisma.user.findUnique({ where: { email } });

// 2. Verify admin permission
const workspaceMember = await prisma.workspaceMember.findFirst({
  where: { userId, workspaceId: project.workspaceId, role: "ADMIN" },
});

// 3. Check existing membership
const existingMember = await prisma.projectMember.findFirst({
  where: { userId: user.id, projectId },
});

// 4. Create membership
const member = await prisma.projectMember.create({
  data: { userId: user.id, projectId },
});
```

---

### 2.3 Task Controller (`server/controllers/taskController.js`)

#### `createTask` — `POST /api/tasks`

**Auth:** Required
**Request Body:**

```json
{
  "projectId": "string",
  "workspaceId": "string",
  "title": "string",
  "description": "string (optional)",
  "type": "TaskType",
  "priority": "Priority",
  "assigneeId": "string",
  "status": "TaskStatus",
  "due_date": "ISO date string"
}
```

**Permission Check:** User must be a member of the project (`ProjectMember`).
**Response:** `201` — `{ task }` (with assignee included)
**Side Effect:** Sends Inngest event `app/task.assigned` for email notification.
**Errors:** `403` — Not a member | `500` — Server error

**Failure Scenarios:**

- `404 Not Found`: "Project not found".
- `403 Forbidden`: "You don't have admin privileges for this project" (if user is not team lead).
- `403 Forbidden`: "assignee is not a member of the project / workspace".
- `500 Server Error`: Inngest failure or database error.

```javascript
// 1. Check project membership
const projectMember = await prisma.projectMember.findFirst({
  where: { userId, projectId },
});

// 2. Create task
const task = await prisma.task.create({
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

// 3. Trigger email notification via Inngest
await inngest.send({ name: "app/task.assigned", data: { taskId: task.id } });

// 4. Fetch with assignee
const taskWithAssignee = await prisma.task.findUnique({
  where: { id: task.id },
  include: { assignee: true },
});
```

#### `updateTask` — `PUT /api/tasks/:id`

**Auth:** Required
**Request Body:** Any subset of Task fields.
**Permission Check:** User must be a member of the task's project.
**Response:** `200` — `{ task }` (with assignee)
**Failure Scenarios:**

- `404 Not Found`: "Task not found".
- `404 Not Found`: "Project not found" (if task's project is missing).
- `403 Forbidden`: "You don't have admin privileges for this project" (checks team lead).
- `500 Server Error`: Database error.

```javascript
// 1. Verify project membership
const task = await prisma.task.findUnique({ where: { id: req.params.id } });
const projectMember = await prisma.projectMember.findFirst({
  where: { userId, projectId: task.projectId },
});

// 2. Update
const updatedTask = await prisma.task.update({
  where: { id: req.params.id },
  data: req.body,
});
```

#### `deleteTask` — `POST /api/tasks/delete`

**Auth:** Required
**Request Body:** `{ "tasksIds": ["id1", "id2"], "projectId": "string", "workspaceId": "string" }`
**Permission Check:** User must be `ADMIN` in the workspace.
**Response:** `200` — `{ message: "Tasks deleted successfully" }`
**Failure Scenarios:**

- `404 Not Found`: "Task not found" (if `tasksIds` array is empty or no tasks found).
- `404 Not Found`: "Project not found".
- `403 Forbidden`: "You don't have admin privileges for this project".
- `500 Server Error`: Database error.

```javascript
const workspaceMember = await prisma.workspaceMember.findFirst({
  where: { userId, workspaceId, role: "ADMIN" },
});

await prisma.task.deleteMany({
  where: { id: { in: tasksIds } },
});
```

---

### 2.4 Comment Controller (`server/controllers/commentController.js`)

#### `addComment` — `POST /api/comments`

**Auth:** Required
**Request Body:** `{ "taskId": "string", "content": "string" }`
**Permission Check:** User must be a member of the task's project.
**Response:** `201` — `{ comment }` (with user included)
**Failure Scenarios:**

- `404 Not Found`: "Project not found".
- `403 Forbidden`: "You are not member of this project".
- `500 Server Error`: Database error.

```javascript
const task = await prisma.task.findUnique({ where: { id: taskId } });
const projectMember = await prisma.projectMember.findFirst({
  where: { userId, projectId: task.projectId },
});

const comment = await prisma.comment.create({
  data: { taskId, content, userId },
  include: { user: true },
});
```

#### `getTaskComments` — `GET /api/comments/:taskId`

**Auth:** Required
**Request Params:** `taskId`
**Permission Check:** User must be a member of the task's project.
**Response:** `200` — Array of comment objects (with user included)
**Failure Scenarios:**

- `500 Server Error`: Database error.
- _Note:_ Returns empty array `[]` if task or comments do not exist.

```javascript
const task = await prisma.task.findUnique({ where: { id: taskId } });
const projectMember = await prisma.projectMember.findFirst({
  where: { userId, projectId: task.projectId },
});

const comments = await prisma.comment.findMany({
  where: { taskId },
  include: { user: true },
});
```

---

## 3. Background Jobs (Inngest — `server/inngest/index.js`)

### 3.1 `syncUserCreation` — Event: `clerk/user.created`

```javascript
await prisma.user.create({
  data: { id: data.id, email, name, image },
});
```

### 3.2 `syncUserUpdation` — Event: `clerk/user.updated`

```javascript
await prisma.user.update({
  where: { id: data.id },
  data: { email, name, image },
});
```

### 3.3 `syncUserDeletion` — Event: `clerk/user.deleted`

```javascript
await prisma.user.delete({ where: { id: data.id } });
```

### 3.4 `syncWorkspaceCreation` — Event: `clerk/organization.created`

```javascript
await prisma.workspace.create({
  data: { id: data.id, name, slug, ownerId: data.created_by, image_url },
});
await prisma.workspaceMember.create({
  data: { userId: data.created_by, workspaceId: data.id, role: "ADMIN" },
});
```

### 3.5 `syncWorkspaceUpdation` — Event: `clerk/organization.updated`

```javascript
await prisma.workspace.update({
  where: { id: data.id },
  data: { name, slug, image_url },
});
```

### 3.6 `syncWorkspaceDeletion` — Event: `clerk/organization.deleted`

```javascript
await prisma.workspace.delete({ where: { id: data.id } });
```

### 3.7 `syncWorkspaceMemberCreation` — Event: `clerk/organizationInvitation.accepted`

```javascript
await prisma.workspaceMember.create({
  data: { userId: data.user_id, workspaceId: data.organization_id, role },
});
```

### 3.8 `sendBookingConfirmationEmail` — Event: `app/task.assigned`

```javascript
const task = await prisma.task.findUnique({
  where: { id: taskId },
  include: { assignee: true, project: true },
});
// Uses nodemailer to send email to task.assignee.email
```

---

## 4. Middleware & Auth

### Auth Middleware (`server/middlewares/authMiddleware.js`)

All API routes (except `/api/inngest`) are protected by the `protect` middleware:

```javascript
export const protect = (req, res, next) => {
  const { userId } = req.auth;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  next();
};
```

Clerk's `clerkMiddleware()` is applied globally in `server.js` to populate `req.auth`.

---

## 5. Server Configuration

### Environment Variables (Server)

| Variable              | Purpose                               | Used In                       |
| --------------------- | ------------------------------------- | ----------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string (pooled) | `prisma.js`                   |
| `DIRECT_URL`          | PostgreSQL direct connection          | `schema.prisma`               |
| `CLERK_SECRET_KEY`    | Clerk backend API key                 | Clerk SDK                     |
| `SMTP_USER`           | SMTP username (Brevo)                 | `nodemailer.js`               |
| `SMTP_PASS`           | SMTP password (Brevo)                 | `nodemailer.js`               |
| `SENDER_EMAIL`        | From address for emails               | `nodemailer.js`               |
| `INNGEST_EVENT_KEY`   | Inngest event key                     | `inngest/index.js`            |
| `INNGEST_SIGNING_KEY` | Inngest webhook signing               | `inngest/index.js`            |
| `PORT`                | Server port                           | `server.js` (default: `5000`) |

### Environment Variables (Client)

| Variable                     | Purpose              | Used In          |
| ---------------------------- | -------------------- | ---------------- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk frontend key   | `main.jsx`       |
| `VITE_API_URL`               | Backend API base URL | `configs/api.js` |

---

## 6. Route Definitions

| Method | Route                                | Controller            | Auth          |
| ------ | ------------------------------------ | --------------------- | ------------- |
| `GET`  | `/api/workspaces`                    | `getUserWorkspaces`   | ✅            |
| `POST` | `/api/workspaces/sync`               | `syncWorkspaces`      | ✅            |
| `POST` | `/api/projects`                      | `createProject`       | ✅            |
| `PUT`  | `/api/projects`                      | `updateProject`       | ✅            |
| `POST` | `/api/projects/:projectId/addMember` | `addMember`           | ✅            |
| `POST` | `/api/tasks`                         | `createTask`          | ✅            |
| `PUT`  | `/api/tasks/:id`                     | `updateTask`          | ✅            |
| `POST` | `/api/tasks/delete`                  | `deleteTask`          | ✅            |
| `POST` | `/api/comments`                      | `addComment`          | ✅            |
| `GET`  | `/api/comments/:taskId`              | `getTaskComments`     | ✅            |
| `*`    | `/api/inngest`                       | Inngest serve handler | ❌ (webhooks) |
