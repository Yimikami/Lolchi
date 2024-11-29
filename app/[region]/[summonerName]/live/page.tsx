import NotInGame from "@/app/not-ingame";
import LiveGamePage from "@/components/live-game-page";
import {
  getAccountByRiotID,
  getCurrentGame,
  getSummonerByPUUID,
} from "@/lib/api/riot";
import { regions } from "@/lib/config/regions";

export default async function LivePage({
  params,
}: {
  params: { region: string; summonerName: string; tagLine: string };
}) {
  try {
    const regionConfig = regions.find((r) => r.id === params.region);
    if (!regionConfig) return;

    const account = await getAccountByRiotID(
      regionConfig.platform,
      params.summonerName.split("%2B")[0],
      params.summonerName.split("%2B")[1]
    );

    const summoner = await getSummonerByPUUID(
      params.region as any,
      account.puuid
    );

    const gameData = await getCurrentGame(params.region as any, summoner.puuid);
    return (
      <LiveGamePage
        region={params.region as any}
        gameData={gameData}
        summonerName={params.summonerName}
        tagLine={params.tagLine}
      />
    );
  } catch (error) {
    return <NotInGame />;
  }
}
