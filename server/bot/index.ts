// Main bot setup and initialization
import { Client } from 'discord.js';
import { createBotClient, setupEventHandlers, registerCommands } from './handlers';
import { commands } from './commands';
import WebSocket from 'ws';
import { dot } from 'node:test/reporters';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

// Bot state tracking
let botClient: Client | null = null;
let wsServer: WebSocket.Server | null = null;
let connectionStatus = {
  state: 'disconnected',
  ping: 0,
  uptime: '0d 0h 0m',
  startTime: 0,
};

// Initialize and start the bot
export async function initializeBot() {
  try {
    // Use process.env directly instead of getenv
    const discordToken = process.env.DISCORD_TOKEN || '';
    if (!discordToken) {
      console.error('DISCORD_TOKEN not provided in environment variables');
      return null;
    }
    
    // Create and setup the bot client
    const client = createBotClient();
    setupEventHandlers(client);
    
    // Login to Discord
    await client.login(discordToken); // Use the token retrieved by getenv
    
    // Register slash commands after login
    await registerCommands(client);
    
    // Store the client for later use
    botClient = client;
    connectionStatus.state = 'connected';
    connectionStatus.startTime = Date.now();
    
    // Start updating bot status
    startStatusUpdates();
    
    return client;
  } catch (error) {
    console.error('Failed to initialize bot:', error);
    connectionStatus.state = 'disconnected';
    return null;
  }
}

// Update the bot status periodically
function startStatusUpdates() {
  // Update the connection status every 5 seconds
  setInterval(() => {
    if (!botClient) {
      connectionStatus.state = 'disconnected';
      connectionStatus.ping = 0;
      connectionStatus.uptime = '0d 0h 0m';
      return;
    }
    
    // Update ping
    connectionStatus.ping = botClient.ws.ping;
    
    // Update uptime
    if (connectionStatus.startTime > 0) {
      const uptime = Date.now() - connectionStatus.startTime;
      connectionStatus.uptime = formatUptime(uptime);
    }
    
    // Update all connected websocket clients
    if (wsServer) {
      const clients = Array.from(wsServer.clients);
      if (clients.length > 0) {
        const statusMessage = JSON.stringify({
          type: 'status_update',
          data: getStatus(),
        });
        
        clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(statusMessage);
          }
        });
      }
    }
  }, 5000);
}

// Get current bot status
export function getStatus() {
  return {
    state: connectionStatus.state,
    ping: connectionStatus.ping,
    uptime: connectionStatus.uptime,
  };
}

// Get bot statistics
export function getStats() {
  if (!botClient) {
    return {
      servers: 0,
      users: 0,
      commands: 0,
      games: 0,
    };
  }
  
  return {
    servers: {
      count: botClient.guilds.cache.size,
      growth: '+12%', // This would be calculated based on historical data in a real implementation
    },
    users: {
      count: botClient.users.cache.size,
      growth: '+8%',
    },
    commands: {
      count: 0, // This would be tracked in a real implementation
      growth: '+23%',
    },
    games: {
      count: 0, // This would be tracked in a real implementation
      growth: '+15%',
    },
  };
}

// Format uptime for display
function formatUptime(uptime: number) {
  const totalSeconds = Math.floor(uptime / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor(((totalSeconds % 86400) % 3600) / 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  
  return parts.join(' ') || '< 1m';
}

// Setup WebSocket server for real-time updates
export function setupWebSocket(server: any) {
  wsServer = new WebSocket.Server({ server, path: '/ws' }); // <-- Add path to avoid Vite conflict
  
  wsServer.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send initial status to the client
    ws.send(JSON.stringify({
      type: 'status_update',
      data: getStatus(),
    }));
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        if (data.type === 'get_status') {
          ws.send(JSON.stringify({
            type: 'status_update',
            data: getStatus(),
          }));
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  return wsServer;
}

// Restart the bot
export async function restartBot() {
  if (botClient) {
    try {
      await botClient.destroy();
    } catch (error) {
      console.error('Error destroying bot client:', error);
    }
    botClient = null;
  }
  
  connectionStatus.state = 'reconnecting';
  
  return initializeBot();
}

// Shutdown the bot
export async function shutdownBot() {
  if (botClient) {
    try {
      await botClient.destroy();
      console.log('Bot client destroyed');
    } catch (error) {
      console.error('Error destroying bot client:', error);
    }
    botClient = null;
  }
  
  connectionStatus.state = 'disconnected';
}

// Get the bot client
export function getBotClient() {
  return botClient;
}
