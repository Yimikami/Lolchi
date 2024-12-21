"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Home, Loader } from "lucide-react";
import Image from "next/image";
import { getRankedInfo } from "@/lib/api/riot";
import { RegionId } from "@/lib/config/regions";
import Link from "next/link";

type Participant = {
  riotId: string;
  championId: number;
  teamId: number;
  profileIconId: number;
  summonerId: string;
  spell1Id: number;
  spell2Id: number;
};

type GameData = {
  gameId: number;
  gameQueueConfigId: number;
  participants: Participant[];
  gameStartTime: number;
  gameLength: number;
  bans: number[];
  bannedChampions: {
    championId: number;
    pickTurn: number;
  }[];
};

const queueIds: { [key: number]: string } = {
  "400": "Draft Pick",
  "420": "Ranked Solo/Duo",
  "430": "Blind Pick",
  "440": "Ranked Flex",
  "450": "ARAM",
};

const getWinRateStyle = (winRate: number) => {
  if (winRate > 70) return { color: "red" };
  if (winRate > 60) return { color: "orange" };
  if (winRate < 50) return { color: "gray" };
  return {};
};

export default function LiveGamePage({
  gameData,
  region,
  summonerName,
  tagLine,
}: {
  gameData: GameData;
  region: RegionId;
  summonerName: string;
  tagLine: string;
}) {
  const [ranks, setRanks] = useState<{
    [key: string]: {
      rank: string;
      wins: number;
      losses: number;
      winRate: number;
      lp: number;
    };
  }>({});
  const [loading, setLoading] = useState(true);
  const SummonerName = decodeURIComponent(summonerName).replace(/\+/g, "#");
  useEffect(() => {
    const fetchRanks = async () => {
      try {
        const ranks: {
          [key: string]: {
            rank: string;
            wins: number;
            losses: number;
            winRate: number;
            lp: number;
          };
        } = {};
        for (const participant of gameData.participants) {
          const rankInfo = await getRankedInfo(region, participant.summonerId);
          const queueId = gameData.gameQueueConfigId;
          const rankType =
            queueId === 440 ? "RANKED_FLEX_SR" : "RANKED_SOLO_5x5";
          const selectedRank = rankInfo.find(
            (rank: { queueType: string }) => rank.queueType === rankType
          );
          if (selectedRank) {
            const wins = selectedRank.wins;
            const losses = selectedRank.losses;
            const winRate = ((wins / (wins + losses)) * 100).toFixed(2);
            const lp = selectedRank.leaguePoints;
            ranks[participant.summonerId] = {
              rank: `${selectedRank.tier} ${selectedRank.rank}`,
              wins,
              losses,
              winRate: parseFloat(winRate),
              lp,
            };
          } else {
            ranks[participant.summonerId] = {
              rank: "Unranked",
              wins: 0,
              losses: 0,
              winRate: 0,
              lp: 0,
            };
          }
        }
        setRanks(ranks);
      } catch (error) {
        console.error("Error fetching ranks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRanks();
  }, [gameData, region]);
  const blueTeam = gameData.participants.filter((p) => p.teamId === 100);
  const redTeam = gameData.participants.filter((p) => p.teamId === 200);

  const summonerSpells: { [key: number]: string } = {
    1: "SummonerBoost",
    3: "SummonerExhaust",
    4: "SummonerFlash",
    6: "SummonerHaste",
    7: "SummonerHeal",
    11: "SummonerSmite",
    12: "SummonerTeleport",
    13: "SummonerMana",
    14: "SummonerDot",
    21: "SummonerBarrier",
    22: "SummonerAssist",
    30: "SummonerPoroRecall",
    31: "SummonerPoroThrow",
    32: "SummonerSnowball",
    39: "SummonerSnowURFSnowball_Mark",
    54: "Summoner_UltBookPlaceholder",
    55: "Summoner_UltBookSmitePlaceholder",
    2201: "SummonerCherryHold",
    2202: "SummonerCherryFlash",
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <Card className="bg-white/95 backdrop-blur-sm shadow-xl rounded-xl border-0">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Live Game #{gameData.gameId}
          </CardTitle>
          <div className="text-lg font-medium text-gray-700">
            {SummonerName}#{tagLine}'s Game
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <Badge className="bg-blue-500 text-white hover:bg-blue-600 transition-colors px-4 py-1 text-sm font-medium">
                {queueIds[gameData.gameQueueConfigId]}
              </Badge>
            </div>
            <div className="flex justify-end items-center">
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-gray-600">
                  Banned Champions:
                </p>
                <div className="flex gap-2">
                  {gameData.bannedChampions.map(
                    (ban, index) =>
                      ban.championId !== -1 && (
                        <div key={index} className="relative group">
                          <Image
                            src={`https://cdn.communitydragon.org/14.23.1/champion/${ban.championId}/square`}
                            alt={`Ban ${ban.championId}`}
                            width={32}
                            height={32}
                            className="rounded-md shadow-sm transition-transform duration-200 group-hover:scale-110"
                          />
                        </div>
                      )
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="bg-blue-50/50 backdrop-blur-sm shadow-xl rounded-xl border-0">
          <CardHeader className="border-b border-blue-100/50">
            <CardTitle className="text-xl font-bold text-blue-900">
              Blue Team
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4">
              {blueTeam.map((participant) => (
                <div
                  key={participant.summonerId}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-100/30"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <div className="relative w-8 h-8">
                        <Image
                          src={`https://cdn.communitydragon.org/14.23.1/champion/${participant.championId}/square`}
                          alt={`Champion ${participant.championId}`}
                          fill
                          className="rounded-md"
                        />
                      </div>
                      <div className="flex">
                        <div className="relative w-4 h-4">
                          <Image
                            src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/spell/${
                              summonerSpells[participant.spell1Id]
                            }.png`}
                            alt={`Spell ${participant.spell1Id}`}
                            fill
                            className="rounded-sm"
                          />
                        </div>
                        <div className="relative w-4 h-4">
                          <Image
                            src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/spell/${
                              summonerSpells[participant.spell2Id]
                            }.png`}
                            alt={`Spell ${participant.spell2Id}`}
                            fill
                            className="rounded-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Link
                        className="font-medium text-blue-900"
                        href={`/${region}/${participant.riotId.split("#")[0]}+${
                          participant.riotId.split("#")[1]
                        }`}
                      >
                        {participant.riotId}
                      </Link>
                      <div className="text-sm text-blue-700">
                        {loading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          ranks[participant.summonerId]?.rank || "Unranked"
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Wins</div>
                      <div className="text-green-600 font-medium">
                        {loading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          ranks[participant.summonerId]?.wins || 0
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Losses</div>
                      <div className="text-red-600 font-medium">
                        {loading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          ranks[participant.summonerId]?.losses || 0
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Win Rate</div>
                      <div
                        className="font-medium"
                        style={getWinRateStyle(
                          ranks[participant.summonerId]?.winRate || 0
                        )}
                      >
                        {loading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          `${ranks[participant.summonerId]?.winRate || 0}%`
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50/50 backdrop-blur-sm shadow-xl rounded-xl border-0">
          <CardHeader className="border-b border-red-100/50">
            <CardTitle className="text-xl font-bold text-red-900">
              Red Team
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4">
              {redTeam.map((participant) => (
                <div
                  key={participant.summonerId}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-red-100/30"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <div className="relative w-8 h-8">
                        <Image
                          src={`https://cdn.communitydragon.org/14.23.1/champion/${participant.championId}/square`}
                          alt={`Champion ${participant.championId}`}
                          fill
                          className="rounded-md"
                        />
                      </div>
                      <div className="flex">
                        <div className="relative w-4 h-4">
                          <Image
                            src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/spell/${
                              summonerSpells[participant.spell1Id]
                            }.png`}
                            alt={`Spell ${participant.spell1Id}`}
                            fill
                            className="rounded-sm"
                          />
                        </div>
                        <div className="relative w-4 h-4">
                          <Image
                            src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/spell/${
                              summonerSpells[participant.spell2Id]
                            }.png`}
                            alt={`Spell ${participant.spell2Id}`}
                            fill
                            className="rounded-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Link
                        className="font-medium text-red-900"
                        href={`/${region}/${participant.riotId.split("#")[0]}+${
                          participant.riotId.split("#")[1]
                        }`}
                      >
                        {participant.riotId}
                      </Link>
                      <div className="text-sm text-red-700">
                        {loading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          ranks[participant.summonerId]?.rank || "Unranked"
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Wins</div>
                      <div className="text-green-600 font-medium">
                        {loading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          ranks[participant.summonerId]?.wins || 0
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Losses</div>
                      <div className="text-red-600 font-medium">
                        {loading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          ranks[participant.summonerId]?.losses || 0
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Win Rate</div>
                      <div
                        className="font-medium"
                        style={getWinRateStyle(
                          ranks[participant.summonerId]?.winRate || 0
                        )}
                      >
                        {loading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          `${ranks[participant.summonerId]?.winRate || 0}%`
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
