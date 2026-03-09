# Data Flow & Architecture Guide

> A complete guide to how data flows through the application, from user interaction to database and back. Covers client architecture, state management, API integration, and authentication.

---

## 1. Technology Stack

| Layer                | Technology              | Purpose                               |
| -------------------- | ----------------------- | ------------------------------------- |
| **Frontend**         | React 19 + Vite         | UI framework & build tool             |
| **State Management** | Redux Toolkit           | Centralized state (workspaces, theme) |
| **Routing**          | React Router DOM v7     | Client-side routing                   |
| **Authentication**   | Clerk React SDK         | Login, signup, session management     |
| **HTTP Client**      | Axios                   | API requests to backend               |
| **Notifications**    | React Hot Toast         | User-facing toast notifications       |
| **Charts**           | Recharts                | Project analytics visualizations      |
| **Date Utilities**   | date-fns                | Date formatting and comparisons       |
| **CSS**              | Tailwind CSS v4         | Utility-first styling with dark mode  |
| **Backend**          | Express.js              | REST API server                       |
| **ORM**              | Prisma Client           | Database queries                      |
| **Database**         | PostgreSQL (Neon)       | Persistent storage                    |
| **Background Jobs**  | Inngest                 | Async event processing (email, sync)  |
| **Email**            | Nodemailer + Brevo SMTP | Task assignment notifications         |

---

## 2. Application Bootstrap

```
main.jsx
├── BrowserRouter          (routing)
│   └── ClerkProvider      (auth — reads VITE_CLERK_PUBLISHABLE_KEY)
│       └── Redux Provider (state — configures workspace + theme reducers)
│           └── App.jsx    (route definitions)
```

**Routes defined in `App.jsx`:**

| Path              | Component                   | Description                                   |
| ----------------- | --------------------------- | --------------------------------------------- |
| `/`               | `Layout` → `Dashboard`      | Main dashboard with stats, overview, activity |
| `/team`           | `Layout` → `Team`           | Team member listing & invite                  |
| `/projects`       | `Layout` → `Projects`       | Project list with search/filter               |
| `/projectsDetail` | `Layout` → `ProjectDetails` | Project tasks, analytics, calendar, settings  |
| `/taskDetails`    | `Layout` → `TaskDetails`    | Individual task with comments                 |
| `/settings`       | `Layout` → `Settings`       | User profile & account settings               |

All routes are nested under `Layout`, which handles authentication checks, sidebar, navbar, and workspace syncing.

---

## 3. Authentication Flow

```
User visits app
    │
    ├── Not signed in → Clerk <SignIn /> modal
    │
    └── Signed in → Layout.jsx executes syncWorkspaces()
            │
            ├── POST /api/workspaces/sync
            │   ├── Upserts User record from Clerk data
            │   ├── Upserts Workspace records from Clerk orgs
            │   └── Upserts WorkspaceMember records
            │
            └── GET /api/workspaces
                └── Returns all workspaces with nested data
                    └── Redux store populated via fetchWorkspaces()
```

**Auth header on every API call:**

```javascript
// Client adds Bearer token from Clerk
headers: {
  Authorization: `Bearer ${await getToken()}`;
}

// Server verifies via clerkMiddleware() global middleware
// Then protect() middleware extracts req.auth().userId
```

---

## 4. State Management (Redux)

### 4.1 Workspace Slice (`features/workspaceSlice.js`)

**State Shape:**

```javascript
{
  workspaces: [],          // All workspaces the user belongs to
  currentWorkspace: null,  // Currently selected workspace (with nested projects, tasks, members)
  status: 'idle',          // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
}
```

**Async Thunk:**

- `fetchWorkspaces({ getToken })` — `GET /api/workspaces` → populates `workspaces` + sets `currentWorkspace` to first workspace

**Reducers (synchronous):**

| Reducer               | Action                                 | Description                                                              |
| --------------------- | -------------------------------------- | ------------------------------------------------------------------------ |
| `setCurrentWorkspace` | `dispatch(setCurrentWorkspace(orgId))` | Switches active workspace by Clerk org ID                                |
| `addProject`          | `dispatch(addProject(project))`        | Adds project to `currentWorkspace.projects` and `workspaces`             |
| `addTask`             | `dispatch(addTask(task))`              | Adds task to correct project in both `currentWorkspace` and `workspaces` |
| `updateTask`          | `dispatch(updateTask(task))`           | Replaces task by ID in correct project                                   |
| `deleteTask`          | `dispatch(deleteTask(taskIds))`        | Filters out tasks by ID array                                            |

