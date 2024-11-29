import { SearchBar } from "@/components/search/SearchBar";
import { Gamepad } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16 bg-gradient-to-b from-background to-secondary">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Gamepad className="h-12 w-12 text-primary mr-2" />
          <h1 className="text-4xl font-bold">LoL Stats</h1>
        </div>
        <p className="text-muted-foreground">
          Track your League of Legends statistics and improve your game
        </p>
      </div>
      <SearchBar />
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        <FeatureCard
          title="Real-time Tracking"
          description="Monitor live games and get instant updates on player performance"
        />
        <FeatureCard
          title="Detailed Analytics"
          description="Access comprehensive statistics and performance metrics"
        />
        <FeatureCard
          title="Match History"
          description="Review past games and analyze your gameplay patterns"
        />
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-lg bg-card border shadow-sm">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
