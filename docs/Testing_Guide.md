# Project Management Application: Testing Guide

This guide provides a comprehensive approach to testing the core flows of the Project Management application. Since the architecture spans a React frontend, an Express/Prisma backend, and utilizes external services like Clerk (Auth) and Inngest (Background Jobs), testing should cover the integration of these features.

## 1. Authentication & User Sync via Clerk

**Goal:** Verify that a user can sign up, sign in, and their data is accurately synced to the database via Inngest.

*   **Test Sign Up:** Navigate to the client application and use the Clerk signup UI. Provide a dummy email and complete the verification step.
*   **Database Verification:** Check the Neon database (`User` table). Is the newly created user present? This verifies that Clerk fired the `clerk/user.created` webhook, and Inngest successfully captured the event and executed the Prisma creation logic.
*   **Test Update/Delete:** Change the user's name in the Clerk profile widget. Verify the DB updates. Delete the user and ensure they are removed from the database via the `delete-user-with-clerk` Inngest function.

## 2. Workspace Management

**Goal:** Verify the multi-tenant aspect of the application.

*   **Create Workspace:** Logged in as a user, create a new Workspace.
*   **Database Verification:** Check the `Workspace` table for the new entry, and the `WorkspaceMember` table to ensure the creator was assigned the `ADMIN` role automatically.
*   **Invite Member:** Invite another user to the workspace via Clerk's organizational controls. Ensure the `sync-workspace-member-from-clerk` Inngest function triggers when they accept, populating the `WorkspaceMember` table.

## 3. Project & Task Flow

**Goal:** Verify Core CRUD operations for projects, tasks, and API stability.

*   **Create a Project:** Within a workspace, create a new project. 
*   **Create Task & Assignment:** Create a task and assign it to a workspace member. Set a due date to *tomorrow*.
*   **Background Job Verification (Inngest):**
    *   Verify that the assignee receives a "New Task Assignment" email. This is handled off the main thread by Inngest.
    *   Open the Inngest local dashboard (`http://localhost:8288` if running locally). You should see the `send-task-assignment-mail` function running. 
    *   Observe that Inngest has hit the `step.sleepUntil` command and is securely waiting until the due date to send a reminder.
*   **Mark Task as Done:** Update the task status to `DONE`. This ensures the API correctly mutates the `Task` entry. (Inngest checks if status is `DONE` before sending reminders, preventing spam).

## 4. Environment & Endpoints Test

**Goal:** Quickly test stability of the API.

*   **Health Check:** Ensure `http://localhost:5000` is running.
*   **API Tests:** Use Postman or curl to hit standard endpoints (e.g., `GET /api/workspaces` with the appropriate Bearer token obtained from Clerk). Ensure 200 OK responses.

## 5. UI/UX Verification

**Goal:** Ensure the Vite/Tailwind client is responsive and intuitive.

*   **Responsive Check:** Resize the browser window to mobile width. Check if the sidebars collapse properly and the Kanban/List views for tasks remain usable.
*   **Redux State:** Use Redux DevTools to watch state changes when navigating between projects. Ensure switching projects updates the global store correctly without requiring full page reloads.
