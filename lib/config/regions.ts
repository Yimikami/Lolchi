export const regions = [
  { id: "na1", name: "North America", platform: "americas" },
  { id: "euw1", name: "Europe West", platform: "europe" },
  { id: "kr", name: "Korea", platform: "asia" },
  { id: "eun1", name: "Europe Nordic & East", platform: "europe" },
  { id: "jp1", name: "Japan", platform: "asia" },
  { id: "br1", name: "Brazil", platform: "americas" },
  { id: "la1", name: "LAN", platform: "americas" },
  { id: "la2", name: "LAS", platform: "americas" },
  { id: "oc1", name: "Oceania", platform: "sea" },
  { id: "tr1", name: "Turkey", platform: "europe" },
  { id: "ru", name: "Russia", platform: "europe" },
] as const;

export type RegionId = (typeof regions)[number]["id"];
export type Platform = (typeof regions)[number]["platform"];
