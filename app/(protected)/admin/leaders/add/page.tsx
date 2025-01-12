import React from "react";

import { auth } from "@/auth";
import TopBar from "../../../_components/Topbar";
import TeamForm from "../../_components/team-form";
import { db } from "@/lib/db";
import LeaderForm from "../../_components/leader-form";

export const generateMetadata = () => {
  return {
    title: "Add Leader | GrowonsMedia",
    description: "Add Leader",
  };
};

const page = async () => {
  const session = await auth();
  const teams = await db.team.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  const mergedTeams = teams.map((team) => {
    //@ts-ignore
    return {
      id: team.id,
      name: team.name,
    };
  });
  const users = await db.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  const mergedUsers = users.map((user) => {
    //@ts-ignore
    return {
      id: user.id,
      name: user.name,
      email:user.email,
      phone:user.number,
    };
  });

  return (
    <>
      <nav className="md:block hidden">
        <TopBar title="Add Leader" />
      </nav>
      <section className="h-screen overflow-auto">
        <div className="mb-11 mx-1">
          <LeaderForm teams={mergedTeams} users={mergedUsers} />
        </div>
      </section>
    </>
  );
};

export default page;
