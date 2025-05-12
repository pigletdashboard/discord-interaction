// Message and command handlers for the bot
import { 
  Client, 
  Message, 
  Events, 
  GatewayIntentBits, 
  Partials,
  Collection,
  CommandInteraction,
  ChatInputCommandInteraction,
  MessagePayload,
  MessageCreateOptions,
  MessageReplyOptions,
  REST,
  Routes,
} from 'discord.js';

import { commands, aliases } from './commands';
import { storage } from '../storage';
import { createEmbed, createErrorEmbed } from './embeds';

// Setup bot client with required intents
export function createBotClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel, Partials.Message],
  });
  
  return client;
}

// Handle incoming messages (for commands via message content)
export async function handleMessage(message: Message) {
  // Ignore bot messages
  if (message.author.bot) return;
  
  // Check if message is a direct mention or starts with the bot's mention
  const botMention = `<@${message.client.user!.id}>`;
  
  if (!message.content.startsWith(botMention)) return;
  
  // Parse the command and arguments
  const withoutMention = message.content.slice(botMention.length).trim();
  const args = withoutMention.split(/ +/);
  const commandName = args.shift()?.toLowerCase();
  
  if (!commandName) return;
  
  // Check if command exists or if it's an alias
  const command = commands[commandName] || commands[aliases[commandName]];
  
  if (!command || !command.handleMessage) {
    return message.reply({ 
      embeds: [createErrorEmbed(`Unknown command: ${commandName}`)]
    });
  }
  
  try {
    // Execute the command and get the response
    const response = await command.handleMessage(message, args);
    
    // Send the response based on its type
    if (typeof response === 'string') {
      await message.reply(response);
    } else if ('embeds' in response) {
      await message.reply({ embeds: response.embeds });
    } else {
      await message.reply({ embeds: [response] });
    }
  } catch (error) {
    console.error(`Error executing command ${commandName}:`, error);
    await message.reply({ 
      embeds: [createErrorEmbed('There was an error executing that command!')]
    });
  }
}

// Handle slash commands
export async function handleInteraction(interaction: ChatInputCommandInteraction) {
  if (!interaction.isCommand()) return;
  
  const { commandName } = interaction;
  const command = commands[commandName];
  
  if (!command) return;
  
  try {
    await interaction.deferReply();
    
    // Execute the command
    const response = await command.execute(interaction);
    
    // Send the response based on its type
    if (typeof response === 'string') {
      await interaction.editReply(response);
    } else if ('embeds' in response) {
      await interaction.editReply({ embeds: response.embeds });
    } else {
      await interaction.editReply({ embeds: [response] });
    }
  } catch (error) {
    console.error(`Error executing slash command ${commandName}:`, error);
    
    try {
      const errorMessage = { 
        embeds: [createErrorEmbed('There was an error executing that command!')] 
      };
      
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    } catch (e) {
      console.error('Could not respond to slash command with error:', e);
    }
  }
}

// Register slash commands with Discord
export async function registerCommands(client: Client, globalCommands = true) {
  if (!process.env.DISCORD_TOKEN || !process.env.DISCORD_CLIENT_ID) {
    throw new Error('Missing Discord credentials in environment variables');
  }
  
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  
  const commandsData = Object.values(commands).map(cmd => cmd.data.toJSON());
  
  try {
    console.log(`Started refreshing ${commandsData.length} application (/) commands.`);
    
    // Register commands globally or to a specific guild
    const route = globalCommands
      ? Routes.applicationCommands(process.env.DISCORD_CLIENT_ID)
      : Routes.applicationGuildCommands(
          process.env.DISCORD_CLIENT_ID, 
          process.env.DISCORD_GUILD_ID || ''
        );
    
    // Push commands to Discord API
    const data: any = await rest.put(route, { body: commandsData });
    
    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    return data;
  } catch (error) {
    console.error('Failed to register slash commands:', error);
    throw error;
  }
}

// Setup event handlers for the bot
export function setupEventHandlers(client: Client) {
  // Ready event
  client.on(Events.ClientReady, () => {
    console.log(`Bot logged in as ${client.user?.tag}`);
  });
  
  // Message event for handling message-based commands
  client.on(Events.MessageCreate, handleMessage);
  
  // Interaction event for handling slash commands
  client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
      await handleInteraction(interaction);
    }
  });
  
  // Error handling
  client.on('error', (error) => {
    console.error('Discord client error:', error);
  });
  
  return client;
}
