"use client";

import React, { useEffect, useState } from "react";
import { getChampionRotation } from "../lib/api/riot";
import { RegionId } from "@/lib/config/regions";
import Image from "next/image";
import { Loader } from "lucide-react";

interface ChampionRotationProps {
  region: RegionId;
}

const ChampionRotation: React.FC<ChampionRotationProps> = ({ region }) => {
  const [freeChampions, setFreeChampions] = useState<number[]>([]);
  const [newPlayerChampions, setNewPlayerChampions] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChampionRotation = async () => {
      try {
        const data = await getChampionRotation(region);
        setFreeChampions(data.freeChampionIds);
        setNewPlayerChampions(data.freeChampionIdsForNewPlayers);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch champion rotation");
        setLoading(false);
      }
    };

    fetchChampionRotation();
  }, [region]);

  if (loading)
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="bg-white/95 backdrop-blur-sm shadow-xl rounded-xl border-0 p-8">
      <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
        Champion Rotation
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-center text-gray-800 mb-6">
            Free Champions
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center">
            {freeChampions.map((championId) => (
              <div
                key={championId}
                className="relative group transform transition-all duration-200 hover:scale-110"
              >
                <div className="relative w-16 h-16">
                  <Image
                    src={`https://cdn.communitydragon.org/14.23.1/champion/${championId}/square`}
                    alt={`Champion ${championId}`}
                    fill
                    className="rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-200"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-center text-gray-800 mb-6">
            Free for New Players
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center">
            {newPlayerChampions.map((championId) => (
              <div
                key={championId}
                className="relative group transform transition-all duration-200 hover:scale-110"
              >
                <div className="relative w-16 h-16">
                  <Image
                    src={`https://cdn.communitydragon.org/14.23.1/champion/${championId}/square`}
                    alt={`Champion ${championId}`}
                    fill
                    className="rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-200"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChampionRotation;
