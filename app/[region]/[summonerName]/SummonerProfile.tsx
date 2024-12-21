import { Summoner, RankedInfo } from "@/lib/types/summoner";
import { Card } from "@/components/ui/card";
import Image from "next/image";

interface SummonerProfileProps {
  summoner: Summoner;
  summonerName: string;
  rankedInfo: RankedInfo[];
}

export function SummonerProfile({
  summoner,
  rankedInfo,
  summonerName,
}: SummonerProfileProps) {
  const soloQueue = rankedInfo.find(
    (queue) => queue.queueType === "RANKED_SOLO_5x5"
  );
  const flexQueue = rankedInfo.find(
    (queue) => queue.queueType === "RANKED_FLEX_SR"
  );

  return (
    <Card className="p-6 bg-white shadow-lg rounded-lg">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative w-32 h-32">
          <Image
            src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${summoner.profileIconId}.png`}
            alt="Summoner Icon"
            fill
            className="rounded-full shadow-md"
          />
        </div>

        <div className="flex-1">
          <h1 className="text-4xl font-extrabold mb-2 text-gray-800">
            {summonerName}
          </h1>

          <p className="text-lg text-gray-600 mb-4">
            Level {summoner.summonerLevel}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {soloQueue ? (
              <RankDisplay
                type="Solo Queue"
                tier={soloQueue.tier}
                rank={soloQueue.rank}
                lp={soloQueue.leaguePoints}
                wins={soloQueue.wins}
                losses={soloQueue.losses}
              />
            ) : (
              <RankDisplay
                type="Solo Queue"
                tier="Unranked"
                rank=""
                lp={0}
                wins={0}
                losses={0}
              />
            )}
            {flexQueue ? (
              <RankDisplay
                type="Flex Queue"
                tier={flexQueue.tier}
                rank={flexQueue.rank}
                lp={flexQueue.leaguePoints}
                wins={flexQueue.wins}
                losses={flexQueue.losses}
              />
            ) : (
              <RankDisplay
                type="Flex Queue"
                tier="Unranked"
                rank=""
                lp={0}
                wins={0}
                losses={0}
              />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function RankDisplay({
  type,
  tier,
  rank,
  lp,
  wins,
  losses,
}: {
  type: string;
  tier: string;
  rank: string;
  lp: number;
  wins: number;
  losses: number;
}) {
  const winRate =
    wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

  return (
    <div className="bg-card border rounded-lg p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{type}</h3>
      {tier !== "Unranked" ? (
        <div className="flex items-center gap-4">
          <Image
            src={`/ranks/${tier.toLowerCase()}.png`}
            alt={tier}
            width={128}
            height={128}
            className="rounded-lg"
          />
          <div>
            <p className="font-semibold">
              {tier} {rank}
            </p>
            <p className="text-sm text-muted-foreground">{lp} LP</p>
            <p className="text-sm">
              {wins}W {losses}L ({winRate}%)
            </p>
          </div>
        </div>
      ) : (
        <div>
          <p className="font-semibold">{tier}</p>
        </div>
      )}
    </div>
  );
}
