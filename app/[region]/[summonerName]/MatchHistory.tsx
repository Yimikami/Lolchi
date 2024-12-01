"use client";

import { useEffect, useState } from "react";
import { Match } from "@/lib/types/summoner";
import { Card } from "@/components/ui/card";
import { getMatchList, getMatchDetails } from "@/lib/api/riot";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { RegionId, regions } from "@/lib/config/regions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MatchHistoryProps {
  summonerId: string;
  region: RegionId;
}

export function MatchHistory({ summonerId, region }: MatchHistoryProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const regionConfig = regions.find((r) => r.id === region);
        if (!regionConfig) return;

        const matchIds = await getMatchList(regionConfig.platform, summonerId);
        const matchDetails: Match[] = await Promise.all(
          matchIds
            .slice(0, 10)
            .map((id: string) => getMatchDetails(regionConfig.platform, id))
        );
        setMatches(matchDetails);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [summonerId]);

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMatch(null);
  };

  if (loading) {
    return <div>Loading matches...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Match History</h2>
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
            </DialogHeader>
            <div>
              <div className="flex">
                <div className="w-1/2 pr-2">
                  <h4
                    className={`text-lg font-bold mb-2 ${
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
                  </h4>
                  {selectedMatch.info.participants
                    .filter((participant) => participant.teamId === 100)
                    .map((participant) => (
                      <div
                        key={participant.puuid}
                        className="flex items-center mb-4 p-2 border rounded-md bg-gray-100"
                      >
                        <Image
                          src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${participant.championName}.png`}
                          alt={participant.championName}
                          width={48}
                          height={48}
                          className="mr-2"
                        />
                        <div className="flex-1">
                          <p className="font-bold">
                            {participant.riotIdGameName}#
                            {participant.riotIdTagline}
                          </p>
                          <p>
                            KDA: {participant.kills}/{participant.deaths}/
                            {participant.assists}
                          </p>
                          <p>CS: {participant.totalMinionsKilled}</p>
                        </div>
                        <div className="flex space-x-1">
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
                                width={32}
                                height={32}
                              />
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
                <div className="w-1/2 pl-2">
                  <h4
                    className={`text-lg font-bold mb-2 ${
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
                  </h4>
                  {selectedMatch.info.participants
                    .filter((participant) => participant.teamId === 200)
                    .map((participant) => (
                      <div
                        key={participant.puuid}
                        className="flex items-center mb-4 p-2 border rounded-md bg-gray-100"
                      >
                        <Image
                          src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/${participant.championName}.png`}
                          alt={participant.championName}
                          width={48}
                          height={48}
                          className="mr-2"
                        />
                        <div className="flex-1">
                          <p className="font-bold">
                            {participant.riotIdGameName}#
                            {participant.riotIdTagline}
                          </p>
                          <p>
                            KDA: {participant.kills}/{participant.deaths}/
                            {participant.assists}
                          </p>
                          <p>CS: {participant.totalMinionsKilled}</p>
                        </div>
                        <div className="flex space-x-1">
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
                                width={32}
                                height={32}
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
