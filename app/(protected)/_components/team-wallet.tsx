import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { Copy } from "lucide-react";
import { db } from "@/lib/db";
import { toast } from "sonner";
import CopyButton from "@/components/shared/copy-button";
import { formatPrice } from "@/components/shared/formatPrice";

const TeamWallet = async () => {
  const session = await auth();
  
  // Fetch team details where current user is leader
  const team = await db.team.findFirst({
    where: {
      leaderId: session?.user?.id
    },
    select: {
      refCode: true,
      id:true,
      name: true,
      amount_limit:true,
    }
  });

  if(!team)return <></>
 

  return (
    <div className="flex flex-col mx-2 mt-5 w-full md:w-56 bg-gray-100 p-4 rounded-lg space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-semibold">Team Balance </span>
        
    </div>
    <div>
        <span className="font-semibold">{formatPrice(team?.amount_limit)}</span>
        </div>
    </div>
  );
};

export default TeamWallet;