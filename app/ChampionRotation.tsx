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
      <div>
        <Loader className="animate-spin" />
      </div>
    );
  if (error) return <div>{error}</div>;

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Champion Rotation</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl text-center font-semibold mb-3">
            Free Champions
          </h3>
          <ul className="flex flex-wrap gap-4 justify-center">
            {freeChampions.map((id) => (
              <li key={id} className="flex flex-col items-center">
                <Image
                  src={`https://cdn.communitydragon.org/14.23.1/champion/${id}/square`}
                  alt={`Champion ${id}`}
                  width={64}
                  height={64}
                  className="rounded-full border border-gray-300"
                />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl text-center font-semibold mb-3">
            New Player Champions <br /> (Before Level 10)
          </h3>
          <ul className="flex flex-wrap gap-4 justify-center">
            {newPlayerChampions.map((id) => (
              <li key={id} className="flex flex-col items-center">
                <Image
                  src={`https://cdn.communitydragon.org/14.23.1/champion/${id}/square`}
                  alt={`Champion ${id}`}
                  width={64}
                  height={64}
                  className="rounded-full border border-gray-300"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChampionRotation;
