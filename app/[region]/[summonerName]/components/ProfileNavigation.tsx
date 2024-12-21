"use client";

import { Button } from "@/components/ui/button";
import { Gamepad, RefreshCw } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { refreshProfileData } from "../actions";
import { RegionId } from "@/lib/config/regions";

interface ProfileNavigationProps {
  region: RegionId;
  summonerName: string;
  isInGame: boolean;
}

export function ProfileNavigation({
  region,
  summonerName,
  isInGame,
}: ProfileNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isLiveGame = pathname.includes("/live");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshProfileData(region, summonerName);
      router.refresh();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex items-center gap-4 border-b border-gray-200">
      <Button
        asChild
        variant="ghost"
        className={`relative h-12 rounded-none border-b-2 ${
          !isLiveGame
            ? "border-blue-500 font-semibold text-blue-600"
            : "border-transparent hover:text-blue-600 hover:border-blue-500"
        } transition-colors`}
      >
        <Link href={`/${region}/${summonerName}`}>Summary</Link>
      </Button>

      {isInGame ? (
        <Button
          asChild
          variant="ghost"
          className={`relative h-12 rounded-none border-b-2 ${
            isLiveGame
              ? "border-blue-500 font-semibold text-blue-600"
              : "border-transparent hover:text-blue-600 hover:border-blue-500"
          } transition-colors`}
        >
          <Link href={`/${region}/${summonerName}/live`}>
            <div className="flex items-center gap-2">
              <Gamepad className="w-4 h-4" />
              Live Game
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
            </div>
          </Link>
        </Button>
      ) : (
        <div className="relative h-12 px-4 flex items-center gap-2 text-gray-400 cursor-not-allowed">
          <Gamepad className="w-4 h-4" />
          Live Game
        </div>
      )}

      <div className="ml-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`${isRefreshing ? "animate-spin" : ""}`}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
