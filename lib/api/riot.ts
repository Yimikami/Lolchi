import { Platform, RegionId } from "@/lib/config/regions";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL; // Proxy server URL

async function fetchDirect(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

export async function getAccountByRiotID(
  platform: Platform,
  gameName: string,
  tagLine: string
) {
  const url = `${BASE_URL}/account/${platform}/${gameName}/${tagLine}`;
  return fetchDirect(url);
}

export async function getSummonerByPUUID(region: RegionId, puuid: string) {
  const url = `${BASE_URL}/summoner/${region}/${puuid}`;
  return fetchDirect(url);
}

export async function getRankedInfo(region: RegionId, summonerId: string) {
  const url = `${BASE_URL}/ranked/${region}/${summonerId}`;
  return fetchDirect(url);
}

export async function getCurrentGame(region: RegionId, puuid: string) {
  const url = `${BASE_URL}/spectator/${region}/${puuid}`;
  return fetchDirect(url);
}

export async function getMatchList(
  platform: Platform,
  puuid: string,
  start = 0,
  count = 20
) {
  const url = `${BASE_URL}/matches/${platform}/${puuid}?start=${start}&count=${count}`;
  return fetchDirect(url);
}

export async function getMatchDetails(platform: Platform, matchId: string) {
  const url = `${BASE_URL}/match/${platform}/${matchId}`;
  return fetchDirect(url);
}

export async function getChampionNameById(championId: number) {
  try {
    const url = `https://ddragon.leagueoflegends.com/cdn/14.23.1/data/en_US/champion.json`;
    const response = await fetch(url);
    const data = await response.json();
    const champions = data.data;
    for (const champion of Object.values(champions as Record<string, any>)) {
      if (champion.key == championId.toString()) {
        return { name: champion.id };
      }
    }
    throw new Error("Champion not found");
  } catch (error) {
    throw new Error(`Error fetching champion name: ${error}`);
  }
}
