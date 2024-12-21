import {
  getSummonerByPUUID,
  getAccountByRiotID,
  getRankedInfo,
  getCurrentGame,
} from "@/lib/api/riot";
import { notFound } from "next/navigation";
import { SummonerProfile } from "./SummonerProfile";
import { MatchHistory } from "./MatchHistory";
import { RecentlyPlayedWith } from "./RecentlyPlayedWith";
import { ChampionStatistics } from "./ChampionStatistics";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RegionId, regions } from "@/lib/config/regions";
import Footer from "@/app/footer";

export default async function SummonerPage({
  params,
}: {
  params: { region: RegionId; summonerName: string; tagLine: string };
}) {
  try {
    const regionConfig = regions.find((r) => r.id === params.region);
    if (!regionConfig) return;

    const account = await getAccountByRiotID(
      regionConfig.platform,
      params.summonerName.split("%2B")[0],
      params.summonerName.split("%2B")[1]
    );
    const SummonerName = decodeURIComponent(params.summonerName).replace(
      /\+/g,
      "#"
    );
    const summoner = await getSummonerByPUUID(
      params.region as any,
      account.puuid
    );
    const rankedInfo = await getRankedInfo(params.region as any, summoner.id);
    let gameData = null;
    try {
      gameData = await getCurrentGame(params.region as any, summoner.puuid);
    } catch (error) {
      console.error("Player is not in a game");
    }
    return (
      <div className="container mx-auto px-4 py-8">
        <a
          href="/"
          className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-all duration-200 mb-6 group"
        >
          <Home
            size={20}
            className="mr-2 group-hover:-translate-x-1 transition-transform duration-200"
          />
          <span className="font-medium">Back to home</span>
        </a>

        <div className="space-y-6">
          <SummonerProfile
            summoner={summoner}
            rankedInfo={rankedInfo}
            summonerName={`${SummonerName}`}
          />

          {gameData && (
            <div className="flex justify-start">
              <Button
                asChild
                className="bg-gradient-to-r from-red-500 to-red-600 
                  hover:from-red-600 hover:to-red-700 text-white shadow-md 
                  hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              >
                <Link href={`/${params.region}/${params.summonerName}/live`}>
                  <div className="flex items-center gap-2 px-2">
                    <div className="w-2 h-2 rounded-full bg-white/90 animate-pulse" />
                    Live Game
                  </div>
                </Link>
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <ChampionStatistics
                    summonerId={summoner.puuid}
                    region={params.region as any}
                  />
                </div>
                <div className="lg:col-span-2">
                  <MatchHistory
                    summonerId={summoner.puuid}
                    region={params.region as any}
                  />
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <RecentlyPlayedWith
                summonerId={summoner.puuid}
                region={params.region as any}
              />
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  } catch (error) {
    return notFound();
  }
}
