"use server";

import { db } from "@/lib/db";
import { TeamMember, UserRole } from "@prisma/client";

// Fetch team details along with admin check
export async function getTeamDetails(teamId: string, userId: string) {
  const team = await db.team.findUnique({
    where: { id: teamId },
    include: {
      leader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!team) {
    throw new Error("Team not found");
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  const isAdmin = user?.role === UserRole.ADMIN;

  return { team, isAdmin };
}

// Save team details and manage members
export async function saveTeamDetails(teamId: string, data: FormData) {
  const name = data.get("name") as string;
  const amountLimitRaw = data.get("amountLimit") as string;
  const addMemberEmails = data.get("addMemberEmails") as string;
  const removeMemberIds = data.get("removeMemberIds") as string;

  // Validate inputs
  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new Error("Team name is required and must be a valid string.");
  }

  const amountLimit = parseInt(amountLimitRaw, 10);
  if (isNaN(amountLimit) || amountLimit < 0) {
    throw new Error("Amount limit must be a valid positive number.");
  }

  const emailArray = addMemberEmails
    ? addMemberEmails.split(",").map((email) => email.trim()).filter(Boolean)
    : [];

  const memberIdsArray = removeMemberIds
    ? removeMemberIds.split(",").map((id) => id.trim()).filter(Boolean)
    : [];

  try {
    // Start a transaction for atomicity
    await db.$transaction(async (tx) => {
      // Add new members
      for (const email of emailArray) {
        const user = await tx.user.findUnique({ where: { email } });
        if (!user) {
          throw new Error(`User with email "${email}" not found.`);
        }

        // Check if the user is already a member
        const existingMember = await tx.teamMember.findFirst({
          where: { teamId, userId: user.id },
        });

        if (!existingMember) {
          await tx.teamMember.create({
            data: {
              teamId,
              userId: user.id,
              isLeader: false,
            },
          });
        }
      }

      // Remove members (except the leader)
      for (const userId of memberIdsArray) {
        const member = await tx.teamMember.findUnique({
          where: {
            teamId_userId: {
              teamId,
              userId,
            },
          },
        });

        if (member?.isLeader) {
          throw new Error(`Cannot remove the team leader with ID "${userId}".`);
        }

        await tx.teamMember.deleteMany({
          where: { teamId, userId, isLeader: false },
        });
      }

      // Update team details
      await tx.team.update({
        where: { id: teamId },
        data: {
          name,
          amount_limit: amountLimit,
        },
      });
    });
  } catch (error: any) {
    console.error("Error saving team details:", error);
    throw new Error(`Failed to save team details: ${error.message}`);
  }
}

// Add a member to the team
export async function addMember(teamId: string, email: string) {
  try {
    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error(`User with email "${email}" not found.`);
    }

    const existingMember = await db.teamMember.findFirst({
      where: { teamId, userId: user.id },
    });

    if (existingMember) {
      throw new Error(`User with email "${email}" is already a team member.`);
    }

    const teamMembers = await db.teamMember.findMany({
      where: { teamId },
    });

    const leader = teamMembers.find((member) => member.isLeader);
    console.log("Leader - ", leader);

    // Fetch all ProUsers in the team
    const proUsers = await db.proUser.findMany({
      where: {
        userId: {
          in: teamMembers.map((member) => member.userId),
        },
      },
    });

    // Calculate the total amount limit of all ProUsers
    const totalAmount = proUsers.reduce((sum, proUser) => sum + proUser.amount_limit, 0);

    // Fetch the team's wallet_money (amount_limit)
    const team = await db.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new Error(`Team with id "${teamId}" not found.`);
    }

    console.log("Total amount - ", totalAmount);
    console.log("Team amount limit - ", team.amount_limit); 

    // Check if the total amount exceeds the team's wallet_money
    if (totalAmount > team.amount_limit) {
      throw new Error(`Total amount limit of ProUsers exceeds the team's wallet money.`);
    }

    // Add the user as a team member
    await db.teamMember.create({
      data: {
        teamId,
        userId: user.id,
        isLeader: false,
      },
    });
    await db.user.update({
      where: { id: user.id },
      data:{teamId:teamId}
    })

    return { message: `User with email "${email}" added to the team.`, success: true };
  } catch (error: any) {
    console.error("Error adding member:", error);
    throw new Error(error.message);
  }
}
// Remove a member from the team
export async function removeMember(teamId: string, userId: string) {
  try {
    // Find the member in the database
    const member = await db.teamMember.findFirst({
      where: {
        userId: userId,
        teamId: teamId,
      },
    });

    if (!member) {
      throw new Error(`Member with ID "${userId}" not found in the team.`);
    }

    // Check if the member is the team leader
    if (member.isLeader) {
      throw new Error("Cannot remove the team leader.");
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(`User with ID "${userId}" not found.`);
    }

    if (user.role !== UserRole.USER && user.role !== UserRole.LEADER && user.role !== UserRole.PRO) {
      throw new Error(
        `Cannot remove user with unknown role "${user.role}".`
      );
    }
    if(user.role === UserRole.PRO){
      await db.proUser.deleteMany({
        where: {
          userId: userId,
        },
      });
    }

    await db.teamMember.deleteMany({
      where: {
        teamId: teamId,
        userId: userId,
      },
    });
    console.log(`Member with ID "${userId}" (${user.role}) removed from the team.`);
    return {
      message: `Member with ID "${userId}" (${user.role}) removed from the team.`,
      success: true,
    };
  } catch (error: any) {
    console.error("Error removing member:", error);
    return { success: false, message: error.message };
  }
}
