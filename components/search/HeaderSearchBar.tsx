"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { regions } from "@/lib/config/regions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function HeaderSearchBar() {
  const router = useRouter();
  const [summonerName, setSummonerName] = useState("");
  const [region, setRegion] = useState("euw1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (summonerName.trim()) {
      const encodedSummonerName = encodeURIComponent(summonerName.trim())
        .replace(/%20/g, " ")
        .replace(/%23/g, "+");
      router.push(`/${region}/${encodedSummonerName}`);
    }
  };

  const selectedRegion = regions.find((r) => r.id === region);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center gap-2">
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="w-[140px] md:w-[160px] h-9 bg-white shadow-sm border-gray-200 hover:border-blue-400 transition-colors">
            <SelectValue>
              {selectedRegion ? (
                <span className="flex items-center gap-2">
                  <span className="font-medium">{selectedRegion.name}</span>
                </span>
              ) : (
                "Select Region"
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem
                key={region.id}
                value={region.id}
                className="flex items-center gap-2"
              >
                <span className="font-medium">{region.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <input
            type="text"
            value={summonerName}
            onChange={(e) => setSummonerName(e.target.value)}
            placeholder="Search summoner..."
            className="w-full h-9 pl-4 pr-10 rounded-lg bg-white shadow-sm border border-gray-200 hover:border-blue-400 focus:border-blue-500 outline-none transition-colors"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
          >
            <Search size={18} />
          </button>
        </div>
      </div>
    </form>
  );
}
