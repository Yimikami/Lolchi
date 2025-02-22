export interface Summoner {
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export interface RankedInfo {
  leagueId: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
}

export interface Match {
  metadata: {
    matchId: string;
    participants: string[];
  };
  info: {
    queueId: number;
    gameCreation: number;
    gameDuration: number;
    gameMode: string;
    participants: MatchParticipant[];
  };
}

export interface MatchParticipant {
  rank: string;
  summonerId: string;
  riotIdGameName: string;
  riotIdTagline: string;
  teamId: number;
  puuid: string;
  summonerName: string;
  championName: string;
  champLevel: number;
  kills: number;
  deaths: number;
  assists: number;
  totalMinionsKilled: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  summoner1Id: number;
  summoner2Id: number;
  primaryRuneId: number;
  secondaryRuneId: number;
  win: boolean;
}
