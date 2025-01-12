import React from "react";

import { auth } from "@/auth";
import TopBar from "../../../_components/Topbar";
import TeamForm from "../../_components/team-form";
import { db } from "@/lib/db";

export const generateMetadata = () => {
  return {
    title: "Edit Team | GrowonsMedia",
    description: "Edit Team",
  };
};

const page = async () => {
  const session = await auth();
  const products = await db.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  const mergedProducts = products.map((product) => {
    //@ts-ignore
    return {
      id: product.id,
      name: product.productName,
      description: product.description,
    };
  });
  const users = await db.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <>
      <nav className="md:block hidden">
        <TopBar title="Add Team" />
      </nav>
      <section className="h-screen overflow-auto">
        <div className="mb-11 mx-1">
          <TeamForm products={mergedProducts} users={users} />
        </div>
      </section>
    </>
  );
};

export default page;
