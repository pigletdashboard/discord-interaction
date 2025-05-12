// Bot Status Types
export interface BotStats {
  servers: {
    count: number;
    growth: string;
  };
  users: {
    count: number;
    growth: string;
  };
  commands: {
    count: number;
    growth: string;
  };
  games: {
    count: number;
    growth: string;
  };
}

export interface ConnectionStatus {
  state: "connected" | "disconnected" | "reconnecting";
  ping: number;
  uptime: string;
}

// Command Types
export interface CommandOption {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface Command {
  name: string;
  description: string;
  options?: CommandOption[];
  helpText: string;
  alternatives: string[];
  examples?: string[];
  icon: string;
  color: string;
}

// Game Types
export interface Game {
  id: string;
  name: string;
  description: string;
  playCount: number;
  winRate: number;
}

// User Types
export interface GamblingUser {
  id: number;
  discordId: string;
  username: string;
  balance: number;
  gamesPlayed: number;
  gamesWon: number;
  lastPlayed: string;
}

// Statistics Types
export interface GameStats {
  id: number;
  gameType: string;
  totalPlayed: number;
  totalWagered: number;
  totalPaidOut: number;
  totalProfitLoss: number;
  highestWin: number;
  highestWager: number;
  largestMultiplier: string | null;
  userWithMostWins: string | null;
  userWithHighestWager: string | null;
  lastUpdated: string;
}

export interface UserGameStats {
  id: number;
  userId: number;
  gameType: string;
  gamesPlayed: number;
  gamesWon: number;
  totalWagered: number;
  totalWon: number;
  netProfitLoss: number;
  highestWin: number;
  highestMultiplier: string | null;
  winRate: string;
  favoriteGame: string | null;
  lastPlayed: string;
}

export interface LeaderboardPlayer {
  rank: number;
  username: string;
  balance: number;
  netProfitLoss: number;
  gamesPlayed: number;
  winRate: string;
}

export interface GameLeaderboard {
  gameType: string;
  totalPlayed: number;
  popularity: string;
  houseEdge: string;
  largestWin: number;
}
