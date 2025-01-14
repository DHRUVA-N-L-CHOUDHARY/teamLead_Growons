"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getTeamDetails, saveTeamDetails, addMember, removeMember } from "@/actions/admin-editTeam";

interface TeamMember {
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  isLeader: boolean;
}

interface Team {
  id: string;
  name: string;
  leaderId: string;
  amount_limit: number;
  leader: {
    id: string;
    name: string;
    email: string;
  };
  members: TeamMember[];
}

export default function EditTeamPage({ params }: { params: { teamId: string } }) {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { teamId } = params;

  useEffect(() => {
    async function fetchTeamDetails() {
      try {
        const session = await fetch("/api/auth/session").then((res) => res.json());
        if (!session?.user?.id) {
          router.push("/auth/login");
          return;
        }

        const { team, isAdmin } = await getTeamDetails(teamId, session.user.id);
        setTeam(team);
        setIsAdmin(isAdmin);
      } catch (error) {
        console.error("Failed to fetch team details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTeamDetails();
  }, [teamId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
  
    try {
      const name = formData.get("name") as string;
      const amountLimit = formData.get("amountLimit") as string;
  
      // Validate fields
      if (!name || name.trim() === "") {
        throw new Error("Team name is required.");
      }
  
      if (!amountLimit || isNaN(Number(amountLimit)) || Number(amountLimit) < 0) {
        throw new Error("Amount limit must be a valid positive number.");
      }
  
      await saveTeamDetails(teamId, formData);
      alert("Team details updated successfully!");
      router.refresh();
    } catch (error: any) {
      alert(error.message || "An error occurred while saving changes.");
    }
  };

  const handleAddMember = async () => {
    try {
      if (!newMemberEmail) {
        alert("Please provide a valid email.");
        return;
      }
      
      // Call backend to add member by email
      const response = await addMember(teamId, newMemberEmail);
      if (response.success) {
        alert("Member added successfully!, refresh to see changes");
        setNewMemberEmail("");
        setIsDialogOpen(false);
        
      } else {
        alert("Failed to add member.");
      }
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Error adding member.");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const response = await removeMember(teamId, userId);
      if (response.success) {
        alert("Member removed successfully!, refresh once to see changes");
        // getTeamDetails(); // Refresh the team data
      } else {
        alert("Failed to remove member.");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Error removing member.");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!team) {
    return <p>Team not found.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Team: {team.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                defaultValue={team.amount_limit}
                className="w-full"
                min="0"
                step="1"
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
                    {member.isLeader ? (
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

        {isAdmin && (
          <div className="mt-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Member</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <Label htmlFor="newMemberEmail">Member Email</Label>
                  <Input
                    id="newMemberEmail"
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="Enter member email"
                    className="w-full"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddMember}>Add</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}
