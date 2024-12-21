"use client";

import { regions } from "@/lib/config/regions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RegionSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function RegionSelect({ value, onValueChange }: RegionSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger 
        className="w-[180px] bg-white/50 backdrop-blur-sm border border-gray-200 
        hover:bg-white/80 transition-colors duration-200 shadow-sm hover:shadow
        focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
      >
        <SelectValue placeholder="Select region" />
      </SelectTrigger>
      <SelectContent className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg">
        {regions.map((region) => (
          <SelectItem 
            key={region.id} 
            value={region.id}
            className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer transition-colors duration-200"
          >
            {region.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
