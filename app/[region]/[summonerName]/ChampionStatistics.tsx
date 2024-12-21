"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getMatchList, getMatchDetails } from "@/lib/api/riot";
import Image from "next/image";
import { regions } from "@/lib/config/regions";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const queueIds: { [key: number]: string } = {
  400: "Draft Pick",
  420: "Ranked Solo/Duo",
  430: "Blind Pick",
  440: "Ranked Flex",
  450: "ARAM",
};

interface ChampionStat {
  championId: string;
  games: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  goldEarned: number;
}

interface ChampionStatisticsProps {
  summonerId: string;
  region: string;
}

export function ChampionStatistics({
  summonerId,
  region,
}: ChampionStatisticsProps) {
  const [champions, setChampions] = useState<ChampionStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQueue, setSelectedQueue] = useState<string>("420");

  useEffect(() => {
    async function fetchChampionStats() {
      try {
        const regionConfig = regions.find((r) => r.id === region);
        if (!regionConfig) return;
        const recentMatches = await getMatchList(
          regionConfig.platform,
          summonerId,
          0,
          20
        );

        if (recentMatches.length === 0) {
          setLoading(false);
          return;
        }

        const championMap = new Map<string, ChampionStat>();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        await Promise.all(
          recentMatches.map(async (matchId: string) => {
            const match = await getMatchDetails(regionConfig.platform, matchId);
            const matchDate = new Date(match.info.gameEndTimestamp);
            const player = match.info.participants.find(
              (p: any) => p.puuid === summonerId
            );

            if (
              player &&
              match.info.queueId === parseInt(selectedQueue) &&
              matchDate >= threeMonthsAgo
            ) {
              const existingChampion = championMap.get(player.championName);
              if (existingChampion) {
                existingChampion.games++;
                if (player.win) existingChampion.wins++;
                existingChampion.kills += player.kills;
                existingChampion.deaths += player.deaths;
                existingChampion.assists += player.assists;
                existingChampion.cs +=
                  player.totalMinionsKilled + player.neutralMinionsKilled;
                existingChampion.goldEarned += player.goldEarned;
              } else {
                championMap.set(player.championName, {
                  championId: player.championName,
                  games: 1,
                  wins: player.win ? 1 : 0,
                  kills: player.kills,
                  deaths: player.deaths,
                  assists: player.assists,
                  cs: player.totalMinionsKilled + player.neutralMinionsKilled,
                  goldEarned: player.goldEarned,
                });
              }
            }
          })
        );

        const sortedChampions = Array.from(championMap.values())
          .sort((a, b) => b.games - a.games)
          .slice(0, 5);

        setChampions(sortedChampions);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching champion stats:", error);
        setLoading(false);
      }
    }

    fetchChampionStats();
  }, [summonerId, region, selectedQueue]);

  if (loading) {
    return (
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">
          Champion Statistics
          <p className="text-sm text-gray-500">Loading...</p>
        </h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (champions.length === 0) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Champion Statistics
          </h2>
          <div className="mt-2">
            <Select value={selectedQueue} onValueChange={setSelectedQueue}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(queueIds).map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No games found in this queue type
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">
          Champion Statistics
        </h2>
        <div className="mt-2">
          <Select value={selectedQueue} onValueChange={setSelectedQueue}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(queueIds).map(([id, name]) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Last 3 months (up to 20 games)
        </p>
      </div>
      <div className="p-2">
        {champions.map((champion) => (
          <div
            key={champion.championId}
            className="flex items-center gap-4 p-3 hover:bg-blue-50/50 rounded-lg transition-all duration-200"
          >
            <div className="relative w-16 h-16">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${champion.championId}.png`}
                alt={champion.championId}
                width={64}
                height={64}
                className="rounded-lg border border-gray-200"
              />
              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
                {champion.games}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900">
                {champion.championId}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={
                    champion.wins / champion.games >= 0.5
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {Math.round((champion.wins / champion.games) * 100)}% WR
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  {(
                    (champion.kills + champion.assists) /
                    Math.max(champion.deaths, 1)
                  ).toFixed(2)}{" "}
                  KDA
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {(champion.cs / champion.games).toFixed(1)} CS •{" "}
                {(champion.goldEarned / champion.games / 1000).toFixed(1)}k Gold
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
