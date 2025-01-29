"use client";

import React, { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormControl,
  FormMessage,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/shared/form-error";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import DowngradeToUser from "./downgrade";
import { addProUser } from "@/actions/user-pro";
import { ProUserSchema } from "@/schemas";

interface Product {
  name: string;
  minProduct: number;
  maxProduct: number;
  price: number;
}

type ProUserProps = {
  userId: string;
  role: "PRO" | "BLOCKED" | "ADMIN" | "USER" | "LEADER";
  products_from_team?: any;
};

const ProUser = ({ userId, role, products_from_team }: ProUserProps) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>("");
  console.log("Products - ", products_from_team);

  const form = useForm<z.infer<typeof ProUserSchema>>({
    resolver: zodResolver(ProUserSchema),
    defaultValues: {
      userId: userId,
      amount: 0,
    },
  });

  const handleSubmitWrapper = (event: React.FormEvent<HTMLFormElement>) => {
    
    event.preventDefault();
    onSubmit(form.getValues());
  };

  const onSubmit = (values: z.infer<typeof ProUserSchema>) => {
    values.products = products_from_team;
    console.log("Submitting Values: ", values);

    startTransition(() => {
      addProUser(values).then((data) => {
        if (data?.error) {
          setError(data.error);
          toast.error(data.error);
        } else if (data?.success) {
          toast.success(data.success);
          form.reset();
        }
      });
    });
  };

  return (
    <>
      {role === "PRO" ? (
        <DowngradeToUser userId={userId} />
      ) : (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="default">Upgrade to Pro</Button>
          </SheetTrigger>
          <SheetContent className="w-[300px] flex flex-col gap-6 bg-white overflow-auto md:w-full">
            <SheetTitle>
              <p className="text-2xl font-bold">Upgrade to Pro</p>
            </SheetTitle>
            <Separator className="border border-gray-500" />
            <Form {...form}>
              <form
                onSubmit={handleSubmitWrapper}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enter the Amount Limit</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isPending}
                            placeholder="Enter the amount limit"
                            type="number"
                            step="0.01"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormError message={error} />
                <SheetFooter>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full"
                  >
                    {isPending ? "Submitting..." : "Upgrade to Pro"}
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

export default ProUser;
