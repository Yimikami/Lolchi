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
    <div className="container mx-auto p-4 bg-gradient-to-b from-gray-100 to-gray-300 min-h-screen">
      <Link
        href={`/${region}/${summonerName}+${tagLine}`}
        className="flex items-center text-muted-foreground mb-4 hover:text-primary transition-colors duration-300"
      >
        <Home size={24} className="mr-2" />
        Back to Profile Page
      </Link>
      <Card className="mb-6 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Live Game #{gameData.gameId}
          </CardTitle>
          <CardTitle className="text-lg font-medium">
            {SummonerName}#{tagLine}'s Game
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Badge variant="outline" className="bg-white text-black">
                {queueIds[gameData.gameQueueConfigId]}
              </Badge>
            </div>
            <div className="flex justify-end">
              <div className="flex space-x-2">
                <p className="text-sm text-muted-foreground">Bans:</p>
                {gameData.bannedChampions.map(
                  (ban, index) =>
                    ban.championId !== -1 && (
                      <Image
                        key={index}
                        src={`https://cdn.communitydragon.org/14.23.1/champion/${ban.championId}/square`}
                        alt={`Ban ${ban.championId}`}
                        width={32}
                        height={32}
                        className=""
                      />
                    )
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Blue Team</CardTitle>
          </CardHeader>
          <CardContent>
            <Table className="rounded-lg overflow-hidden">
              <TableHeader className="bg-gray-200">
                <TableRow>
                  <TableHead>Summoner</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Wins</TableHead>
                  <TableHead>Losses</TableHead>
                  <TableHead>Win Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blueTeam.map((participant) => (
                  <TableRow
                    key={participant.riotId}
                    className="hover:bg-gray-100 transition-colors duration-300"
                  >
                    <TableCell>
                      <div className="flex items-center">
                        <Image
                          src={`https://cdn.communitydragon.org/14.23.1/champion/${participant.championId}/square`}
                          alt={`Champion ${participant.championId}`}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                        <Link
                          href={`/${region}/${
                            participant.riotId.split("#")[0]
                          }+${participant.riotId.split("#")[1]}`}
                          className="ml-2  hover:text-primary transition-colors duration-300"
                        >
                          {participant.riotId}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      {ranks[participant.summonerId]?.rank || (
                        <Loader className="animate-spin" />
                      )}
                    </TableCell>
                    <TableCell>
                      {ranks[participant.summonerId]?.wins !== undefined
                        ? ranks[participant.summonerId].wins
                        : 0}
                    </TableCell>
                    <TableCell>
                      {ranks[participant.summonerId]?.losses !== undefined
                        ? ranks[participant.summonerId].losses
                        : 0}
                    </TableCell>
                    <TableCell
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

        <Card className="shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Red Team</CardTitle>
          </CardHeader>
          <CardContent>
            <Table className="rounded-lg overflow-hidden">
              <TableHeader className="bg-gray-200">
                <TableRow>
                  <TableHead>Summoner</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Wins</TableHead>
                  <TableHead>Losses</TableHead>
                  <TableHead>Win Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redTeam.map((participant) => (
                  <TableRow
                    key={participant.riotId}
                    className="hover:bg-gray-100 transition-colors duration-300"
                  >
                    <TableCell>
                      <div className="flex items-center">
                        <Image
                          src={`https://cdn.communitydragon.org/14.23.1/champion/${participant.championId}/square`}
                          alt={`Champion ${participant.championId}`}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                        <Link
                          href={`/${region}/${
                            participant.riotId.split("#")[0]
                          }+${participant.riotId.split("#")[1]}`}
                          className="ml-2 hover:text-primary transition-colors duration-300"
                        >
                          {participant.riotId}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      {ranks[participant.summonerId]?.rank || (
                        <Loader className="animate-spin" />
                      )}
                    </TableCell>
                    <TableCell>
                      {ranks[participant.summonerId]?.wins !== undefined
                        ? ranks[participant.summonerId].wins
                        : 0}
                    </TableCell>
                    <TableCell>
                      {ranks[participant.summonerId]?.losses !== undefined
                        ? ranks[participant.summonerId].losses
                        : 0}
                    </TableCell>
                    <TableCell
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
