"use client";

import { removeMember } from "@/actions/admin-editTeam";

type RemoveMemberFormProps = {
  teamId: string;
  userId: string;
  onRemove?: () => void; // Optional callback after removal
};

export default function RemoveMemberForm({ teamId, userId, onRemove }: RemoveMemberFormProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const confirmation = confirm("Are you sure you want to remove this member?");
    if (!confirmation) return;

    try {
      const res = await removeMember(teamId, userId);

      if(res.success){
        alert(res.message);
      }

      if (onRemove) {
        onRemove();
      }
    } catch (error) {
      console.error(error);
      alert("Error removing member");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" className="text-red-600 hover:underline">
        Remove
      </button>
    </form>
  );
}
