import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import RemoveMemberForm from "../_components/remove-member";

async function getTeamDetails(teamId: string, userId: string) {
  try {
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
  } catch (error) {
    console.error("Error fetching team details:", error);
    return null;
  }
}

export default async function TeamDetailsPage({ params }: { params: { teamId: string } }) {
  const session = await auth();

  // Redirect to login if the user is not authenticated
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { teamId } = params;
  const teamDetails = await getTeamDetails(teamId, session.user.id);

  if (!teamDetails) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-bold text-red-600">Team Not Found</h1>
        <p className="text-muted-foreground">The team you are looking for does not exist or you do not have access to it.</p>
      </div>
    );
  }

  const { team, isLeader } = teamDetails;


  return (
    <div className="p-6">
      {/* Team Details Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{team.name}</h1>
        <p className="text-muted-foreground">Managed by {team.leader.name}</p>
      </div>

      {/* Members Table */}
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
                    <RemoveMemberForm teamId={team.id} userId={member.userId} />
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
