"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { regions, RegionId, Platform } from "@/lib/config/regions";
import {
  getChallengerLeague,
  getPUUIDBySummonerId,
  getAccountByPUUID,
  getCurrentGame,
} from "@/lib/api/riot";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";

interface ChallengerPlayer {
  summonerId: string;
  summonerName: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  rank: string;
  profileIconId?: number;
  puuid?: string;
  gameName?: string;
  tagLine?: string;
  isInGame?: boolean;
}

const PLAYERS_PER_PAGE = 20;

export default function LeaderboardsPage() {
  const [selectedRegion, setSelectedRegion] = useState<RegionId>(regions[0].id);
  const [loading, setLoading] = useState(true);
  const [allPlayers, setAllPlayers] = useState<ChallengerPlayer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Get platform from region
  const getPlatform = (region: RegionId): Platform => {
    const regionConfig = regions.find((r) => r.id === region);
    return regionConfig?.platform || "americas";
  };

  // Get current page players
  const getCurrentPagePlayers = () => {
    const startIndex = (currentPage - 1) * PLAYERS_PER_PAGE;
    return allPlayers.slice(startIndex, startIndex + PLAYERS_PER_PAGE);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRegion]);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const data = await getChallengerLeague(selectedRegion);
        const sortedPlayers = data.entries.sort(
          (a: any, b: any) => b.leaguePoints - a.leaguePoints
        );
        setTotalPages(Math.ceil(sortedPlayers.length / PLAYERS_PER_PAGE));

        // Get current page players
        const startIndex = (currentPage - 1) * PLAYERS_PER_PAGE;
        const currentPagePlayers = sortedPlayers.slice(
          startIndex,
          startIndex + PLAYERS_PER_PAGE
        );

        // Fetch summoner details for current page players
        const playersWithDetails = await Promise.all(
          currentPagePlayers.map(async (player: ChallengerPlayer) => {
            try {
              // Get summoner details including PUUID
              const summoner = await getPUUIDBySummonerId(
                selectedRegion,
                player.summonerId
              );

              // Get Riot Account details
              const platform = getPlatform(selectedRegion);
              const account = await getAccountByPUUID(platform, summoner.puuid);

              // Check if player is in game
              let isInGame = false;
              try {
                const gameData = await getCurrentGame(
                  selectedRegion,
                  summoner.puuid
                );
                if (gameData) {
                  isInGame = true;
                }
              } catch (error) {
                console.error(
                  `Error fetching current game for ${player.summonerName}:`,
                  error
                );
              }

              return {
                ...player,
                profileIconId: summoner.profileIconId,
                puuid: summoner.puuid,
                gameName: account.gameName,
                tagLine: account.tagLine,
                isInGame,
              };
            } catch (error) {
              console.error(
                `Error fetching summoner details for ${player.summonerName}:`,
                error
              );
              return player;
            }
          })
        );

        // Update all players with the new details
        const updatedAllPlayers = [...sortedPlayers];
        playersWithDetails.forEach((player, index) => {
          updatedAllPlayers[startIndex + index] = player;
        });
        setAllPlayers(updatedAllPlayers);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [selectedRegion, currentPage]);

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className={
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => setCurrentPage(1)}>
                  1
                </PaginationLink>
              </PaginationItem>
              {startPage > 2 && <PaginationEllipsis />}
            </>
          )}
          {pages}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <PaginationEllipsis />}
              <PaginationItem>
                <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Challenger Leaderboards
            </CardTitle>
            <Select
              value={selectedRegion}
              onValueChange={(value: RegionId) => setSelectedRegion(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Rank</TableHead>
                <TableHead>Summoner</TableHead>
                <TableHead className="text-right">LP</TableHead>
                <TableHead className="text-right">Win Rate</TableHead>
                <TableHead className="text-right">Wins</TableHead>
                <TableHead className="text-right">Losses</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: PLAYERS_PER_PAGE }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16 ml-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16 ml-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12 ml-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                : getCurrentPagePlayers().map((player, index) => {
                    const winRate = Math.round(
                      (player.wins / (player.wins + player.losses)) * 100
                    );
                    const globalRank =
                      (currentPage - 1) * PLAYERS_PER_PAGE + index + 1;
                    return (
                      <TableRow key={player.summonerId}>
                        <TableCell className="font-medium">
                          #{globalRank}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/${selectedRegion}/${
                                player.gameName
                                  ? `${player.gameName}+${player.tagLine}`
                                  : player.summonerName
                              }`}
                              className="flex items-center gap-2 hover:text-blue-600 transition-colors duration-200"
                            >
                              <Avatar className="h-8 w-8 ring-2 ring-offset-2 ring-blue-500/10">
                                {player.profileIconId ? (
                                  <AvatarImage
                                    src={`https://ddragon.leagueoflegends.com/cdn/15.2.1/img/profileicon/${player.profileIconId}.png`}
                                    alt={player.gameName || player.summonerName}
                                  />
                                ) : null}
                                <AvatarFallback>
                                  {(
                                    player.gameName ||
                                    player.summonerName ||
                                    "??"
                                  ).slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium">
                                  {player.gameName || player.summonerName}
                                </span>
                                {player.tagLine && (
                                  <span className="text-sm text-gray-500 ml-1">
                                    #{player.tagLine}
                                  </span>
                                )}
                              </div>
                            </Link>
                            {player.isInGame && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link
                                      href={`/${selectedRegion}/${
                                        player.gameName
                                          ? `${player.gameName}+${player.tagLine}`
                                          : player.summonerName
                                      }/live`}
                                      className="inline-flex items-center"
                                    >
                                      <Badge className="h-5 bg-green-500 hover:bg-green-600 text-white transition-all duration-400 px-2 animate-pulse shadow-sm hover:shadow-md flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        <span className="text-[10px] font-medium">
                                          LIVE
                                        </span>
                                      </Badge>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent className="font-medium">
                                    Click to watch{" "}
                                    {player.gameName || player.summonerName}
                                    &apos;s live game
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-blue-600">
                          {player.leaguePoints.toLocaleString()} LP
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            winRate >= 55
                              ? "text-green-600"
                              : winRate >= 50
                              ? "text-blue-600"
                              : "text-red-600"
                          }`}
                        >
                          {winRate}%
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {player.wins}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          {player.losses}
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-center">{renderPagination()}</div>
        </CardContent>
      </Card>
    </div>
  );
}