### 4.2 Theme Slice (`features/themeSlice.js`)

**State Shape:**

```javascript
{
  theme: "light"; // 'light' | 'dark'
}
```

**Reducers:**

| Reducer       | Description                                                                              |
| ------------- | ---------------------------------------------------------------------------------------- |
| `toggleTheme` | Toggles between light/dark, persists to `localStorage`, toggles `dark` class on `<html>` |
| `setTheme`    | Sets theme directly                                                                      |
| `loadTheme`   | Loads theme from `localStorage` on app startup                                           |

---

## 5. Component → API Mapping

Every component that makes an API call (directly via Axios or indirectly via Redux) is listed below. Components not listed here derive all data from the Redux store.

### Components That Make Direct API Calls

| Component                 | API Call           | Method | Endpoint                      | Redux Action                    |
| ------------------------- | ------------------ | ------ | ----------------------------- | ------------------------------- |
| `Layout.jsx`              | Sync workspaces    | `POST` | `/api/workspaces/sync`        | — (calls fetchWorkspaces after) |
| `Layout.jsx`              | Fetch workspaces   | `GET`  | `/api/workspaces`             | `fetchWorkspaces`               |
| `CreateProjectDialog.jsx` | Create project     | `POST` | `/api/projects`               | `addProject`                    |
| `ProjectSettings.jsx`     | Update project     | `PUT`  | `/api/projects`               | calls `fetchWorkspaces`         |
| `AddProjectMember.jsx`    | Add project member | `POST` | `/api/projects/:id/addMember` | calls `fetchWorkspaces`         |
| `CreateTaskDialog.jsx`    | Create task        | `POST` | `/api/tasks`                  | `addTask`                       |
| `ProjectTasks.jsx`        | Update task status | `PUT`  | `/api/tasks/:id`              | `updateTask`                    |
| `ProjectTasks.jsx`        | Delete tasks       | `POST` | `/api/tasks/delete`           | `deleteTask`                    |
| `TaskDetails.jsx`         | Fetch comments     | `GET`  | `/api/comments/:taskId`       | — (local state)                 |
| `TaskDetails.jsx`         | Add comment        | `POST` | `/api/comments`               | — (local state)                 |

### Components That Use Clerk SDK Only (No Backend API)

| Component                | Clerk API Used                | Purpose                              |
| ------------------------ | ----------------------------- | ------------------------------------ |
| `Settings.jsx`           | `user.update()`               | Update profile (firstName, lastName) |
| `Settings.jsx`           | `signOut()`                   | Logout                               |
| `WorkspaceDropdown.jsx`  | `useOrganizationList()`       | List user's orgs for switching       |
| `WorkspaceDropdown.jsx`  | `setActive()`                 | Switch active org                    |
| `WorkspaceDropdown.jsx`  | `openCreateOrganization()`    | Create new org (triggers webhook)    |
| `InviteMemberDialog.jsx` | `organization.inviteMember()` | Invite workspace member              |
| `Navbar.jsx`             | `<UserButton />`              | Clerk user avatar/menu               |

### Components That Use Only Redux Store Data (No API Calls)

| Component              | Data Source                         | Purpose                                           |
| ---------------------- | ----------------------------------- | ------------------------------------------------- |
| `Dashboard.jsx`        | Clerk `useUser()`                   | Displays welcome message                          |
| `StatsGrid.jsx`        | `currentWorkspace`                  | Computes total/completed/overdue stats            |
| `ProjectOverview.jsx`  | `currentWorkspace.projects`         | Displays project cards on dashboard               |
| `RecentActivity.jsx`   | `currentWorkspace.projects[].tasks` | Shows all tasks as activity feed                  |
| `TasksSummary.jsx`     | `currentWorkspace.projects[].tasks` | Shows my tasks, overdue, in-progress              |
| `MyTasksSidebar.jsx`   | `currentWorkspace.projects[].tasks` | Sidebar list of tasks assigned to user            |
| `ProjectsSidebar.jsx`  | `currentWorkspace.projects`         | Sidebar project navigation tree                   |
| `Sidebar.jsx`          | —                                   | Navigation links                                  |
| `Projects.jsx`         | `currentWorkspace.projects`         | Project list with filtering                       |
| `ProjectDetails.jsx`   | `currentWorkspace.projects`         | Tab container (tasks/analytics/calendar/settings) |
| `ProjectAnalytics.jsx` | Props from `ProjectDetails`         | Charts and metrics (Recharts)                     |
| `ProjectCalendar.jsx`  | Props from `ProjectDetails`         | Calendar view of task due dates                   |
| `ProjectCard.jsx`      | Props from `Projects`               | Single project card layout                        |
| `Team.jsx`             | `currentWorkspace.members`          | Team listing with role badges                     |

