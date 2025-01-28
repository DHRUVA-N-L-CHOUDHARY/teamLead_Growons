import React from "react";
import Link from "next/link";
import {
  AdminSidebar,
  LeaderSidebar,
  ProSidebar,
  SidebarItems,
  SupportPolicies,
} from "./NavBarItems";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const NavItems = async () => {
  const session = await auth();
  let team;
   team = await db.team.findFirst({
    where: {
      leaderId: session?.user?.id,
    },
    select: {
      id: true,
      name: true,
    },
  });
  

  if(!team){
    const teamId = await db.user.findFirst({
      where:{
      id:session?.user?.id
    },
    select:{
      teamId:true
    }
    })
    console.log(teamId)
    team = await db.team.findFirst({
      where:{
        id:teamId?.teamId || ""
      }
    })

  }

  return (
    <ul className="space-y-4 font-medium">
      <li>
        <Link
          href="/"
          className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100"
        >
          <span className="flex-1 ms-3 whitespace-nowrap">Dashboard</span>
        </Link>
      </li>

      {team && (
        <li className="p-4 bg-gray-100 rounded-lg shadow">
          <div className="flex flex-col items-start">
            <h4 className="text-sm font-semibold text-gray-600">Your Team</h4>
            <p className="text-xl text-black">
              {team.name}
            </p>
          </div>
        </li>
      )}

      {session?.user.role !== "ADMIN" && (
        <>
          {/* User-specific Links */}
          <li>
            <Link
              href={`/money/record/${session?.user?.id}`}
              className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <span className="flex-1 ms-3 whitespace-nowrap">
                Deposit Money
              </span>
            </Link>
          </li>
          <li>
            <Link
              href={`/orders/products/${session?.user.id}`}
              className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <span className="flex-1 ms-3 whitespace-nowrap">
                Place New Order
              </span>
            </Link>
          </li>
          <li>
            <Link
              href={`/orders/records/${session?.user.id}`}
              className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <span className="flex-1 ms-3 whitespace-nowrap">
                Download Leads
              </span>
            </Link>
          </li>
          <li>
            <Link
              href={`/money/wallet-flow/${session?.user?.id}`}
              className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <span className="flex-1 ms-3 whitespace-nowrap">Wallet Flow</span>
            </Link>
          </li>
          <li>
            <Link
              href={`/feedback/reply/${session?.user.id}`}
              className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <span className="flex-1 ms-3 whitespace-nowrap">Feedback</span>
            </Link>
          </li>
          <li>
            <Link
              href={`/withdraw/record/${session?.user?.id}`}
              className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100"
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
      {session?.user.role === "PRO" && <ProSidebar />}
      {session?.user.role === "LEADER" && <LeaderSidebar />}
    </ul>
  );
};

export default NavItems;
