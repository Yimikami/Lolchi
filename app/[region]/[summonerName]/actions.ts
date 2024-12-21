"use server";

import {
  getAccountByRiotID,
  getCurrentGame,
  getRankedInfo,
  getSummonerByPUUID,
} from "@/lib/api/riot";
import { RegionId, regions } from "@/lib/config/regions";

export async function refreshProfileData(
  region: RegionId,
  summonerName: string
) {
  try {
    const regionConfig = regions.find((r) => r.id === region);
    if (!regionConfig) {
      throw new Error(`Invalid region: ${region}`);
    }

    const [name, tagLine] = summonerName.split("%2B");
    const account = await getAccountByRiotID(
      regionConfig.platform,
      name,
      tagLine
    );

    const summoner = await getSummonerByPUUID(region, account.puuid);
    const rankedInfo = await getRankedInfo(region, summoner.id);

    let isInGame = false;
    let gameData = null;
    try {
      gameData = await getCurrentGame(region, summoner.puuid);
      if (gameData) {
        isInGame = true;
      }
    } catch (error) {
      console.error("Player is not in a game");
    }

    return {
      summoner,
      rankedInfo,
      isInGame,
      gameData,
    };
  } catch (error) {
    console.error("Error refreshing profile data:", error);
    throw error;
  }
}
