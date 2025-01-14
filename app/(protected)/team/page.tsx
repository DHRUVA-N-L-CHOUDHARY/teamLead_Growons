// app/teams/page.tsx
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import TeamCard from "./_components/team-card";
import Link from "next/link";

async function getTeams(userId: string) {
  try {
    const leaderTeams = await db.team.findMany({
      where: {
        leaderId: userId,
      },
      include: {
        leader: true,
      },
    });

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    return {
      teams: leaderTeams,
      userRole: user?.role
    };
  } catch (error) {
    console.error("Error fetching teams:", error);
    return { teams: [], userRole: null };
  }
}

export default async function TeamsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { teams, userRole } = await getTeams(session.user.id);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Teams</h1>
        <p className="text-muted-foreground">Manage and view your team memberships</p>
      </div>

      {teams.length === 0 ? (
        <div className="text-center p-6 bg-muted rounded-lg">
          <p>You are not a member of any teams yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`}>
              <TeamCard team={team} userRole={userRole} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
