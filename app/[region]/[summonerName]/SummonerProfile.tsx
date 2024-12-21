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
    <Card className="p-8 bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-xl border-0">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-36 h-36 group">
          <Image
            src={`https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${summoner.profileIconId}.png`}
            alt="Summoner Icon"
            fill
            className="rounded-full shadow-lg ring-4 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all duration-300"
          />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
            {summoner.summonerLevel}
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              {summonerName}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    <div className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{type}</h3>
      {tier !== "Unranked" ? (
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 group">
            <Image
              src={`/ranks/${tier.toLowerCase()}.png`}
              alt={tier}
              width={128}
              height={128}
              className="rounded-lg transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-gray-900">
              {tier} {rank}
            </p>
            <p className="text-lg font-medium text-blue-500">{lp} LP</p>
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-medium">{wins}W</span>
              <span className="text-red-500 font-medium">{losses}L</span>
              <span className="text-gray-600">({winRate}%)</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-32">
          <p className="text-xl font-semibold text-gray-400">{tier}</p>
        </div>
      )}
    </div>
  );
}
