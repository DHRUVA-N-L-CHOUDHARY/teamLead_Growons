// app/teams/[teamId]/page.tsx
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

async function getTeamDetails(teamId: string, userId: string) {
  const team = await db.team.findUnique({
    where: { id: teamId },
    include: {
      leader: true,
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!team) {
    throw new Error("Team not found");
  }

  const isLeader = team.leaderId === userId;
  return { team, isLeader };
}

export default async function TeamDetailsPage({ params }: { params: { teamId: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { teamId } = params;
  const { team, isLeader } = await getTeamDetails(teamId, session.user.id);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{team.name}</h1>
        <p className="text-muted-foreground">
          Managed by {team.leader.name}
        </p>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Member Name</th>
            <th className="border border-gray-300 p-2">Email</th>
            {isLeader && <th className="border border-gray-300 p-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {team.members.map((member) => (
            <tr key={member.userId} className="border-b border-gray-300">
              <td className="border border-gray-300 p-2">{member.user.name}</td>
              <td className="border border-gray-300 p-2">{member.user.email}</td>
              {isLeader && (
                <td className="border border-gray-300 p-2">
                  {member.userId === team.leaderId ? (
                    <span className="text-gray-500">Team Leader</span>
                  ) : (
                    <form action={`/api/removeMember`} method="POST">
                      <input type="hidden" name="teamId" value={team.id} />
                      <input type="hidden" name="userId" value={member.userId} />
                      <button
                        type="submit"
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </form>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
