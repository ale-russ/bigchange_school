"use client";

import { Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function NavBar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-primary text-black shadow-md px-4">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="text-xl font-bold">
          School Management
        </Link>
        <div className="hidden md:flex items-center space-x-4">
          {session ? (
            <>
              <Link
                href={`/${session.user.role}/dashboard`}
                className="hover:text-accent"
              >
                Dashboard
              </Link>
              <Link href="/api/auth/signout" className="hover:text-accent">
                Sign Out
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hover:text-accent">
                Login
              </Link>
              <Link href="/auth/register" className="hover:text-accent">
                Sign Up
              </Link>
            </>
          )}
        </div>
        <button
          className="md:hidden focus:outline-none"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-primary p-4">
          <div className="flex flex-col space-y-4">
            {session ? (
              <>
                <Link
                  href={`/${session.user.role}/dashboard`}
                  className="hover:text-accent"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                <Link
                  href="/api/auth/signout"
                  className="hover:text-accent"
                  onClick={toggleMenu}
                >
                  Sign Out
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="hover:text-accent"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="hover:text-accent"
                  onClick={toggleMenu}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
