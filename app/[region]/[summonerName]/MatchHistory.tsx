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

interface MatchHistoryProps {
  summonerId: string;
  region: RegionId;
}

export function MatchHistory({ summonerId, region }: MatchHistoryProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ranks, setRanks] = useState<{ [key: string]: string }>({});

  const fetchMatches = async () => {
    try {
      const regionConfig = regions.find((r) => r.id === region);
      if (!regionConfig) return;

      const matchIds = await getMatchList(regionConfig.platform, summonerId);
      const matchDetails: Match[] = await Promise.all(
        matchIds.slice(0, 10).map((id: string) => getMatchDetails(regionConfig.platform, id))
      );
      setMatches(matchDetails);
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
          const rankType = queueId === 440 ? "RANKED_FLEX_SR" : "RANKED_SOLO_5x5";
          participantIds.forEach((id, index) => {
            const rankInfo = rankInfos[index];
            if (rankInfo.length > 0) {
              const selectedRank = rankInfo.find(
                (rank: { queueType: string }) => rank.queueType === rankType
              );
              ranks[id] = selectedRank ? `${selectedRank.tier} ${selectedRank.rank}` : "Unranked";
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

  const queueIds: { [key: number]: string } = {
    "400": "Draft Pick",
    "420": "Ranked Solo/Duo",
    "430": "Blind Pick",
    "440": "Ranked Flex",
    "450": "ARAM",
  };

  const loadingIndicator = loading ? <div>Loading matches...</div> : null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Match History</h2>
      {loadingIndicator}
      {matches.map((match) => (
        <div
          key={match.metadata.matchId}
          onClick={() => handleMatchClick(match)}
          className="mb-6"
        >
          <MatchCard match={match} summonerId={summonerId} />
        </div>
      ))}
      {selectedMatch && (
        <Dialog open={isModalOpen} onOpenChange={closeModal}>
          <DialogContent className="w-full max-w-6xl">
            <DialogHeader>
              <DialogTitle>Match Details</DialogTitle>
              <div className="text-sm text-gray-500 mb-2">
                Game Duration:{" "}
                {Math.floor(selectedMatch.info.gameDuration / 60)}m{" "}
                {selectedMatch.info.gameDuration % 60}s
              </div>

              <div className="text-sm text-gray-500">
                {queueIds[selectedMatch.info.queueId] || "Unknown Queue"}
              </div>
            </DialogHeader>
            <div>
              <div className="flex justify-between">
                <div className="w-1/2 pr-2">
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

                  {selectedMatch.info.participants
                    .filter((participant) => participant.teamId === 100)
                    .map((participant) => (
                      <div
                        key={participant.puuid}
                        className="flex items-center mb-2"
                      >
                        <div className="relative">
                          <Image
                            src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${participant.championName}.png`}
                            alt={participant.championName}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                          <span className="absolute top-0 left-0 bg-black text-white text-xs font-bold rounded-full px-1">
                            {participant.champLevel}
                          </span>
                          <div className="flex justify-center mt-1">
                            <Image
                              src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/spell/${
                                summonerSpells[participant.summoner1Id]
                              }.png`}
                              alt={summonerSpells[participant.summoner1Id]}
                              width={16}
                              height={16}
                              className="mr-1"
                            />
                            <Image
                              src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/spell/${
                                summonerSpells[participant.summoner2Id]
                              }.png`}
                              alt={summonerSpells[participant.summoner2Id]}
                              width={16}
                              height={16}
                            />
                          </div>
                        </div>
                        <div className="ml-2">
                          <p className="text-xs text-gray-500">
                            {ranks[participant.summonerId]}
                          </p>
                          <Link
                            href={`/${region}/${participant.riotIdGameName}+${participant.riotIdTagline}`}
                          >
                            <p className="font-bold">
                              {participant.riotIdGameName}#
                              {participant.riotIdTagline}
                            </p>
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
                                src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/item/${itemId}.png`}
                                alt={`Item ${index + 1}`}
                                width={24}
                                height={24}
                              />
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
                <div className="w-1/2 pl-2">
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
                  {selectedMatch.info.participants
                    .filter((participant) => participant.teamId === 200)
                    .map((participant) => (
                      <div
                        key={participant.puuid}
                        className="flex items-center mb-2"
                      >
                        <div className="relative">
                          <Image
                            src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${participant.championName}.png`}
                            alt={participant.championName}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                          <span className="absolute top-0 left-0 bg-black text-white text-xs font-bold rounded-full px-1">
                            {participant.champLevel}
                          </span>
                          <div className="flex justify-center mt-1">
                            <Image
                              src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/spell/${
                                summonerSpells[participant.summoner1Id]
                              }.png`}
                              alt={summonerSpells[participant.summoner1Id]}
                              width={16}
                              height={16}
                              className="mr-1"
                            />
                            <Image
                              src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/spell/${
                                summonerSpells[participant.summoner2Id]
                              }.png`}
                              alt={summonerSpells[participant.summoner2Id]}
                              width={16}
                              height={16}
                            />
                          </div>
                        </div>
                        <div className="ml-2">
                          <p className="text-xs text-gray-500">
                            {ranks[participant.summonerId]}
                          </p>
                          <Link
                            href={`/${region}/${participant.riotIdGameName}+${participant.riotIdTagline}`}
                          >
                            <p className="font-bold">
                              {participant.riotIdGameName}#
                              {participant.riotIdTagline}
                            </p>
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
                                src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/item/${itemId}.png`}
                                alt={`Item ${index + 1}`}
                                width={24}
                                height={24}
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
      className={`p-4 ${
        participant.win
          ? "border-l-4 border-l-green-500"
          : "border-l-4 border-l-red-500"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16">
          <Image
            src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${participant.championName}.png`}
            alt="Champion"
            fill
            className="rounded-lg"
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold">
                {participant.win ? "Victory" : "Defeat"}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(match.info.gameCreation)} ago
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                {participant.kills}/{participant.deaths}/{participant.assists}
              </p>
              <p className="text-sm text-muted-foreground">{kda} KDA</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex gap-1">
              {participantItems.map(
                (itemId, index) =>
                  itemId !== 0 && (
                    <div key={index} className="relative w-8 h-8">
                      <Image
                        src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/item/${itemId}.png`}
                        alt="Item"
                        fill
                        className="rounded-md"
                      />
                    </div>
                  )
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {cs} CS ({csPerMin}/min)
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
