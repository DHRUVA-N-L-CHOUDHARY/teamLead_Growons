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
import { Input } from "@/components/ui/input"; // Import the Input component
import { redirect } from "next/navigation"; // For handling search redirection
import { revalidatePath } from "next/cache";
import Search from "@/components/shared/search";

export const revalidate = 3600;

const LeaderTable = async ({
  searchParams,
}: {
  searchParams: { page: string; query: string };
}) => {
  const currentPage = parseInt(searchParams.page) || 1;
  const query = searchParams.query || ""; // Extract the search query from the URL
  const pageSize = 7;

  // Fetch total count of leaders (filtered by search query if applicable)
  const totalItemCount = await db.user.count({
    where: {
      role: "LEADER",
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        // Search by team name (if applicable)
      ],
    },
  });

  const totalPages = Math.ceil(totalItemCount / pageSize);

  // Fetch leaders (filtered by search query if applicable)
  const leaders = await db.user.findMany({
    where: {
      role: "LEADER",
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } }
        // Search by team name (if applicable)
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      number: true,
      teamId: true,
    },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  // Fetch team details for each leader
  const leadersWithTeamDetails = await Promise.all(
    leaders.map(async (leader) => {
      const teamDetails = leader.teamId
        ? await db.team.findUnique({
            where: { id: leader.teamId },
            select: { name: true },
          })
        : null;

      return {
        id: leader.id,
        name: leader.name,
        number: leader.number,
        email: leader.email,
        teamId: leader.teamId,
        teamName: teamDetails?.name || "No Team Assigned",
      };
    })
  );

  revalidatePath("/admin/leader");

  // Handle search submission
  const handleSearch = async (formData: FormData) => {
    "use server";
    const newQuery = formData.get("query") as string;
    redirect(`/search/leaders?query=${newQuery}&page=1`); // Redirect to the search page
  };

  return (
    <div className="p-6">
      <Search fileName="leaders" />
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
              <TableCell colSpan={4} className="text-center">
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
              <TableCell>{leader.teamName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <PaginationBar totalPages={totalPages} currentPage={currentPage} />
      )}
    </div>
  );
};

export default LeaderTable;
