"use client";
import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormItem,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const LeaderSchema = z.object({
  leaderName: z.string().min(1, "Leader name is required"),
  leaderEmail: z.string().email("Invalid email address"),
  leaderPhone: z.string().min(10, "Invalid phone number"),
  leaderPassword: z.string().optional(),
  teamId: z.string().min(1, "Team selection is required"),
});

type LeaderFormValues = z.infer<typeof LeaderSchema>;

type LeaderFormProps = {
  users: Array<{ id: string; name: string; email: string; phone: string }>;
  teams: Array<{ id: string; name: string }>;
};

const LeaderForm = ({ users, teams }: LeaderFormProps) => {
  const [isPending, startTransition] = React.useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  
  const form = useForm<LeaderFormValues>({
    resolver: zodResolver(LeaderSchema),
    mode: "onBlur",
  });

  const handleGeneratePassword = (name: string) => {
    const prefix = name.slice(0, 3).toLowerCase();
    return `${prefix}@123`;
  };

  const onSubmit = (values: LeaderFormValues) => {
    startTransition(() => {
      console.log("Submitting leader data:", values);
      toast.success("Leader created successfully");
      form.reset();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full md:w-[50%]">
        {/* Leader Name */}
        <FormField
          control={form.control}
          name="leaderName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Leader Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Enter leader name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Leader Email */}
        <FormField
          control={form.control}
          name="leaderEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Leader Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter leader email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Leader Phone */}
        <FormField
          control={form.control}
          name="leaderPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Leader Phone</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Enter leader phone number"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Leader Password */}
        <FormField
          control={form.control}
          name="leaderPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Leader Password</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Auto-generated password"
                  {...field}
                  value={
                    field.value ||
                    handleGeneratePassword(form.getValues().leaderName || "")
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Team Selection */}
        <FormField
          control={form.control}
          name="teamId"
          render={({ field }) => {
            const filteredTeams = teams.filter((user) =>
              user.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            return (
              <FormItem>
                <FormLabel>Team</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Team" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Search Input */}
                      <div className="p-2">
                        <Input
                          type="text"
                          placeholder="Search Teams..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      {/* Filtered List */}
                      {filteredTeams.map((team) => (
                        <SelectItem value={team.id} key={team.id}>
                          {team.name}
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

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creating Leader..." : "Create Team Leader"}
        </Button>
      </form>
    </Form>
  );
};

export default LeaderForm;
