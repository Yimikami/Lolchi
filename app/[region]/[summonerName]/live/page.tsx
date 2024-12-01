import NotInGame from "@/app/not-ingame";
import LiveGamePage from "./LiveGamePage";
import {
  getAccountByRiotID,
  getCurrentGame,
  getSummonerByPUUID,
} from "@/lib/api/riot";
import { RegionId, regions } from "@/lib/config/regions";
import Footer from "@/app/footer";

export default async function LivePage({
  params,
}: {
  params: { region: RegionId; summonerName: string; tagLine: string };
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

    const summoner = await getSummonerByPUUID(params.region, account.puuid);

    const gameData = await getCurrentGame(params.region, summoner.puuid);
    if (!gameData) {
      throw new Error("No game data found");
    }

    return (
      <div className="min-h-screen flex flex-col items-center px-4 pt-8 bg-gradient-to-b from-background to-secondary">
        <LiveGamePage
          gameData={gameData}
          region={params.region}
          summonerName={summonerName}
          tagLine={tagLine}
        />
        <Footer />
      </div>
    );
  } catch (error) {
    console.error("Error loading live game page:", error);
    return <NotInGame />;
  }
}
