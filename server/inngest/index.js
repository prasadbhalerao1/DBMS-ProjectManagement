import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";
import sendEmail from "../configs/nodemailer.js";
import { generateTaskAssignmentEmail, generateTaskReminderEmail, generateProjectInviteEmail, generateTaskCommentEmail } from "../utils/htmlEmails.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "project-management" });

// Inngest Function to save user data to a database
const syncUserCreation = inngest.createFunction({ id: "sync-user-from-clerk" }, { event: "clerk/user.created" }, async ({ event }) => {
    const { data } = event;
    await prisma.user.create({
        data: {
            id: data.id,
            email: data?.email_addresses[0]?.email_address,
            name: data?.first_name + " " + data?.last_name,
            image: data?.image_url,
        },
    });
});

// Inngest Function to delete user from database
const syncUserDeletion = inngest.createFunction({ id: "delete-user-with-clerk" }, { event: "clerk/user.deleted" }, async ({ event }) => {
    const { data } = event;

    await prisma.user.delete({
        where: {
            id: data.id,
        },
    });
});

// Inngest Function to update user data in database
const syncUserUpdation = inngest.createFunction({ id: "update-user-from-clerk" }, { event: "clerk/user.updated" }, async ({ event }) => {
    const { data } = event;
    await prisma.user.update({
        where: {
            id: data.id,
        },
        data: {
            email: data?.email_addresses[0]?.email_address,
            name: data?.first_name + " " + data?.last_name,
            image: data?.image_url,
        },
    });
});

// Inngest Function to save workspace data to a database
const syncWorkspaceCreation = inngest.createFunction({ id: "sync-workspace-from-clerk" }, { event: "clerk/organization.created" }, async ({ event }) => {
    const { data } = event;
    await prisma.workspace.create({
        data: {
            id: data.id,
            name: data.name,
            slug: data.slug,
            ownerId: data.created_by,
            image_url: data.image_url,
        },
    });

    // Add creator as ADMIN member
    await prisma.workspaceMember.create({
        data: {
            userId: data.created_by,
            workspaceId: data.id,
            role: "ADMIN",
        },
    });
});

// Inngest Function to update workspace data in database
const syncWorkspaceUpdation = inngest.createFunction({ id: "update-workspace-from-clerk" }, { event: "clerk/organization.updated" }, async ({ event }) => {
    const { data } = event;
    await prisma.workspace.update({
        where: {
            id: data.id,
        },
        data: {
            name: data.name,
            slug: data.slug,
            image_url: data.image_url,
        },
    });
});

// Inngest Function to delete workspace from database
const syncWorkspaceDeletion = inngest.createFunction({ id: "delete-workspace-with-clerk" }, { event: "clerk/organization.deleted" }, async ({ event }) => {
    const { data } = event;
    await prisma.workspace.delete({
        where: {
            id: data.id,
        },
    });
});

// Inngest Function to save workspace member data to a database
const syncWorkspaceMemberCreation = inngest.createFunction({ id: "sync-workspace-member-from-clerk" }, { event: "clerk/organizationInvitation.accepted" }, async ({ event }) => {
    const { data } = event;
    await prisma.workspaceMember.create({
        data: {
            userId: data.user_id,
            workspaceId: data.organization_id,
            role: String(data.role_name).toUpperCase(),
        },
    });
});

// Inngest Function to Send Email on Task Creation
const sendBookingConfirmationEmail = inngest.createFunction({ id: "send-task-assignment-mail" }, { event: "app/task.assigned" }, async ({ event, step }) => {
    const { taskId, origin } = event.data;

    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { assignee: true, project: true },
    });

    await sendEmail({
        to: task.assignee.email,
        subject: `New Task Assignment in ${task.project.name}`,
        body: generateTaskAssignmentEmail({
            assigneeName: task.assignee.name,
            taskTitle: task.title,
            projectName: task.project.name,
            taskDescription: task.description,
            dueDate: task.due_date,
            origin: origin
        }),
    });

    if (new Date(task.due_date).toDateString() !== new Date().toDateString()) {
        await step.sleepUntil("wait-for-the-due-date", new Date(task.due_date));

        await step.run("check-if-task-is-completed ", async () => {
            const task = await prisma.task.findUnique({
                where: { id: taskId },
                include: { assignee: true, project: true },
            });

            if (!task) return;

            if (task.status !== "DONE") {
                await step.run("send-task-reminder-mail", async () => {
                    await sendEmail({
                        to: task.assignee.email,
                        subject: `Reminder for ${task.project.name}`,
                        body: generateTaskReminderEmail({
                            assigneeName: task.assignee.name,
                            taskTitle: task.title,
                            projectName: task.project.name,
                            taskDescription: task.description,
                            dueDate: task.due_date,
                            origin: origin
                        }),
                    });
                });
            }
        });
    }
});

// Inngest Function to Send Project Invite Email
const sendProjectInviteEmail = inngest.createFunction(
    { id: "send-project-invite-mail" },
    { event: "app/project.invited" },
    async ({ event }) => {
        const { projectId, inviterId, inviteeEmail, origin } = event.data;

        const project = await prisma.project.findUnique({ where: { id: projectId } });
        const inviter = await prisma.user.findUnique({ where: { id: inviterId } });

        if (!project || !inviter) return;

        await sendEmail({
            to: inviteeEmail,
            subject: `Invitation to collaborate on ${project.name}`,
            body: generateProjectInviteEmail({
                inviterName: inviter.name,
                projectName: project.name,
                origin: origin + "/project/" + projectId,
            }),
        });
    }
);

// Inngest Function to Send Task Comment Email
const sendTaskCommentNotification = inngest.createFunction(
    { id: "send-task-comment-mail" },
    { event: "app/task.comment" },
    async ({ event }) => {
        const { taskId, commenterId, commentContent, origin } = event.data;

        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { assignee: true, project: true },
        });
        const commenter = await prisma.user.findUnique({ where: { id: commenterId } });

        // Don't email if the commenter is the assignee themselves
        if (!task || !commenter || !task.assignee || task.assignee.id === commenterId) return;

        await sendEmail({
            to: task.assignee.email,
            subject: `New Comment on ${task.title}`,
            body: generateTaskCommentEmail({
                commenterName: commenter.name,
                taskTitle: task.title,
                commentContent: commentContent,
                origin: origin + "/project/" + task.projectId,
            }),
        });
    }
);

// Inngest functions
export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, syncWorkspaceCreation, syncWorkspaceUpdation, syncWorkspaceDeletion, syncWorkspaceMemberCreation, sendBookingConfirmationEmail, sendProjectInviteEmail, sendTaskCommentNotification];
