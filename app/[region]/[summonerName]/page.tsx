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
        <a href="/" className="flex items-center text-muted-foreground mb-4">
          <Home size={24} className="mr-2" />
          Back to home
        </a>

        <SummonerProfile
          summoner={summoner}
          rankedInfo={rankedInfo}
          summonerName={`${SummonerName}`}
        />
        <br />
        {gameData ? (
          <Button>
            <Link href={`/${params.region}/${params.summonerName}/live`}>
              Live Game
            </Link>
          </Button>
        ) : null}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-3">
            <MatchHistory
              summonerId={summoner.puuid}
              region={params.region as any}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return notFound();
  }
}
