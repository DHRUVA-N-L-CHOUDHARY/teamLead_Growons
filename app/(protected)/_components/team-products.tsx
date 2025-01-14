import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { db } from "@/lib/db";

const TeamProductsCard = async () => {
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
    if(team==null)return <></>
  return (
    <div className="flex justify-around flex-col mx-2 mt-5 w-full md:w-56 bg-gray-100 p-2 rounded-lg h-24 md:h-28">
      <div className="flex justify-between items-center">
        <span className="font-semibold">Products</span>
        <Button variant={"link"} className="font-medium" asChild>
          <Link href={`/team/products`}>Inspect</Link>
        </Button>
      </div>
    </div>
  );
};

export default TeamProductsCard;
