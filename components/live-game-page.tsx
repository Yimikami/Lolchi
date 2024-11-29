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
import { Home } from "lucide-react";
import Image from "next/image";
import { getChampionNameById, getRankedInfo } from "@/lib/api/riot";
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
};

const getQueueName = (id: number) => {
  if (id === 420) return "Ranked Solo/Duo";
  if (id === 440) return "Ranked Flex";
  if (id === 450) return "ARAM";
  if (id === 700) return "Clash";
  else return "Normal Game";
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
  const [championNames, setChampionNames] = useState<{ [key: number]: string }>(
    {}
  );
  const SummonerName = decodeURIComponent(summonerName).replace(/\+/g, "#");
  useEffect(() => {
    const fetchChampionNames = async () => {
      try {
        for (const participant of gameData.participants) {
          const championName = await getChampionNameById(
            participant.championId
          );
          setChampionNames((prev) => ({
            ...prev,
            [participant.championId]: championName.name,
          }));
        }
      } catch (error) {
        console.error("Error fetching champion names:", error);
      }
    };
    fetchChampionNames();
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
          if (rankInfo.length > 0) {
            const soloRank = rankInfo.find(
              (rank: { queueType: string }) =>
                rank.queueType === "RANKED_SOLO_5x5"
            );
            if (soloRank) {
              const wins = soloRank.wins;
              const losses = soloRank.losses;
              const winRate = ((wins / (wins + losses)) * 100).toFixed(2);
              const lp = soloRank.leaguePoints;
              ranks[participant.summonerId] = {
                rank: `${soloRank.tier} ${soloRank.rank}`,
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

  return (
    <div className="container mx-auto p-4">
      <Link
        href={`/${region}/${summonerName}`}
        className={"flex items-center text-muted-foreground mb-4"}
      >
        <Home size={24} className="mr-2" />
        Back to Profile Page
      </Link>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Live Game #{gameData.gameId}</CardTitle>
          <CardTitle>
            {SummonerName}
            {tagLine}'s Game
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Badge variant="outline">
                {getQueueName(gameData.gameQueueConfigId)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Blue Team</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
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
                  <TableRow key={participant.riotId}>
                    <TableCell>
                      <div className="flex items-center">
                        <Image
                          src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${
                            championNames[participant.championId]
                          }.png`}
                          alt={championNames[participant.championId]}
                          width={48}
                          height={48}
                        />
                        {participant.riotId}
                      </div>
                    </TableCell>
                    <TableCell>
                      {ranks[participant.summonerId]?.rank || "Loading..."}{" "}
                      {ranks[participant.summonerId]?.lp + " LP" ||
                        "Loading..."}
                    </TableCell>
                    <TableCell>
                      {ranks[participant.summonerId]?.wins || "Loading..."}
                    </TableCell>
                    <TableCell>
                      {ranks[participant.summonerId]?.losses || "Loading..."}
                    </TableCell>
                    <TableCell
                      style={getWinRateStyle(
                        ranks[participant.summonerId]?.winRate
                      )}
                    >
                      {ranks[participant.summonerId]?.winRate !== undefined
                        ? `${ranks[participant.summonerId].winRate}%`
                        : "Loading..."}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Red Team</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
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
                  <TableRow key={participant.riotId}>
                    <TableCell>
                      <div className="flex items-center">
                        <Image
                          src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${
                            championNames[participant.championId]
                          }.png`}
                          alt={championNames[participant.championId]}
                          width={48}
                          height={48}
                        />
                        {participant.riotId}
                      </div>
                    </TableCell>
                    <TableCell>
                      {ranks[participant.summonerId]?.rank || "Loading..."}{" "}
                      {ranks[participant.summonerId]?.lp + " LP" ||
                        "Loading..."}
                    </TableCell>
                    <TableCell>
                      {ranks[participant.summonerId]?.wins || "Loading..."}
                    </TableCell>
                    <TableCell>
                      {ranks[participant.summonerId]?.losses || "Loading..."}
                    </TableCell>
                    <TableCell
                      style={getWinRateStyle(
                        ranks[participant.summonerId]?.winRate
                      )}
                    >
                      {ranks[participant.summonerId]?.winRate !== undefined
                        ? `${ranks[participant.summonerId].winRate}%`
                        : "Loading..."}
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
