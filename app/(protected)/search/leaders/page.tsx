import { Metadata } from "next";
import { db } from "@/lib/db";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import SearchPaginationBar from "@/components/shared/search-paginationbar";
import Search from "@/components/shared/search";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";

interface SearchLeaderPageProps {
  searchParams: { query: string; page: string };
}

export function generateMetadata({
  searchParams: { query },
}: SearchLeaderPageProps): Metadata {
  return {
    title: `Search Leaders: ${query} - Growonsmedia`,
  };
}

const SearchLeaderPage = async ({
  searchParams: { query, page },
}: SearchLeaderPageProps) => {
  const currentPage = parseInt(page) || 1;
  const pageSize = 7;

  const totalItemCount = await db.user.count({
    where: {
      AND: [
        { role: "LEADER" },
        {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
      ],
    },
  });

  const totalPages = Math.ceil(totalItemCount / pageSize);

  const leaders = await db.user.findMany({
    where: {
      AND: [
        { role: "LEADER" },
        {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
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

  revalidatePath("/admin/leaders");

  if (leadersWithTeamDetails.length === 0) {
    return (
      <section className="m-2">
        <div className="flex items-center justify-between gap-x-2 p-1">
          <Search fileName="leaders" />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Leader Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Team</TableHead>
            </TableRow>
          </TableHeader>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No leaders found
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </section>
    );
  }

  return (
    <section className="m-2">
      <div className="flex items-center justify-between gap-x-2 p-1">
        <Search fileName="leaders" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Leader Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Team</TableHead>
          </TableRow>
        </TableHeader>
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
      <SearchPaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        searchQuery={query}
      />
    </section>
  );
};

export default SearchLeaderPage;
