# ER Diagram Drawing Guide — Project Management Application

> A complete step-by-step guide to manually draw the ER diagram for this project on paper or a whiteboard.

---

## Part A: ER Diagram Symbols Reference

Before drawing, memorize these symbols — they are the building blocks of every ER diagram.

### Entities

| Symbol               | Meaning           | When to Use                                                              |
| -------------------- | ----------------- | ------------------------------------------------------------------------ |
| **Rectangle**        | **Strong Entity** | Has its own primary key (e.g., User, Project)                            |
| **Double Rectangle** | **Weak Entity**   | Cannot exist without a strong entity; has no full primary key of its own |

### Attributes

| Symbol                            | Meaning                    | When to Use                                                       |
| --------------------------------- | -------------------------- | ----------------------------------------------------------------- |
| **Oval**                          | **Simple Attribute**       | A single, atomic value (e.g., `name`, `email`)                    |
| **Oval with underline**           | **Key Attribute**          | Uniquely identifies the entity (e.g., `id`, `email`)              |
| **Double Oval**                   | **Multi-Valued Attribute** | Can hold multiple values (e.g., phone numbers)                    |
| **Dashed Oval**                   | **Derived Attribute**      | Calculated from other attributes (e.g., `age` from `DOB`)         |
| **Oval branching into sub-ovals** | **Composite Attribute**    | Can be broken into parts (e.g., `name` → `firstName`, `lastName`) |

### Relationships

| Symbol             | Meaning                      | When to Use                                             |
| ------------------ | ---------------------------- | ------------------------------------------------------- |
| **Diamond**        | **Relationship**             | Connects two or more entities                           |
| **Double Diamond** | **Identifying Relationship** | Connects a weak entity to its identifying strong entity |

### Lines / Participation

| Symbol          | Meaning                                                       |
| --------------- | ------------------------------------------------------------- |
| **Single Line** | **Partial Participation** — not every entity must participate |
| **Double Line** | **Total Participation** — every entity must participate       |

### Cardinality Notation (write near the line)

| Notation       | Meaning      |
| -------------- | ------------ |
| **1**          | Exactly one  |
| **M** or **N** | Many         |
| **1 : 1**      | One-to-One   |
| **1 : M**      | One-to-Many  |
| **M : N**      | Many-to-Many |

---

## Part B: Attribute Type Classification

Here is how each attribute type maps to a drawing convention:

| Type              | Drawing Rule                    | Example from This Project                                                                              |
| ----------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Simple**        | Plain oval                      | `email`, `title`, `content`                                                                            |
| **Composite**     | Oval → branching into sub-ovals | User `name` → `first_name` + `last_name`                                                               |
| **Single-Valued** | Plain oval (holds one value)    | `email`, `slug`, `due_date`                                                                            |
| **Multi-Valued**  | Double oval                     | _(none in this schema — all are single-valued)_                                                        |
| **Derived**       | Dashed oval                     | `age` (if derived from `createdAt`, not stored), `overdue` status (derived from `due_date` + `status`) |
| **Key**           | Oval with underline             | `id` (on every entity), `email` on User                                                                |

---

## Part C: Entities & Their Attributes for This Project

Draw each entity as a **Rectangle** with its attributes as **Ovals** connected by lines.

---

### Entity 1: USER (Strong Entity)

```
Draw: Rectangle labeled "USER"
```

| Attribute     | Type                   | Symbol                                        |
| ------------- | ---------------------- | --------------------------------------------- |
| **id**        | Key Attribute (PK)     | Underlined oval                               |
| **name**      | Composite Attribute    | Oval → `first_name` + `last_name` (sub-ovals) |
| **email**     | Key Attribute (Unique) | Underlined oval                               |
| **image**     | Simple Attribute       | Plain oval                                    |
| **createdAt** | Simple Attribute       | Plain oval                                    |
| **updatedAt** | Simple Attribute       | Plain oval                                    |

---

### Entity 2: WORKSPACE (Strong Entity)

```
Draw: Rectangle labeled "WORKSPACE"
```

| Attribute       | Type                    | Symbol          |
| --------------- | ----------------------- | --------------- |
| **id**          | Key Attribute (PK)      | Underlined oval |
| **name**        | Simple Attribute        | Plain oval      |
| **slug**        | Key Attribute (Unique)  | Underlined oval |
| **description** | Simple Attribute        | Plain oval      |
| **settings**    | Simple Attribute (JSON) | Plain oval      |
| **image_url**   | Simple Attribute        | Plain oval      |
| **createdAt**   | Simple Attribute        | Plain oval      |
| **updatedAt**   | Simple Attribute        | Plain oval      |

---

