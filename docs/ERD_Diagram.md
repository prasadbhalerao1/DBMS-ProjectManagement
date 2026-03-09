# Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    %% Entities
    USER {
        String id PK "Primary Key (NanoID/CUID)"
        String email UK "Unique Key"
        String name "First + Last Name"
        String image "Profile Image URL"
        DateTime createdAt
        DateTime updatedAt
    }

    WORKSPACE {
        String id PK "Primary Key"
        String name
        String slug UK "Unique URL Identifier"
        String description
        String image_url
        Json settings
        String ownerId FK "References User.id"
        DateTime createdAt
        DateTime updatedAt
    }

    WORKSPACE_MEMBER {
        String id PK
        String userId FK
        String workspaceId FK
        String role "Enum: ADMIN, MEMBER"
        String message "Invite message"
    }

    PROJECT {
        String id PK
        String name
        String description
        String status "Enum: PLANNING, ACTIVE, COMPLETED..."
        String priority "Enum: LOW, MEDIUM, HIGH"
        DateTime start_date
        DateTime end_date
        Int progress "0-100"
        String workspaceId FK
        String team_lead FK "References User.id"
        DateTime createdAt
        DateTime updatedAt
    }

    PROJECT_MEMBER {
        String id PK
        String userId FK
        String projectId FK
    }

    TASK {
        String id PK
        String title
        String description
        String type "Enum: TASK, BUG, FEATURE..."
        String status "Enum: TODO, IN_PROGRESS, DONE"
        String priority "Enum: LOW, MEDIUM, HIGH"
        DateTime due_date
        String projectId FK
        String assigneeId FK "References User.id"
        DateTime createdAt
        DateTime updatedAt
    }

    COMMENT {
        String id PK
        String content
        String taskId FK
        String userId FK
        DateTime createdAt
    }

    %% Relationships

    USER ||--o{ WORKSPACE : "owns"
    USER ||--o{ WORKSPACE_MEMBER : "has memberships"
    WORKSPACE ||--o{ WORKSPACE_MEMBER : "has members"

    WORKSPACE ||--o{ PROJECT : "contains"

    USER ||--o{ PROJECT : "leads"
    USER ||--o{ PROJECT_MEMBER : "participates in"
    PROJECT ||--o{ PROJECT_MEMBER : "has members"

    PROJECT ||--o{ TASK : "has"
    USER ||--o{ TASK : "assigned to"

    TASK ||--o{ COMMENT : "has"
    USER ||--o{ COMMENT : "writes"
```

## Enum Definitions

### WorkspaceRole

- `ADMIN`
- `MEMBER`

### ProjectStatus

- `PLANNING`
- `ACTIVE`
- `COMPLETED`
- `ON_HOLD`
- `CANCELLED`

### ProjectPriority / TaskPriority

- `LOW`
- `MEDIUM`
- `HIGH`

### TaskStatus

- `TODO`
- `IN_PROGRESS`
- `DONE`

### TaskType

- `TASK`
- `BUG`
- `FEATURE`
- `IMPROVEMENT`
- `OTHER`
