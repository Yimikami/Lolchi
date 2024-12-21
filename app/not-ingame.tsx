import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotInGame() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="text-center space-y-6 max-w-2xl mx-auto px-4">
        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Not In Game
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          The player you're looking for is not currently in a game or there was an
          error fetching their data.
        </p>
        <Button
          asChild
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Link href="/" className="inline-flex items-center px-6 py-3">
            <Home className="mr-2 h-5 w-5" />
            Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
