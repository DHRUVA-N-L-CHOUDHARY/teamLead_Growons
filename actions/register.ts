"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { RegisterSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  // Validate input fields
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name, number, referralCode } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: "Email already in use!" };
  }

  let teamId: string | undefined;
  if (referralCode) {
    const team = await db.team.findUnique({
      where: { refCode: referralCode },
    });

    if (!team) {
      return { error: "Invalid referral code!" };
    }

    teamId = team.id;
  }

  try {
    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        number,
        teamId,
      },
    });

    if (teamId) {
      await db.teamMember.create({
        data: {
          teamId,
          userId: newUser.id,
          isLeader: false,
        },
      });
    }

    return { success: "User created successfully!" };
  } catch (error) {
    console.error("Error creating user:", error);
    return { error: "An error occurred while creating the user." };
  }
};