### Entity 3: PROJECT (Strong Entity)

```
Draw: Rectangle labeled "PROJECT"
```

| Attribute       | Type                                                                 | Symbol          |
| --------------- | -------------------------------------------------------------------- | --------------- |
| **id**          | Key Attribute (PK)                                                   | Underlined oval |
| **name**        | Simple Attribute                                                     | Plain oval      |
| **description** | Simple Attribute                                                     | Plain oval      |
| **priority**    | Simple Attribute (Enum: LOW/MEDIUM/HIGH)                             | Plain oval      |
| **status**      | Simple Attribute (Enum: ACTIVE/PLANNING/COMPLETED/ON_HOLD/CANCELLED) | Plain oval      |
| **start_date**  | Simple Attribute                                                     | Plain oval      |
| **end_date**    | Simple Attribute                                                     | Plain oval      |
| **progress**    | Simple Attribute (Integer)                                           | Plain oval      |
| **createdAt**   | Simple Attribute                                                     | Plain oval      |
| **updatedAt**   | Simple Attribute                                                     | Plain oval      |

---

### Entity 4: TASK (Strong Entity)

```
Draw: Rectangle labeled "TASK"
```

| Attribute       | Type                                                        | Symbol          |
| --------------- | ----------------------------------------------------------- | --------------- |
| **id**          | Key Attribute (PK)                                          | Underlined oval |
| **title**       | Simple Attribute                                            | Plain oval      |
| **description** | Simple Attribute                                            | Plain oval      |
| **status**      | Simple Attribute (Enum: TODO/IN_PROGRESS/DONE)              | Plain oval      |
| **type**        | Simple Attribute (Enum: TASK/BUG/FEATURE/IMPROVEMENT/OTHER) | Plain oval      |
| **priority**    | Simple Attribute (Enum: LOW/MEDIUM/HIGH)                    | Plain oval      |
| **due_date**    | Simple Attribute                                            | Plain oval      |
| **createdAt**   | Simple Attribute                                            | Plain oval      |
| **updatedAt**   | Simple Attribute                                            | Plain oval      |
| _overdue_       | Derived Attribute (from `due_date` + `status`)              | Dashed oval     |

---

### Entity 5: COMMENT (Strong Entity)

```
Draw: Rectangle labeled "COMMENT"
```

| Attribute     | Type               | Symbol          |
| ------------- | ------------------ | --------------- |
| **id**        | Key Attribute (PK) | Underlined oval |
| **content**   | Simple Attribute   | Plain oval      |
| **createdAt** | Simple Attribute   | Plain oval      |

---

## Part D: Relationships — Step-by-Step

Draw each relationship as a **Diamond** between the connected entities, with **cardinality** and **participation** marked.

---

### Relationship 1: USER —⟨ Owns ⟩— WORKSPACE

```
 [USER] ——— 1 ———⟨ Owns ⟩——— M ——═══ [WORKSPACE]
  (partial)                           (total)
```

| Property                    | Value                                                        |
| --------------------------- | ------------------------------------------------------------ |
| **Cardinality**             | **1 : M** (One User can own Many Workspaces)                 |
| **User Participation**      | **Partial** (single line) — not every user owns a workspace  |
| **Workspace Participation** | **Total** (double line) — every workspace MUST have an owner |
| **FK**                      | `Workspace.ownerId` → `User.id`                              |

---

### Relationship 2: USER —⟨ Member Of ⟩— WORKSPACE

```
 [USER] ═══ M ═══⟨ Member Of ⟩═══ N ═══ [WORKSPACE]
  (total)                                 (total)
```

| Property                    | Value                                                                                                                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cardinality**             | **M : N** (Many Users can be members of Many Workspaces)                                                                                                        |
| **User Participation**      | **Total** (double line) — every user must be member of at least one workspace to use the app                                                                    |
| **Workspace Participation** | **Total** (double line) — every workspace has at least one member (the creator/admin)                                                                           |
| **Junction Table**          | `WorkspaceMember` with attributes: `id` (PK), `role` (ADMIN/MEMBER), `message`                                                                                  |
| **How to draw M:N**         | Draw the diamond "Member Of", then draw a rectangle `WorkspaceMember` on the diamond to show the associative entity with its own attributes (`role`, `message`) |

---

### Relationship 3: WORKSPACE —⟨ Contains ⟩— PROJECT

```
 [WORKSPACE] ——— 1 ———⟨ Contains ⟩═══ M ═══ [PROJECT]
  (partial)                                  (total)
```

