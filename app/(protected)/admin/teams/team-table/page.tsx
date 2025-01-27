import React from "react";
import TeamTable from "../../_components/team-table";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import TopBar from "@/app/(protected)/_components/Topbar";

const TeamPage = ({ searchParams }: { searchParams: { page: string } }) => {
  return (
    <>
      <div className="hidden md:block">
        <TopBar title="Team Records" />
      </div>
      <section className="space-y-4 md:max-h-[90vh] w-full md:w-[100%] p-2">
        <div className="flex items-center gap-x-2">
          <Button className="flex items-center " asChild>
            <Link href={`/admin/teams/add`} className="inline">
              <Image
                src="/svgs/plus.svg"
                alt="add team"
                width={20}
                height={20}
                className="h-6 w-6 mr-1"
              />
              Add Team here
            </Link>
          </Button>
        </div>
        <section>
          <TeamTable searchParams={searchParams} />
        </section>
      </section>
    </>
  );
};

export default TeamPage;
