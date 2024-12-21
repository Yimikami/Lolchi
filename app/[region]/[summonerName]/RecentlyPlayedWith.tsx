"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getMatchList, getMatchDetails } from "@/lib/api/riot";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { regions } from "@/lib/config/regions";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface ChampionStat {
  championId: string;
  wins: number;
  games: number;
}

interface PlayerStats {
  gameName: string;
  tagline: string;
  profileIcon: number;
  gamesPlayed: number;
  wins: number;
  region: string;
  champions: ChampionStat[];
}

interface RecentlyPlayedWithProps {
  summonerId: string;
  region: string;
}

export function RecentlyPlayedWith({
  summonerId,
  region,
}: RecentlyPlayedWithProps) {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentlyPlayedWith() {
      try {
        const regionConfig = regions.find((r) => r.id === region);
        if (!regionConfig) return;
        const recentMatches = await getMatchList(
          regionConfig.platform,
          summonerId,
          0,
          20
        );

        const playerMap = new Map<string, PlayerStats>();

        await Promise.all(
          recentMatches.map(async (matchId: string) => {
            const match = await getMatchDetails(regionConfig.platform, matchId);
            const playerTeam = match.info.participants.find(
              (p: any) => p.puuid === summonerId
            )?.teamId;

            match.info.participants.forEach((player: any) => {
              if (player.puuid !== summonerId && player.teamId === playerTeam) {
                const playerKey = `${player.riotIdGameName}#${player.riotIdTagline}`;
                const existingPlayer = playerMap.get(playerKey);

                if (existingPlayer) {
                  existingPlayer.gamesPlayed++;
                  if (player.win) existingPlayer.wins++;

                  // Update champion stats
                  const existingChampion = existingPlayer.champions.find(
                    (c) => c.championId === player.championName
                  );
                  if (existingChampion) {
                    existingChampion.games++;
                    if (player.win) existingChampion.wins++;
                  } else {
                    existingPlayer.champions.push({
                      championId: player.championName,
                      games: 1,
                      wins: player.win ? 1 : 0,
                    });
                  }
                } else {
                  playerMap.set(playerKey, {
                    gameName: player.riotIdGameName,
                    tagline: player.riotIdTagline,
                    profileIcon: player.profileIcon,
                    gamesPlayed: 1,
                    wins: player.win ? 1 : 0,
                    region: region,
                    champions: [
                      {
                        championId: player.championName,
                        games: 1,
                        wins: player.win ? 1 : 0,
                      },
                    ],
                  });
                }
              }
            });
          })
        );

        const sortedPlayers = Array.from(playerMap.values())
          .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
          .filter((player) => player.gamesPlayed > 2)
          .slice(0, 5);

        // Sort champions by games played for each player
        sortedPlayers.forEach((player) => {
          player.champions.sort((a, b) => b.games - a.games);
        });

        setPlayers(sortedPlayers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching recently played with:", error);
        setLoading(false);
      }
    }

    fetchRecentlyPlayedWith();
  }, [summonerId, region]);

  if (loading) {
    return (
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">
          Recently Played With
          <p className="text-sm text-gray-500">Loading...</p>
        </h2>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
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

  if (players.length === 0) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Recently Played With
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            No players found with more than 2 games together
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">
          Recently Played With
          <p className="text-sm text-gray-500">Players with 3+ games together</p>
        </h2>
      </div>
      <div className="p-2">
        {players.map((player) => (
          <Link
            href={`/${player.region}/${player.gameName}+${player.tagline}`}
            key={`${player.gameName}#${player.tagline}`}
            className="flex items-center gap-3 p-3 hover:bg-blue-50/50 rounded-lg transition-all duration-200 group"
          >
            <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-blue-500/10 group-hover:ring-blue-500/20 transition-all duration-200">
              <AvatarImage
                src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${player.profileIcon}.png`}
                alt={player.gameName}
                className="object-cover"
              />
              <AvatarFallback className="bg-blue-500/10 text-blue-600 font-semibold">
                {player.gameName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-medium text-gray-900 truncate">
                  {player.gameName}
                </span>
                <span className="text-sm text-gray-500">#{player.tagline}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-medium text-gray-600">
                  {player.gamesPlayed} games
                </span>
                <span className="text-gray-400">•</span>
                <span
                  className={
                    player.wins / player.gamesPlayed >= 0.5
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {Math.round((player.wins / player.gamesPlayed) * 100)}% WR
                </span>
              </div>
              <div className="flex gap-1 mt-2">
                {player.champions.slice(0, 3).map((champion) => (
                  <div
                    key={champion.championId}
                    className="relative group/champion"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                      <Image
                        src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${champion.championId}.png`}
                        alt={champion.championId}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/champion:opacity-100 whitespace-nowrap transition-opacity duration-200">
                      {champion.games} games •{" "}
                      {Math.round((champion.wins / champion.games) * 100)}% WR
                    </div>
                  </div>
                ))}
                {player.champions.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600 font-medium">
                    +{player.champions.length - 3}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
