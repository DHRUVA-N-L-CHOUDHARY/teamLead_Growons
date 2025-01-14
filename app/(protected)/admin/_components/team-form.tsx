"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AddTeamSchema } from "@/schemas";
import { createTeam } from "@/actions/admin-createTeam";

type FormValues = z.infer<typeof AddTeamSchema>;

type TeamProps = {
  users: Array<{ id: string; name: string }>;
  products: any;
};

const TeamForm = ({ users, products }: TeamProps) => {
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = useState<string | undefined>("");
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(AddTeamSchema),
    defaultValues: {
      teamName: "",
      teamLeader: "",
      amount: 0,
      products: [
        {
          name: "",
          minProduct: 0,
          maxProduct: 1,
          price: 0,
        },
      ],
      teamDescription: "",
    },
  });

  const { fields, append } = useFieldArray({
    name: "products",
    control: form.control,
  });

  const onSubmit = (values: FormValues) => {
    setError("");
    if (values.products?.some((product) => !product.name)) {
      toast.error("All selected products must have a name");
      return;
    }
  
    startTransition(() => {
      createTeam(values).then((data) => {
        if (data?.success) {
          toast.success(data.success);
          form.reset();
          router.refresh();
        }
        if (data?.error) {
          setError(data.error);
          toast.error(data.error);
        }
      });
    });
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 w-full md:w-[50%]"
      >
        <FormField
          control={form.control}
          name="teamName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter team name"
                  {...field}
                  disabled={isPending}
                  type="name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="teamLeader"
          render={({ field }) => {
            const filteredUsers = users.filter((user) =>
              user.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            return (
              <FormItem>
                <FormLabel>Team Leader</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Search Input */}
                      <div className="p-2">
                        <Input
                          type="text"
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      {/* Filtered List */}
                      {filteredUsers.map((user) => (
                        <SelectItem value={user.id} key={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enter the amount limit</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Enter the amount limit"
                  type="number"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-4">
          <FormLabel>Product</FormLabel>
        </div>

        {fields.map((item, index) => (
          <div key={item.id}>
            <FormField
              control={form.control}
              name={`products.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    disabled={isPending}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product: any) => (
                        <SelectItem
                          key={product.id}
                          value={product.name}
                          className="capitalize"
                        >
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`products.${index}.minProduct`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum no of products</FormLabel>
                  <FormControl>
                    <Input type="number" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`products.${index}.maxProduct`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum no of products</FormLabel>
                  <FormControl>
                    <Input type="number" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`products.${index}.price`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price of the product</FormLabel>
                  <FormControl>
                    <Input type="number" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
        <div>
                            <FormField
                              control={form.control}
                              name="products"
                              render={() => (
                                <Button
                                  type="button"
                                  disabled={isPending}
                                  className={`mb-2`}
                                >
                                  <div className="flex items-center gap-x-3 mt-2 mb-2">
                                    <label
                                      htmlFor="Products"
                                      className={`text-sm text-[7E8DA0] cursor-pointer focus:outline-none focus:underline`}
                                      tabIndex={0}
                                      onClick={() => {
                                        const lastProduct =
                                          form.getValues().products[fields.length - 1];
        
                                        if (
                                          lastProduct &&
                                          lastProduct.name.trim() !== ""
                                        ) {
                                          append({
                                            name: "",
                                            minProduct: 0,
                                            maxProduct: 0,
                                            price: 0,
                                          });
                                        } else {
                                          toast.error(
                                            "Please fill in the previous product before adding a new one."
                                          );
                                        }
                                      }}
                                    >
                                      Add Product
                                    </label>
                                  </div>
                                </Button>
                              )}
                            />
                          </div>
        <FormField
          control={form.control}
          name="teamDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter team description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={isPending} type="submit" className="w-full">
          Create Team
        </Button>
      </form>
    </Form>
  );
};

export default TeamForm;
