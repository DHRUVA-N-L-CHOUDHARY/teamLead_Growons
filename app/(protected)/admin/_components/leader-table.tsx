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
      password: true,
      teamId: true,
    },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  const teams = await db.team.findMany({
    select: {
      id: true,
      name: true,
    },
  });

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
          {leaders.map((leader) => (
            <TableRow key={leader.id}>
              <TableCell className="capitalize">{leader.name}</TableCell>
              <TableCell>{leader.email}</TableCell>
              <TableCell>{leader.number}</TableCell>
              <TableCell>
                <Select defaultValue={leader.teamId || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
