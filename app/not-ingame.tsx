import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotInGame() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">404 - Game not found</h1>
      <p className="text-muted-foreground mb-8">
        The summoner you're looking for doesn't in a game or there was an error
        fetching their data.
      </p>
      <Button asChild>
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Return Home
        </Link>
      </Button>
    </div>
  );
}
