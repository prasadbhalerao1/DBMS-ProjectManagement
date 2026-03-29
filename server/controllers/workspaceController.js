import prisma from "../configs/prisma.js";
import { clerkClient } from "@clerk/express";

export const getUserWorkspaces = async (req, res) => {
  try {
    const { userId } = req.auth;
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: { some: { userId: userId } },
      },
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
    res.json({ workspaces });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};

export const syncWorkspaces = async (req, res) => {
  try {
    const { userId } = req.auth;

    const user = await clerkClient.users.getUser(userId);

    await prisma.user.upsert({
      where: { id: userId },
      update: {
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
        email: user.emailAddresses[0]?.emailAddress || "",
        image: user.imageUrl || "",
      },
      create: {
        id: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
        email: user.emailAddresses[0]?.emailAddress || "",
        image: user.imageUrl || "",
      },
    });

    const memberships = await clerkClient.users.getOrganizationMembershipList({
      userId,
      limit: 100,
    });

    const results = [];

    for (const membership of memberships.data) {
      const org = membership.organization;

      let ownerId = org.createdBy;
      if (ownerId && ownerId !== userId) {
        try {
          const ownerData = await clerkClient.users.getUser(ownerId);
          await prisma.user.upsert({
            where: { id: ownerId },
            update: {
              name:
                `${ownerData.firstName || ""} ${ownerData.lastName || ""}`.trim() ||
                "User",
              email: ownerData.emailAddresses[0]?.emailAddress || "",
              image: ownerData.imageUrl || "",
            },
            create: {
              id: ownerId,
              name:
                `${ownerData.firstName || ""} ${ownerData.lastName || ""}`.trim() ||
                "User",
              email: ownerData.emailAddresses[0]?.emailAddress || "",
              image: ownerData.imageUrl || "",
            },
          });
        } catch {
          ownerId = userId;
        }
      } else if (!ownerId) {
        ownerId = userId;
      }

      const workspace = await prisma.workspace.upsert({
        where: { id: org.id },
        update: {
          name: org.name,
          slug: org.slug,
          image_url: org.imageUrl || "",
        },
        create: {
          id: org.id,
          name: org.name,
          slug: org.slug,
          image_url: org.imageUrl || "",
          ownerId: ownerId,
        },
      });

      await prisma.workspaceMember.upsert({
        where: {
          userId_workspaceId: {
            userId: userId,
            workspaceId: org.id,
          },
        },
        update: {
          role: membership.role === "org:admin" ? "ADMIN" : "MEMBER",
        },
        create: {
          userId: userId,
          workspaceId: org.id,
          role: membership.role === "org:admin" ? "ADMIN" : "MEMBER",
        },
      });
      results.push(workspace);
    }

    res.json({
      message: "Workspaces synced successfully",
      count: results.length,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.code || error.message });
  }
};
