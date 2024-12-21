"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { getMatchList, getMatchDetails } from "@/lib/api/riot";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { regions } from "@/lib/config/regions";

interface PlayerStats {
  gameName: string;
  tagline: string;
  profileIcon: number;
  gamesPlayed: number;
  wins: number;
  region: string;
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
        const matches = await getMatchList(
          regionConfig.platform,
          summonerId,
          0,
          20
        );
        const recentMatches = matches.slice(0, 20);

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
                } else {
                  playerMap.set(playerKey, {
                    gameName: player.riotIdGameName,
                    tagline: player.riotIdTagline,
                    profileIcon: player.profileIcon,
                    gamesPlayed: 1,
                    wins: player.win ? 1 : 0,
                    region: region,
                  });
                }
              }
            });
          })
        );

        const sortedPlayers = Array.from(playerMap.values())
          .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
          .slice(0, 5);

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
          Recently Played With (5 Players)
        </h2>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (players.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">
          Recently Played With
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
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
