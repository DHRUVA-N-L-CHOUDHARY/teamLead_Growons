import React from "react";
import Link from "next/link";
import { AdminSidebar, LeaderSidebar, SidebarItems, SupportPolicies } from "./NavBarItems";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const NavItems = async () => {
  const session = await auth();
  // find team id with current user
  const team = await db.team.findFirst({
    where: {
      leaderId: session?.user?.id,
    },
    select: {
      id: true,
    },
  })
  return (
    <ul className="space-y-2 font-medium">
      <li>
        <Link
          href="/"
          className="flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100 "
        >
          <span className="flex-1 ms-3 whitespace-nowrap">Dashboard</span>
        </Link>
      </li>
      {session?.user.role === "ADMIN" ? (
        <></>
      ) : (
        <>
        
          <li>
            <Link
              href={`/money/record/${session?.user?.id}`}
              className="flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100 "
            >
              <span className="flex-1 ms-3 whitespace-nowrap">
                Deposit Money
              </span>
            </Link>
          </li>

          <li>
            <Link
              href={`/orders/products/${session?.user.id}`}
              className="flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100"
            >
              <span className="flex-1 ms-3 whitespace-nowrap">
                Place new order
              </span>
            </Link>
          </li>
          <li>
            <Link
              href={`/orders/records/${session?.user.id}`}
              className="flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100"
            >
              <span className="flex-1 ms-3 whitespace-nowrap">
                Download Leads
              </span>
            </Link>
          </li>
          <li>
            <Link
              href={`/money/wallet-flow/${session?.user?.id}`}
              className="flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100 "
            >
              <span className="flex-1 ms-3 whitespace-nowrap">Wallet flow</span>
            </Link>
          </li>
          {session?.user.role === "LEADER" && team && <LeaderSidebar teamId={team.id} />}
          <li>
            <Link
              href={`/feedback/reply/${session?.user.id}`}
              className="flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100 "
            >
              <span className="flex-1 ms-3 whitespace-nowrap">Feedback</span>
            </Link>
          </li>
          <li>
            <Link
              href={`/withdraw/record/${session?.user?.id}`}
              className="flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100 "
            >
              <span className="flex-1 ms-3 whitespace-nowrap">
                Request Withdrawal
              </span>
            </Link>
          </li>
          <SupportPolicies />
        </>
      )}
      
      {session?.user.role === "ADMIN" && <AdminSidebar />}
      

    </ul>
  );
};

export default NavItems;