---

## 6. Data Flow Example: Creating a Task

```
1. User fills form in CreateTaskDialog.jsx
         │
2. Component calls: axios.post('/api/tasks', { projectId, title, ... },
                     { headers: { Authorization: Bearer <token> } })
         │
3. Server: taskRoutes.js → protect middleware → createTask controller
         │
4. Controller: prisma.projectMember.findFirst() → permission check
         │
5. Controller: prisma.task.create() → INSERT INTO "Task" ...
         │
6. Controller: inngest.send('app/task.assigned') → async email trigger
         │
7. Controller: prisma.task.findUnique({ include: { assignee: true } })
         │
8. Response: 201 { task: { id, title, assignee: { name, email } } }
         │
9. Client: dispatch(addTask(response.data.task))
         │
10. Redux: adds task to currentWorkspace.projects[x].tasks[]
         │
11. All subscribed components re-render (ProjectTasks, TasksSummary, etc.)
```

---

## 7. Error Handling Patterns

### Server-Side

All controllers use try/catch blocks. Errors return:

```json
{ "message": "<error description>" }
```

**Status codes used:**

- `200` — Success
- `201` — Created
- `400` — Bad request (e.g., already a member)
- `401` — Unauthorized (from auth middleware)
- `403` — Forbidden (permission denied)
- `404` — Not found (e.g., user not found)
- `500` — Internal server error

### Client-Side

Components use `toast.error(error.response?.data?.message || error.message)` for user-facing errors.

---

## 8. Client Edge Cases & Permutations

### 8.1 UI States (Loading, Empty, Error)

| Component      | State              | Condition                    | UI Behavior                                                                  |
| -------------- | ------------------ | ---------------------------- | ---------------------------------------------------------------------------- |
| `TaskDetails`  | **Loading**        | `loading === true`           | Shows "Loading task details..." text                                         |
| `TaskDetails`  | **Error**          | `!task && !loading`          | Shows "Task not found." (red text)                                           |
| `TaskDetails`  | **Empty Comments** | `comments.length === 0`      | Shows "No comments yet. Be the first!"                                       |
| `ProjectTasks` | **Empty List**     | `filteredTasks.length === 0` | Shows "No tasks found for the selected filters."                             |
| `Projects`     | **Empty List**     | `projects.length === 0`      | Shows "No projects found"                                                    |
| `ProjectTasks` | **Loading**        | Action-based                 | `toast.loading("Updating status...")` / `toast.loading("Deleting tasks...")` |
| `TaskDetails`  | **Loading**        | Action-based                 | `toast.loading("Adding comment...")`                                         |

### 8.2 Error Handling Map

| Action             | Error Source             | Client Feedback                                                  |
| ------------------ | ------------------------ | ---------------------------------------------------------------- | --- | --------------- |
| Update Task Status | `PUT /api/tasks/:id`     | `toast.error(error.response.data.message                         |     | error.message)` |
| Delete Task        | `POST /api/tasks/delete` | `toast.error(error.response.data.message                         |     | error.message)` |
| Add Comment        | `POST /api/comments`     | `toast.error(error.response.data.message                         |     | error.message)` |
| Fetch Comments     | `GET /api/comments`      | `toast.error(error.message)` (auto-dismissed by next poll often) |

### 8.3 State Permutations

#### Task Creation

- **Success:** Task added to project, local state updated via Redux, toast success.
- **Fail (403):** "You don't have admin privileges" → Toast error.
- **Fail (404):** "Project not found" → Toast error.

#### Workspace Sync

- **Scenario:** User creates org in Clerk dashboard but app is offline.
- **Recovery:** On next app load, `syncWorkspaces` runs.
- **Edge Case:** User is removed from org in Clerk while logged in.
  - **Result:** `fetchWorkspaces` will not return that org next time.
  - **Current UI:** User might still see it until refresh.

#### Concurrent Edits

- **Scenario:** Two users edit same task status.
- **Resolution:** Last write wins (PostgreSQL behavior).
- **UI:** No real-time socket updates for status (only comments are polled). User B will see old status until refresh or poll.
