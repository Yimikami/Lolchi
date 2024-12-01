import { Platform, RegionId } from "@/lib/config/regions";

const API_KEY = process.env.RIOT_API_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL; // Proxy server URL

class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private requestsPerSecond = 20;
  private requestsPerTwoMinutes = 100;
  private requestCount = 0;
  private twoMinuteRequestCount = 0;
  private lastReset = Date.now();
  private twoMinuteReset = Date.now();
  async process() {
    if (this.processing) return;
    this.processing = true;
    while (this.queue.length > 0) {
      const now = Date.now();
      if (now - this.lastReset >= 1000) {
        this.requestCount = 0;
        this.lastReset = now;
      }
      if (now - this.twoMinuteReset >= 120000) {
        this.twoMinuteRequestCount = 0;
        this.twoMinuteReset = now;
      }
      if (
        this.requestCount < this.requestsPerSecond &&
        this.twoMinuteRequestCount < this.requestsPerTwoMinutes
      ) {
        const request = this.queue.shift();
        if (request) {
          this.requestCount++;
          this.twoMinuteRequestCount++;
          await request();
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }
    this.processing = false;
  }

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }
}
const rateLimiter = new RateLimiter();
async function fetchWithRateLimit(url: string) {
  return rateLimiter.add(async () => {
    const response = await fetch(url, {
      headers: {
        "X-Riot-Token": API_KEY!,
      },
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  });
}

export async function getAccountByRiotID(
  platform: Platform,
  gameName: string,
  tagLine: string
) {
  const url = `${BASE_URL}/account/${platform}/${gameName}/${tagLine}`;
  return fetchWithRateLimit(url);
}

export async function getSummonerByPUUID(region: RegionId, puuid: string) {
  const url = `${BASE_URL}/summoner/${region}/${puuid}`;
  return fetchWithRateLimit(url);
}

export async function getRankedInfo(region: RegionId, summonerId: string) {
  const url = `${BASE_URL}/ranked/${region}/${summonerId}`;
  return fetchWithRateLimit(url);
}

export async function getCurrentGame(region: RegionId, puuid: string) {
  const url = `${BASE_URL}/spectator/active-games/by-summoner/${region}/${puuid}`;
  return fetchWithRateLimit(url);
}

export async function getMatchList(
  platform: Platform,
  puuid: string,
  start = 0,
  count = 20
) {
  const url = `${BASE_URL}/matches/${platform}/${puuid}?start=${start}&count=${count}`;
  return fetchWithRateLimit(url);
}

export async function getMatchDetails(platform: Platform, matchId: string) {
  const url = `${BASE_URL}/match/${platform}/${matchId}`;
  return fetchWithRateLimit(url);
}

export async function getChampionNameById(championId: number) {
  const url = `${BASE_URL}/champion/${championId}`;
  const response = await fetch(url, {
    headers: {
      "X-Riot-Token": API_KEY!,
    },
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  return response.json();
}
