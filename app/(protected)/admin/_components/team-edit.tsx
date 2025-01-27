"use client"
import React from "react";
import { Button } from "@/components/ui/button";

const TeamEdit = ({ teamId }: { teamId: string }) => {
  const handleEdit = () => {
    // route to edit team page /admin/teams/edit/:teamId
    // router.push not working
    window.location.href = `/admin/teams/edit/${teamId}`;
    console.log(`Edit team: ${teamId}`);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleEdit}>
      Edit
    </Button>
  );
};

export default TeamEdit;
