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
  console.log(gameData.bannedChampions);
  const blueTeam = gameData.participants.filter((p) => p.teamId === 100);
  const redTeam = gameData.participants.filter((p) => p.teamId === 200);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <Link
        href={`/${region}/${summonerName}+${tagLine}`}
        className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
      >
        <Home size={24} className="mr-2" />
        Back to Profile
      </Link>

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
                <p className="text-sm font-medium text-gray-600">Banned Champions:</p>
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
            <CardTitle className="text-xl font-bold text-blue-900">Blue Team</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-100/50 hover:bg-blue-100/70">
                  <TableHead className="font-semibold text-blue-900">Summoner</TableHead>
                  <TableHead className="font-semibold text-blue-900">Rank</TableHead>
                  <TableHead className="font-semibold text-blue-900">Wins</TableHead>
                  <TableHead className="font-semibold text-blue-900">Losses</TableHead>
                  <TableHead className="font-semibold text-blue-900">Win Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blueTeam.map((participant) => (
                  <TableRow
                    key={participant.riotId}
                    className="hover:bg-blue-100/30 transition-colors duration-200"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative group">
                          <Image
                            src={`https://cdn.communitydragon.org/14.23.1/champion/${participant.championId}/square`}
                            alt={`Champion ${participant.championId}`}
                            width={48}
                            height={48}
                            className="rounded-lg shadow-md transition-transform duration-200 group-hover:scale-110"
                          />
                        </div>
                        <Link
                          href={`/${region}/${
                            participant.riotId.split("#")[0]
                          }+${participant.riotId.split("#")[1]}`}
                          className="font-medium hover:text-blue-600 transition-colors duration-200"
                        >
                          {participant.riotId}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {ranks[participant.summonerId]?.rank || (
                        <Loader className="w-4 h-4 animate-spin text-blue-500" />
                      )}
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {ranks[participant.summonerId]?.wins !== undefined
                        ? ranks[participant.summonerId].wins
                        : 0}
                    </TableCell>
                    <TableCell className="text-red-600 font-medium">
                      {ranks[participant.summonerId]?.losses !== undefined
                        ? ranks[participant.summonerId].losses
                        : 0}
                    </TableCell>
                    <TableCell
                      className="font-bold"
                      style={getWinRateStyle(
                        ranks[participant.summonerId]?.winRate
                      )}
                    >
                      {ranks[participant.summonerId]?.winRate !== undefined
                        ? `${ranks[participant.summonerId].winRate}%`
                        : "0%"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-red-50/50 backdrop-blur-sm shadow-xl rounded-xl border-0">
          <CardHeader className="border-b border-red-100/50">
            <CardTitle className="text-xl font-bold text-red-900">Red Team</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-red-100/50 hover:bg-red-100/70">
                  <TableHead className="font-semibold text-red-900">Summoner</TableHead>
                  <TableHead className="font-semibold text-red-900">Rank</TableHead>
                  <TableHead className="font-semibold text-red-900">Wins</TableHead>
                  <TableHead className="font-semibold text-red-900">Losses</TableHead>
                  <TableHead className="font-semibold text-red-900">Win Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redTeam.map((participant) => (
                  <TableRow
                    key={participant.riotId}
                    className="hover:bg-red-100/30 transition-colors duration-200"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative group">
                          <Image
                            src={`https://cdn.communitydragon.org/14.23.1/champion/${participant.championId}/square`}
                            alt={`Champion ${participant.championId}`}
                            width={48}
                            height={48}
                            className="rounded-lg shadow-md transition-transform duration-200 group-hover:scale-110"
                          />
                        </div>
                        <Link
                          href={`/${region}/${
                            participant.riotId.split("#")[0]
                          }+${participant.riotId.split("#")[1]}`}
                          className="font-medium hover:text-red-600 transition-colors duration-200"
                        >
                          {participant.riotId}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {ranks[participant.summonerId]?.rank || (
                        <Loader className="w-4 h-4 animate-spin text-red-500" />
                      )}
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {ranks[participant.summonerId]?.wins !== undefined
                        ? ranks[participant.summonerId].wins
                        : 0}
                    </TableCell>
                    <TableCell className="text-red-600 font-medium">
                      {ranks[participant.summonerId]?.losses !== undefined
                        ? ranks[participant.summonerId].losses
                        : 0}
                    </TableCell>
                    <TableCell
                      className="font-bold"
                      style={getWinRateStyle(
                        ranks[participant.summonerId]?.winRate
                      )}
                    >
                      {ranks[participant.summonerId]?.winRate !== undefined
                        ? `${ranks[participant.summonerId].winRate}%`
                        : "0%"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
