import React from "react";
import { db } from "@/lib/db";
import {
  Table,
  TableBody,
  TableFooter,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PaginationBar from "../../money/_components/PaginationBar";
import { revalidatePath } from "next/cache";
import TopBar from "../../_components/Topbar";
import Search from "@/components/shared/search";
import ProUser from "./prouser";

import { Button } from "@/components/ui/button";
import { removeMember } from "@/actions/admin-editTeam";

interface TeamMembersTableProps {
  teamId: string;
  searchParams: { page: string };
}

const RemoveMemberButton = ({ teamId, userId }: { teamId: string; userId: string }) => {
    const handleRemove = async () => {
      'use server'
      await removeMember(teamId, userId);
      revalidatePath(`/team/${teamId}`);
    };
  
    return (
      <form action={handleRemove}>
        <Button 
          type="submit"
          variant="destructive" 
          size="sm"
        >
          Remove
        </Button>
      </form>
    );
  };

const TeamMembersTable = async ({ teamId, searchParams }: TeamMembersTableProps) => {
  const currentPage = parseInt(searchParams.page) || 1;
  const pageSize = 7;

  const totalItemCount = await db.teamMember.count({
    where: {
      teamId: teamId
    }
  });

  const totalPages = Math.ceil(totalItemCount / pageSize);

  const teamMembers = await db.teamMember.findMany({
    where: {
      teamId: teamId
    },
    include: {
      user: true
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  const products = await db.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  revalidatePath(`/team/${teamId}`);

  return (
    <>
      <nav className="hidden md:block">
        <TopBar title="Team Members" />
      </nav>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined On</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead>
              <Search fileName="team-members" />
            </TableHead>
          </TableRow>
        </TableHeader>
        {totalItemCount === 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No team members found
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
        <TableBody>
          {teamMembers.map((member) => (
            <TableRow 
              key={member.id}
              className={member.user.role === "BLOCKED" ? "text-red-500" : ""}
            >
              <TableCell className="capitalize">{member.user.name}</TableCell>
              <TableCell>{member.user.email}</TableCell>
              <TableCell>{member.isLeader ? "Leader" : "Member"}</TableCell>
              <TableCell>{member.createdAt.toDateString()}</TableCell>
              <TableCell>
                <RemoveMemberButton teamId={teamId} userId={member.user.id} />
              </TableCell>
              {member.user.role !== "BLOCKED" && (
                <TableCell>
                  <ProUser
                    userId={member.user.id}
                    role={member.user.role}
                    products={products}
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <PaginationBar totalPages={totalPages} currentPage={currentPage} />
      )}
    </>
  );
};

export default TeamMembersTable;