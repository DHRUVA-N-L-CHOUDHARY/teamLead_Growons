"use server";

import { db } from "@/lib/db";

export const deleteTeam = async (teamId: string) => {
  try {
    console.log(teamId);
    
    const team = await db.team.findUnique({
      where: { id: teamId },
    });

    console.log(team);

    if (!team) {
      throw new Error("Team not found.");
    }

    await db.teamMember.deleteMany({
      where: {
        teamId: teamId, 
      },
    });

    await db.team.delete({
      where: {
        id: teamId, 
      },
    });

    console.log(`Team and its members with ID ${teamId} deleted successfully.`);
  } catch (error: any) {
    console.error("Error in deleting team:", error);
  }
};
