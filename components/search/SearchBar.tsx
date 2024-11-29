"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RegionSelect } from "./RegionSelect";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const router = useRouter();
  const [region, setRegion] = useState("tr1");
  const [summonerName, setSummonerName] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (summonerName.trim()) {
      const encodedSummonerName = encodeURIComponent(summonerName.trim())
        .replace(/%20/g, " ")
        .replace(/%23/g, "+");
      router.push(`/${region}/${encodedSummonerName}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl"
    >
      <RegionSelect value={region} onValueChange={setRegion} />
      <div className="flex-1 flex gap-2">
        <Input
          placeholder="Search summoner..."
          value={summonerName}
          onChange={(e) => setSummonerName(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>
    </form>
  );
}
