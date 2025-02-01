import {
  getAccountByRiotID,
  getCurrentGame,
  getRankedInfo,
  getSummonerByPUUID,
} from "@/lib/api/riot";
import { RegionId, regions } from "@/lib/config/regions";
import { SummonerProfile } from "./SummonerProfile";
import { MatchHistory } from "./MatchHistory";
import { RecentlyPlayedWith } from "./RecentlyPlayedWith";
import { ChampionStatistics } from "./ChampionStatistics";
import Footer from "@/app/footer";
import { ProfileNavigation } from "@/components/ProfileNavigation";

export default async function SummonerPage({
  params,
}: {
  params: Promise<{ region: RegionId; summonerName: string }>;
}) {
  try {
    const region = (await params).region;

    const regionConfig = regions.find((r) => r.id === region);
    if (!regionConfig) {
      throw new Error(`Invalid region: ${region}`);
    }

    const [summonerName, tagLine] = (await params).summonerName.split("%2B");
    const account = await getAccountByRiotID(
      regionConfig.platform,
      summonerName,
      tagLine
    );

    const SummonerName = decodeURIComponent(summonerName).replace(/\+/g, "#");

    const summoner = await getSummonerByPUUID(region, account.puuid);
    const rankedInfo = await getRankedInfo(region, summoner.id);

    // Check if player is in game
    let isInGame = false;
    try {
      const gameData = await getCurrentGame(region, summoner.puuid);
      if (gameData) {
        isInGame = true;
      }
    } catch (error) {}

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <SummonerProfile
            summoner={summoner}
            rankedInfo={rankedInfo}
            summonerName={`${SummonerName}`}
          />

          <ProfileNavigation
            region={region}
            summonerName={summonerName}
            isInGame={isInGame}
          />

          {/* Content */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <ChampionStatistics
                      summonerId={summoner.puuid}
                      region={region}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <MatchHistory summonerId={summoner.puuid} region={region} />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <RecentlyPlayedWith
                  summonerId={summoner.puuid}
                  region={region}
                />
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  } catch (error) {
    console.error("Error loading summoner page:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Summoner not found
          </h1>
          <p className="text-gray-600 mt-2">
            The summoner you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }
}
