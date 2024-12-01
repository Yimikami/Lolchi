import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotInGame() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200">
      <h1 className="text-5xl font-extrabold mb-4 text-gray-800">
        Player Not In Game
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        The player you're looking for is not currently in a game or there was an
        error fetching their data.
      </p>
      <Button
        asChild
        className="hover:bg-primary transition-colors duration-300"
      >
        <Link href="/">
          <Home className="mr-2 h-5 w-5" />
          Return Home
        </Link>
      </Button>
    </div>
  );
}
