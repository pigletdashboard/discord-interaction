import { 
  users, games, commands, botSettings, gameStats, userGameStats, transactions, currencyEarnings,
  type User, type InsertUser, 
  type Game, type InsertGame,
  type Command, type InsertCommand,
  type BotSettings, type InsertBotSettings,
  type GameStats, type InsertGameStats,
  type UserGameStats, type InsertUserGameStats,
  type Transaction, type InsertTransaction,
  type CurrencyEarning, type InsertCurrencyEarning
} from "@shared/schema";

// Storage interface for all data operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, update: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  
  // Game operations
  createGame(game: InsertGame): Promise<Game>;
  getGamesByUserId(userId: number): Promise<Game[]>;
  getAllGames(): Promise<Game[]>;
  
  // Command operations
  getCommand(name: string): Promise<Command | undefined>;
  getAllCommands(): Promise<Command[]>;
  createCommand(command: InsertCommand): Promise<Command>;
  updateCommand(name: string, update: Partial<Command>): Promise<Command | undefined>;
  
  // Settings operations
  getSettings(): Promise<BotSettings | undefined>;
  updateSettings(update: Partial<BotSettings>): Promise<BotSettings | undefined>;
  
  // Game statistics operations
  getGameStats(gameType: string): Promise<GameStats | undefined>;
  getAllGameStats(): Promise<GameStats[]>;
  updateGameStats(gameType: string, update: Partial<GameStats>): Promise<GameStats | undefined>;
  getUserGameStats(userId: number, gameType?: string): Promise<UserGameStats[]>;
  updateUserGameStats(userId: number, gameType: string, update: Partial<UserGameStats>): Promise<UserGameStats | undefined>;
  
  // Advanced statistics operations
  getTopPlayers(limit?: number): Promise<User[]>;
  getTopGames(limit?: number): Promise<GameStats[]>;
  getMostProfitableGames(): Promise<GameStats[]>;
  getLeastProfitableGames(): Promise<GameStats[]>;
  getPlayerLeaderboard(gameType?: string, sortBy?: string, limit?: number): Promise<UserGameStats[]>;
  
  // Currency operations
  addCurrency(userId: number, amount: number, type: string, description: string, gameId?: number): Promise<Transaction>;
  removeCurrency(userId: number, amount: number, type: string, description: string, gameId?: number): Promise<Transaction>;
  transferCurrency(fromUserId: number, toUserId: number, amount: number, description: string): Promise<Transaction>;
  getUserTransactions(userId: number, limit?: number): Promise<Transaction[]>;
  
  // Daily rewards operations
  claimDailyReward(userId: number): Promise<{ success: boolean; amount: number; streak: number; nextAvailable: Date; error?: string }>;
  getDailyStatus(userId: number): Promise<CurrencyEarning | undefined>;
  
  // Currency leaderboard
  getTopBalances(limit?: number): Promise<User[]>;
  getTopEarners(limit?: number): Promise<User[]>;
  getMostGenerous(limit?: number): Promise<{ userId: number; username: string; totalTransferred: number }[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<number, Game>;
  private commands: Map<string, Command>;
  private settings: BotSettings | undefined;
  private gameStatsMap: Map<string, GameStats>;
  private userGameStatsMap: Map<string, UserGameStats>;
  private transactionsMap: Map<number, Transaction>;
  private currencyEarningsMap: Map<string, CurrencyEarning>; // key: userId-type
  
  private userIdCounter: number = 1;
  private gameIdCounter: number = 1;
  private gameStatsIdCounter: number = 1;
  private userGameStatsIdCounter: number = 1;
  private transactionIdCounter: number = 1;
  private currencyEarningIdCounter: number = 1;
  
  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.commands = new Map();
    this.gameStatsMap = new Map();
    this.userGameStatsMap = new Map();
    this.transactionsMap = new Map();
    this.currencyEarningsMap = new Map();
    
    // Initialize with default settings
    this.settings = {
      id: 1,
      prefix: "!",
      defaultCurrency: "$",
      startingBalance: 1000,
      logCommands: true,
      allowUserReset: true,
      cooldownMinutes: 5,
      
      // Game settings
      gameEnabledCoinflip: true,
      gameEnabledBlackjack: true,
      gameEnabledSlots: true,
      gameEnabledRoulette: true,
      gameEnabledDice: true,
      
      // Currency settings
      dailyRewardAmount: 100,
      streakBonusAmount: 25,
      maxStreakBonus: 250,
      minimumBetAmount: 10,
      maximumBetAmount: 10000,
      currencyName: "coins",
      currencyNamePlural: "coins",
      allowTransfersBetweenUsers: true,
    };
    
    // Initialize with default commands
    this.initializeDefaultCommands();
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.discordId === discordId);
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const startingBalance = userData.balance || (this.settings?.startingBalance || 1000);
    
    const user: User = {
      ...userData,
      id,
      balance: startingBalance,
      totalEarned: 0,
      totalSpent: 0,
      totalWon: 0,
      highestBalance: startingBalance,
      gamesPlayed: 0,
      gamesWon: 0,
      lastPlayed: now,
      vip: false,
      vipLevel: 0,
      lastDaily: null,
    };
    
    this.users.set(id, user);
    
    // We'll add the addCurrency method implementation later
    // which will record the initial balance as a transaction
    
    return user;
  }
  
  async updateUser(id: number, update: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...update };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Game methods
  async createGame(gameData: InsertGame): Promise<Game> {
    const id = this.gameIdCounter++;
    const now = new Date();
    const game: Game = {
      ...gameData,
      id,
      playedAt: now,
      winAmount: gameData.winAmount || null, // Ensure winAmount is always set
      multiplier: gameData.multiplier || null, // Ensure multiplier is always set
      details: gameData.details || null, // Ensure details is always set
    };
    this.games.set(id, game);
    
    // Update game statistics
    this.updateGameStatistics(game);
    
    // Update user game statistics
    this.updateUserGameStatistics(game);
    
    return game;
  }
  
  // Private helper methods for statistics tracking
  private async updateGameStatistics(game: Game): Promise<void> {
    const { gameType, bet, winAmount, multiplier, outcome } = game;
    const isWin = outcome === 'win';
    const actualWinAmount = winAmount || 0;
    
    // Get existing stats or create new ones
    const existingStats = await this.getGameStats(gameType);
    
    if (existingStats) {
      // Update existing game stats
      await this.updateGameStats(gameType, {
        totalPlayed: existingStats.totalPlayed + 1,
        totalWagered: existingStats.totalWagered + bet,
        totalPaidOut: existingStats.totalPaidOut + (isWin ? actualWinAmount + bet : 0),
        totalProfitLoss: existingStats.totalProfitLoss + (isWin ? -actualWinAmount : bet),
        highestWin: Math.max(existingStats.highestWin, isWin ? actualWinAmount : 0),
        highestWager: Math.max(existingStats.highestWager, bet),
        largestMultiplier: multiplier && existingStats.largestMultiplier ? 
          (parseFloat(multiplier) > parseFloat(existingStats.largestMultiplier) ? 
            multiplier : existingStats.largestMultiplier) : 
          (multiplier || existingStats.largestMultiplier)
      });
    } else {
      // Create new game stats
      await this.updateGameStats(gameType, {
        totalPlayed: 1,
        totalWagered: bet,
        totalPaidOut: isWin ? actualWinAmount + bet : 0,
        totalProfitLoss: isWin ? -actualWinAmount : bet,
        highestWin: isWin ? actualWinAmount : 0,
        highestWager: bet,
        largestMultiplier: multiplier
      });
    }
  }
  
  private async updateUserGameStatistics(game: Game): Promise<void> {
    const { userId, gameType, bet, winAmount, multiplier, outcome } = game;
    const isWin = outcome === 'win';
    const actualWinAmount = winAmount || 0;
    
    // Get user's existing stats for this game type
    const userStats = await this.getUserGameStats(userId, gameType);
    const existingStat = userStats.length > 0 ? userStats[0] : null;
    
    if (existingStat) {
      // Calculate new win rate
      const newGamesPlayed = existingStat.gamesPlayed + 1;
      const newGamesWon = existingStat.gamesWon + (isWin ? 1 : 0);
      const winRate = `${Math.round((newGamesWon / newGamesPlayed) * 100)}%`;
      
      // Update existing user game stats
      await this.updateUserGameStats(userId, gameType, {
        gamesPlayed: newGamesPlayed,
        gamesWon: newGamesWon,
        totalWagered: existingStat.totalWagered + bet,
        totalWon: existingStat.totalWon + (isWin ? actualWinAmount + bet : 0),
        netProfitLoss: existingStat.netProfitLoss + (isWin ? actualWinAmount : -bet),
        highestWin: Math.max(existingStat.highestWin, isWin ? actualWinAmount : 0),
        highestMultiplier: multiplier && existingStat.highestMultiplier ?
          (parseFloat(multiplier) > parseFloat(existingStat.highestMultiplier) ?
            multiplier : existingStat.highestMultiplier) :
          (multiplier || existingStat.highestMultiplier),
        winRate
      });
    } else {
      // Calculate win rate
      const winRate = isWin ? '100%' : '0%';
      
      // Create new user game stats
      await this.updateUserGameStats(userId, gameType, {
        gamesPlayed: 1,
        gamesWon: isWin ? 1 : 0,
        totalWagered: bet,
        totalWon: isWin ? actualWinAmount + bet : 0,
        netProfitLoss: isWin ? actualWinAmount : -bet,
        highestWin: isWin ? actualWinAmount : 0,
        highestMultiplier: multiplier,
        winRate
      });
    }
    
    // Update the user's favorite game based on most played
    const allUserStats = await this.getUserGameStats(userId);
    if (allUserStats.length > 0) {
      // Sort by games played to find favorite
      allUserStats.sort((a, b) => b.gamesPlayed - a.gamesPlayed);
      const favoriteGame = allUserStats[0].gameType;
      
      // Update all user game stats with favorite game
      for (const stat of allUserStats) {
        await this.updateUserGameStats(userId, stat.gameType, {
          favoriteGame
        });
      }
    }
  }
  
  async getGamesByUserId(userId: number): Promise<Game[]> {
    return Array.from(this.games.values()).filter(game => game.userId === userId);
  }
  
  async getAllGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }
  
  // Command methods
  async getCommand(name: string): Promise<Command | undefined> {
    return this.commands.get(name);
  }
  
  async getAllCommands(): Promise<Command[]> {
    return Array.from(this.commands.values());
  }
  
  async createCommand(commandData: InsertCommand): Promise<Command> {
    const id = this.commands.size + 1;
    const command: Command = {
      ...commandData,
      id,
      options: commandData.options || null,
      examples: commandData.examples || null
    };
    this.commands.set(command.name, command);
    return command;
  }
  
  async updateCommand(name: string, update: Partial<Command>): Promise<Command | undefined> {
    const command = await this.getCommand(name);
    if (!command) return undefined;
    
    const updatedCommand = { ...command, ...update };
    this.commands.set(name, updatedCommand);
    return updatedCommand;
  }
  
  // Settings methods
  async getSettings(): Promise<BotSettings | undefined> {
    return this.settings;
  }
  
  async updateSettings(update: Partial<BotSettings>): Promise<BotSettings | undefined> {
    if (!this.settings) return undefined;
    
    this.settings = { ...this.settings, ...update };
    return this.settings;
  }
  
  // Initialize default commands based on the provided text file
  private initializeDefaultCommands() {
    const defaultCommands: InsertCommand[] = [
      {
        name: "help",
        description: "Show help for all commands",
        helpText: "Show the help for all the commands available in the bot",
        options: JSON.stringify([{
          name: "command_name",
          type: "STRING",
          required: false,
          description: "The command to look up. Start typing to search for a command"
        }]),
        alternatives: JSON.stringify([
          "@Discord Gambling Bot help [<command> | <alias> | bets | guild | player | games]",
          "@Discord Gambling Bot h [<command> | <alias> | bets | guild | player | games]",
          "@Discord Gambling Bot wtf [<command> | <alias> | bets | guild | player | games]"
        ]),
        examples: JSON.stringify([
          "@Discord Gambling Bot help",
          "@Discord Gambling Bot help help",
          "@Discord Gambling Bot help connectFour",
          "@Discord Gambling Bot help c4"
        ]),
        icon: "fa-question",
        color: "discord-blurple"
      },
      {
        name: "delete_my_data",
        description: "Clear all your data from the bot",
        helpText: "The command used to clear all of your data from the bot. Use this if you want to start from scratch",
        alternatives: JSON.stringify([
          "@Discord Gambling Bot deleteMyData"
        ]),
        examples: null,
        options: null,
        icon: "fa-trash-alt",
        color: "discord-red"
      },
      {
        name: "donate",
        description: "Shares a link to donate to the bot",
        helpText: "Shares a link to donate to the bot",
        alternatives: JSON.stringify([
          "@Discord Gambling Bot donate"
        ]),
        examples: JSON.stringify([
          "@Discord Gambling Bot donate",
          "@Discord Gambling Bot donate paypal",
          "@Discord Gambling Bot donate patreon"
        ]),
        options: null,
        icon: "fa-donate",
        color: "discord-green"
      },
      {
        name: "invite",
        description: "Shares the details of how to add the bot",
        helpText: "Shares the details of how to add the bot",
        alternatives: JSON.stringify([
          "@Discord Gambling Bot invite"
        ]),
        examples: null,
        options: null,
        icon: "fa-plus",
        color: "purple-500"
      },
      {
        name: "stats",
        description: "Shows bot stats including ping, player count, etc.",
        helpText: "Shows a selection of bot stats including ping, player count, guild count etc.",
        alternatives: JSON.stringify([
          "@Discord Gambling Bot stats",
          "@Discord Gambling Bot ping",
          "@Discord Gambling Bot status",
          "@Discord Gambling Bot about",
          "@Discord Gambling Bot info",
          "@Discord Gambling Bot owner"
        ]),
        examples: null,
        options: null,
        icon: "fa-chart-bar",
        color: "blue-500"
      },
      {
        name: "support",
        description: "Shares a link to the support server",
        helpText: "Shares a link to the support server",
        alternatives: JSON.stringify([
          "@Discord Gambling Bot support"
        ]),
        examples: null,
        options: null,
        icon: "fa-hands-helping",
        color: "yellow-500"
      },
      {
        name: "coinflip",
        description: "Flip a coin and bet on the outcome",
        helpText: "Flip a coin and bet on heads or tails. Win double your bet if you guess correctly!",
        options: JSON.stringify([
          {
            name: "choice",
            type: "STRING",
            required: true,
            description: "Choose heads or tails"
          },
          {
            name: "bet",
            type: "INTEGER",
            required: true,
            description: "The amount to bet"
          }
        ]),
        alternatives: JSON.stringify([
          "@Discord Gambling Bot coinflip <heads|tails> <bet>",
          "@Discord Gambling Bot cf <heads|tails> <bet>",
          "@Discord Gambling Bot flip <heads|tails> <bet>"
        ]),
        examples: JSON.stringify([
          "@Discord Gambling Bot coinflip heads 100",
          "@Discord Gambling Bot cf tails 500",
          "@Discord Gambling Bot flip heads 1000"
        ]),
        icon: "fa-coins",
        color: "yellow-400"
      },
      {
        name: "slots",
        description: "Play the slot machine and win big",
        helpText: "Play the slot machine with different symbols. Match two or three symbols to win! Triple sevens gives the biggest jackpot!",
        options: JSON.stringify([
          {
            name: "bet",
            type: "INTEGER",
            required: true,
            description: "The amount to bet"
          }
        ]),
        alternatives: JSON.stringify([
          "@Discord Gambling Bot slots <bet>",
          "@Discord Gambling Bot slot <bet>",
          "@Discord Gambling Bot slotmachine <bet>"
        ]),
        examples: JSON.stringify([
          "@Discord Gambling Bot slots 100",
          "@Discord Gambling Bot slots 500",
          "@Discord Gambling Bot slots 1000"
        ]),
        icon: "fa-dice",
        color: "purple-500"
      },
      {
        name: "blackjack",
        description: "Play a game of blackjack against the dealer",
        helpText: "Play a game of blackjack against the dealer. Beat the dealer's hand without going over 21 to win!",
        options: JSON.stringify([
          {
            name: "bet",
            type: "INTEGER",
            required: true,
            description: "The amount to bet"
          },
          {
            name: "mode",
            type: "STRING",
            required: false,
            description: "Game difficulty (normal or hard)"
          }
        ]),
        alternatives: JSON.stringify([
          "@Discord Gambling Bot blackjack <bet> [hard]",
          "@Discord Gambling Bot bj <bet> [hard]",
          "@Discord Gambling Bot 21 <bet> [hard]"
        ]),
        examples: JSON.stringify([
          "@Discord Gambling Bot blackjack 100",
          "@Discord Gambling Bot blackjack 500 hard",
          "@Discord Gambling Bot bj 1000"
        ]),
        icon: "fa-playing-cards",
        color: "green-500"
      },
      {
        name: "roulette",
        description: "Play roulette and bet on different options",
        helpText: "Play roulette by betting on red/black, odd/even, high/low, or a specific number. Different bets have different payouts!",
        options: JSON.stringify([
          {
            name: "bet_type",
            type: "STRING",
            required: true,
            description: "Type of bet (color, parity, range, number)"
          },
          {
            name: "choice",
            type: "STRING",
            required: true,
            description: "Your choice (red/black, odd/even, high/low, or a number 0-36)"
          },
          {
            name: "bet",
            type: "INTEGER",
            required: true,
            description: "The amount to bet"
          }
        ]),
        alternatives: JSON.stringify([
          "@Discord Gambling Bot roulette <bet_type> <choice> <bet>",
          "@Discord Gambling Bot roul <bet_type> <choice> <bet>"
        ]),
        examples: JSON.stringify([
          "@Discord Gambling Bot roulette color red 100",
          "@Discord Gambling Bot roulette number 23 500",
          "@Discord Gambling Bot roulette parity odd 200",
          "@Discord Gambling Bot roulette range high 300"
        ]),
        icon: "fa-dice",
        color: "red-500"
      },
      {
        name: "dice",
        description: "Roll dice and bet on the outcome",
        helpText: "Roll two dice and bet on whether the total will be higher, lower, or exactly equal to a target number. Different bets have different payouts based on probability!",
        options: JSON.stringify([
          {
            name: "bet_type",
            type: "STRING",
            required: true,
            description: "Type of bet (higher, lower, exact)"
          },
          {
            name: "number",
            type: "INTEGER",
            required: true,
            description: "The number to compare the dice roll against (2-12)"
          },
          {
            name: "bet",
            type: "INTEGER",
            required: true,
            description: "The amount to bet"
          }
        ]),
        alternatives: JSON.stringify([
          "@Discord Gambling Bot dice <bet_type> <number> <bet>",
          "@Discord Gambling Bot roll <bet_type> <number> <bet>"
        ]),
        examples: JSON.stringify([
          "@Discord Gambling Bot dice higher 7 100",
          "@Discord Gambling Bot dice lower 9 200",
          "@Discord Gambling Bot dice exact 7 500"
        ]),
        icon: "fa-dice",
        color: "blue-500"
      },
      {
        name: "poker",
        description: "Play a simplified 5-card draw poker game",
        helpText: "Play a simplified poker game where you are dealt 5 cards and compete against the dealer. Different hand rankings have different payouts!",
        options: JSON.stringify([
          {
            name: "bet",
            type: "INTEGER",
            required: true,
            description: "The amount to bet"
          }
        ]),
        alternatives: JSON.stringify([
          "@Discord Gambling Bot poker <bet>",
          "@Discord Gambling Bot cards <bet>"
        ]),
        examples: JSON.stringify([
          "@Discord Gambling Bot poker 100",
          "@Discord Gambling Bot poker 500",
          "@Discord Gambling Bot cards 250"
        ]),
        icon: "fa-cards",
        color: "green-700"
      },
      {
        name: "crash",
        description: "Play the crash game with a multiplier",
        helpText: "Place a bet and watch the multiplier rise. Cash out before it crashes to win big! The longer you wait, the higher the multiplier, but if it crashes before you cash out, you lose your bet.",
        options: JSON.stringify([
          {
            name: "bet",
            type: "INTEGER",
            required: true,
            description: "The amount to bet"
          },
          {
            name: "cashout",
            type: "NUMBER",
            required: false,
            description: "Auto cashout multiplier (e.g. 2.0 = double your bet)"
          }
        ]),
        alternatives: JSON.stringify([
          "@Discord Gambling Bot crash <bet> [cashout]",
          "@Discord Gambling Bot boom <bet> [cashout]"
        ]),
        examples: JSON.stringify([
          "@Discord Gambling Bot crash 100",
          "@Discord Gambling Bot crash 200 2.5",
          "@Discord Gambling Bot boom 500 3.0"
        ]),
        icon: "fa-chart-line",
        color: "red-600"
      },
      {
        name: "hilo",
        description: "Play the Higher-or-Lower card game with multipliers",
        helpText: "A card is drawn, and you must bet whether the next card will be higher or lower. The payout depends on the probability of your prediction being correct!",
        options: JSON.stringify([
          {
            name: "bet",
            type: "INTEGER",
            required: true,
            description: "The amount to bet"
          }
        ]),
        alternatives: JSON.stringify([
          "@Discord Gambling Bot hilo <bet> <choice>",
          "@Discord Gambling Bot highlow <bet> <choice>",
          "@Discord Gambling Bot higherlow <bet> <choice>"
        ]),
        examples: JSON.stringify([
          "@Discord Gambling Bot hilo 100 higher",
          "@Discord Gambling Bot hilo 250 lower",
          "@Discord Gambling Bot highlow 500 higher"
        ]),
        icon: "fa-exchange-alt",
        color: "purple-600"
      },
      {
        name: "megamultiplier",
        description: "High-risk, high-reward game with multipliers up to 100,000x",
        helpText: "Set your risk level and make a bet for a chance to win massive multipliers up to 100,000x! Higher risk levels reduce your odds but increase potential rewards.",
        options: JSON.stringify([
          {
            name: "bet",
            type: "INTEGER",
            required: true,
            description: "The amount to bet"
          },
          {
            name: "risk",
            type: "INTEGER",
            required: false,
            description: "Risk level (1-10). Higher risk means bigger potential multipliers but lower odds"
          }
        ]),
        alternatives: JSON.stringify([
          "@Discord Gambling Bot megamultiplier <bet> [risk]",
          "@Discord Gambling Bot megawin <bet> [risk]",
          "@Discord Gambling Bot megamulti <bet> [risk]"
        ]),
        examples: JSON.stringify([
          "@Discord Gambling Bot megamultiplier 100",
          "@Discord Gambling Bot megamultiplier 50 3",
          "@Discord Gambling Bot megawin 25 10"
        ]),
        icon: "fa-gem",
        color: "amber-500"
      }
    ];
    
    // Add each command to the map
    defaultCommands.forEach((cmd, index) => {
      this.commands.set(cmd.name, {
        ...cmd,
        id: index + 1,
      });
    });
  }
  
  // Game statistics operations
  async getGameStats(gameType: string): Promise<GameStats | undefined> {
    return this.gameStatsMap.get(gameType);
  }

  async getAllGameStats(): Promise<GameStats[]> {
    return Array.from(this.gameStatsMap.values());
  }

  async updateGameStats(gameType: string, update: Partial<GameStats>): Promise<GameStats | undefined> {
    const existingStats = this.gameStatsMap.get(gameType);
    
    if (!existingStats) {
      // If stats don't exist for this game type, create new entry
      const newStats: GameStats = {
        id: this.gameStatsIdCounter++,
        gameType,
        totalPlayed: update.totalPlayed || 0,
        totalWagered: update.totalWagered || 0,
        totalPaidOut: update.totalPaidOut || 0,
        totalProfitLoss: update.totalProfitLoss || 0,
        highestWin: update.highestWin || 0,
        highestWager: update.highestWager || 0,
        largestMultiplier: update.largestMultiplier || null,
        userWithMostWins: update.userWithMostWins || null,
        userWithHighestWager: update.userWithHighestWager || null,
        lastUpdated: new Date()
      };
      
      this.gameStatsMap.set(gameType, newStats);
      return newStats;
    }
    
    // Update existing stats
    const updatedStats: GameStats = {
      ...existingStats,
      ...update,
      lastUpdated: new Date()
    };
    
    this.gameStatsMap.set(gameType, updatedStats);
    return updatedStats;
  }

  async getUserGameStats(userId: number, gameType?: string): Promise<UserGameStats[]> {
    const userStats: UserGameStats[] = [];
    
    // Use Array.from instead of direct iteration to avoid TypeScript issues
    Array.from(this.userGameStatsMap.values()).forEach(stats => {
      if (stats.userId === userId && (!gameType || stats.gameType === gameType)) {
        userStats.push(stats);
      }
    });
    
    return userStats;
  }

  async updateUserGameStats(userId: number, gameType: string, update: Partial<UserGameStats>): Promise<UserGameStats | undefined> {
    const key = `${userId}-${gameType}`;
    const existingStats = this.userGameStatsMap.get(key);
    
    if (!existingStats) {
      // If stats don't exist for this user and game type, create new entry
      const newStats: UserGameStats = {
        id: this.userGameStatsIdCounter++,
        userId,
        gameType,
        gamesPlayed: update.gamesPlayed || 0,
        gamesWon: update.gamesWon || 0,
        totalWagered: update.totalWagered || 0,
        totalWon: update.totalWon || 0,
        netProfitLoss: update.netProfitLoss || 0,
        highestWin: update.highestWin || 0,
        highestMultiplier: update.highestMultiplier || null,
        winRate: update.winRate || "0%",
        favoriteGame: update.favoriteGame || null,
        lastPlayed: new Date()
      };
      
      this.userGameStatsMap.set(key, newStats);
      return newStats;
    }
    
    // Update existing stats
    const updatedStats: UserGameStats = {
      ...existingStats,
      ...update,
      lastPlayed: new Date()
    };
    
    this.userGameStatsMap.set(key, updatedStats);
    return updatedStats;
  }
  
  // Advanced statistics operations
  async getTopPlayers(limit: number = 10): Promise<User[]> {
    // Get all users sorted by balance
    const users = Array.from(this.users.values())
      .sort((a, b) => b.balance - a.balance)
      .slice(0, limit);
    
    return users;
  }
  
  async getTopGames(limit: number = 10): Promise<GameStats[]> {
    // Get all game stats sorted by total played
    const gameStats = Array.from(this.gameStatsMap.values())
      .sort((a, b) => b.totalPlayed - a.totalPlayed)
      .slice(0, limit);
    
    return gameStats;
  }
  
  async getMostProfitableGames(): Promise<GameStats[]> {
    // Get all game stats sorted by total profit (house edge)
    const gameStats = Array.from(this.gameStatsMap.values())
      .sort((a, b) => b.totalProfitLoss - a.totalProfitLoss);
    
    return gameStats;
  }
  
  async getLeastProfitableGames(): Promise<GameStats[]> {
    // Get all game stats sorted by total loss (player-friendly)
    const gameStats = Array.from(this.gameStatsMap.values())
      .sort((a, b) => a.totalProfitLoss - b.totalProfitLoss);
    
    return gameStats;
  }
  
  async getPlayerLeaderboard(gameType?: string, sortBy: string = 'netProfitLoss', limit: number = 10): Promise<UserGameStats[]> {
    // Filter user game stats by game type if provided
    let filteredStats = Array.from(this.userGameStatsMap.values());
    
    if (gameType) {
      filteredStats = filteredStats.filter(stats => stats.gameType === gameType);
    }
    
    // Sort by the specified criteria
    switch (sortBy) {
      case 'netProfitLoss':
        filteredStats.sort((a, b) => b.netProfitLoss - a.netProfitLoss);
        break;
      case 'gamesPlayed':
        filteredStats.sort((a, b) => b.gamesPlayed - a.gamesPlayed);
        break;
      case 'gamesWon':
        filteredStats.sort((a, b) => b.gamesWon - a.gamesWon);
        break;
      case 'totalWagered':
        filteredStats.sort((a, b) => b.totalWagered - a.totalWagered);
        break;
      case 'highestWin':
        filteredStats.sort((a, b) => b.highestWin - a.highestWin);
        break;
      default:
        filteredStats.sort((a, b) => b.netProfitLoss - a.netProfitLoss);
    }
    
    // Limit the results
    return filteredStats.slice(0, limit);
  }
  
  // Currency operations
  async addCurrency(userId: number, amount: number, type: string, description: string, gameId?: number): Promise<Transaction> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const balanceBefore = user.balance;
    const balanceAfter = balanceBefore + amount;
    
    // Update user balance
    const updatedUser = await this.updateUser(userId, {
      balance: balanceAfter,
      totalEarned: user.totalEarned + (type !== 'win' ? amount : 0), // Don't count game winnings in totalEarned
      totalWon: user.totalWon + (type === 'win' ? amount : 0),
      highestBalance: Math.max(user.highestBalance, balanceAfter)
    });
    
    if (!updatedUser) {
      throw new Error(`Failed to update balance for user ${userId}`);
    }
    
    // Create transaction record
    const transaction: Transaction = {
      id: this.transactionIdCounter++,
      userId,
      amount,
      type,
      description,
      balanceBefore,
      balanceAfter,
      gameId: gameId || null,
      createdAt: new Date()
    };
    
    this.transactionsMap.set(transaction.id, transaction);
    return transaction;
  }
  
  async removeCurrency(userId: number, amount: number, type: string, description: string, gameId?: number): Promise<Transaction> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    if (user.balance < amount) {
      throw new Error(`Insufficient balance. User ${userId} has ${user.balance} but attempted to spend ${amount}`);
    }
    
    const balanceBefore = user.balance;
    const balanceAfter = balanceBefore - amount;
    
    // Update user balance
    const updatedUser = await this.updateUser(userId, {
      balance: balanceAfter,
      totalSpent: user.totalSpent + (type === 'bet' ? amount : 0) // Only count bets in totalSpent
    });
    
    if (!updatedUser) {
      throw new Error(`Failed to update balance for user ${userId}`);
    }
    
    // Create transaction record (amount is negative for removals)
    const transaction: Transaction = {
      id: this.transactionIdCounter++,
      userId,
      amount: -amount, // Store as negative amount for removals
      type,
      description,
      balanceBefore,
      balanceAfter,
      gameId: gameId || null,
      createdAt: new Date()
    };
    
    this.transactionsMap.set(transaction.id, transaction);
    return transaction;
  }
  
  async transferCurrency(fromUserId: number, toUserId: number, amount: number, description: string): Promise<Transaction> {
    const fromUser = await this.getUser(fromUserId);
    const toUser = await this.getUser(toUserId);
    
    if (!fromUser) {
      throw new Error(`Sender with ID ${fromUserId} not found`);
    }
    
    if (!toUser) {
      throw new Error(`Recipient with ID ${toUserId} not found`);
    }
    
    // Get settings to check if transfers are allowed
    const settings = await this.getSettings();
    if (settings && !settings.allowTransfersBetweenUsers) {
      throw new Error('Currency transfers between users are disabled');
    }
    
    if (fromUser.balance < amount) {
      throw new Error(`Insufficient balance. User ${fromUserId} has ${fromUser.balance} but attempted to transfer ${amount}`);
    }
    
    // Remove from sender
    await this.removeCurrency(fromUserId, amount, 'transfer_out', `Transfer to ${toUser.username}: ${description}`);
    
    // Add to recipient
    const transaction = await this.addCurrency(toUserId, amount, 'transfer_in', `Transfer from ${fromUser.username}: ${description}`);
    
    return transaction;
  }
  
  async getUserTransactions(userId: number, limit: number = 50): Promise<Transaction[]> {
    const userTransactions = Array.from(this.transactionsMap.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by date, newest first
    
    return userTransactions.slice(0, limit);
  }
  
  // Daily rewards operations
  async claimDailyReward(userId: number): Promise<{ success: boolean; amount: number; streak: number; nextAvailable: Date; error?: string }> {
    const user = await this.getUser(userId);
    if (!user) {
      return {
        success: false,
        amount: 0,
        streak: 0,
        nextAvailable: new Date(),
        error: `User with ID ${userId} not found`
      };
    }
    
    const settings = await this.getSettings();
    if (!settings) {
      return {
        success: false,
        amount: 0,
        streak: 0,
        nextAvailable: new Date(),
        error: 'Bot settings not found'
      };
    }
    
    const now = new Date();
    const key = `${userId}-daily`;
    let earningRecord = this.currencyEarningsMap.get(key);
    
    // Check if user has an existing daily reward record
    if (earningRecord) {
      // Check if enough time has passed since last claim
      if (now < earningRecord.nextAvailable) {
        return {
          success: false,
          amount: 0,
          streak: earningRecord.streak,
          nextAvailable: earningRecord.nextAvailable,
          error: 'Daily reward not yet available'
        };
      }
      
      // Check if the streak should be reset (more than 48 hours since last claim)
      const hoursSinceLastClaim = (now.getTime() - earningRecord.lastClaimed.getTime()) / (1000 * 60 * 60);
      const newStreak = hoursSinceLastClaim <= 48 ? earningRecord.streak + 1 : 1;
      
      // Calculate streak bonus
      const streakBonus = Math.min(
        (newStreak - 1) * settings.streakBonusAmount,
        settings.maxStreakBonus
      );
      
      // Calculate total reward
      const totalReward = settings.dailyRewardAmount + streakBonus;
      
      // Update earnings record
      earningRecord = {
        ...earningRecord,
        streak: newStreak,
        lastClaimed: now,
        nextAvailable: new Date(now.getTime() + 24 * 60 * 60 * 1000) // Next available in 24 hours
      };
      
      this.currencyEarningsMap.set(key, earningRecord);
      
      // Add currency to user
      await this.addCurrency(
        userId,
        totalReward,
        'daily',
        `Daily reward (Day ${newStreak}): ${settings.dailyRewardAmount} + ${streakBonus} streak bonus`
      );
      
      // Update user's lastDaily
      await this.updateUser(userId, {
        lastDaily: now
      });
      
      return {
        success: true,
        amount: totalReward,
        streak: newStreak,
        nextAvailable: earningRecord.nextAvailable
      };
    } else {
      // First time claiming daily reward
      const newRecord: CurrencyEarning = {
        id: this.currencyEarningIdCounter++,
        userId,
        type: 'daily',
        streak: 1,
        lastClaimed: now,
        nextAvailable: new Date(now.getTime() + 24 * 60 * 60 * 1000) // Next available in 24 hours
      };
      
      this.currencyEarningsMap.set(key, newRecord);
      
      // Add currency to user
      await this.addCurrency(
        userId,
        settings.dailyRewardAmount,
        'daily',
        `Daily reward (Day 1): ${settings.dailyRewardAmount}`
      );
      
      // Update user's lastDaily
      await this.updateUser(userId, {
        lastDaily: now
      });
      
      return {
        success: true,
        amount: settings.dailyRewardAmount,
        streak: 1,
        nextAvailable: newRecord.nextAvailable
      };
    }
  }
  
  async getDailyStatus(userId: number): Promise<CurrencyEarning | undefined> {
    const key = `${userId}-daily`;
    return this.currencyEarningsMap.get(key);
  }
  
  // Currency leaderboard
  async getTopBalances(limit: number = 10): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.balance - a.balance)
      .slice(0, limit);
  }
  
  async getTopEarners(limit: number = 10): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => (b.totalWon - b.totalSpent) - (a.totalWon - a.totalSpent))
      .slice(0, limit);
  }
  
  async getMostGenerous(limit: number = 10): Promise<{ userId: number; username: string; totalTransferred: number }[]> {
    const userTransfers = new Map<number, number>();
    
    // Calculate total transferred by each user
    for (const transaction of this.transactionsMap.values()) {
      if (transaction.type === 'transfer_out') {
        const userId = transaction.userId;
        const currentTotal = userTransfers.get(userId) || 0;
        userTransfers.set(userId, currentTotal + Math.abs(transaction.amount));
      }
    }
    
    // Convert to array and sort
    const results: { userId: number; username: string; totalTransferred: number }[] = [];
    
    for (const [userId, totalTransferred] of userTransfers.entries()) {
      const user = await this.getUser(userId);
      if (user) {
        results.push({
          userId,
          username: user.username,
          totalTransferred
        });
      }
    }
    
    // Sort by total transferred and limit results
    return results
      .sort((a, b) => b.totalTransferred - a.totalTransferred)
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
