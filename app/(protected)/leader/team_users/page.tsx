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
import BalanceCell from "../../admin/_components/Balance-cell";
import ProUser from "../../admin/_components/upgrade-to-pro";
import TopBar from "../../_components/Topbar";
import EditUser from "./_components/edit-user";
import Search from "@/components/shared/search";

const UserTable = async ({
  searchParams,
}: {
  searchParams: { page: string };
}) => {
  const currentPage = parseInt(searchParams.page) || 1;

  const pageSize = 7;

  const totalItemCount = await db.user.count();

  const totalPages = Math.ceil(totalItemCount / pageSize);

  const users = await db.user.findMany({
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

  revalidatePath("/admin/user");

  return (
    <>
      <nav className="hidden md:block">
        <TopBar title="User Management" />
      </nav>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>UserName</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Wallet</TableHead>
            <TableHead>Payment Type</TableHead>
            <TableHead>Joined on</TableHead>
            <TableHead colSpan={2}>
              <Search fileName={"user-management"} />
            </TableHead>
          </TableRow>
        </TableHeader>
        {totalItemCount === 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No users found
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              className={user.role === "BLOCKED" ? "text-red-500" : ""}
            >
              <TableCell className="capitalize">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <BalanceCell id={user.id} />
              </TableCell>
              <TableCell>
                {user.paymentType === "PAYMENT_GATEWAY"
                  ? "Payment Gateway"
                  : "Manual"}
              </TableCell>
              <TableCell>{user.createdAt.toDateString()}</TableCell>
              <TableCell>
                <EditUser user={user} />
              </TableCell>
              {user.role !== "BLOCKED" && (
                <TableCell>
                  <ProUser
                    userId={user.id}
                    role={user.role}
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

export default UserTable;
