import React from "react";
import LeadersTable from "../../_components/leader-table";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/app/(protected)/_components/Topbar";

const LeadersPage = ({ searchParams }: { searchParams: { page: string } }) => {
  return <>
  <div className="hidden md:block">
    <TopBar title="Team Records" />
  </div>
  <section className="space-y-4 md:max-h-[90vh] w-full md:w-[100%] p-2">
    <div className="flex items-center gap-x-2">
      <Button className="flex items-center " asChild>
        <Link href={`/admin/leaders/add`} className="inline">
          <Image
            src="/svgs/plus.svg"
            alt="add team"
            width={20}
            height={20}
            className="h-6 w-6 mr-1"
          />
          Add Leader here
        </Link>
      </Button>
    </div>
    <section>
      <LeadersTable searchParams={searchParams} />
    </section>
  </section>
</>;
};

export default LeadersPage;
