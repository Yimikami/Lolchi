import NotInGame from "@/app/not-ingame";
import LiveGamePage from "./LiveGamePage";
import {
  getAccountByRiotID,
  getCurrentGame,
  getRankedInfo,
  getSummonerByPUUID,
} from "@/lib/api/riot";
import { RegionId, regions } from "@/lib/config/regions";
import Footer from "@/app/footer";
import { SummonerProfile } from "../SummonerProfile";
import { ProfileNavigation } from "../components/ProfileNavigation";

export default async function LivePage({
  params,
}: {
  params: { region: RegionId; summonerName: string };
}) {
  try {
    const regionConfig = regions.find((r) => r.id === params.region);
    if (!regionConfig) {
      throw new Error(`Invalid region: ${params.region}`);
    }

    const [summonerName, tagLine] = params.summonerName.split("%2B");
    const account = await getAccountByRiotID(
      regionConfig.platform,
      summonerName,
      tagLine
    );

    const SummonerName = decodeURIComponent(params.summonerName).replace(
      /\+/g,
      "#"
    );

    const summoner = await getSummonerByPUUID(params.region, account.puuid);
    const rankedInfo = await getRankedInfo(params.region, summoner.id);
    const gameData = await getCurrentGame(params.region, summoner.puuid);

    if (!gameData) {
      throw new Error("No game data found");
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8 space-y-6">
          <SummonerProfile
            summoner={summoner}
            rankedInfo={rankedInfo}
            summonerName={`${SummonerName}`}
          />

          <ProfileNavigation
            region={params.region}
            summonerName={params.summonerName}
            isInGame={true}
          />

          <div className="mt-8">
            <LiveGamePage
              gameData={gameData}
              region={params.region}
              summonerName={summonerName}
              tagLine={tagLine}
            />
          </div>

          <div className="mt-8">
            <Footer />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading live game page:", error);
    return <NotInGame />;
  }
}
