import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  initializeBot, 
  setupWebSocket, 
  getStatus, 
  getStats, 
  restartBot,
  getBotClient,
} from "./bot/index";
import { registerCommands } from "./bot/handlers";
import { z } from "zod";
import { insertUserSchema, insertGameSchema, insertCommandSchema, insertBotSettingsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  setupWebSocket(httpServer);

  // Initialize the bot
  await initializeBot();
  
  // API routes
  app.get('/api/bot/status', async (req: Request, res: Response) => {
    res.json(getStatus());
  });
  
  app.get('/api/bot/stats', async (req: Request, res: Response) => {
    res.json(getStats());
  });
  
  // Sync commands with Discord
  app.post('/api/bot/sync', async (req: Request, res: Response) => {
    try {
      const client = getBotClient();
      if (!client) {
        return res.status(500).json({ error: 'Bot client not initialized' });
      }
      
      const result = await registerCommands(client);
      res.json({ success: true, commands: result });
    } catch (error) {
      console.error('Error syncing commands:', error);
      res.status(500).json({ error: 'Failed to sync commands' });
    }
  });
  
  // Bot restart
  app.post('/api/bot/restart', async (req: Request, res: Response) => {
    try {
      await restartBot();
      res.json({ success: true });
    } catch (error) {
      console.error('Error restarting bot:', error);
      res.status(500).json({ error: 'Failed to restart bot' });
    }
  });
  
  // User routes
  app.get('/api/bot/users', async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ error: 'Failed to get users' });
    }
  });
  
  app.get('/api/bot/users/:id', async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  });
  
  app.post('/api/bot/users', async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(400).json({ error: 'Invalid user data' });
    }
  });
  
  app.delete('/api/bot/users/:id', async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteUser(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });
  
  // Game routes
  app.get('/api/bot/games', async (req: Request, res: Response) => {
    try {
      const games = await storage.getAllGames();
      
      // Transform games for the frontend display (group by type and calculate stats)
      const gameStats = games.reduce((acc, game) => {
        if (!acc[game.gameType]) {
          acc[game.gameType] = {
            id: game.gameType,
            name: formatGameType(game.gameType),
            description: getGameDescription(game.gameType),
            playCount: 0,
            winCount: 0,
          };
        }
        
        acc[game.gameType].playCount++;
        if (game.outcome === 'win') {
          acc[game.gameType].winCount++;
        }
        
        return acc;
      }, {} as Record<string, any>);
      
      // Calculate win rates and format for frontend
      const formattedGames = Object.values(gameStats).map(game => ({
        ...game,
        winRate: game.playCount > 0 ? Math.round((game.winCount / game.playCount) * 100 * 10) / 10 : 0,
      }));
      
      res.json(formattedGames);
    } catch (error) {
      console.error('Error getting games:', error);
      res.status(500).json({ error: 'Failed to get games' });
    }
  });
  
  // Command routes
  app.get('/api/bot/commands', async (req: Request, res: Response) => {
    try {
      const commands = await storage.getAllCommands();
      
      // Parse JSON strings for the frontend
      const formattedCommands = commands.map(cmd => {
        return {
          name: cmd.name,
          description: cmd.description,
          helpText: cmd.helpText,
          options: cmd.options ? JSON.parse(cmd.options) : null,
          alternatives: cmd.alternatives ? JSON.parse(cmd.alternatives) : [],
          examples: cmd.examples ? JSON.parse(cmd.examples) : null,
          icon: cmd.icon,
          color: cmd.color,
        };
      });
      
      res.json(formattedCommands);
    } catch (error) {
      console.error('Error getting commands:', error);
      res.status(500).json({ error: 'Failed to get commands' });
    }
  });
  
  // Settings routes
  app.get('/api/bot/settings', async (req: Request, res: Response) => {
    try {
      const settings = await storage.getSettings();
      if (!settings) {
        return res.status(404).json({ error: 'Settings not found' });
      }
      
      // Transform settings for the frontend
      const formattedSettings = {
        prefix: settings.prefix,
        defaultCurrency: settings.defaultCurrency,
        startingBalance: settings.startingBalance,
        logCommands: settings.logCommands,
        allowUserReset: settings.allowUserReset,
        cooldownMinutes: settings.cooldownMinutes,
        gameEnabled: {
          coinflip: settings.gameEnabledCoinflip,
          blackjack: settings.gameEnabledBlackjack,
          slots: settings.gameEnabledSlots,
          roulette: settings.gameEnabledRoulette,
          dice: settings.gameEnabledDice,
        },
      };
      
      res.json(formattedSettings);
    } catch (error) {
      console.error('Error getting settings:', error);
      res.status(500).json({ error: 'Failed to get settings' });
    }
  });
  
  app.post('/api/bot/settings', async (req: Request, res: Response) => {
    try {
      // Transform from frontend format to storage format
      const { gameEnabled, ...otherSettings } = req.body;
      
      const settingsToSave = {
        ...otherSettings,
        gameEnabledCoinflip: gameEnabled.coinflip,
        gameEnabledBlackjack: gameEnabled.blackjack,
        gameEnabledSlots: gameEnabled.slots,
        gameEnabledRoulette: gameEnabled.roulette,
        gameEnabledDice: gameEnabled.dice,
      };
      
      const updatedSettings = await storage.updateSettings(settingsToSave);
      if (!updatedSettings) {
        return res.status(500).json({ error: 'Failed to update settings' });
      }
      
      // Transform back for the response
      const formattedSettings = {
        prefix: updatedSettings.prefix,
        defaultCurrency: updatedSettings.defaultCurrency,
        startingBalance: updatedSettings.startingBalance,
        logCommands: updatedSettings.logCommands,
        allowUserReset: updatedSettings.allowUserReset,
        cooldownMinutes: updatedSettings.cooldownMinutes,
        gameEnabled: {
          coinflip: updatedSettings.gameEnabledCoinflip,
          blackjack: updatedSettings.gameEnabledBlackjack,
          slots: updatedSettings.gameEnabledSlots,
          roulette: updatedSettings.gameEnabledRoulette,
          dice: updatedSettings.gameEnabledDice,
        },
      };
      
      res.json(formattedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });
  
  // Game Statistics routes
  app.get('/api/bot/statistics/games', async (req: Request, res: Response) => {
    try {
      const gameStats = await storage.getAllGameStats();
      res.json(gameStats);
    } catch (error) {
      console.error('Error getting game statistics:', error);
      res.status(500).json({ error: 'Failed to get game statistics' });
    }
  });
  
  app.get('/api/bot/statistics/games/:gameType', async (req: Request, res: Response) => {
    try {
      const gameStats = await storage.getGameStats(req.params.gameType);
      if (!gameStats) {
        return res.status(404).json({ error: 'Game statistics not found for this game type' });
      }
      res.json(gameStats);
    } catch (error) {
      console.error('Error getting game statistics:', error);
      res.status(500).json({ error: 'Failed to get game statistics' });
    }
  });
  
  // User Game Statistics routes
  app.get('/api/bot/statistics/users/:userId', async (req: Request, res: Response) => {
    try {
      const userGameStats = await storage.getUserGameStats(parseInt(req.params.userId));
      res.json(userGameStats);
    } catch (error) {
      console.error('Error getting user game statistics:', error);
      res.status(500).json({ error: 'Failed to get user game statistics' });
    }
  });
  
  app.get('/api/bot/statistics/users/:userId/:gameType', async (req: Request, res: Response) => {
    try {
      const userGameStats = await storage.getUserGameStats(parseInt(req.params.userId), req.params.gameType);
      res.json(userGameStats);
    } catch (error) {
      console.error('Error getting user game statistics:', error);
      res.status(500).json({ error: 'Failed to get user game statistics' });
    }
  });
  
  // Leaderboard routes
  app.get('/api/bot/statistics/leaderboard/players', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const topPlayers = await storage.getTopPlayers(limit);
      res.json(topPlayers);
    } catch (error) {
      console.error('Error getting top players:', error);
      res.status(500).json({ error: 'Failed to get top players' });
    }
  });
  
  app.get('/api/bot/statistics/leaderboard/games', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const topGames = await storage.getTopGames(limit);
      res.json(topGames);
    } catch (error) {
      console.error('Error getting top games:', error);
      res.status(500).json({ error: 'Failed to get top games' });
    }
  });
  
  app.get('/api/bot/statistics/leaderboard/mostProfitable', async (req: Request, res: Response) => {
    try {
      const mostProfitableGames = await storage.getMostProfitableGames();
      res.json(mostProfitableGames);
    } catch (error) {
      console.error('Error getting most profitable games:', error);
      res.status(500).json({ error: 'Failed to get most profitable games' });
    }
  });
  
  app.get('/api/bot/statistics/leaderboard/leastProfitable', async (req: Request, res: Response) => {
    try {
      const leastProfitableGames = await storage.getLeastProfitableGames();
      res.json(leastProfitableGames);
    } catch (error) {
      console.error('Error getting least profitable games:', error);
      res.status(500).json({ error: 'Failed to get least profitable games' });
    }
  });
  
  app.get('/api/bot/statistics/leaderboard/players/byGame', async (req: Request, res: Response) => {
    try {
      const gameType = req.query.gameType as string | undefined;
      const sortBy = req.query.sortBy as string || 'netProfitLoss';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const playerLeaderboard = await storage.getPlayerLeaderboard(gameType, sortBy, limit);
      res.json(playerLeaderboard);
    } catch (error) {
      console.error('Error getting player leaderboard:', error);
      res.status(500).json({ error: 'Failed to get player leaderboard' });
    }
  });
  
  return httpServer;
}

// Helper function to format game type for display
function formatGameType(gameType: string): string {
  const formatted = gameType.replace(/([A-Z])/g, ' $1').trim();
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// Helper function to get game description
function getGameDescription(gameType: string): string {
  const descriptions: Record<string, string> = {
    coinflip: "Bet on heads or tails and flip a coin to win double your bet",
    blackjack: "Play blackjack against the dealer and try to get as close to 21 as possible",
    slots: "Spin the slot machine and try to match symbols to win big",
    roulette: "Bet on numbers, colors, or groups and spin the wheel to win",
    dice: "Roll dice and bet on the outcome to win big",
    poker: "Play 5-card poker against the dealer with various hand rankings and payouts",
    crash: "Place a bet and watch the multiplier rise - cash out before it crashes to win big!",
    hilo: "Predict if the next card will be higher or lower than the current card to win multipliers",
    megamultiplier: "High-risk, high-reward game with potential multipliers up to 100,000x your bet!",
  };
  
  return descriptions[gameType] || "A gambling game where you can win virtual currency";
}
