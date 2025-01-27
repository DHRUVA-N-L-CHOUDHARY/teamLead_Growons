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
import RemoveMemberForm from "../../team/_components/remove-member";

interface SearchTeamPageProps {
  searchParams: { query: string; page: string };
}

export function generateMetadata({
  searchParams: { query },
}: SearchTeamPageProps): Metadata {
  return {
    title: `Search Team Members: ${query} - Growonsmedia`,
  };
}

const SearchTeamPage = async ({ searchParams: { query, page } }: SearchTeamPageProps) => {
  const currentPage = parseInt(page) || 1;
  const pageSize = 10;

  const totalItemCount = await db.teamMember.count({
    where: {
      OR: [
        { user: { name: { contains: query, mode: "insensitive" } } },
        { user: { email: { contains: query, mode: "insensitive" } } },
      ],
    },
  });

  const totalPages = Math.ceil(totalItemCount / pageSize);

  const teamMembers = await db.teamMember.findMany({
    where: {
      OR: [
        { user: { name: { contains: query, mode: "insensitive" } } },
        { user: { email: { contains: query, mode: "insensitive" } } },
      ],
    },
    include: {
      user: true,
    },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  if (teamMembers.length === 0) {
    return (
      <section className="m-2">
        <div className="flex items-center justify-between gap-x-2">
          <Search fileName="leader-team" />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined On</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No team members found
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
        <Search fileName="leader-team" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined On</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamMembers.map((member) => (
            <TableRow key={member.id}>
              <TableCell>{member.user.name}</TableCell>
              <TableCell>{member.user.email}</TableCell>
              <TableCell>
                {member.user.role === "LEADER" ? "Leader" : "Member"}
              </TableCell>
              <TableCell>
                {new Date(member.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {member.user.role !== "LEADER" && (
                  <RemoveMemberForm
                    teamId={member.teamId}
                    userId={member.user.id}
                  />
                )}
              </TableCell>
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

export default SearchTeamPage;
