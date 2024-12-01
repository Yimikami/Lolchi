import { Platform, RegionId } from "@/lib/config/regions";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL; // Proxy server URL

async function fetchDirect(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  return response.json();
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
  const url = `${BASE_URL}/spectator/active-games/by-summoner/${region}/${puuid}`;
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
  const url = `${BASE_URL}/champion/${championId}`;
  return fetchDirect(url);
}
