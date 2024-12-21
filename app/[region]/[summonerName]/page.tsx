import {
  getSummonerByPUUID,
  getAccountByRiotID,
  getRankedInfo,
  getCurrentGame,
} from "@/lib/api/riot";
import { notFound } from "next/navigation";
import { SummonerProfile } from "./SummonerProfile";
import { MatchHistory } from "./MatchHistory";
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <Home size={24} className="mr-2" />
            <span className="font-medium">Back to home</span>
          </Link>

          <SummonerProfile
            summoner={summoner}
            rankedInfo={rankedInfo}
            summonerName={`${SummonerName}`}
          />

          {gameData && (
            <div className="flex justify-center">
              <Button
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Link
                  href={`/${params.region}/${params.summonerName}/live`}
                  className="text-white font-medium"
                >
                  Live Game
                </Link>
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-8">
            <div className="w-full">
              <MatchHistory
                summonerId={summoner.puuid}
                region={params.region as any}
              />
            </div>
          </div>

          <Footer />
        </div>
      </div>
    );
  } catch (error) {
    return notFound();
  }
}
