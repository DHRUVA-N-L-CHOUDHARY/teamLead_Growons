import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { Copy } from "lucide-react";
import { db } from "@/lib/db";
import { toast } from "sonner";
import CopyButton from "@/components/shared/copy-referral";



const TeamCard = async () => {
  const session = await auth();
  
  const team = await db.team.findFirst({
    where: {
      leaderId: session?.user?.id
    },
    select: {
      refCode: true,
      id:true,
      name: true
    }
  });

  const copyRefCode = () => {
    if (team?.refCode) {
      navigator.clipboard.writeText(team.refCode);
      toast.success("Referral code copied!");
    }
  };

  if(team==null)return <></>

  return (
    <div className="flex flex-col mx-2 mt-5 w-full md:w-56 bg-gray-100 p-4 rounded-lg space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-semibold">My Team</span>
        <Button variant="link" className="font-medium p-0" asChild>
          <Link href={`/team/${team.id}`}>Edit</Link>
        </Button>
      </div>
      
      {team ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">{team.name}</p>
          <div className="flex items-center gap-2">
            <code className="bg-gray-200 px-2 py-1 rounded text-sm flex-1 truncate">
              {team.refCode}
            </code>
            <CopyButton text={team.refCode}/>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No team found</p>
      )}
    </div>
  );
};

export default TeamCard;