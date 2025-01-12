"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteTeam } from "@/actions/admin-removeTeam";

const TeamRemove = ({ teamId }: { teamId: string }) => {
  const handleRemove = async () => {
    try {
      await deleteTeam(teamId);
      toast.success("Team removed successfully");
      console.log(`Remove team: ${teamId}`);
    } catch (error) {
      toast.error("Failed to remove team");
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleRemove}
      className="text-black"
    >
      Remove
    </Button>
  );
};

export default TeamRemove;
