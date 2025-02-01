"use client";

import Link from "next/link";
import { Gamepad, Menu, X, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { HeaderSearchBar } from "@/components/search/HeaderSearchBar";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isProfilePage =
    pathname.split("/").length === 3 ||
    pathname.split("/").length === 4 ||
    pathname.includes("leaderboards");

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Gamepad className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Lolchi
              </span>
            </Link>
          </div>

          {/* Search Bar - Only on Profile Pages */}
          {isProfilePage && (
            <div className="hidden md:block w-[500px]">
              <HeaderSearchBar />
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              className="flex items-center gap-2 hover:bg-blue-50"
            >
              <Link href="/leaderboards">
                <Trophy className="w-4 h-4 text-blue-500" />
                <span>Leaderboards</span>
              </Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Link href="https://github.com/Yimikami/Lolchi">Github Repo</Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Search Bar - Only on Profile Pages */}
            {isProfilePage && (
              <div className="w-full">
                <HeaderSearchBar />
              </div>
            )}

            <Button
              asChild
              variant="ghost"
              className="w-full flex items-center justify-center gap-2 hover:bg-blue-50"
            >
              <Link href="/leaderboards">
                <Trophy className="w-4 h-4 text-blue-500" />
                <span>Leaderboards</span>
              </Link>
            </Button>
            <Button
              asChild
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Link href="https://github.com/Yimikami/Lolchi">Github Repo</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
