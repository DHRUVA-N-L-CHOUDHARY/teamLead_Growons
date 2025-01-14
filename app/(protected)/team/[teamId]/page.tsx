import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import TeamMembersTable from "../_components/team-table";
import TeamWallet from "../_components/team-wallet";

interface TeamPageProps {
  params: {
    teamId: string;
  };
  searchParams: { page: string };
}

const TeamPage = async ({ params, searchParams }: TeamPageProps) => {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login");
  }

  // Verify if user is the team leader
  const team = await db.team.findFirst({
    where: {
      id: params.teamId,
      leaderId: session.user.id
    },
    select: {
      amount_limit: true,
      products: true,
      }
  });

  console.log(team);

  if (!team) {
    redirect("/"); // or wherever you want to redirect unauthorized users
  }

  

  return (
    <div className="p-6">
      
      <TeamMembersTable teamId={params.teamId} searchParams={searchParams} />
    </div>
  );
};

export default TeamPage;

