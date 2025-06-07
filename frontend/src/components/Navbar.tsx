"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "./ui/button";


export default function Navbar() {
  const { user, logout } = useAuth();
console.log("user: ", user);
  return (
    <NavigationMenu className="w-full p-4 bg-primary text-primary-foreground">
      <NavigationMenuList className="flex gap-4 w-full">
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/">Home</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {!user?.role && (
          <>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/login">Login</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/register">Register</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </>
        )}
        {user.role === "admin" && (
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/admin/dashboard">Admin Dashboard</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        )}
        {user.role === "teacher" && (
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/teacher/dashboard">Teacher Dashboard</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        )}
        {user.role &&(
         <NavigationMenuItem>
              <Button variant={"destructive"}  onClick={logout} className="ml-2">
                Logout
              </Button>
            </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
