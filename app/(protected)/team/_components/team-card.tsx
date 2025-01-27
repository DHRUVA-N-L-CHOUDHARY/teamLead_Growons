
"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserRole } from "@prisma/client";
import { MoreHorizontal, Users, Settings, Crown, CreditCard, UserMinus } from "lucide-react";
import { useState } from "react";

interface TeamCardProps {
  team: {
    id: string;
    name: string;
    refCode: string;
    amount_limit: number;
    products: any;
    leader: {
      name: string;
    };
  };
  userRole : any;
}

const TeamCard = ({ team , userRole }: TeamCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const isLeader = userRole === "LEADER";
  
  // Convert products from JSON to array and get count
  const productsArray = Array.isArray(team.products) 
    ? team.products 
    : Object.values(team.products);
  const productCount = productsArray.length;

  // Placeholder action handlers
  const handleManageUsers = () => {
    setIsLoading(true);
    // Implementation will go here
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleRemoveUser = (userId: string) => {
    setIsLoading(true);
    // Implementation will go here
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleUpdateUserRole = (userId: string, newRole: "PRO" | "USER") => {
    setIsLoading(true);
    // Implementation will go here
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleUpdateCreditLimit = (userId: string) => {
    setIsLoading(true);
    // Implementation will go here
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <Card
    onClick={() => window.location.href = `/teams/${team.id}`}    
    className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{team.name}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={isLeader ? "default" : "secondary"}>
            {userRole}
          </Badge>
          {isLeader && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Team Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleManageUsers}>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleUpdateUserRole("placeholder-id", "PRO")}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleUpdateUserRole("placeholder-id", "USER")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Downgrade to User
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleUpdateCreditLimit("placeholder-id")}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Update Credit Limit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleRemoveUser("placeholder-id")}
                  className="text-red-600"
                >
                  <UserMinus className="mr-2 h-4 w-4" />
                  Remove User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Team Lead:</span>
            <span>{team.leader.name}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Reference Code:</span>
            <span className="font-mono">{team.refCode}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Amount Limit:</span>
            <span>₹{team.amount_limit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Products:</span>
            <span>{productCount}</span>
          </div>
        </div>
        
        {isLeader && (
          <div className="mt-4 space-y-2">
            <Button 
              onClick={handleManageUsers}
              className="w-full"
              disabled={isLoading}
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Team Members
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamCard;