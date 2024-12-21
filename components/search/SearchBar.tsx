"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RegionSelect } from "./RegionSelect";
import { useRouter } from "next/navigation";

interface RecentSearch {
  summonerName: string;
  region: string;
  timestamp: number;
}

const MAX_RECENT_SEARCHES = 10;

export function SearchBar() {
  const router = useRouter();
  const [region, setRegion] = useState("euw1");
  const [summonerName, setSummonerName] = useState("");
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [showRecent, setShowRecent] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  const addRecentSearch = (summonerName: string, region: string) => {
    const newSearch: RecentSearch = {
      summonerName,
      region,
      timestamp: Date.now(),
    };

    const updatedSearches = [
      newSearch,
      ...recentSearches.filter(
        (search) =>
          search.summonerName !== summonerName || search.region !== region
      ),
    ].slice(0, MAX_RECENT_SEARCHES);

    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  const removeRecentSearch = (index: number) => {
    const updatedSearches = recentSearches.filter((_, i) => i !== index);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (summonerName.trim()) {
      const encodedSummonerName = encodeURIComponent(summonerName.trim())
        .replace(/%20/g, " ")
        .replace(/%23/g, "+");
      addRecentSearch(summonerName.trim(), region);
      router.push(`/${region}/${encodedSummonerName}`);
    }
  };

  const handleRecentSearchClick = (search: RecentSearch) => {
    const encodedName = encodeURIComponent(search.summonerName)
      .replace(/%20/g, " ")
      .replace(/%23/g, "+");
    setShowRecent(false);
    router.push(`/${search.region}/${encodedName}`);
  };

  return (
    <div className="relative w-full max-w-2xl z-50">
      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row gap-4 w-full bg-white/95 backdrop-blur-sm shadow-xl rounded-xl p-6 border border-gray-100"
      >
        <RegionSelect value={region} onValueChange={setRegion} />
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Input
              placeholder="Search summoner..."
              value={summonerName}
              onChange={(e) => setSummonerName(e.target.value)}
              onFocus={() => setShowRecent(true)}
              className="flex-1 bg-white/50 backdrop-blur-sm border border-gray-200 
                hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                placeholder:text-gray-400"
            />
            {showRecent && recentSearches.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-2 bg-white backdrop-blur-sm 
                  border border-gray-200 rounded-lg shadow-xl z-50 max-h-[400px] overflow-y-auto"
              >
                <div className="p-3 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500">
                    Recent Search
                  </h3>
                </div>
                <div className="py-1">
                  {recentSearches.map((search, index) => (
                    <div
                      key={`${search.summonerName}-${search.region}-${search.timestamp}`}
                      className="flex items-center px-3 py-2 hover:bg-gray-50 group cursor-pointer transition-colors duration-200"
                      onClick={() => handleRecentSearchClick(search)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleRecentSearchClick(search);
                        }
                      }}
                    >
                      <div className="min-w-[40px] h-5 flex items-center justify-center bg-blue-500 text-white text-xs font-medium rounded">
                        {search.region.replace(/[0-9]/g, "").toUpperCase()}
                      </div>
                      <span className="ml-2 text-gray-900 font-medium">
                        {search.summonerName.split("#")[0]}
                      </span>
                      <span className="ml-2 text-gray-500 text-sm">
                        #{search.summonerName.split("#")[1]}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeRecentSearch(index);
                        }}
                        className="ml-auto p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 rounded transition-all duration-200"
                        aria-label="Remove search"
                      >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-blue-600 
              hover:from-blue-600 hover:to-blue-700 text-white shadow-md 
              hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
          >
            <Search className="h-5 w-5 mr-2" />
            Search
          </Button>
        </div>
      </form>
      {showRecent && recentSearches.length > 0 && (
        <div
          className="fixed inset-0 -z-40"
          onClick={() => setShowRecent(false)}
        />
      )}
    </div>
  );
}