| Property                    | Value                                                              |
| --------------------------- | ------------------------------------------------------------------ |
| **Cardinality**             | **1 : M** (One Workspace contains Many Projects)                   |
| **Workspace Participation** | **Partial** (single line) — a workspace may have zero projects     |
| **Project Participation**   | **Total** (double line) — every project MUST belong to a workspace |
| **FK**                      | `Project.workspaceId` → `Workspace.id`                             |

---

### Relationship 4: USER —⟨ Leads ⟩— PROJECT

```
 [USER] ——— 1 ———⟨ Leads ⟩——— M ——— [PROJECT]
  (partial)                         (partial)
```

| Property                  | Value                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| **Cardinality**           | **1 : M** (One User can lead Many Projects; each Project has one lead)                      |
| **User Participation**    | **Partial** (single line) — not every user is a team lead                                   |
| **Project Participation** | **Partial** (single line) — `team_lead` is nullable, a project may not have a lead assigned |
| **FK**                    | `Project.team_lead` → `User.id`                                                             |

---

### Relationship 5: USER —⟨ Member Of ⟩— PROJECT

```
 [USER] ═══ M ═══⟨ Project Member ⟩═══ N ═══ [PROJECT]
```

| Property                  | Value                                                                       |
| ------------------------- | --------------------------------------------------------------------------- |
| **Cardinality**           | **M : N** (Many Users can be members of Many Projects)                      |
| **User Participation**    | **Partial** (single line) — not every user is in every project              |
| **Project Participation** | **Partial** (single line) — a project may have zero explicit members        |
| **Junction Table**        | `ProjectMember` with attributes: `id` (PK), `userId` (FK), `projectId` (FK) |
| **How to draw M:N**       | Same as Relationship 2 — draw associative entity rectangle on the diamond   |

---

### Relationship 6: PROJECT —⟨ Has ⟩— TASK

```
 [PROJECT] ——— 1 ———⟨ Has ⟩═══ M ═══ [TASK]
  (partial)                          (total)
```

| Property                  | Value                                                         |
| ------------------------- | ------------------------------------------------------------- |
| **Cardinality**           | **1 : M** (One Project has Many Tasks)                        |
| **Project Participation** | **Partial** (single line) — a project may have zero tasks     |
| **Task Participation**    | **Total** (double line) — every task MUST belong to a project |
| **FK**                    | `Task.projectId` → `Project.id`                               |

---

### Relationship 7: USER —⟨ Assigned To ⟩— TASK

```
 [USER] ——— 1 ———⟨ Assigned To ⟩═══ M ═══ [TASK]
  (partial)                                (total)
```

| Property               | Value                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| **Cardinality**        | **1 : M** (One User can be assigned Many Tasks; each Task has one assignee)              |
| **User Participation** | **Partial** (single line) — not every user has tasks assigned                            |
| **Task Participation** | **Total** (double line) — every task has an assignee (field is required in `createTask`) |
| **FK**                 | `Task.assigneeId` → `User.id`                                                            |

---

### Relationship 8: TASK —⟨ Has ⟩— COMMENT

```
 [TASK] ——— 1 ———⟨ Has ⟩═══ M ═══ [COMMENT]
  (partial)                        (total)
```

| Property                  | Value                                                         |
| ------------------------- | ------------------------------------------------------------- |
| **Cardinality**           | **1 : M** (One Task has Many Comments)                        |
| **Task Participation**    | **Partial** (single line) — a task may have zero comments     |
| **Comment Participation** | **Total** (double line) — every comment MUST belong to a task |
| **FK**                    | `Comment.taskId` → `Task.id`                                  |

---

### Relationship 9: USER —⟨ Writes ⟩— COMMENT

```
 [USER] ——— 1 ———⟨ Writes ⟩═══ M ═══ [COMMENT]
  (partial)                           (total)
```

| Property                  | Value                                                                     |
| ------------------------- | ------------------------------------------------------------------------- |
| **Cardinality**           | **1 : M** (One User can write Many Comments; each Comment has one author) |
| **User Participation**    | **Partial** (single line) — not every user writes comments                |
| **Comment Participation** | **Total** (double line) — every comment MUST have an author               |
| **FK**                    | `Comment.userId` → `User.id`                                              |

---

## Part E: Step-by-Step Drawing Instructions

### Step 1 — Draw All Entities

1. Draw **5 rectangles** in a layout that minimizes crossing lines:

   ```
   Suggested layout:

              [USER]
             /  |   \
            /   |    \
   [WORKSPACE] [PROJECT] [TASK] ——— [COMMENT]
   ```

2. Label each rectangle: `USER`, `WORKSPACE`, `PROJECT`, `TASK`, `COMMENT`

### Step 2 — Add Key Attributes First

- For each entity, draw an **underlined oval** for the primary key (`id`) and connect it with a line
- For `USER`, also underline `email` (unique key)
- For `WORKSPACE`, also underline `slug` (unique key)

