"use client";

import { useEffect, useState } from "react";
import { Match } from "@/lib/types/summoner";
import { Card } from "@/components/ui/card";
import { getMatchList, getMatchDetails } from "@/lib/api/riot";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { RegionId, regions } from "@/lib/config/regions";

interface MatchHistoryProps {
  summonerId: string;
  region: RegionId;
}

export function MatchHistory({ summonerId, region }: MatchHistoryProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div>Loading matches...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Match History</h2>
      {matches.map((match) => (
        <MatchCard
          key={match.metadata.matchId}
          match={match}
          summonerId={summonerId}
        />
      ))}
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
