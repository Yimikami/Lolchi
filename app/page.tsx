import { SearchBar } from "@/components/search/SearchBar";
import { Gamepad, Activity, History, BarChart3 } from "lucide-react";
import Footer from "./footer";
import ChampionRotation from "./ChampionRotation";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex flex-col items-center px-4 py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="text-center mb-16 space-y-6">
          <div className="flex items-center justify-center mb-4 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-blue-400/20 rounded-full" />
              <Gamepad className="h-16 w-16 text-blue-500 relative transform hover:scale-110 transition-transform duration-200" />
            </div>
            <h1 className="text-6xl font-extrabold ml-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Lolchi
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl">
            Track your League of Legends statistics and elevate your gameplay to the next level
          </p>
        </div>

        <div className="w-full max-w-2xl mb-16">
          <SearchBar />
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-4">
          <FeatureCard
            icon={Activity}
            title="Real-time Tracking"
            description="Monitor live games and get instant updates on player performance"
          />
          <FeatureCard
            icon={BarChart3}
            title="Detailed Analytics"
            description="Access comprehensive statistics and performance metrics"
          />
          <FeatureCard
            icon={History}
            title="Match History"
            description="Review past games and analyze your gameplay patterns"
          />
        </div>

        <div className="mt-16 w-full max-w-6xl px-4">
          <ChampionRotation region="euw1" />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="group p-8 rounded-xl bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-3 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors duration-200">
          <Icon className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
