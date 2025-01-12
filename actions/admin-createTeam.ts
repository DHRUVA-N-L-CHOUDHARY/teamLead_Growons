"use server";

import { z } from "zod";
import { AddTeamSchema } from "@/schemas";
import { db } from "@/lib/db";
import { generateRandomCode } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { getUserById } from "@/data/user";

export async function createTeam(values: z.infer<typeof AddTeamSchema>) {
  try {
    // Get user details of the selected team leader

    console.log(values);
    const leader = await getUserById(values.teamLeader);

    console.log(leader)
    
    if (!leader) {
      return { error: "Selected team leader not found" };
    }

    // Generate a unique reference code for the team
    const refCode = generateRandomCode(); // You'll need to implement this utility function
    
    // Format products data for storage
    const formattedProducts = values?.products.map(product => ({
      name: product.name,
      minProduct: product.minProduct,
      maxProduct: product.maxProduct,
      price: product.price
    }));

    console.log("Formatted products - "+formattedProducts);

    // Create the team
    const team = await db.team.create({
      data: {
        name: values.teamName,
        leaderId: values.teamLeader,
        refCode: refCode,
        amount_limit: values.amount,
        products: formattedProducts,
      },
    });

    // Add the team leader as a member of the team
    await db.teamMember.create({
      data: {
        teamId: team.id,
        userId: values.teamLeader, // Add the leader to the team as a member
      },
    });

    // Update products to include this team
    for (const product of values.products) {
      await db.product.updateMany({
        where: {
          productName: product.name,
        },
        data: {
          teamIds: {
            push: team.id,
          },
        },
      });
    }

    // Optionally update the user's role to LEADER if not already
    if (leader.role !== "LEADER") {
      await db.user.update({
        where: { id: values.teamLeader },
        data: { role: "LEADER" },
      });
    }

    revalidatePath("/teams");
    return { success: "Team created successfully" };

  } catch (error) {
    console.error("TEAM_CREATION_ERROR", error);
    if (error instanceof z.ZodError) {
      return { error: "Invalid form data. Please check your inputs." };
    }
    
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return { error: "Team name or reference code already exists" };
      }
    }

    return { error: "Something went wrong. Please try again." };
  }
}