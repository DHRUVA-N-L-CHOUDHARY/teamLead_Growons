import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertCircle, AlertDescription } from "@/components/ui/alert";

// Function to get team details and members
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

  // Check if the user is an admin (admin role assumed to be present in user model)
  const isAdmin = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  }).then(user => user?.role === "ADMIN");

  return { team, isAdmin };
}

export default async function EditTeamPage({ params }: { params: { teamId: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { teamId } = params;
  const { team, isAdmin } = await getTeamDetails(teamId, session.user.id);

  // Handle form submission logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name");
    const amountLimit = formData.get("amountLimit");

    try {
      await db.team.update({
        where: { id: teamId },
        data: {
          name: name as string,
          amount_limit: parseFloat(amountLimit as string),
        },
      });
    } catch (error) {
      console.error("Error updating team:", error);
      throw new Error("Error updating team: " + error.message);
    }
  };

  // Handle removing a team member
  const handleRemoveMember = async (userId: string) => {
    try {
      await db.team.update({
        where: { id: teamId },
        data: {
          members: {
            disconnect: {
              userId,
            },
          },
        },
      });
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  // Handle adding a new member by email
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;

    try {
      // Check if the user exists
      const user = await db.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Add the user to the team
      await db.team.update({
        where: { id: teamId },
        data: {
          members: {
            connect: {
              userId: user.id,
            },
          },
        },
      });
    } catch (error) {
      console.error("Error adding member:", error);
      throw new Error("Error adding member: " + error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Team: {team.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" >
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={team.name}
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amountLimit">Amount Limit</Label>
              <Input
                id="amountLimit"
                name="amountLimit"
                type="number"
                defaultValue={team.amount_limit || 0}
                className="w-full"
                min="0"
                step="0.01"
                required
              />
            </div>

            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Team Members</h2>
        <table className="w-full mt-4 table-auto">
          <thead>
            <tr>
              <th className="border-b px-4 py-2">Member Name</th>
              <th className="border-b px-4 py-2">Email</th>
              {isAdmin && <th className="border-b px-4 py-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {team.members.map((member) => (
              <tr key={member.userId} className="border-b">
                <td className="px-4 py-2">{member.user.name}</td>
                <td className="px-4 py-2">{member.user.email}</td>
                {isAdmin && (
                  <td className="px-4 py-2">
                    {member.userId === team.leaderId ? (
                      <span className="text-gray-500">Team Leader</span>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveMember(member.userId)}
                      >
                        Remove
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAdmin && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Add Team Member</h3>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Member Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="w-full"
              />
            </div>

            <Button type="submit">Add Member</Button>
          </form>
        </div>
      )}
    </div>
  );
}
