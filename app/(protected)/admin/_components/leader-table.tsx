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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { revalidatePath } from "next/cache";

export const revalidate = 3600;

const LeaderTable = async ({
  searchParams,
}: {
  searchParams: { page: string };
}) => {
  const currentPage = parseInt(searchParams.page) || 1;
  const pageSize = 7;

  const totalItemCount = await db.user.count({
    where: { role: "LEADER" },
  });
  const totalPages = Math.ceil(totalItemCount / pageSize);

  const leaders = await db.user.findMany({
    where: { role: "LEADER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      number: true,
      teamId : true
    },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  const leadersWithTeamDetails = [];
  
  if (leaders.length !== 0) {
    for (let i = 0; i < leaders.length; i++) {
      const leader = leaders[i];
  
      const teamDetails = leader.teamId
        ? await db.team.findUnique({
            where: { id: leader.teamId },
            select: { name: true },
          })
        : null;
  
      leadersWithTeamDetails.push({
        id: leader.id,
        name: leader.name,
        number: leader.number,
        email: leader.email,
        teamId: leader.teamId,
        teamName: teamDetails?.name || "No Team Assigned",
      });
    }
  }

  console.log(leadersWithTeamDetails);
  

  revalidatePath("/admin/leader");

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Leader Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Team</TableHead>
          </TableRow>
        </TableHeader>

        {totalItemCount === 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No leaders found
              </TableCell>
            </TableRow>
          </TableFooter>
        )}

        <TableBody>
          {leadersWithTeamDetails.map((leader) => (
            <TableRow key={leader.id}>
              <TableCell className="capitalize">{leader.name}</TableCell>
              <TableCell>{leader.email}</TableCell>
              <TableCell>{leader.number}</TableCell>
              <TableCell>
                {leader.teamName}
              </TableCell>
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

export default LeaderTable;
