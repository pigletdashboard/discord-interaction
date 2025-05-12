import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull().unique(),
  username: text("username").notNull(),
  balance: integer("balance").notNull().default(1000),
  totalEarned: integer("total_earned").notNull().default(0),  // Total currency earned (excluding initial balance)
  totalSpent: integer("total_spent").notNull().default(0),    // Total currency spent on bets
  totalWon: integer("total_won").notNull().default(0),        // Total currency won from games
  highestBalance: integer("highest_balance").notNull().default(1000), // Highest balance ever achieved
  gamesPlayed: integer("games_played").notNull().default(0),
  gamesWon: integer("games_won").notNull().default(0),
  lastPlayed: timestamp("last_played").defaultNow(),
  vip: boolean("vip").notNull().default(false),               // VIP status (for special rewards)
  vipLevel: integer("vip_level").notNull().default(0),        // VIP level for tiered benefits
  lastDaily: timestamp("last_daily"),                        // Last time they claimed daily reward
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  gamesPlayed: true, 
  gamesWon: true,
  lastPlayed: true,
  totalEarned: true,
  totalSpent: true,
  totalWon: true,
  highestBalance: true,
  vip: true,
  vipLevel: true,
  lastDaily: true,
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  gameType: text("game_type").notNull(), // coinflip, blackjack, etc.
  userId: integer("user_id").notNull(),
  bet: integer("bet").notNull(),
  outcome: text("outcome").notNull(), // win, loss, tie
  winAmount: integer("win_amount"),
  multiplier: text("multiplier"), // Store multiplier for relevant games (e.g., crash, megamultiplier)
  details: text("details"), // Store JSON string with game-specific details
  playedAt: timestamp("played_at").defaultNow(),
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  playedAt: true,
});

export const commands = pgTable("commands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  helpText: text("help_text").notNull(),
  options: text("options").notNull().default("[]"),
  alternatives: text("alternatives").notNull(),
  examples: text("examples"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

export const insertCommandSchema = createInsertSchema(commands).omit({
  id: true,
});

export const botSettings = pgTable("bot_settings", {
  id: serial("id").primaryKey(),
  prefix: text("prefix").notNull().default("!"),
  defaultCurrency: text("default_currency").notNull().default("$"),
  startingBalance: integer("starting_balance").notNull().default(1000),
  logCommands: boolean("log_commands").notNull().default(true),
  allowUserReset: boolean("allow_user_reset").notNull().default(true),
  cooldownMinutes: integer("cooldown_minutes").notNull().default(5),
  // Game settings
  gameEnabledCoinflip: boolean("game_enabled_coinflip").notNull().default(true),
  gameEnabledBlackjack: boolean("game_enabled_blackjack").notNull().default(true),
  gameEnabledSlots: boolean("game_enabled_slots").notNull().default(true),
  gameEnabledRoulette: boolean("game_enabled_roulette").notNull().default(true),
  gameEnabledDice: boolean("game_enabled_dice").notNull().default(true),
  // Currency settings
  dailyRewardAmount: integer("daily_reward_amount").notNull().default(100),
  streakBonusAmount: integer("streak_bonus_amount").notNull().default(25),
  maxStreakBonus: integer("max_streak_bonus").notNull().default(250),
  minimumBetAmount: integer("minimum_bet_amount").notNull().default(10),
  maximumBetAmount: integer("maximum_bet_amount").notNull().default(10000),
  currencyName: text("currency_name").notNull().default("coins"),
  currencyNamePlural: text("currency_name_plural").notNull().default("coins"),
  allowTransfersBetweenUsers: boolean("allow_transfers_between_users").notNull().default(true),
});

export const insertBotSettingsSchema = createInsertSchema(botSettings).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export type InsertCommand = z.infer<typeof insertCommandSchema>;
export type Command = typeof commands.$inferSelect;

export const gameStats = pgTable("game_stats", {
  id: serial("id").primaryKey(),
  gameType: text("game_type").notNull().unique(),
  totalPlayed: integer("total_played").notNull().default(0),
  totalWagered: integer("total_wagered").notNull().default(0),
  totalPaidOut: integer("total_paid_out").notNull().default(0),
  totalProfitLoss: integer("total_profit_loss").notNull().default(0),
  highestWin: integer("highest_win").notNull().default(0),
  highestWager: integer("highest_wager").notNull().default(0),
  largestMultiplier: text("largest_multiplier"),
  userWithMostWins: integer("user_with_most_wins"),
  userWithHighestWager: integer("user_with_highest_wager"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const userGameStats = pgTable("user_game_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  gameType: text("game_type").notNull(),
  gamesPlayed: integer("games_played").notNull().default(0),
  gamesWon: integer("games_won").notNull().default(0),
  totalWagered: integer("total_wagered").notNull().default(0),
  totalWon: integer("total_won").notNull().default(0),
  netProfitLoss: integer("net_profit_loss").notNull().default(0),
  highestWin: integer("highest_win").notNull().default(0),
  highestMultiplier: text("highest_multiplier"),
  winRate: text("win_rate").notNull().default("0%"),
  favoriteGame: text("favorite_game"),
  lastPlayed: timestamp("last_played").defaultNow(),
});

export const insertGameStatsSchema = createInsertSchema(gameStats).omit({
  id: true,
  lastUpdated: true,
});

export const insertUserGameStatsSchema = createInsertSchema(userGameStats).omit({
  id: true,
  lastPlayed: true,
});

export type InsertBotSettings = z.infer<typeof insertBotSettingsSchema>;
export type BotSettings = typeof botSettings.$inferSelect;

export type InsertGameStats = z.infer<typeof insertGameStatsSchema>;
export type GameStats = typeof gameStats.$inferSelect;

export type InsertUserGameStats = z.infer<typeof insertUserGameStatsSchema>;
export type UserGameStats = typeof userGameStats.$inferSelect;

// Currency transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(), // Positive for credits, negative for debits
  type: text("type").notNull(), // "bet", "win", "daily", "bonus", "admin", etc.
  description: text("description").notNull(),
  balanceBefore: integer("balance_before").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  gameId: integer("game_id"), // Optional reference to a game
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Currency earnings table (for tracking daily rewards, etc.)
export const currencyEarnings = pgTable("currency_earnings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // "daily", "streak", "bonus", etc.
  lastClaimed: timestamp("last_claimed").notNull(),
  streak: integer("streak").notNull().default(1),
  nextAvailable: timestamp("next_available").notNull(),
});

export const insertCurrencyEarningSchema = createInsertSchema(currencyEarnings).omit({
  id: true,
});

export type InsertCurrencyEarning = z.infer<typeof insertCurrencyEarningSchema>;
export type CurrencyEarning = typeof currencyEarnings.$inferSelect;
