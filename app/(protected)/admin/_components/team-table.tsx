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
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import CopyButton from "@/components/shared/copy-button";
import TeamEdit from "./team-edit";
import ViewProductsDialog from "./view-products";
import TeamRemove from "./team-remove";
import Search from "@/components/shared/search";

export const revalidate = 3600;

const TeamTable = async ({
  searchParams,
}: {
  searchParams: { page: string };
}) => {
  const currentPage = parseInt(searchParams.page) || 1;
  const pageSize = 7;

  const totalItemCount = await db.team.count();
  const totalPages = Math.ceil(totalItemCount / pageSize);

  const teams = await db.team.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      leaderId: true,
      leader:true,
      refCode: true,
      products:true
    },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  console.log(teams)

  return (
    <>
    <div className="p-1 m-1 w-[100%] flex justify-end">
        <Search fileName="team-listing" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team Name</TableHead>
            <TableHead>Leader Name</TableHead>
            <TableHead>Referral Code</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Edit</TableHead>
            <TableHead>Remove</TableHead>
          </TableRow>
        </TableHeader>

        {totalItemCount === 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No teams found
              </TableCell>
            </TableRow>
          </TableFooter>
        )}

        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell className="capitalize">{team.name}</TableCell>
              <TableCell className="capitalize">
                {team.leader.name || "Admin"}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <span>{team.refCode}</span>
                  <CopyButton text={team.refCode} />
                </div>
              </TableCell>
              <TableCell>
                <ViewProductsDialog products= {JSON.parse(JSON.stringify(team.products))} />
              </TableCell>
              <TableCell>
                <TeamEdit teamId={team.id} />
              </TableCell>
              <TableCell>
                <TeamRemove teamId={team.id} />
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

export default TeamTable;