### Step 3 — Add All Other Attributes

- Draw **plain ovals** for each simple attribute and connect them to their entity
- For `USER.name`, draw a **composite attribute**: one oval labeled `name` branching into two sub-ovals `first_name` and `last_name`
- For `TASK`, optionally draw a **dashed oval** for the derived attribute `overdue`

### Step 4 — Draw Relationships

- Draw **9 diamonds** between the entities as specified in Part D
- Label each diamond: `Owns`, `Member Of`, `Contains`, `Leads`, `Project Member`, `Has`, `Assigned To`, `Has`, `Writes`

### Step 5 — Mark Cardinality

- Write `1` or `M` (or `N`) near each entity's connection line as specified in Part D
- Example: `[USER] —1— ⟨Owns⟩ —M— [WORKSPACE]`

### Step 6 — Mark Participation

- **Double line** = Total participation (entity MUST participate)
- **Single line** = Partial participation (entity MAY participate)
- Refer to Part D for each relationship's participation

### Step 7 — Draw Associative Entities (for M:N relationships)

- For **USER ↔ WORKSPACE** (M:N): Draw a rectangle `WorkspaceMember` overlapping the "Member Of" diamond, with its own attributes: `id` (underlined oval), `role` (plain oval), `message` (plain oval)
- For **USER ↔ PROJECT** (M:N): Draw a rectangle `ProjectMember` overlapping the "Project Member" diamond, with its own attribute: `id` (underlined oval)

### Step 8 — Add Enum Annotations

- Next to the relevant attributes, write the allowed values:
  - `WorkspaceMember.role` → {ADMIN, MEMBER}
  - `Project.status` → {ACTIVE, PLANNING, COMPLETED, ON_HOLD, CANCELLED}
  - `Project.priority` → {LOW, MEDIUM, HIGH}
  - `Task.status` → {TODO, IN_PROGRESS, DONE}
  - `Task.type` → {TASK, BUG, FEATURE, IMPROVEMENT, OTHER}
  - `Task.priority` → {LOW, MEDIUM, HIGH}

### Step 9 — Mark Cascade Deletes

- Draw a small **"cascade"** annotation near FK relationships where deleting the parent deletes the children:
  - Deleting `User` → cascades to `WorkspaceMember`, `Workspace`, `Project`, `Task`, `Comment`
  - Deleting `Workspace` → cascades to `WorkspaceMember`, `Project`
  - Deleting `Project` → cascades to `ProjectMember`, `Task`
  - Deleting `Task` → cascades to `Comment`

### Step 10 — Color Code (Optional but Recommended)

- **Blue** for primary entities (`USER`, `WORKSPACE`, `PROJECT`)
- **Green** for operational entities (`TASK`, `COMMENT`)
- **Orange** for associative/junction entities (`WorkspaceMember`, `ProjectMember`)
- **Red underline** for key attributes

---

## Part F: Summary Table of All Relationships

| #   | Entity A  | Relationship | Entity B  | Cardinality | A Participation | B Participation | FK Location                |
| --- | --------- | ------------ | --------- | ----------- | --------------- | --------------- | -------------------------- |
| 1   | User      | Owns         | Workspace | 1:M         | Partial         | Total           | `Workspace.ownerId`        |
| 2   | User      | Member Of    | Workspace | M:N         | Total           | Total           | `WorkspaceMember` junction |
| 3   | Workspace | Contains     | Project   | 1:M         | Partial         | Total           | `Project.workspaceId`      |
| 4   | User      | Leads        | Project   | 1:M         | Partial         | Partial         | `Project.team_lead`        |
| 5   | User      | Member Of    | Project   | M:N         | Partial         | Partial         | `ProjectMember` junction   |
| 6   | Project   | Has          | Task      | 1:M         | Partial         | Total           | `Task.projectId`           |
| 7   | User      | Assigned To  | Task      | 1:M         | Partial         | Total           | `Task.assigneeId`          |
| 8   | Task      | Has          | Comment   | 1:M         | Partial         | Total           | `Comment.taskId`           |
| 9   | User      | Writes       | Comment   | 1:M         | Partial         | Total           | `Comment.userId`           |

---

## Part G: Quick Reference — All Unique Constraints

| Entity          | Unique Fields           | Purpose                          |
| --------------- | ----------------------- | -------------------------------- |
| User            | `email`                 | No duplicate users               |
| Workspace       | `slug`                  | Unique URL-friendly identifier   |
| WorkspaceMember | `(userId, workspaceId)` | No duplicate memberships         |
| ProjectMember   | `(userId, projectId)`   | No duplicate project memberships |
