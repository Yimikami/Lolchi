"use client";

import { useEffect, useState } from "react";
import { Match } from "@/lib/types/summoner";
import { Card } from "@/components/ui/card";
import { getMatchList, getMatchDetails, getRankedInfo } from "@/lib/api/riot";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { RegionId, regions } from "@/lib/config/regions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { Loader } from "lucide-react";

interface MatchHistoryProps {
  summonerId: string;
  region: RegionId;
}

export function MatchHistory({ summonerId, region }: MatchHistoryProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ranks, setRanks] = useState<{ [key: string]: string }>({});

  const fetchMatches = async (isLoadMore = false) => {
    try {
      const regionConfig = regions.find((r) => r.id === region);
      if (!regionConfig) return;

      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const startIndex = isLoadMore ? offset : 0;
      const matchIds = await getMatchList(
        regionConfig.platform,
        summonerId,
        startIndex,
        10
      );

      const matchDetails: Match[] = await Promise.all(
        matchIds.map((id: string) => getMatchDetails(regionConfig.platform, id))
      );

      if (isLoadMore) {
        setMatches((prev) => [...prev, ...matchDetails]);
        setOffset(startIndex + matchIds.length);
      } else {
        setMatches(matchDetails);
        setOffset(matchIds.length);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setOffset(0);
    fetchMatches();
  }, [summonerId]);

  useEffect(() => {
    if (selectedMatch) {
      const fetchRanks = async () => {
        try {
          const participantIds = selectedMatch.info.participants.map(
            (participant) => participant.summonerId
          );
          const rankInfos = await Promise.all(
            participantIds.map((id) => getRankedInfo(region, id))
          );

          const ranks: { [key: string]: string } = {};
          const queueId = selectedMatch.info.queueId;
          const rankType =
            queueId === 440 ? "RANKED_FLEX_SR" : "RANKED_SOLO_5x5";
          participantIds.forEach((id, index) => {
            const rankInfo = rankInfos[index];
            if (rankInfo.length > 0) {
              const selectedRank = rankInfo.find(
                (rank: { queueType: string }) => rank.queueType === rankType
              );
              ranks[id] = selectedRank
                ? `${selectedRank.tier} ${selectedRank.rank}`
                : "Unranked";
            } else {
              ranks[id] = "Unranked";
            }
          });

          setRanks(ranks);
        } catch (error) {
          console.error("Error fetching ranks:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchRanks();
    }
  }, [selectedMatch]);

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMatch(null);
  };

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
    <div className="space-y-4 max-w-5xl mx-auto px-4">
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px] bg-white/50 backdrop-blur-sm rounded-xl p-8">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {matches.map((match) => (
            <div
              key={match.metadata.matchId}
              onClick={() => handleMatchClick(match)}
              className="transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
            >
              <MatchCard match={match} summonerId={summonerId} />
            </div>
          ))}
          <div className="flex justify-center mt-6 pb-6">
            <button
              onClick={() => fetchMatches(true)}
              disabled={loadingMore}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg 
              hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
              shadow-md hover:shadow-lg transition-all duration-200 font-medium flex items-center gap-2"
            >
              {loadingMore ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                "Load more..."
              )}
            </button>
          </div>
        </>
      )}
      {selectedMatch && (
        <Dialog open={isModalOpen} onOpenChange={closeModal}>
          <DialogContent className="w-full max-w-6xl rounded-lg shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Match Details
              </DialogTitle>
              <div className="text-sm text-gray-500 mb-2">
                Game Duration:{" "}
                {Math.floor(selectedMatch.info.gameDuration / 60)}m{" "}
                {selectedMatch.info.gameDuration % 60}s
              </div>
            </DialogHeader>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between mb-4">
                <h3
                  className={`text-lg font-bold ${
                    selectedMatch.info.participants.some(
                      (participant) =>
                        participant.teamId === 100 && participant.win
                    )
                      ? "text-blue-500"
                      : "text-red-500"
                  }`}
                >
                  {selectedMatch.info.participants.some(
                    (participant) =>
                      participant.teamId === 100 && participant.win
                  )
                    ? "Victory"
                    : "Defeat"}
                </h3>
                <h3
                  className={`text-lg font-bold ${
                    selectedMatch.info.participants.some(
                      (participant) =>
                        participant.teamId === 200 && participant.win
                    )
                      ? "text-blue-500"
                      : "text-red-500"
                  }`}
                >
                  {selectedMatch.info.participants.some(
                    (participant) =>
                      participant.teamId === 200 && participant.win
                  )
                    ? "Victory"
                    : "Defeat"}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="pr-2">
                  {selectedMatch.info.participants
                    .filter((participant) => participant.teamId === 100)
                    .map((participant) => (
                      <div
                        key={participant.puuid}
                        className="flex items-center mb-2"
                      >
                        <div className="relative group">
                          <div className="relative w-16 h-16 transition-transform duration-200 group-hover:scale-105">
                            <Image
                              src={`https://ddragon.leagueoflegends.com/cdn/15.2.1/img/champion/${participant.championName}.png`}
                              alt="Champion"
                              fill
                              className="rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                            />
                          </div>
                          <div className="mt-1 flex gap-0.5 justify-center">
                            <div className="relative w-6 h-6 transition-transform duration-200 hover:scale-110">
                              <Image
                                src={`https://ddragon.leagueoflegends.com/cdn/15.2.1/img/spell/${
                                  summonerSpells[participant.summoner1Id]
                                }.png`}
                                alt="Spell 1"
                                fill
                                className="rounded-md shadow-sm hover:shadow-md transition-shadow duration-200"
                              />
                            </div>
                            <div className="relative w-6 h-6 transition-transform duration-200 hover:scale-110">
                              <Image
                                src={`https://ddragon.leagueoflegends.com/cdn/15.2.1/img/spell/${
                                  summonerSpells[participant.summoner2Id]
                                }.png`}
                                alt="Spell 2"
                                fill
                                className="rounded-md shadow-sm hover:shadow-md transition-shadow duration-200"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="ml-2">
                          <p className="text-xs text-gray-500">
                            {ranks[participant.summonerId]}
                          </p>
                          <Link
                            href={`/${region}/${participant.riotIdGameName}+${participant.riotIdTagline}`}
                            className="font-bold hover:text-primary transition-colors duration-300"
                          >
                            {participant.riotIdGameName}#
                            {participant.riotIdTagline}
                          </Link>
                          <p className="text-sm">
                            {participant.kills}/{participant.deaths}/
                            {participant.assists}
                          </p>
                        </div>
                        <div className="flex ml-auto space-x-1">
                          {[
                            participant.item0,
                            participant.item1,
                            participant.item2,
                            participant.item3,
                            participant.item4,
                            participant.item5,
                            participant.item6,
                          ]
                            .filter((itemId) => itemId !== 0)
                            .map((itemId, index) => (
                              <Image
                                key={index}
                                src={`https://ddragon.leagueoflegends.com/cdn/15.2.1/img/item/${itemId}.png`}
                                alt={`Item ${index + 1}`}
                                width={24}
                                height={24}
                                className="rounded"
                              />
                            ))}
                        </div>
                      </div>
                    ))}
                </div>

                <div className="pl-2">
                  {selectedMatch.info.participants
                    .filter((participant) => participant.teamId === 200)
                    .map((participant) => (
                      <div
                        key={participant.puuid}
                        className="flex items-center mb-2"
                      >
                        <div className="relative group">
                          <div className="relative w-16 h-16 transition-transform duration-200 group-hover:scale-105">
                            <Image
                              src={`https://ddragon.leagueoflegends.com/cdn/15.2.1/img/champion/${participant.championName}.png`}
                              alt="Champion"
                              fill
                              className="rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                            />
                          </div>
                          <div className="mt-1 flex gap-0.5 justify-center">
                            <div className="relative w-6 h-6 transition-transform duration-200 hover:scale-110">
                              <Image
                                src={`https://ddragon.leagueoflegends.com/cdn/15.2.1/img/spell/${
                                  summonerSpells[participant.summoner1Id]
                                }.png`}
                                alt="Spell 1"
                                fill
                                className="rounded-md shadow-sm hover:shadow-md transition-shadow duration-200"
                              />
                            </div>
                            <div className="relative w-6 h-6 transition-transform duration-200 hover:scale-110">
                              <Image
                                src={`https://ddragon.leagueoflegends.com/cdn/15.2.1/img/spell/${
                                  summonerSpells[participant.summoner2Id]
                                }.png`}
                                alt="Spell 2"
                                fill
                                className="rounded-md shadow-sm hover:shadow-md transition-shadow duration-200"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="ml-2">
                          <p className="text-xs text-gray-500">
                            {ranks[participant.summonerId]}
                          </p>
                          <Link
                            href={`/${region}/${participant.riotIdGameName}+${participant.riotIdTagline}`}
                            className="font-bold hover:text-primary transition-colors duration-300"
                          >
                            {participant.riotIdGameName}#
                            {participant.riotIdTagline}
                          </Link>
                          <p className="text-sm">
                            {participant.kills}/{participant.deaths}/
                            {participant.assists}
                          </p>
                        </div>
                        <div className="flex ml-auto space-x-1">
                          {[
                            participant.item0,
                            participant.item1,
                            participant.item2,
                            participant.item3,
                            participant.item4,
                            participant.item5,
                            participant.item6,
                          ]
                            .filter((itemId) => itemId !== 0)
                            .map((itemId, index) => (
                              <Image
                                key={index}
                                src={`https://ddragon.leagueoflegends.com/cdn/15.2.1/img/item/${itemId}.png`}
                                alt={`Item ${index + 1}`}
                                width={24}
                                height={24}
                                className="rounded"
                              />
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

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

const queueIds: { [key: number]: string } = {
  "400": "Draft Pick",
  "420": "Ranked Solo/Duo",
  "430": "Blind Pick",
  "440": "Ranked Flex",
  "450": "ARAM",
  "900": "ARURF",
};

function MatchCard({
  match,
  summonerId,
}: {
  match: Match;
  summonerId: string;
}) {
  const participant = match.info.participants.find(
    (p) => p.puuid === summonerId
  );
  if (!participant) return null;
  const participantItems = [
    participant.item0,
    participant.item1,
    participant.item2,
    participant.item3,
    participant.item4,
    participant.item5,
    participant.item6,
  ];
  const kda = (
    (participant.kills + participant.assists) /
    Math.max(1, participant.deaths)
  ).toFixed(2);
  const cs = participant.totalMinionsKilled;
  const csPerMin = (cs / (match.info.gameDuration / 60)).toFixed(1);

  return (
    <Card
      className={`p-3 ${
        participant.win
          ? "bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500"
          : "bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="relative w-16 h-16">
            <Image
              src={`https://ddragon.leagueoflegends.com/cdn/15.2.1/img/champion/${participant.championName}.png`}
              alt="Champion"
              fill
              className="rounded-lg shadow-md"
            />
          </div>
          <div className="mt-1 flex gap-1 justify-center">
            <div className="relative w-6 h-6">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/15.2.1/img/spell/${
                  summonerSpells[participant.summoner1Id]
                }.png`}
                alt={`Spell ${participant.summoner1Id}`}
                fill
                className="rounded-md shadow-sm"
              />
            </div>
            <div className="relative w-6 h-6">
              <Image
                src={`https://ddragon.leagueoflegends.com/cdn/15.2.1/img/spell/${
                  summonerSpells[participant.summoner2Id]
                }.png`}
                alt={`Spell ${participant.summoner2Id}`}
                fill
                className="rounded-md shadow-sm"
              />
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <p
                className={`text-lg font-bold ${
                  participant.win ? "text-blue-600" : "text-red-600"
                }`}
              >
                {participant.win ? "Victory" : "Defeat"}
              </p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(match.info.gameCreation)} ago
              </p>
              <p className="text-sm text-gray-600 font-medium">
                {queueIds[match.info.queueId] || "Unknown Queue"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-800">
                {participant.kills}/{participant.deaths}/{participant.assists}
              </p>
              <p className="text-sm text-gray-600">{kda} KDA</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              {participantItems.map(
                (itemId, index) =>
                  itemId !== 0 && (
                    <div
                      key={index}
                      className="relative w-8 h-8 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <Image
                        src={`https://ddragon.leagueoflegends.com/cdn/15.2.1/img/item/${itemId}.png`}
                        alt="Item"
                        fill
                        className="rounded-md"
                      />
                    </div>
                  )
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
