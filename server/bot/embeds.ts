// Utility functions for creating Discord message embeds
import { EmbedBuilder, ColorResolvable } from 'discord.js';

// Color constants
export const COLORS = {
  PRIMARY: 0x5865F2, // Discord blurple
  SUCCESS: 0x43B581, // Discord green
  ERROR: 0xF04747,   // Discord red
  WARNING: 0xFEE75C, // Discord yellow
  INFO: 0x5865F2,    // Discord blurple
  SECONDARY: 0x99AAB5, // Discord grey
};

/**
 * Create a basic embed with predefined styling
 */
export function createEmbed(options: {
  title?: string;
  description?: string;
  color?: ColorResolvable;
  thumbnail?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: string;
  timestamp?: boolean;
}) {
  const { title, description, color = COLORS.PRIMARY, thumbnail, fields, footer, timestamp } = options;
  
  const embed = new EmbedBuilder()
    .setColor(color as ColorResolvable);
  
  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);
  if (thumbnail) embed.setThumbnail(thumbnail);
  if (fields?.length) embed.addFields(fields);
  if (footer) embed.setFooter({ text: footer });
  if (timestamp) embed.setTimestamp();
  
  return embed;
}

/**
 * Create a help embed for a command
 */
export function createHelpEmbed(params: {
  commandName: string;
  description: string;
  usage?: string;
  examples?: string[];
  alternatives?: string[];
  options?: { name: string; description: string; required: boolean }[];
}) {
  const { commandName, description, usage, examples, alternatives, options } = params;
  
  const embed = createEmbed({
    title: `Help: /${commandName}`,
    description,
    color: COLORS.INFO as ColorResolvable,
    footer: 'Type /help to see all commands',
    timestamp: true,
  });
  
  if (usage) {
    embed.addFields([
      { name: 'Usage', value: usage },
    ]);
  }
  
  if (options && options.length > 0) {
    const optionsText = options.map(opt => 
      `**${opt.name}**: ${opt.description} ${opt.required ? '(Required)' : '(Optional)'}`
    ).join('\n');
    
    embed.addFields([
      { name: 'Options', value: optionsText },
    ]);
  }
  
  if (examples && examples.length > 0) {
    embed.addFields([
      { name: 'Examples', value: examples.map(ex => `\`${ex}\``).join('\n') },
    ]);
  }
  
  if (alternatives && alternatives.length > 0) {
    embed.addFields([
      { name: 'Alternatives', value: alternatives.map(alt => `\`${alt}\``).join('\n') },
    ]);
  }
  
  return embed;
}

/**
 * Create an error embed
 */
export function createErrorEmbed(errorMessage: string) {
  return createEmbed({
    title: 'Error',
    description: errorMessage,
    color: COLORS.ERROR as ColorResolvable,
    timestamp: true,
  });
}

/**
 * Create a success embed
 */
export function createSuccessEmbed(message: string) {
  return createEmbed({
    title: 'Success',
    description: message,
    color: COLORS.SUCCESS as ColorResolvable,
    timestamp: true,
  });
}

/**
 * Create a stats embed
 */
export function createStatsEmbed(stats: {
  servers: number;
  users: number;
  commands: number;
  gamesPlayed: number;
  ping: number;
  uptime: string;
}) {
  const { servers, users, commands, gamesPlayed, ping, uptime } = stats;
  
  return createEmbed({
    title: 'Bot Statistics',
    description: 'Current statistics for the Discord Gambling Bot',
    color: COLORS.INFO as ColorResolvable,
    fields: [
      { name: 'Servers', value: servers.toString(), inline: true },
      { name: 'Users', value: users.toString(), inline: true },
      { name: 'Commands Used', value: commands.toString(), inline: true },
      { name: 'Games Played', value: gamesPlayed.toString(), inline: true },
      { name: 'Ping', value: `${ping}ms`, inline: true },
      { name: 'Uptime', value: uptime, inline: true },
    ],
    footer: 'Use /support to join our support server',
    timestamp: true,
  });
}

/**
 * Create a game embed (for displaying game results)
 */
export function createGameEmbed(options: {
  gameType: string;
  result: 'win' | 'loss' | 'tie';
  description: string;
  bet?: number;
  winnings?: number;
  balance?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
}) {
  const { gameType, result, description, bet, winnings, balance, fields } = options;
  
  const color = result === 'win' ? COLORS.SUCCESS : result === 'loss' ? COLORS.ERROR : COLORS.WARNING;
  
  const embed = createEmbed({
    title: `${gameType} - ${result.toUpperCase()}`,
    description,
    color: color as ColorResolvable,
    timestamp: true,
  });
  
  // Add bet/winnings/balance if provided
  const gameFields: { name: string; value: string; inline?: boolean }[] = [];
  
  if (bet !== undefined) {
    gameFields.push({ name: 'Bet', value: `$${bet}`, inline: true });
  }
  
  if (winnings !== undefined) {
    gameFields.push({ name: 'Winnings', value: `$${winnings}`, inline: true });
  }
  
  if (balance !== undefined) {
    gameFields.push({ name: 'New Balance', value: `$${balance}`, inline: true });
  }
  
  if (gameFields.length > 0) {
    embed.addFields(gameFields);
  }
  
  // Add additional fields if provided
  if (fields && fields.length > 0) {
    embed.addFields(fields);
  }
  
  return embed;
}
