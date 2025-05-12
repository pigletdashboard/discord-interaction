// Bot commands implementation
import { 
  SlashCommandBuilder, 
  CommandInteraction, 
  Message, 
  EmbedBuilder,
  ChatInputCommandInteraction,
  MessagePayload,
  MessageCreateOptions,
  MessageReplyOptions,
  ColorResolvable,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction
} from 'discord.js';
import { storage } from '../storage';
import { createEmbed, createHelpEmbed, createErrorEmbed, createSuccessEmbed, createStatsEmbed, COLORS } from './embeds';

// Helper type for command responses
type CommandResponse = string | EmbedBuilder | { embeds: EmbedBuilder[] };

// Command handler interface
export interface CommandHandler {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<CommandResponse>;
  handleMessage?: (message: Message, args: string[]) => Promise<CommandResponse>;
  aliases?: string[];
}

// Help command
export const helpCommand: CommandHandler = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show the help for all the commands available in the bot')
    .addStringOption(option =>
      option.setName('command_name')
        .setDescription('The command to look up. Start typing to search for a command')
        .setRequired(false)
    ) as SlashCommandBuilder,
  aliases: ['h', 'wtf'],
  async execute(interaction: ChatInputCommandInteraction) {
    const commandName = interaction.options.getString('command_name');
    
    // If no command specified, show general help
    if (!commandName) {
      const commands = await storage.getAllCommands();
      
      const embed = createEmbed({
        title: 'Discord Gambling Bot Help',
        description: 'Here are all the available commands:',
        color: COLORS.PRIMARY,
        fields: commands.map(cmd => {
          return {
            name: `/${cmd.name}`,
            value: cmd.description,
          };
        }),
        footer: 'Use /help <command> to get more information about a specific command',
        timestamp: true,
      });
      
      return embed;
    }
    
    // Get specific command help
    const command = await storage.getCommand(commandName);
    
    if (!command) {
      return createErrorEmbed(`Command \`${commandName}\` not found.`);
    }
    
    // Parse options and alternatives from stored strings
    const options = command.options ? JSON.parse(command.options) : [];
    const alternatives = command.alternatives ? JSON.parse(command.alternatives) : [];
    const examples = command.examples ? JSON.parse(command.examples) : [];
    
    return createHelpEmbed({
      commandName: command.name,
      description: command.helpText,
      options,
      alternatives,
      examples,
    });
  },
  async handleMessage(message: Message, args: string[]) {
    const commandName = args[0];
    
    // If no command specified, show general help
    if (!commandName) {
      const commands = await storage.getAllCommands();
      
      const embed = createEmbed({
        title: 'Discord Gambling Bot Help',
        description: 'Here are all the available commands:',
        color: COLORS.PRIMARY,
        fields: commands.map(cmd => {
          return {
            name: `/${cmd.name}`,
            value: cmd.description,
          };
        }),
        footer: 'Use @Discord Gambling Bot help <command> to get more information about a specific command',
        timestamp: true,
      });
      
      return embed;
    }
    
    // Get specific command help
    const command = await storage.getCommand(commandName);
    
    if (!command) {
      return createErrorEmbed(`Command \`${commandName}\` not found.`);
    }
    
    // Parse options and alternatives from stored strings
    const options = command.options ? JSON.parse(command.options) : [];
    const alternatives = command.alternatives ? JSON.parse(command.alternatives) : [];
    const examples = command.examples ? JSON.parse(command.examples) : [];
    
    return createHelpEmbed({
      commandName: command.name,
      description: command.helpText,
      options,
      alternatives,
      examples,
    });
  }
};

// Delete user data command
export const deleteMyDataCommand: CommandHandler = {
  data: new SlashCommandBuilder()
    .setName('delete_my_data')
    .setDescription('Clear all of your data from the bot. Use this if you want to start from scratch'),
  aliases: ['deletemydata'],
  async execute(interaction: ChatInputCommandInteraction) {
    const discordId = interaction.user.id;
    
    // Find user by Discord ID
    const user = await storage.getUserByDiscordId(discordId);
    
    if (!user) {
      return createErrorEmbed('You don\'t have any data stored with this bot.');
    }
    
    // Delete the user's data
    const deleted = await storage.deleteUser(user.id);
    
    if (deleted) {
      return createSuccessEmbed('Your data has been deleted. If you use the bot again, you will start fresh.');
    } else {
      return createErrorEmbed('Failed to delete your data. Please try again later.');
    }
  },
  async handleMessage(message: Message, args: string[]) {
    const discordId = message.author.id;
    
    // Find user by Discord ID
    const user = await storage.getUserByDiscordId(discordId);
    
    if (!user) {
      return createErrorEmbed('You don\'t have any data stored with this bot.');
    }
    
    // Delete the user's data
    const deleted = await storage.deleteUser(user.id);
    
    if (deleted) {
      return createSuccessEmbed('Your data has been deleted. If you use the bot again, you will start fresh.');
    } else {
      return createErrorEmbed('Failed to delete your data. Please try again later.');
    }
  }
};

// Donate command
export const donateCommand: CommandHandler = {
  data: new SlashCommandBuilder()
    .setName('donate')
    .setDescription('Shares a link to donate to the bot'),
  aliases: ['donate'],
  async execute(interaction: ChatInputCommandInteraction) {
    return createEmbed({
      title: 'Support the Discord Gambling Bot',
      description: 'If you enjoy using this bot, please consider supporting its development! Your donations help keep the servers running and fund new features.',
      color: COLORS.SUCCESS,
      fields: [
        { name: 'PayPal', value: '[Donate via PayPal](https://paypal.me/discordgamblingbot)', inline: true },
        { name: 'Patreon', value: '[Become a Patron](https://patreon.com/discordgamblingbot)', inline: true },
        { name: 'Ko-fi', value: '[Buy me a coffee](https://ko-fi.com/discordgamblingbot)', inline: true },
      ],
      timestamp: true,
    });
  },
  async handleMessage(message: Message, args: string[]) {
    return createEmbed({
      title: 'Support the Discord Gambling Bot',
      description: 'If you enjoy using this bot, please consider supporting its development! Your donations help keep the servers running and fund new features.',
      color: COLORS.SUCCESS,
      fields: [
        { name: 'PayPal', value: '[Donate via PayPal](https://paypal.me/discordgamblingbot)', inline: true },
        { name: 'Patreon', value: '[Become a Patron](https://patreon.com/discordgamblingbot)', inline: true },
        { name: 'Ko-fi', value: '[Buy me a coffee](https://ko-fi.com/discordgamblingbot)', inline: true },
      ],
      timestamp: true,
    });
  }
};

// Invite command
export const inviteCommand: CommandHandler = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Shares the details of how to add the bot'),
  aliases: ['invite'],
  async execute(interaction: ChatInputCommandInteraction) {
    return createEmbed({
      title: 'Invite Discord Gambling Bot',
      description: 'Want to add this bot to your server? Click the link below to invite it!',
      color: COLORS.PRIMARY,
      fields: [
        { 
          name: 'Invite Link', 
          value: '[Click here to add Discord Gambling Bot to your server](https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands)' 
        },
        {
          name: 'Permissions',
          value: 'The bot requires permissions to send messages, use slash commands, and more to function properly.'
        }
      ],
      timestamp: true,
    });
  },
  async handleMessage(message: Message, args: string[]) {
    return createEmbed({
      title: 'Invite Discord Gambling Bot',
      description: 'Want to add this bot to your server? Click the link below to invite it!',
      color: COLORS.PRIMARY,
      fields: [
        { 
          name: 'Invite Link', 
          value: '[Click here to add Discord Gambling Bot to your server](https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands)' 
        },
        {
          name: 'Permissions',
          value: 'The bot requires permissions to send messages, use slash commands, and more to function properly.'
        }
      ],
      timestamp: true,
    });
  }
};

// Stats command
export const statsCommand: CommandHandler = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Shows a selection of bot stats including ping, player count, guild count etc.'),
  aliases: ['ping', 'status', 'about', 'info', 'owner'],
  async execute(interaction: ChatInputCommandInteraction) {
    const users = await storage.getAllUsers();
    const games = await storage.getAllGames();
    
    // Calculate stats
    const stats = {
      servers: interaction.client.guilds.cache.size,
      users: users.length,
      commands: 0, // This would be tracked in a real implementation
      gamesPlayed: games.length,
      ping: interaction.client.ws.ping,
      uptime: formatUptime(interaction.client.uptime || 0),
    };
    
    return createStatsEmbed(stats);
  },
  async handleMessage(message: Message, args: string[]) {
    const users = await storage.getAllUsers();
    const games = await storage.getAllGames();
    
    // Calculate stats
    const stats = {
      servers: message.client.guilds.cache.size,
      users: users.length,
      commands: 0, // This would be tracked in a real implementation
      gamesPlayed: games.length,
      ping: message.client.ws.ping,
      uptime: formatUptime(message.client.uptime || 0),
    };
    
    return createStatsEmbed(stats);
  }
};

// Support command
export const supportCommand: CommandHandler = {
  data: new SlashCommandBuilder()
    .setName('support')
    .setDescription('Shares a link to the support server'),
  aliases: ['support'],
  async execute(interaction: ChatInputCommandInteraction) {
    return createEmbed({
      title: 'Discord Gambling Bot Support',
      description: 'Need help with the bot? Join our support server for assistance, to report bugs, or to suggest new features!',
      color: COLORS.PRIMARY,
      fields: [
        { 
          name: 'Support Server', 
          value: '[Click here to join the Discord Gambling Bot support server](https://discord.gg/gamblingbotsupport)' 
        }
      ],
      timestamp: true,
    });
  },
  async handleMessage(message: Message, args: string[]) {
    return createEmbed({
      title: 'Discord Gambling Bot Support',
      description: 'Need help with the bot? Join our support server for assistance, to report bugs, or to suggest new features!',
      color: COLORS.PRIMARY,
      fields: [
        { 
          name: 'Support Server', 
          value: '[Click here to join the Discord Gambling Bot support server](https://discord.gg/gamblingbotsupport)' 
        }
      ],
      timestamp: true,
    });
  }
};

// Helper function to format uptime duration
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

// Coinflip command
export const coinflipCommand: CommandHandler = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin and bet on the outcome')
    .addStringOption(option =>
      option.setName('choice')
        .setDescription('Choose heads or tails')
        .setRequired(true)
        .addChoices(
          { name: 'Heads', value: 'heads' },
          { name: 'Tails', value: 'tails' }
        )
    )
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('The amount to bet')
        .setRequired(true)
        .setMinValue(1)
    ) as SlashCommandBuilder,
  aliases: ['cf', 'flip'],
  async execute(interaction: ChatInputCommandInteraction) {
    const choice = interaction.options.getString('choice', true).toLowerCase();
    const bet = interaction.options.getInteger('bet', true);
    
    if (bet <= 0) {
      return createErrorEmbed('Your bet must be greater than 0.');
    }
    
    // Get user or create if doesn't exist
    let user = await storage.getUserByDiscordId(interaction.user.id);
    
    if (!user) {
      user = await storage.createUser({
        discordId: interaction.user.id,
        username: interaction.user.username,
        balance: 1000
      });
    }
    
    // Check if user has enough balance
    if (user.balance < bet) {
      return createErrorEmbed(`You don't have enough balance. Your current balance is $${user.balance}.`);
    }
    
    // Determine the result (50/50 chance)
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const isWin = result === choice;
    
    // Calculate winnings and update user's balance
    const winnings = isWin ? bet : 0;
    const newBalance = user.balance - bet + (isWin ? bet * 2 : 0);
    
    // Update user stats
    const updatedUser = await storage.updateUser(user.id, {
      balance: newBalance,
      gamesPlayed: user.gamesPlayed + 1,
      gamesWon: user.gamesWon + (isWin ? 1 : 0),
      lastPlayed: new Date()
    });
    
    // Record the game
    await storage.createGame({
      gameType: 'coinflip',
      userId: user.id,
      bet,
      outcome: isWin ? 'win' : 'loss',
      winAmount: isWin ? bet : 0
    });
    
    // Create the embed message
    const resultDescription = isWin
      ? `The coin landed on **${result}**. You win $${bet}!`
      : `The coin landed on **${result}**. You lose $${bet}.`;
    
    const color = isWin ? COLORS.SUCCESS : COLORS.ERROR;
    
    return createEmbed({
      title: `Coinflip - ${isWin ? 'WIN' : 'LOSS'}`,
      description: resultDescription,
      color: color as ColorResolvable,
      fields: [
        { name: 'Your Choice', value: choice.charAt(0).toUpperCase() + choice.slice(1), inline: true },
        { name: 'Result', value: result.charAt(0).toUpperCase() + result.slice(1), inline: true },
        { name: 'Bet', value: `$${bet}`, inline: true },
        { name: 'Winnings', value: `$${isWin ? bet * 2 : 0}`, inline: true },
        { name: 'New Balance', value: `$${newBalance}`, inline: true }
      ],
      timestamp: true
    });
  },
  async handleMessage(message: Message, args: string[]) {
    if (args.length < 2) {
      return createErrorEmbed('Please provide both your choice (heads/tails) and bet amount. Example: `coinflip heads 100`');
    }
    
    const choice = args[0].toLowerCase();
    if (choice !== 'heads' && choice !== 'tails') {
      return createErrorEmbed('Your choice must be either "heads" or "tails".');
    }
    
    const bet = parseInt(args[1], 10);
    if (isNaN(bet) || bet <= 0) {
      return createErrorEmbed('Your bet must be a positive number.');
    }
    
    // Get user or create if doesn't exist
    let user = await storage.getUserByDiscordId(message.author.id);
    
    if (!user) {
      user = await storage.createUser({
        discordId: message.author.id,
        username: message.author.username,
        balance: 1000
      });
    }
    
    // Check if user has enough balance
    if (user.balance < bet) {
      return createErrorEmbed(`You don't have enough balance. Your current balance is $${user.balance}.`);
    }
    
    // Determine the result (50/50 chance)
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const isWin = result === choice;
    
    // Calculate winnings and update user's balance
    const winnings = isWin ? bet : 0;
    const newBalance = user.balance - bet + (isWin ? bet * 2 : 0);
    
    // Update user stats
    const updatedUser = await storage.updateUser(user.id, {
      balance: newBalance,
      gamesPlayed: user.gamesPlayed + 1,
      gamesWon: user.gamesWon + (isWin ? 1 : 0),
      lastPlayed: new Date()
    });
    
    // Record the game
    await storage.createGame({
      gameType: 'coinflip',
      userId: user.id,
      bet,
      outcome: isWin ? 'win' : 'loss',
      winAmount: isWin ? bet : 0
    });
    
    // Create the embed message
    const resultDescription = isWin
      ? `The coin landed on **${result}**. You win $${bet}!`
      : `The coin landed on **${result}**. You lose $${bet}.`;
    
    const color = isWin ? COLORS.SUCCESS : COLORS.ERROR;
    
    return createEmbed({
      title: `Coinflip - ${isWin ? 'WIN' : 'LOSS'}`,
      description: resultDescription,
      color: color as ColorResolvable,
      fields: [
        { name: 'Your Choice', value: choice.charAt(0).toUpperCase() + choice.slice(1), inline: true },
        { name: 'Result', value: result.charAt(0).toUpperCase() + result.slice(1), inline: true },
        { name: 'Bet', value: `$${bet}`, inline: true },
        { name: 'Winnings', value: `$${isWin ? bet * 2 : 0}`, inline: true },
        { name: 'New Balance', value: `$${newBalance}`, inline: true }
      ],
      timestamp: true
    });
  }
};

// Slots command
export const slotsCommand: CommandHandler = {
  data: new SlashCommandBuilder()
    .setName('slots')
    .setDescription('Play the slot machine and win big')
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('The amount to bet')
        .setRequired(true)
        .setMinValue(1)
    ) as SlashCommandBuilder,
  aliases: ['slot', 'slotmachine'],
  async execute(interaction: ChatInputCommandInteraction) {
    const bet = interaction.options.getInteger('bet', true);
    
    if (bet <= 0) {
      return createErrorEmbed('Your bet must be greater than 0.');
    }
    
    // Get user or create if doesn't exist
    let user = await storage.getUserByDiscordId(interaction.user.id);
    
    if (!user) {
      user = await storage.createUser({
        discordId: interaction.user.id,
        username: interaction.user.username,
        balance: 1000
      });
    }
    
    // Check if user has enough balance
    if (user.balance < bet) {
      return createErrorEmbed(`You don't have enough balance. Your current balance is $${user.balance}.`);
    }
    
    // Define the slot symbols and their payouts
    const symbols = [
      { name: 'cherry', emoji: '🍒', value: 1 },
      { name: 'lemon', emoji: '🍋', value: 1.5 },
      { name: 'melon', emoji: '🍉', value: 2 },
      { name: 'bell', emoji: '🔔', value: 2.5 },
      { name: 'bar', emoji: '📊', value: 3 },
      { name: 'diamond', emoji: '💎', value: 3.5 },
      { name: 'heart', emoji: '❤️', value: 4 },
      { name: 'seven', emoji: '7️⃣', value: 5 }
    ];
    
    // Select three random symbols
    const reels: typeof symbols[0][] = [];
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * symbols.length);
      reels.push(symbols[randomIndex]);
    }
    
    // Determine if the user won
    let matchCount = 0;
    let winMultiplier = 0;
    
    // Check for pairs and triples
    if (reels[0].name === reels[1].name && reels[1].name === reels[2].name) {
      // Triple match
      matchCount = 3;
      winMultiplier = reels[0].value * 5; // 5x multiplier for triple match
    } else if (reels[0].name === reels[1].name || reels[1].name === reels[2].name || reels[0].name === reels[2].name) {
      // Pair match (any two symbols)
      matchCount = 2;
      
      // Find the matching pair value
      if (reels[0].name === reels[1].name) {
        winMultiplier = reels[0].value * 2; // 2x multiplier for pair match
      } else if (reels[1].name === reels[2].name) {
        winMultiplier = reels[1].value * 2;
      } else {
        winMultiplier = reels[0].value * 2;
      }
    }
    
    // Special jackpot for triple sevens
    if (reels[0].name === 'seven' && reels[1].name === 'seven' && reels[2].name === 'seven') {
      winMultiplier = 50; // 50x multiplier for triple sevens
    }
    
    const isWin = matchCount >= 2;
    const winnings = isWin ? Math.floor(bet * winMultiplier) : 0;
    const newBalance = user.balance - bet + winnings;
    
    // Update user stats
    const updatedUser = await storage.updateUser(user.id, {
      balance: newBalance,
      gamesPlayed: user.gamesPlayed + 1,
      gamesWon: user.gamesWon + (isWin ? 1 : 0),
      lastPlayed: new Date()
    });
    
    // Record the game
    await storage.createGame({
      gameType: 'slots',
      userId: user.id,
      bet,
      outcome: isWin ? 'win' : 'loss',
      winAmount: winnings
    });
    
    // Create result display
    const reelsDisplay = reels.map(r => r.emoji).join(' | ');
    
    // Create the embed message
    let resultDescription = '';
    if (isWin) {
      if (matchCount === 3) {
        if (reels[0].name === 'seven') {
          resultDescription = `🎰 **JACKPOT!** 🎰\n\n${reelsDisplay}\n\nYou hit the jackpot with triple sevens! You win **$${winnings}**!`;
        } else {
          resultDescription = `🎰 **BIG WIN!** 🎰\n\n${reelsDisplay}\n\nYou matched three symbols! You win **$${winnings}**!`;
        }
      } else {
        resultDescription = `🎰 **WIN!** 🎰\n\n${reelsDisplay}\n\nYou matched two symbols! You win **$${winnings}**!`;
      }
    } else {
      resultDescription = `🎰 **Better luck next time!** 🎰\n\n${reelsDisplay}\n\nNo matches. You lose **$${bet}**.`;
    }
    
    const color = isWin ? COLORS.SUCCESS : COLORS.ERROR;
    
    return createEmbed({
      title: `Slots - ${isWin ? 'WIN' : 'LOSS'}`,
      description: resultDescription,
      color: color as ColorResolvable,
      fields: [
        { name: 'Bet', value: `$${bet}`, inline: true },
        { name: 'Winnings', value: `$${winnings}`, inline: true },
        { name: 'New Balance', value: `$${newBalance}`, inline: true }
      ],
      timestamp: true
    });
  },
  async handleMessage(message: Message, args: string[]) {
    if (args.length < 1) {
      return createErrorEmbed('Please provide a bet amount. Example: `slots 100`');
    }
    
    const bet = parseInt(args[0], 10);
    if (isNaN(bet) || bet <= 0) {
      return createErrorEmbed('Your bet must be a positive number.');
    }
    
    // Get user or create if doesn't exist
    let user = await storage.getUserByDiscordId(message.author.id);
    
    if (!user) {
      user = await storage.createUser({
        discordId: message.author.id,
        username: message.author.username,
        balance: 1000
      });
    }
    
    // Check if user has enough balance
    if (user.balance < bet) {
      return createErrorEmbed(`You don't have enough balance. Your current balance is $${user.balance}.`);
    }
    
    // Define the slot symbols and their payouts
    const symbols = [
      { name: 'cherry', emoji: '🍒', value: 1 },
      { name: 'lemon', emoji: '🍋', value: 1.5 },
      { name: 'melon', emoji: '🍉', value: 2 },
      { name: 'bell', emoji: '🔔', value: 2.5 },
      { name: 'bar', emoji: '📊', value: 3 },
      { name: 'diamond', emoji: '💎', value: 3.5 },
      { name: 'heart', emoji: '❤️', value: 4 },
      { name: 'seven', emoji: '7️⃣', value: 5 }
    ];
    
    // Select three random symbols
    const reels: typeof symbols[0][] = [];
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * symbols.length);
      reels.push(symbols[randomIndex]);
    }
    
    // Determine if the user won
    let matchCount = 0;
    let winMultiplier = 0;
    
    // Check for pairs and triples
    if (reels[0].name === reels[1].name && reels[1].name === reels[2].name) {
      // Triple match
      matchCount = 3;
      winMultiplier = reels[0].value * 5; // 5x multiplier for triple match
    } else if (reels[0].name === reels[1].name || reels[1].name === reels[2].name || reels[0].name === reels[2].name) {
      // Pair match (any two symbols)
      matchCount = 2;
      
      // Find the matching pair value
      if (reels[0].name === reels[1].name) {
        winMultiplier = reels[0].value * 2; // 2x multiplier for pair match
      } else if (reels[1].name === reels[2].name) {
        winMultiplier = reels[1].value * 2;
      } else {
        winMultiplier = reels[0].value * 2;
      }
    }
    
    // Special jackpot for triple sevens
    if (reels[0].name === 'seven' && reels[1].name === 'seven' && reels[2].name === 'seven') {
      winMultiplier = 50; // 50x multiplier for triple sevens
    }
    
    const isWin = matchCount >= 2;
    const winnings = isWin ? Math.floor(bet * winMultiplier) : 0;
    const newBalance = user.balance - bet + winnings;
    
    // Update user stats
    const updatedUser = await storage.updateUser(user.id, {
      balance: newBalance,
      gamesPlayed: user.gamesPlayed + 1,
      gamesWon: user.gamesWon + (isWin ? 1 : 0),
      lastPlayed: new Date()
    });
    
    // Record the game
    await storage.createGame({
      gameType: 'slots',
      userId: user.id,
      bet,
      outcome: isWin ? 'win' : 'loss',
      winAmount: winnings
    });
    
    // Create result display
    const reelsDisplay = reels.map(r => r.emoji).join(' | ');
    
    // Create the embed message
    let resultDescription = '';
    if (isWin) {
      if (matchCount === 3) {
        if (reels[0].name === 'seven') {
          resultDescription = `🎰 **JACKPOT!** 🎰\n\n${reelsDisplay}\n\nYou hit the jackpot with triple sevens! You win **$${winnings}**!`;
        } else {
          resultDescription = `🎰 **BIG WIN!** 🎰\n\n${reelsDisplay}\n\nYou matched three symbols! You win **$${winnings}**!`;
        }
      } else {
        resultDescription = `🎰 **WIN!** 🎰\n\n${reelsDisplay}\n\nYou matched two symbols! You win **$${winnings}**!`;
      }
    } else {
      resultDescription = `🎰 **Better luck next time!** 🎰\n\n${reelsDisplay}\n\nNo matches. You lose **$${bet}**.`;
    }
    
    const color = isWin ? COLORS.SUCCESS : COLORS.ERROR;
    
    return createEmbed({
      title: `Slots - ${isWin ? 'WIN' : 'LOSS'}`,
      description: resultDescription,
      color: color as ColorResolvable,
      fields: [
        { name: 'Bet', value: `$${bet}`, inline: true },
        { name: 'Winnings', value: `$${winnings}`, inline: true },
        { name: 'New Balance', value: `$${newBalance}`, inline: true }
      ],
      timestamp: true
    });
  }
};

// Blackjack command
export const blackjackCommand: CommandHandler = {
  data: new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Play a game of blackjack against the dealer')
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('The amount to bet')
        .setRequired(true)
        .setMinValue(1)
    )
    .addStringOption(option =>
      option.setName('mode')
        .setDescription('Game difficulty')
        .setRequired(false)
        .addChoices(
          { name: 'Normal', value: 'normal' },
          { name: 'Hard', value: 'hard' }
        )
    ) as SlashCommandBuilder,
  aliases: ['bj', '21'],
  async execute(interaction: ChatInputCommandInteraction) {
    const bet = interaction.options.getInteger('bet', true);
    const mode = interaction.options.getString('mode') || 'normal';
    const isHardMode = mode === 'hard';
    
    if (bet <= 0) {
      return createErrorEmbed('Your bet must be greater than 0.');
    }
    
    // Get user or create if doesn't exist
    let user = await storage.getUserByDiscordId(interaction.user.id);
    
    if (!user) {
      user = await storage.createUser({
        discordId: interaction.user.id,
        username: interaction.user.username,
        balance: 1000
      });
    }
    
    // Check if user has enough balance
    if (user.balance < bet) {
      return createErrorEmbed(`You don't have enough balance. Your current balance is $${user.balance}.`);
    }
    
    // Initialize deck and hands
    const deck = createDeck();
    shuffleDeck(deck);
    
    const playerHand: Card[] = [drawCard(deck), drawCard(deck)];
    const dealerHand: Card[] = [drawCard(deck), drawCard(deck)];
    
    // Check for natural blackjack
    const playerHasNaturalBlackjack = calculateHandValue(playerHand) === 21;
    const dealerHasNaturalBlackjack = calculateHandValue(dealerHand) === 21;
    
    let outcome: 'win' | 'loss' | 'tie' = 'loss';
    let winnings = 0;
    
    // Handle natural blackjacks
    if (playerHasNaturalBlackjack && dealerHasNaturalBlackjack) {
      outcome = 'tie';
      winnings = bet;
    } else if (playerHasNaturalBlackjack) {
      outcome = 'win';
      winnings = Math.floor(bet * 2.5); // Natural blackjack pays 3:2
    } else if (dealerHasNaturalBlackjack) {
      outcome = 'loss';
      winnings = 0;
    } else {
      // Simplified blackjack logic for demonstration
      // In a real implementation, this would involve player choices (hit/stand)
      
      // Player's turn (simplified - always hit until 17 or higher)
      while (calculateHandValue(playerHand) < 17) {
        playerHand.push(drawCard(deck));
      }
      
      const playerValue = calculateHandValue(playerHand);
      
      // Check if player busted
      if (playerValue > 21) {
        outcome = 'loss';
        winnings = 0;
      } else {
        // Dealer's turn
        // In hard mode, dealer hits on soft 17
        const dealerStandValue = isHardMode ? 17 : 16;
        
        while (calculateHandValue(dealerHand) <= dealerStandValue) {
          dealerHand.push(drawCard(deck));
        }
        
        const dealerValue = calculateHandValue(dealerHand);
        
        // Determine outcome
        if (dealerValue > 21) {
          outcome = 'win';
          winnings = bet * 2;
        } else if (playerValue > dealerValue) {
          outcome = 'win';
          winnings = bet * 2;
        } else if (playerValue < dealerValue) {
          outcome = 'loss';
          winnings = 0;
        } else {
          outcome = 'tie';
          winnings = bet;
        }
      }
    }
    
    const newBalance = user.balance - bet + winnings;
    
    // Update user stats
    const updatedUser = await storage.updateUser(user.id, {
      balance: newBalance,
      gamesPlayed: user.gamesPlayed + 1,
      gamesWon: user.gamesWon + (outcome === 'win' ? 1 : 0),
      lastPlayed: new Date()
    });
    
    // Record the game
    await storage.createGame({
      gameType: 'blackjack',
      userId: user.id,
      bet,
      outcome,
      winAmount: winnings - bet // Net winnings
    });
    
    // Format hands for display
    const playerHandDisplay = formatHand(playerHand);
    const dealerHandDisplay = formatHand(dealerHand);
    
    // Create result message
    let resultDescription = '';
    if (playerHasNaturalBlackjack && dealerHasNaturalBlackjack) {
      resultDescription = "Both you and the dealer have Blackjack! It's a push.";
    } else if (playerHasNaturalBlackjack) {
      resultDescription = "Blackjack! You win with a natural 21!";
    } else if (dealerHasNaturalBlackjack) {
      resultDescription = "Dealer has Blackjack! You lose.";
    } else if (calculateHandValue(playerHand) > 21) {
      resultDescription = "Bust! Your hand exceeds 21. You lose.";
    } else if (calculateHandValue(dealerHand) > 21) {
      resultDescription = "Dealer busts! You win!";
    } else {
      resultDescription = outcome === 'win' 
        ? "Your hand beats the dealer's! You win!" 
        : outcome === 'loss'
          ? "Dealer's hand beats yours. You lose."
          : "It's a tie! Your bet is returned.";
    }
    
    const color = outcome === 'win' ? COLORS.SUCCESS : outcome === 'loss' ? COLORS.ERROR : COLORS.WARNING;
    
    return createEmbed({
      title: `Blackjack - ${outcome.toUpperCase()}`,
      description: resultDescription,
      color: color as ColorResolvable,
      fields: [
        { name: 'Your Hand', value: `${playerHandDisplay} (${calculateHandValue(playerHand)})`, inline: true },
        { name: 'Dealer Hand', value: `${dealerHandDisplay} (${calculateHandValue(dealerHand)})`, inline: true },
        { name: 'Bet', value: `$${bet}`, inline: true },
        { name: 'Winnings', value: `$${winnings}`, inline: true },
        { name: 'New Balance', value: `$${newBalance}`, inline: true },
        { name: 'Mode', value: isHardMode ? 'Hard' : 'Normal', inline: true }
      ],
      timestamp: true
    });
  },
  async handleMessage(message: Message, args: string[]) {
    if (args.length < 1) {
      return createErrorEmbed('Please provide a bet amount. Example: `blackjack 100` or `blackjack 100 hard`');
    }
    
    const bet = parseInt(args[0], 10);
    if (isNaN(bet) || bet <= 0) {
      return createErrorEmbed('Your bet must be a positive number.');
    }
    
    const isHardMode = args.length > 1 && ['hard', 'h'].includes(args[1].toLowerCase());
    
    // Get user or create if doesn't exist
    let user = await storage.getUserByDiscordId(message.author.id);
    
    if (!user) {
      user = await storage.createUser({
        discordId: message.author.id,
        username: message.author.username,
        balance: 1000
      });
    }
    
    // Check if user has enough balance
    if (user.balance < bet) {
      return createErrorEmbed(`You don't have enough balance. Your current balance is $${user.balance}.`);
    }
    
    // Initialize deck and hands
    const deck = createDeck();
    shuffleDeck(deck);
    
    const playerHand: Card[] = [drawCard(deck), drawCard(deck)];
    const dealerHand: Card[] = [drawCard(deck), drawCard(deck)];
    
    // Check for natural blackjack
    const playerHasNaturalBlackjack = calculateHandValue(playerHand) === 21;
    const dealerHasNaturalBlackjack = calculateHandValue(dealerHand) === 21;
    
    let outcome: 'win' | 'loss' | 'tie' = 'loss';
    let winnings = 0;
    
    // Handle natural blackjacks
    if (playerHasNaturalBlackjack && dealerHasNaturalBlackjack) {
      outcome = 'tie';
      winnings = bet;
    } else if (playerHasNaturalBlackjack) {
      outcome = 'win';
      winnings = Math.floor(bet * 2.5); // Natural blackjack pays 3:2
    } else if (dealerHasNaturalBlackjack) {
      outcome = 'loss';
      winnings = 0;
    } else {
      // Simplified blackjack logic for demonstration
      // In a real implementation, this would involve player choices (hit/stand)
      
      // Player's turn (simplified - always hit until 17 or higher)
      while (calculateHandValue(playerHand) < 17) {
        playerHand.push(drawCard(deck));
      }
      
      const playerValue = calculateHandValue(playerHand);
      
      // Check if player busted
      if (playerValue > 21) {
        outcome = 'loss';
        winnings = 0;
      } else {
        // Dealer's turn
        // In hard mode, dealer hits on soft 17
        const dealerStandValue = isHardMode ? 17 : 16;
        
        while (calculateHandValue(dealerHand) <= dealerStandValue) {
          dealerHand.push(drawCard(deck));
        }
        
        const dealerValue = calculateHandValue(dealerHand);
        
        // Determine outcome
        if (dealerValue > 21) {
          outcome = 'win';
          winnings = bet * 2;
        } else if (playerValue > dealerValue) {
          outcome = 'win';
          winnings = bet * 2;
        } else if (playerValue < dealerValue) {
          outcome = 'loss';
          winnings = 0;
        } else {
          outcome = 'tie';
          winnings = bet;
        }
      }
    }
    
    const newBalance = user.balance - bet + winnings;
    
    // Update user stats
    const updatedUser = await storage.updateUser(user.id, {
      balance: newBalance,
      gamesPlayed: user.gamesPlayed + 1,
      gamesWon: user.gamesWon + (outcome === 'win' ? 1 : 0),
      lastPlayed: new Date()
    });
    
    // Record the game
    await storage.createGame({
      gameType: 'blackjack',
      userId: user.id,
      bet,
      outcome,
      winAmount: winnings - bet // Net winnings
    });
    
    // Format hands for display
    const playerHandDisplay = formatHand(playerHand);
    const dealerHandDisplay = formatHand(dealerHand);
    
    // Create result message
    let resultDescription = '';
    if (playerHasNaturalBlackjack && dealerHasNaturalBlackjack) {
      resultDescription = "Both you and the dealer have Blackjack! It's a push.";
    } else if (playerHasNaturalBlackjack) {
      resultDescription = "Blackjack! You win with a natural 21!";
    } else if (dealerHasNaturalBlackjack) {
      resultDescription = "Dealer has Blackjack! You lose.";
    } else if (calculateHandValue(playerHand) > 21) {
      resultDescription = "Bust! Your hand exceeds 21. You lose.";
    } else if (calculateHandValue(dealerHand) > 21) {
      resultDescription = "Dealer busts! You win!";
    } else {
      resultDescription = outcome === 'win' 
        ? "Your hand beats the dealer's! You win!" 
        : outcome === 'loss'
          ? "Dealer's hand beats yours. You lose."
          : "It's a tie! Your bet is returned.";
    }
    
    const color = outcome === 'win' ? COLORS.SUCCESS : outcome === 'loss' ? COLORS.ERROR : COLORS.WARNING;
    
    return createEmbed({
      title: `Blackjack - ${outcome.toUpperCase()}`,
      description: resultDescription,
      color: color as ColorResolvable,
      fields: [
        { name: 'Your Hand', value: `${playerHandDisplay} (${calculateHandValue(playerHand)})`, inline: true },
        { name: 'Dealer Hand', value: `${dealerHandDisplay} (${calculateHandValue(dealerHand)})`, inline: true },
        { name: 'Bet', value: `$${bet}`, inline: true },
        { name: 'Winnings', value: `$${winnings}`, inline: true },
        { name: 'New Balance', value: `$${newBalance}`, inline: true },
        { name: 'Mode', value: isHardMode ? 'Hard' : 'Normal', inline: true }
      ],
      timestamp: true
    });
  }
};

// Card types for blackjack
type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
type Card = { suit: Suit; rank: Rank };

// Create a standard deck of 52 cards
function createDeck(): Card[] {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  
  return deck;
}

// Shuffle the deck using Fisher-Yates algorithm
function shuffleDeck(deck: Card[]): void {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

// Draw a card from the deck
function drawCard(deck: Card[]): Card {
  if (deck.length === 0) throw new Error('Deck is empty');
  return deck.pop()!;
}

// Calculate the value of a hand
function calculateHandValue(hand: Card[]): number {
  let value = 0;
  let aces = 0;
  
  for (const card of hand) {
    if (card.rank === 'A') {
      aces += 1;
      value += 11;
    } else if (['K', 'Q', 'J'].includes(card.rank)) {
      value += 10;
    } else {
      value += parseInt(card.rank, 10);
    }
  }
  
  // Adjust for aces if needed
  while (value > 21 && aces > 0) {
    value -= 10;
    aces -= 1;
  }
  
  return value;
}

// Format hand for display
function formatHand(hand: Card[]): string {
  const suitEmojis: Record<Suit, string> = {
    hearts: '♥️',
    diamonds: '♦️',
    clubs: '♣️',
    spades: '♠️'
  };
  
  return hand.map(card => `${card.rank}${suitEmojis[card.suit]}`).join(' ');
}

// Roulette command
export const rouletteCommand: CommandHandler = {
  data: new SlashCommandBuilder()
    .setName('roulette')
    .setDescription('Play roulette and bet on different options')
    .addStringOption(option =>
      option.setName('bet_type')
        .setDescription('Type of bet')
        .setRequired(true)
        .addChoices(
          { name: 'Red/Black', value: 'color' },
          { name: 'Odd/Even', value: 'parity' },
          { name: 'High/Low', value: 'range' },
          { name: 'Single Number', value: 'number' }
        )
    )
    .addStringOption(option =>
      option.setName('choice')
        .setDescription('Your choice (red/black, odd/even, high/low, or a number 0-36)')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('The amount to bet')
        .setRequired(true)
        .setMinValue(1)
    ) as SlashCommandBuilder,
  aliases: ['roul'],
  async execute(interaction: ChatInputCommandInteraction) {
    const betType = interaction.options.getString('bet_type', true);
    const choice = interaction.options.getString('choice', true).toLowerCase();
    const bet = interaction.options.getInteger('bet', true);
    
    if (bet <= 0) {
      return createErrorEmbed('Your bet must be greater than 0.');
    }
    
    // Validate bet type and choice
    const validationError = validateRouletteBet(betType, choice);
    if (validationError !== null) {
      return createErrorEmbed(validationError);
    }
    
    // Get user or create if doesn't exist
    let user = await storage.getUserByDiscordId(interaction.user.id);
    
    if (!user) {
      user = await storage.createUser({
        discordId: interaction.user.id,
        username: interaction.user.username,
        balance: 1000
      });
    }
    
    // Check if user has enough balance
    if (user.balance < bet) {
      return createErrorEmbed(`You don't have enough balance. Your current balance is $${user.balance}.`);
    }
    
    // Spin the wheel (generate random number 0-36)
    const result = Math.floor(Math.random() * 37);
    
    // Determine if the user won
    const { isWin, payout } = checkRouletteWin(betType, choice, result);
    
    // Calculate winnings
    const winnings = isWin ? bet * payout : 0;
    const newBalance = user.balance - bet + winnings;
    
    // Update user stats
    const updatedUser = await storage.updateUser(user.id, {
      balance: newBalance,
      gamesPlayed: user.gamesPlayed + 1,
      gamesWon: user.gamesWon + (isWin ? 1 : 0),
      lastPlayed: new Date()
    });
    
    // Record the game
    await storage.createGame({
      gameType: 'roulette',
      userId: user.id,
      bet,
      outcome: isWin ? 'win' : 'loss',
      winAmount: isWin ? winnings - bet : 0 // Net winnings
    });
    
    // Format the result info
    const resultInfo = getRouletteResultInfo(result);
    
    // Create result description
    let resultDescription = `🎲 The ball landed on **${result}** (${resultInfo.color}, ${resultInfo.parity}, ${resultInfo.range}).\n\n`;
    
    if (isWin) {
      resultDescription += `Congratulations! Your bet on ${formatRouletteBet(betType, choice)} won! You receive **$${winnings}**!`;
    } else {
      resultDescription += `Sorry! Your bet on ${formatRouletteBet(betType, choice)} lost. You lose **$${bet}**.`;
    }
    
    const color = isWin ? COLORS.SUCCESS : COLORS.ERROR;
    
    return createEmbed({
      title: `Roulette - ${isWin ? 'WIN' : 'LOSS'}`,
      description: resultDescription,
      color: color as ColorResolvable,
      fields: [
        { name: 'Result', value: `${result} (${resultInfo.color}, ${resultInfo.parity}, ${resultInfo.range})`, inline: true },
        { name: 'Your Bet', value: formatRouletteBet(betType, choice), inline: true },
        { name: 'Payout', value: `${payout}:1`, inline: true },
        { name: 'Bet Amount', value: `$${bet}`, inline: true },
        { name: 'Winnings', value: `$${winnings}`, inline: true },
        { name: 'New Balance', value: `$${newBalance}`, inline: true }
      ],
      timestamp: true
    });
  },
  async handleMessage(message: Message, args: string[]) {
    if (args.length < 3) {
      return createErrorEmbed('Please provide your bet type, choice, and amount. Example: `roulette color red 100`');
    }
    
    const betType = args[0].toLowerCase();
    const choice = args[1].toLowerCase();
    const bet = parseInt(args[2], 10);
    
    if (isNaN(bet) || bet <= 0) {
      return createErrorEmbed('Your bet must be a positive number.');
    }
    
    // Map text input to valid bet types
    let mappedBetType = betType;
    if (['red', 'black'].includes(betType)) mappedBetType = 'color';
    if (['odd', 'even'].includes(betType)) mappedBetType = 'parity';
    if (['high', 'low'].includes(betType)) mappedBetType = 'range';
    if (!isNaN(parseInt(betType, 10))) mappedBetType = 'number';
    
    // Validate bet type and choice
    const validationError = validateRouletteBet(mappedBetType, choice);
    if (validationError !== null) {
      return createErrorEmbed(validationError);
    }
    
    // Get user or create if doesn't exist
    let user = await storage.getUserByDiscordId(message.author.id);
    
    if (!user) {
      user = await storage.createUser({
        discordId: message.author.id,
        username: message.author.username,
        balance: 1000
      });
    }
    
    // Check if user has enough balance
    if (user.balance < bet) {
      return createErrorEmbed(`You don't have enough balance. Your current balance is $${user.balance}.`);
    }
    
    // Spin the wheel (generate random number 0-36)
    const result = Math.floor(Math.random() * 37);
    
    // Determine if the user won
    const { isWin, payout } = checkRouletteWin(mappedBetType, choice, result);
    
    // Calculate winnings
    const winnings = isWin ? bet * payout : 0;
    const newBalance = user.balance - bet + winnings;
    
    // Update user stats
    const updatedUser = await storage.updateUser(user.id, {
      balance: newBalance,
      gamesPlayed: user.gamesPlayed + 1,
      gamesWon: user.gamesWon + (isWin ? 1 : 0),
      lastPlayed: new Date()
    });
    
    // Record the game
    await storage.createGame({
      gameType: 'roulette',
      userId: user.id,
      bet,
      outcome: isWin ? 'win' : 'loss',
      winAmount: isWin ? winnings - bet : 0 // Net winnings
    });
    
    // Format the result info
    const resultInfo = getRouletteResultInfo(result);
    
    // Create result description
    let resultDescription = `🎲 The ball landed on **${result}** (${resultInfo.color}, ${resultInfo.parity}, ${resultInfo.range}).\n\n`;
    
    if (isWin) {
      resultDescription += `Congratulations! Your bet on ${formatRouletteBet(mappedBetType, choice)} won! You receive **$${winnings}**!`;
    } else {
      resultDescription += `Sorry! Your bet on ${formatRouletteBet(mappedBetType, choice)} lost. You lose **$${bet}**.`;
    }
    
    const color = isWin ? COLORS.SUCCESS : COLORS.ERROR;
    
    return createEmbed({
      title: `Roulette - ${isWin ? 'WIN' : 'LOSS'}`,
      description: resultDescription,
      color: color as ColorResolvable,
      fields: [
        { name: 'Result', value: `${result} (${resultInfo.color}, ${resultInfo.parity}, ${resultInfo.range})`, inline: true },
        { name: 'Your Bet', value: formatRouletteBet(mappedBetType, choice), inline: true },
        { name: 'Payout', value: `${payout}:1`, inline: true },
        { name: 'Bet Amount', value: `$${bet}`, inline: true },
        { name: 'Winnings', value: `$${winnings}`, inline: true },
        { name: 'New Balance', value: `$${newBalance}`, inline: true }
      ],
      timestamp: true
    });
  }
};

// Helper functions for roulette
function validateRouletteBet(betType: string, choice: string): string | null {
  switch (betType) {
    case 'color':
      if (!['red', 'black'].includes(choice)) {
        return 'Color bet must be either "red" or "black".';
      }
      break;
    case 'parity':
      if (!['odd', 'even'].includes(choice)) {
        return 'Parity bet must be either "odd" or "even".';
      }
      break;
    case 'range':
      if (!['high', 'low'].includes(choice)) {
        return 'Range bet must be either "high" (19-36) or "low" (1-18).';
      }
      break;
    case 'number':
      const num = parseInt(choice, 10);
      if (isNaN(num) || num < 0 || num > 36) {
        return 'Number bet must be a valid number from 0 to 36.';
      }
      break;
    default:
      return 'Invalid bet type. Choose from: color, parity, range, or number.';
  }
  
  return null; // No error
}

function checkRouletteWin(betType: string, choice: string, result: number): { isWin: boolean, payout: number } {
  const resultInfo = getRouletteResultInfo(result);
  
  switch (betType) {
    case 'color':
      return { 
        isWin: choice === resultInfo.color, 
        payout: 2 // 1:1 payout (bet * 2)
      };
    case 'parity':
      return { 
        isWin: choice === resultInfo.parity, 
        payout: 2 // 1:1 payout
      };
    case 'range':
      return { 
        isWin: choice === resultInfo.range, 
        payout: 2 // 1:1 payout
      };
    case 'number':
      return { 
        isWin: parseInt(choice, 10) === result, 
        payout: 36 // 35:1 payout
      };
    default:
      return { isWin: false, payout: 0 };
  }
}

function getRouletteResultInfo(result: number): { color: string, parity: string, range: string } {
  // Define red numbers in roulette (everything else except 0 is black)
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  
  return {
    color: result === 0 ? 'green' : redNumbers.includes(result) ? 'red' : 'black',
    parity: result === 0 ? 'none' : result % 2 === 0 ? 'even' : 'odd',
    range: result === 0 ? 'none' : result >= 1 && result <= 18 ? 'low' : 'high'
  };
}

function formatRouletteBet(betType: string, choice: string): string {
  switch (betType) {
    case 'color':
      return `${choice.charAt(0).toUpperCase() + choice.slice(1)}`;
    case 'parity':
      return `${choice.charAt(0).toUpperCase() + choice.slice(1)}`;
    case 'range':
      return `${choice === 'high' ? 'High (19-36)' : 'Low (1-18)'}`;
    case 'number':
      return `Number ${choice}`;
    default:
      return 'Unknown bet';
  }
}

// Dice game command
export const diceCommand: CommandHandler = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Roll dice and bet on the outcome')
    .addStringOption(option =>
      option.setName('bet_type')
        .setDescription('Type of bet')
        .setRequired(true)
        .addChoices(
          { name: 'Higher than', value: 'higher' },
          { name: 'Lower than', value: 'lower' },
          { name: 'Exactly', value: 'exact' }
        )
    )
    .addIntegerOption(option =>
      option.setName('number')
        .setDescription('The number to compare the dice roll against (2-12)')
        .setRequired(true)
        .setMinValue(2)
        .setMaxValue(12)
    )
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('The amount to bet')
        .setRequired(true)
        .setMinValue(1)
    ) as SlashCommandBuilder,
  aliases: ['roll'],
  async execute(interaction: ChatInputCommandInteraction) {
    const betType = interaction.options.getString('bet_type', true);
    const targetNumber = interaction.options.getInteger('number', true);
    const bet = interaction.options.getInteger('bet', true);
    
    if (bet <= 0) {
      return createErrorEmbed('Your bet must be greater than 0.');
    }
    
    // Validate bet type and number
    const validationError = validateDiceBet(betType, targetNumber);
    if (validationError !== null) {
      return createErrorEmbed(validationError);
    }
    
    // Get user or create if doesn't exist
    let user = await storage.getUserByDiscordId(interaction.user.id);
    
    if (!user) {
      user = await storage.createUser({
        discordId: interaction.user.id,
        username: interaction.user.username,
        balance: 1000
      });
    }
    
    // Check if user has enough balance
    if (user.balance < bet) {
      return createErrorEmbed(`You don't have enough balance. Your current balance is $${user.balance}.`);
    }
    
    // Roll two dice (values 1-6 each)
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const diceSum = die1 + die2;
    
    // Determine if the user won based on bet type
    const { isWin, payout } = checkDiceWin(betType, targetNumber, diceSum);
    
    // Calculate winnings
    const winnings = isWin ? bet * payout : 0;
    const newBalance = user.balance - bet + winnings;
    
    // Update user stats
    const updatedUser = await storage.updateUser(user.id, {
      balance: newBalance,
      gamesPlayed: user.gamesPlayed + 1,
      gamesWon: user.gamesWon + (isWin ? 1 : 0),
      lastPlayed: new Date()
    });
    
    // Record the game
    await storage.createGame({
      gameType: 'dice',
      userId: user.id,
      bet,
      outcome: isWin ? 'win' : 'loss',
      winAmount: isWin ? winnings - bet : 0 // Net winnings
    });
    
    // Create dice emojis
    const diceEmojis = getDiceEmojis(die1, die2);
    
    // Create result description
    let resultDescription = `🎲 You rolled: ${diceEmojis} = **${diceSum}**\n\n`;
    
    if (isWin) {
      resultDescription += `Congratulations! Your bet on ${formatDiceBet(betType, targetNumber)} won! You receive **$${winnings}**!`;
    } else {
      resultDescription += `Sorry! Your bet on ${formatDiceBet(betType, targetNumber)} lost. You lose **$${bet}**.`;
    }
    
    const color = isWin ? COLORS.SUCCESS : COLORS.ERROR;
    
    return createEmbed({
      title: `Dice Roll - ${isWin ? 'WIN' : 'LOSS'}`,
      description: resultDescription,
      color: color as ColorResolvable,
      fields: [
        { name: 'Dice Result', value: `${diceEmojis} = ${diceSum}`, inline: true },
        { name: 'Your Bet', value: formatDiceBet(betType, targetNumber), inline: true },
        { name: 'Payout', value: `${payout}:1`, inline: true },
        { name: 'Bet Amount', value: `$${bet}`, inline: true },
        { name: 'Winnings', value: `$${winnings}`, inline: true },
        { name: 'New Balance', value: `$${newBalance}`, inline: true }
      ],
      timestamp: true
    });
  },
  async handleMessage(message: Message, args: string[]) {
    if (args.length < 3) {
      return createErrorEmbed('Please provide your bet type, target number, and bet amount. Example: `dice higher 7 100`');
    }
    
    const betType = args[0].toLowerCase();
    const targetNumber = parseInt(args[1], 10);
    const bet = parseInt(args[2], 10);
    
    if (isNaN(targetNumber)) {
      return createErrorEmbed('Your target number must be a valid number between 2 and 12.');
    }
    
    if (isNaN(bet) || bet <= 0) {
      return createErrorEmbed('Your bet must be a positive number.');
    }
    
    // Map text input to valid bet types
    let mappedBetType = betType;
    if (['higher', 'high', 'above', 'over'].includes(betType)) mappedBetType = 'higher';
    if (['lower', 'low', 'below', 'under'].includes(betType)) mappedBetType = 'lower';
    if (['exact', 'equals', 'equal'].includes(betType)) mappedBetType = 'exact';
    
    // Validate bet type and number
    const validationError = validateDiceBet(mappedBetType, targetNumber);
    if (validationError !== null) {
      return createErrorEmbed(validationError);
    }
    
    // Get user or create if doesn't exist
    let user = await storage.getUserByDiscordId(message.author.id);
    
    if (!user) {
      user = await storage.createUser({
        discordId: message.author.id,
        username: message.author.username,
        balance: 1000
      });
    }
    
    // Check if user has enough balance
    if (user.balance < bet) {
      return createErrorEmbed(`You don't have enough balance. Your current balance is $${user.balance}.`);
    }
    
    // Roll two dice (values 1-6 each)
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const diceSum = die1 + die2;
    
    // Determine if the user won
    const { isWin, payout } = checkDiceWin(mappedBetType, targetNumber, diceSum);
    
    // Calculate winnings
    const winnings = isWin ? bet * payout : 0;
    const newBalance = user.balance - bet + winnings;
    
    // Update user stats
    const updatedUser = await storage.updateUser(user.id, {
      balance: newBalance,
      gamesPlayed: user.gamesPlayed + 1,
      gamesWon: user.gamesWon + (isWin ? 1 : 0),
      lastPlayed: new Date()
    });
    
    // Record the game
    await storage.createGame({
      gameType: 'dice',
      userId: user.id,
      bet,
      outcome: isWin ? 'win' : 'loss',
      winAmount: isWin ? winnings - bet : 0 // Net winnings
    });
    
    // Create dice emojis
    const diceEmojis = getDiceEmojis(die1, die2);
    
    // Create result description
    let resultDescription = `🎲 You rolled: ${diceEmojis} = **${diceSum}**\n\n`;
    
    if (isWin) {
      resultDescription += `Congratulations! Your bet on ${formatDiceBet(mappedBetType, targetNumber)} won! You receive **$${winnings}**!`;
    } else {
      resultDescription += `Sorry! Your bet on ${formatDiceBet(mappedBetType, targetNumber)} lost. You lose **$${bet}**.`;
    }
    
    const color = isWin ? COLORS.SUCCESS : COLORS.ERROR;
    
    return createEmbed({
      title: `Dice Roll - ${isWin ? 'WIN' : 'LOSS'}`,
      description: resultDescription,
      color: color as ColorResolvable,
      fields: [
        { name: 'Dice Result', value: `${diceEmojis} = ${diceSum}`, inline: true },
        { name: 'Your Bet', value: formatDiceBet(mappedBetType, targetNumber), inline: true },
        { name: 'Payout', value: `${payout}:1`, inline: true },
        { name: 'Bet Amount', value: `$${bet}`, inline: true },
        { name: 'Winnings', value: `$${winnings}`, inline: true },
        { name: 'New Balance', value: `$${newBalance}`, inline: true }
      ],
      timestamp: true
    });
  }
};

// Helper functions for dice game
function validateDiceBet(betType: string, targetNumber: number): string | null {
  if (targetNumber < 2 || targetNumber > 12) {
    return 'Target number must be between 2 and 12 (the possible outcomes of two dice).';
  }
  
  switch (betType) {
    case 'higher':
      if (targetNumber >= 12) {
        return 'For "higher than" bets, the target number must be less than 12.';
      }
      break;
    case 'lower':
      if (targetNumber <= 2) {
        return 'For "lower than" bets, the target number must be greater than 2.';
      }
      break;
    case 'exact':
      // No additional validation needed
      break;
    default:
      return 'Invalid bet type. Choose from: higher, lower, or exact.';
  }
  
  return null; // No error
}

function checkDiceWin(betType: string, targetNumber: number, diceResult: number): { isWin: boolean, payout: number } {
  switch (betType) {
    case 'higher':
      return { 
        isWin: diceResult > targetNumber, 
        payout: calculateHigherLowerPayout(targetNumber, 'higher')
      };
    case 'lower':
      return { 
        isWin: diceResult < targetNumber, 
        payout: calculateHigherLowerPayout(targetNumber, 'lower')
      };
    case 'exact':
      return { 
        isWin: diceResult === targetNumber, 
        payout: calculateExactPayout(targetNumber)
      };
    default:
      return { isWin: false, payout: 0 };
  }
}

// Calculate payouts based on probability
function calculateHigherLowerPayout(targetNumber: number, betType: 'higher' | 'lower'): number {
  // Calculate probability based on possible dice outcomes (2-12)
  const totalPossibleOutcomes = 36; // 6x6 dice combinations
  
  let favorableOutcomes = 0;
  
  if (betType === 'higher') {
    // Count outcomes where dice sum is higher than target
    for (let die1 = 1; die1 <= 6; die1++) {
      for (let die2 = 1; die2 <= 6; die2++) {
        if (die1 + die2 > targetNumber) {
          favorableOutcomes++;
        }
      }
    }
  } else { // 'lower'
    // Count outcomes where dice sum is lower than target
    for (let die1 = 1; die1 <= 6; die1++) {
      for (let die2 = 1; die2 <= 6; die2++) {
        if (die1 + die2 < targetNumber) {
          favorableOutcomes++;
        }
      }
    }
  }
  
  // Calculate fair payout (rounded)
  const probability = favorableOutcomes / totalPossibleOutcomes;
  const fairPayout = Math.round((1 / probability) * 0.9); // 10% house edge
  
  return Math.max(fairPayout, 2); // Minimum payout of 2
}

function calculateExactPayout(targetNumber: number): number {
  // Calculate probability based on possible dice outcomes (2-12)
  const totalPossibleOutcomes = 36; // 6x6 dice combinations
  
  // Count ways to get this exact sum
  let favorableOutcomes = 0;
  for (let die1 = 1; die1 <= 6; die1++) {
    for (let die2 = 1; die2 <= 6; die2++) {
      if (die1 + die2 === targetNumber) {
        favorableOutcomes++;
      }
    }
  }
  
  // Calculate payout with 10% house edge
  const probability = favorableOutcomes / totalPossibleOutcomes;
  const fairPayout = Math.round((1 / probability) * 0.9);
  
  return fairPayout;
}

function formatDiceBet(betType: string, targetNumber: number): string {
  switch (betType) {
    case 'higher':
      return `Roll Higher than ${targetNumber}`;
    case 'lower':
      return `Roll Lower than ${targetNumber}`;
    case 'exact':
      return `Roll Exactly ${targetNumber}`;
    default:
      return 'Unknown bet';
  }
}

function getDiceEmojis(die1: number, die2: number): string {
  const dieEmojis = [
    '', // placeholder for index 0
    '⚀', // 1
    '⚁', // 2
    '⚂', // 3
    '⚃', // 4
    '⚄', // 5
    '⚅'  // 6
  ];
  
  return `${dieEmojis[die1]} ${dieEmojis[die2]}`;
}

// Poker game command
export const pokerCommand: CommandHandler = {
  data: new SlashCommandBuilder()
    .setName('poker')
    .setDescription('Play a simplified 5-card draw poker game')
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('The amount to bet')
        .setRequired(true)
        .setMinValue(1)
    ) as SlashCommandBuilder,
  aliases: ['cards'],
  async execute(interaction: ChatInputCommandInteraction) {
    const bet = interaction.options.getInteger('bet', true);
    
    if (bet <= 0) {
      return createErrorEmbed('Your bet must be greater than 0.');
    }
    
    // Get user or create if doesn't exist
    let user = await storage.getUserByDiscordId(interaction.user.id);
    
    if (!user) {
      user = await storage.createUser({
        discordId: interaction.user.id,
        username: interaction.user.username,
        balance: 1000
      });
    }
    
    // Check if user has enough balance
    if (user.balance < bet) {
      return createErrorEmbed(`You don't have enough balance. Your current balance is $${user.balance}.`);
    }
    
    // Create a deck and deal player and dealer hands
    const deck = createDeckOfCards();
    shuffleDeckOfCards(deck);
    
    const playerHand = [];
    const dealerHand = [];
    
    // Deal 5 cards to each player
    for (let i = 0; i < 5; i++) {
      playerHand.push(drawCardFromDeck(deck));
      dealerHand.push(drawCardFromDeck(deck));
    }
    
    // Evaluate hands
    const playerHandRank = evaluatePokerHand(playerHand);
    const dealerHandRank = evaluatePokerHand(dealerHand);
    
    // Determine winner
    const isWin = playerHandRank.rank > dealerHandRank.rank || 
                 (playerHandRank.rank === dealerHandRank.rank && playerHandRank.highCard > dealerHandRank.highCard);
    const isTie = playerHandRank.rank === dealerHandRank.rank && playerHandRank.highCard === dealerHandRank.highCard;
    
    // Calculate winnings and payout
    let winnings = 0;
    let payout = 0;
    
    if (isWin) {
      payout = getPokerPayout(playerHandRank.rank);
      winnings = bet * payout;
    } else if (isTie) {
      winnings = bet; // Return the bet on a tie
    }
    
    const newBalance = user.balance - bet + winnings;
    
    // Update user stats
    const updatedUser = await storage.updateUser(user.id, {
      balance: newBalance,
      gamesPlayed: user.gamesPlayed + 1,
      gamesWon: user.gamesWon + (isWin ? 1 : 0),
      lastPlayed: new Date()
    });
    
    // Record the game
    await storage.createGame({
      gameType: 'poker',
      userId: user.id,
      bet,
      outcome: isWin ? 'win' : (isTie ? 'tie' : 'loss'),
      winAmount: isWin ? winnings - bet : (isTie ? 0 : -bet)
    });
    
    // Format hands for display
    const playerHandDisplay = formatPokerHand(playerHand);
    const dealerHandDisplay = formatPokerHand(dealerHand);
    
    // Create result description
    let resultDescription = `🃏 Your hand: ${playerHandDisplay} (${formatPokerRank(playerHandRank)})\n`;
    resultDescription += `🎰 Dealer's hand: ${dealerHandDisplay} (${formatPokerRank(dealerHandRank)})\n\n`;
    
    if (isWin) {
      resultDescription += `Congratulations! Your ${formatPokerRank(playerHandRank)} beat the dealer's ${formatPokerRank(dealerHandRank)}! You win **$${winnings}**!`;
    } else if (isTie) {
      resultDescription += `It's a tie! Both you and the dealer have ${formatPokerRank(playerHandRank)}. Your bet is returned.`;
    } else {
      resultDescription += `Sorry! Your ${formatPokerRank(playerHandRank)} lost to the dealer's ${formatPokerRank(dealerHandRank)}. You lose **$${bet}**.`;
    }
    
    const color = isWin ? COLORS.SUCCESS : (isTie ? COLORS.INFO : COLORS.ERROR);
    
    return createEmbed({
      title: `Poker - ${isWin ? 'WIN' : (isTie ? 'TIE' : 'LOSS')}`,
      description: resultDescription,
      color: color as ColorResolvable,
      fields: [
        { name: 'Your Hand', value: `${playerHandDisplay} (${formatPokerRank(playerHandRank)})`, inline: true },
        { name: 'Dealer\'s Hand', value: `${dealerHandDisplay} (${formatPokerRank(dealerHandRank)})`, inline: true },
        { name: 'Payout', value: isWin ? `${payout}:1` : (isTie ? '1:1' : '0:1'), inline: true },
        { name: 'Bet Amount', value: `$${bet}`, inline: true },
        { name: 'Winnings', value: isWin ? `$${winnings}` : (isTie ? `$${bet}` : '$0'), inline: true },
        { name: 'New Balance', value: `$${newBalance}`, inline: true }
      ],
      timestamp: true
    });
  },
  async handleMessage(message: Message, args: string[]) {
    if (args.length < 1) {
      return createErrorEmbed('Please provide your bet amount. Example: `poker 100`');
    }
    
    const bet = parseInt(args[0], 10);
    
    if (isNaN(bet) || bet <= 0) {
      return createErrorEmbed('Your bet must be a positive number.');
    }
    
    // Get user or create if doesn't exist
    let user = await storage.getUserByDiscordId(message.author.id);
    
    if (!user) {
      user = await storage.createUser({
        discordId: message.author.id,
        username: message.author.username,
        balance: 1000
      });
    }
    
    // Check if user has enough balance
    if (user.balance < bet) {
      return createErrorEmbed(`You don't have enough balance. Your current balance is $${user.balance}.`);
    }
    
    // Create a deck and deal player and dealer hands
    const deck = createDeckOfCards();
    shuffleDeckOfCards(deck);
    
    const playerHand = [];
    const dealerHand = [];
    
    // Deal 5 cards to each player
    for (let i = 0; i < 5; i++) {
      playerHand.push(drawCardFromDeck(deck));
      dealerHand.push(drawCardFromDeck(deck));
    }
    
    // Evaluate hands
    const playerHandRank = evaluatePokerHand(playerHand);
    const dealerHandRank = evaluatePokerHand(dealerHand);
    
    // Determine winner
    const isWin = playerHandRank.rank > dealerHandRank.rank || 
                 (playerHandRank.rank === dealerHandRank.rank && playerHandRank.highCard > dealerHandRank.highCard);
    const isTie = playerHandRank.rank === dealerHandRank.rank && playerHandRank.highCard === dealerHandRank.highCard;
    
    // Calculate winnings and payout
    let winnings = 0;
    let payout = 0;
    
    if (isWin) {
      payout = getPokerPayout(playerHandRank.rank);
      winnings = bet * payout;
    } else if (isTie) {
      winnings = bet; // Return the bet on a tie
    }
    
    const newBalance = user.balance - bet + winnings;
    
    // Update user stats
    const updatedUser = await storage.updateUser(user.id, {
      balance: newBalance,
      gamesPlayed: user.gamesPlayed + 1,
      gamesWon: user.gamesWon + (isWin ? 1 : 0),
      lastPlayed: new Date()
    });
    
    // Record the game
    await storage.createGame({
      gameType: 'poker',
      userId: user.id,
      bet,
      outcome: isWin ? 'win' : (isTie ? 'tie' : 'loss'),
      winAmount: isWin ? winnings - bet : (isTie ? 0 : -bet)
    });
    
    // Format hands for display
    const playerHandDisplay = formatPokerHand(playerHand);
    const dealerHandDisplay = formatPokerHand(dealerHand);
    
    // Create result description
    let resultDescription = `🃏 Your hand: ${playerHandDisplay} (${formatPokerRank(playerHandRank)})\n`;
    resultDescription += `🎰 Dealer's hand: ${dealerHandDisplay} (${formatPokerRank(dealerHandRank)})\n\n`;
    
    if (isWin) {
      resultDescription += `Congratulations! Your ${formatPokerRank(playerHandRank)} beat the dealer's ${formatPokerRank(dealerHandRank)}! You win **$${winnings}**!`;
    } else if (isTie) {
      resultDescription += `It's a tie! Both you and the dealer have ${formatPokerRank(playerHandRank)}. Your bet is returned.`;
    } else {
      resultDescription += `Sorry! Your ${formatPokerRank(playerHandRank)} lost to the dealer's ${formatPokerRank(dealerHandRank)}. You lose **$${bet}**.`;
    }
    
    const color = isWin ? COLORS.SUCCESS : (isTie ? COLORS.INFO : COLORS.ERROR);
    
    return createEmbed({
      title: `Poker - ${isWin ? 'WIN' : (isTie ? 'TIE' : 'LOSS')}`,
      description: resultDescription,
      color: color as ColorResolvable,
      fields: [
        { name: 'Your Hand', value: `${playerHandDisplay} (${formatPokerRank(playerHandRank)})`, inline: true },
        { name: 'Dealer\'s Hand', value: `${dealerHandDisplay} (${formatPokerRank(dealerHandRank)})`, inline: true },
        { name: 'Payout', value: isWin ? `${payout}:1` : (isTie ? '1:1' : '0:1'), inline: true },
        { name: 'Bet Amount', value: `$${bet}`, inline: true },
        { name: 'Winnings', value: isWin ? `$${winnings}` : (isTie ? `$${bet}` : '$0'), inline: true },
        { name: 'New Balance', value: `$${newBalance}`, inline: true }
      ],
      timestamp: true
    });
  }
};

// Poker helper functions
type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
type PokerCard = { suit: CardSuit; rank: CardRank; value: number };

// Hand ranks from lowest to highest
enum PokerHandRank {
  HighCard = 1,
  Pair,
  TwoPair,
  ThreeOfAKind,
  Straight,
  Flush,
  FullHouse,
  FourOfAKind,
  StraightFlush,
  RoyalFlush
}

type PokerHandResult = {
  rank: PokerHandRank;
  highCard: number;
  description: string;
};

function createDeckOfCards(): PokerCard[] {
  const suits: CardSuit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: CardRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const values: { [key in CardRank]: number } = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
  };
  
  const deck: PokerCard[] = [];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank, value: values[rank] });
    }
  }
  
  return deck;
}

function shuffleDeckOfCards(deck: PokerCard[]): void {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function drawCardFromDeck(deck: PokerCard[]): PokerCard {
  if (deck.length === 0) {
    throw new Error("Deck is empty");
  }
  return deck.pop()!;
}

function evaluatePokerHand(hand: PokerCard[]): PokerHandResult {
  // Sort hand by card value (highest first)
  const sortedHand = [...hand].sort((a, b) => b.value - a.value);
  const highestCard = sortedHand[0].value;
  
  // Check for flush (all cards same suit)
  const isFlush = hand.every(card => card.suit === hand[0].suit);
  
  // Check for straight (consecutive values)
  let isStraight = false;
  // Handle special case for A-5 straight
  if (
    sortedHand.some(card => card.rank === 'A') &&
    sortedHand.some(card => card.rank === '5') &&
    sortedHand.some(card => card.rank === '4') &&
    sortedHand.some(card => card.rank === '3') &&
    sortedHand.some(card => card.rank === '2')
  ) {
    isStraight = true;
  } else {
    // Normal straight check
    isStraight = sortedHand.every((card, index, arr) => {
      if (index === 0) return true;
      return card.value === arr[index - 1].value - 1;
    });
  }
  
  // Royal Flush
  if (isFlush && isStraight && highestCard === 14) {
    return { rank: PokerHandRank.RoyalFlush, highCard: highestCard, description: 'Royal Flush' };
  }
  
  // Straight Flush
  if (isFlush && isStraight) {
    return { rank: PokerHandRank.StraightFlush, highCard: highestCard, description: 'Straight Flush' };
  }
  
  // Count cards by rank
  const rankCounts: { [key: number]: number } = {};
  hand.forEach(card => {
    rankCounts[card.value] = (rankCounts[card.value] || 0) + 1;
  });
  
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const values = Object.entries(rankCounts)
    .map(([value, count]) => ({ value: parseInt(value), count }))
    .sort((a, b) => b.count - a.count || b.value - a.value);
  
  // Four of a Kind
  if (counts[0] === 4) {
    return { 
      rank: PokerHandRank.FourOfAKind, 
      highCard: parseInt(Object.keys(rankCounts).find(key => rankCounts[parseInt(key)] === 4) || "0"),
      description: 'Four of a Kind'
    };
  }
  
  // Full House
  if (counts[0] === 3 && counts[1] === 2) {
    return { 
      rank: PokerHandRank.FullHouse, 
      highCard: parseInt(Object.keys(rankCounts).find(key => rankCounts[parseInt(key)] === 3) || "0"),
      description: 'Full House'
    };
  }
  
  // Flush
  if (isFlush) {
    return { rank: PokerHandRank.Flush, highCard: highestCard, description: 'Flush' };
  }
  
  // Straight
  if (isStraight) {
    return { rank: PokerHandRank.Straight, highCard: highestCard, description: 'Straight' };
  }
  
  // Three of a Kind
  if (counts[0] === 3) {
    return { 
      rank: PokerHandRank.ThreeOfAKind, 
      highCard: parseInt(Object.keys(rankCounts).find(key => rankCounts[parseInt(key)] === 3) || "0"),
      description: 'Three of a Kind'
    };
  }
  
  // Two Pair
  if (counts[0] === 2 && counts[1] === 2) {
    // Get the higher pair as the high card
    const pairs = Object.keys(rankCounts)
      .filter(key => rankCounts[parseInt(key)] === 2)
      .map(key => parseInt(key))
      .sort((a, b) => b - a);
    
    return { rank: PokerHandRank.TwoPair, highCard: pairs[0], description: 'Two Pair' };
  }
  
  // Pair
  if (counts[0] === 2) {
    return { 
      rank: PokerHandRank.Pair, 
      highCard: parseInt(Object.keys(rankCounts).find(key => rankCounts[parseInt(key)] === 2) || "0"),
      description: 'Pair'
    };
  }
  
  // High Card
  return { rank: PokerHandRank.HighCard, highCard: highestCard, description: 'High Card' };
}

function formatPokerHand(hand: PokerCard[]): string {
  const suitEmojis: { [key in CardSuit]: string } = {
    'hearts': '♥️',
    'diamonds': '♦️',
    'clubs': '♣️',
    'spades': '♠️'
  };
  
  return hand.map(card => `${card.rank}${suitEmojis[card.suit]}`).join(' ');
}

function formatPokerRank(result: PokerHandResult): string {
  return result.description;
}

function getPokerPayout(handRank: PokerHandRank): number {
  // Set payout multipliers based on hand strength
  switch (handRank) {
    case PokerHandRank.RoyalFlush:
      return 100;
    case PokerHandRank.StraightFlush:
      return 50;
    case PokerHandRank.FourOfAKind:
      return 25;
    case PokerHandRank.FullHouse:
      return 10;
    case PokerHandRank.Flush:
      return 6;
    case PokerHandRank.Straight:
      return 4;
    case PokerHandRank.ThreeOfAKind:
      return 3;
    case PokerHandRank.TwoPair:
      return 2;
    case PokerHandRank.Pair:
      return 1;
    default:
      return 0;
  }
}

// Crash game command
export const crashCommand: CommandHandler = {
  data: new SlashCommandBuilder()
    .setName('crash')
    .setDescription('Play the crash game with a multiplier')
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('The amount to bet')
        .setRequired(true)
        .setMinValue(1)
    )
    .addNumberOption(option =>
      option.setName('cashout')
        .setDescription('Auto cashout multiplier (e.g. 2.0 = double your bet)')
        .setRequired(false)
        .setMinValue(1.1)
    ) as SlashCommandBuilder,
  aliases: ['boom'],
  async execute(interaction: ChatInputCommandInteraction) {
    const bet = interaction.options.getInteger('bet', true);
    const autoCashout = interaction.options.getNumber('cashout');
    
    if (bet <= 0) {
      return createErrorEmbed('Your bet must be greater than 0.');
    }
    
    // Get user or create if doesn't exist
    let user = await storage.getUserByDiscordId(interaction.user.id);
    
    if (!user) {
      user = await storage.createUser({
        discordId: interaction.user.id,
        username: interaction.user.username,
        balance: 1000
      });
    }
    
    // Check if user has enough balance
    if (user.balance < bet) {
      return createErrorEmbed(`You don't have enough balance. Your current balance is $${user.balance}.`);
    }
    
    // Initial response to acknowledge the command
    await interaction.deferReply();
    
    // Calculate crash point using a random exponential distribution
    // House edge is built into this calculation
    const houseEdge = 0.05; // 5% house edge
    const crashPoint = Math.max(1.0, Math.floor(generateCrashPoint(houseEdge) * 100) / 100);
    
    // Determine if player cashout is automatic or not
    const isAutoCashout = autoCashout !== null;
    const targetMultiplier = isAutoCashout ? autoCashout : Infinity;
    
    // Check if the player cashed out before the crash
    const playerCashedOut = targetMultiplier < crashPoint;
    const cashedOutAt = playerCashedOut ? targetMultiplier : crashPoint;
    
    // Calculate winnings
    let winnings = 0;
    if (playerCashedOut) {
      winnings = Math.floor(bet * cashedOutAt);
    }
    
    // Update user balance
    const newBalance = user.balance - bet + winnings;
    await storage.updateUser(user.id, {
      balance: newBalance,
      gamesPlayed: user.gamesPlayed + 1,
      gamesWon: user.gamesWon + (playerCashedOut ? 1 : 0),
      lastPlayed: new Date()
    });
    
    // Record the game
    await storage.createGame({
      gameType: 'crash',
      userId: user.id,
      bet,
      outcome: playerCashedOut ? 'win' : 'loss',
      winAmount: playerCashedOut ? winnings - bet : -bet
    });
    
    // Prepare the message
    let multiplierChart = '';
    for (let i = 0; i < 10; i++) {
      if (i / 10 < crashPoint) {
        multiplierChart += '📈 ';
      } else {
        break;
      }
    }
    multiplierChart += '💥';
    
    // Create result description
    let resultDescription = `${multiplierChart}\n\n`;
    resultDescription += `**Crash point:** ${crashPoint.toFixed(2)}x\n\n`;
    
    if (isAutoCashout) {
      resultDescription += `Your auto cashout was set to: ${autoCashout.toFixed(2)}x\n`;
    }
    
    if (playerCashedOut) {
      resultDescription += `✅ You cashed out at **${cashedOutAt.toFixed(2)}x** multiplier and won **$${winnings}**!`;
    } else {
      resultDescription += `❌ The game crashed at ${crashPoint.toFixed(2)}x before you could cash out. You lost **$${bet}**.`;
    }
    
    const color = playerCashedOut ? COLORS.SUCCESS : COLORS.ERROR;
    
    return createEmbed({
      title: `Crash Game - ${playerCashedOut ? 'CASHED OUT' : 'CRASHED'}`,
      description: resultDescription,
      color: color as ColorResolvable,
      fields: [
        { name: 'Crash Point', value: `${crashPoint.toFixed(2)}x`, inline: true },
        { name: playerCashedOut ? 'Cashed Out At' : 'Crashed At', value: `${cashedOutAt.toFixed(2)}x`, inline: true },
        { name: 'Bet Amount', value: `$${bet}`, inline: true },
        { name: 'Winnings', value: playerCashedOut ? `$${winnings}` : '$0', inline: true },
        { name: 'Net Profit', value: playerCashedOut ? `$${winnings - bet}` : `-$${bet}`, inline: true },
        { name: 'New Balance', value: `$${newBalance}`, inline: true }
      ],
      timestamp: true
    });
  },
  async handleMessage(message: Message, args: string[]) {
    if (args.length < 1) {
      return createErrorEmbed('Please provide your bet amount. Example: `crash 100 2.5` (bet 100, auto cashout at 2.5x)');
    }
    
    const bet = parseInt(args[0], 10);
    const autoCashout = args.length > 1 ? parseFloat(args[1]) : null;
    
    if (isNaN(bet) || bet <= 0) {
      return createErrorEmbed('Your bet must be a positive number.');
    }
    
    if (autoCashout !== null && (isNaN(autoCashout) || autoCashout < 1.1)) {
      return createErrorEmbed('Auto cashout multiplier must be at least 1.1.');
    }
    
    // Get user or create if doesn't exist
    let user = await storage.getUserByDiscordId(message.author.id);
    
    if (!user) {
      user = await storage.createUser({
        discordId: message.author.id,
        username: message.author.username,
        balance: 1000
      });
    }
    
    // Check if user has enough balance
    if (user.balance < bet) {
      return createErrorEmbed(`You don't have enough balance. Your current balance is $${user.balance}.`);
    }
    
    // Calculate crash point using a random exponential distribution
    // House edge is built into this calculation
    const houseEdge = 0.05; // 5% house edge
    const crashPoint = Math.max(1.0, Math.floor(generateCrashPoint(houseEdge) * 100) / 100);
    
    // Determine if player cashout is automatic or not
    const isAutoCashout = autoCashout !== null;
    const targetMultiplier = isAutoCashout ? autoCashout : Infinity;
    
    // Check if the player cashed out before the crash
    const playerCashedOut = targetMultiplier < crashPoint;
    const cashedOutAt = playerCashedOut ? targetMultiplier : crashPoint;
    
    // Calculate winnings
    let winnings = 0;
    if (playerCashedOut) {
      winnings = Math.floor(bet * cashedOutAt);
    }
    
    // Update user balance
    const newBalance = user.balance - bet + winnings;
    await storage.updateUser(user.id, {
      balance: newBalance,
      gamesPlayed: user.gamesPlayed + 1,
      gamesWon: user.gamesWon + (playerCashedOut ? 1 : 0),
      lastPlayed: new Date()
    });
    
    // Record the game
    await storage.createGame({
      gameType: 'crash',
      userId: user.id,
      bet,
      outcome: playerCashedOut ? 'win' : 'loss',
      winAmount: playerCashedOut ? winnings - bet : -bet
    });
    
    // Prepare the message
    let multiplierChart = '';
    for (let i = 0; i < 10; i++) {
      if (i / 10 < crashPoint) {
        multiplierChart += '📈 ';
      } else {
        break;
      }
    }
    multiplierChart += '💥';
    
    // Create result description
    let resultDescription = `${multiplierChart}\n\n`;
    resultDescription += `**Crash point:** ${crashPoint.toFixed(2)}x\n\n`;
    
    if (isAutoCashout) {
      resultDescription += `Your auto cashout was set to: ${autoCashout.toFixed(2)}x\n`;
    }
    
    if (playerCashedOut) {
      resultDescription += `✅ You cashed out at **${cashedOutAt.toFixed(2)}x** multiplier and won **$${winnings}**!`;
    } else {
      resultDescription += `❌ The game crashed at ${crashPoint.toFixed(2)}x before you could cash out. You lost **$${bet}**.`;
    }
    
    const color = playerCashedOut ? COLORS.SUCCESS : COLORS.ERROR;
    
    return createEmbed({
      title: `Crash Game - ${playerCashedOut ? 'CASHED OUT' : 'CRASHED'}`,
      description: resultDescription,
      color: color as ColorResolvable,
      fields: [
        { name: 'Crash Point', value: `${crashPoint.toFixed(2)}x`, inline: true },
        { name: playerCashedOut ? 'Cashed Out At' : 'Crashed At', value: `${cashedOutAt.toFixed(2)}x`, inline: true },
        { name: 'Bet Amount', value: `$${bet}`, inline: true },
        { name: 'Winnings', value: playerCashedOut ? `$${winnings}` : '$0', inline: true },
        { name: 'Net Profit', value: playerCashedOut ? `$${winnings - bet}` : `-$${bet}`, inline: true },
        { name: 'New Balance', value: `$${newBalance}`, inline: true }
      ],
      timestamp: true
    });
  }
};

// Helper function for the crash game
function generateCrashPoint(houseEdge: number): number {
  // Generate a random number between 0 and 1
  const randomValue = Math.random();
  
  // Using the inverse of CDF for exponential distribution
  // Adjusted to account for house edge
  const crashPoint = 1 / (1 - randomValue) * (1 - houseEdge);
  
  return crashPoint;
}

// Hi-Lo (Higher or Lower) game command
export const hiloCommand: CommandHandler = {
  data: new SlashCommandBuilder()
    .setName('hilo')
    .setDescription('Play the Higher-or-Lower card game with multipliers')
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('The amount to bet')
        .setRequired(true)
        .setMinValue(1)
    ) as SlashCommandBuilder,
  aliases: ['highlow', 'higherlow'],
  async execute(interaction: ChatInputCommandInteraction) {
    const bet = interaction.options.getInteger('bet', true);
    
    if (bet <= 0) {
      return createErrorEmbed('Your bet must be greater than 0.');
    }
    
    // Get user or create if doesn't exist
    let user = await storage.getUserByDiscordId(interaction.user.id);
    
    if (!user) {
      user = await storage.createUser({
        discordId: interaction.user.id,
        username: interaction.user.username,
        balance: 1000
      });
    }
    
    // Check if user has enough balance
    if (user.balance < bet) {
      return createErrorEmbed(`You don't have enough balance. Your current balance is $${user.balance}.`);
    }
    
    // Create a deck of cards (simplified)
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    // Assign numeric values to cards for comparison
    const cardValues: { [key: string]: number } = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
      'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    
    // Draw the first card
    const firstCardIndex = Math.floor(Math.random() * values.length);
    const firstCardValue = values[firstCardIndex];
    const firstCardSuit = suits[Math.floor(Math.random() * suits.length)];
    const firstCardNumericValue = cardValues[firstCardValue];
    
    // Show first card and ask player to guess
    const initialEmbed = createEmbed({
      title: "Hi-Lo Game",
      description: `Your card is **${firstCardValue}** of ${firstCardSuit}\n\nChoose "Higher" if you think the next card will be higher, or "Lower" if you think it will be lower.\n\nYour bet: $${bet}`,
      color: COLORS.INFO as ColorResolvable,
      fields: [
        { name: 'Current Card', value: `${firstCardValue} of ${firstCardSuit}`, inline: true },
        { name: 'Your Balance', value: `$${user.balance}`, inline: true },
        { name: 'Bet Amount', value: `$${bet}`, inline: true }
      ],
      timestamp: true
    });
    
    // Use buttons for higher/lower options
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('higher')
          .setLabel('Higher')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('lower')
          .setLabel('Lower')
          .setStyle(ButtonStyle.Danger)
      );
    
    const response = await interaction.reply({
      embeds: [initialEmbed],
      components: [row],
      fetchReply: true
    });
    
    // Create a button interaction collector
    const filter = (i: any) => 
      (i.customId === 'higher' || i.customId === 'lower') && 
      i.user.id === interaction.user.id;
    
    try {
      const confirmation = await response.awaitMessageComponent({ 
        filter, 
        time: 20_000 
      }) as ButtonInteraction;
      
      // Player has made their choice
      const playerChoice = confirmation.customId; // 'higher' or 'lower'
      
      // Draw the second card
      let secondCardIndex = Math.floor(Math.random() * values.length);
      // Ensure second card is different from the first
      while (secondCardIndex === firstCardIndex) {
        secondCardIndex = Math.floor(Math.random() * values.length);
      }
      const secondCardValue = values[secondCardIndex];
      const secondCardSuit = suits[Math.floor(Math.random() * suits.length)];
      const secondCardNumericValue = cardValues[secondCardValue];
      
      // Determine if player won
      const isHigher = secondCardNumericValue > firstCardNumericValue;
      const isLower = secondCardNumericValue < firstCardNumericValue;
      const isTie = secondCardNumericValue === firstCardNumericValue;
      
      const playerWon = (playerChoice === 'higher' && isHigher) || 
                        (playerChoice === 'lower' && isLower);
      
      // Calculate winnings
      // Payout is based on probabilities
      let winnings = 0;
      let multiplier = 0;
      
      if (playerWon) {
        // Calculate win multiplier based on how unlikely the outcome was
        const totalCards = values.length;
        if (playerChoice === 'higher') {
          const cardsHigher = totalCards - firstCardIndex - 1;
          multiplier = Math.max(1.1, (totalCards / cardsHigher) * 0.95); // 5% house edge
        } else { // 'lower'
          const cardsLower = firstCardIndex;
          multiplier = Math.max(1.1, (totalCards / cardsLower) * 0.95); // 5% house edge
        }
        
        // Round to 2 decimal places
        multiplier = Math.round(multiplier * 100) / 100;
        winnings = Math.floor(bet * multiplier);
      }
      
      // Update user balance
      const newBalance = user.balance - bet + winnings;
      await storage.updateUser(user.id, {
        balance: newBalance,
        gamesPlayed: user.gamesPlayed + 1,
        gamesWon: user.gamesWon + (playerWon ? 1 : 0),
        lastPlayed: new Date()
      });
      
      // Record the game
      await storage.createGame({
        gameType: 'hilo',
        userId: user.id,
        bet,
        outcome: playerWon ? 'win' : (isTie ? 'tie' : 'loss'),
        winAmount: playerWon ? winnings - bet : -bet
      });
      
      // Create result description
      let resultDescription = `First card: **${firstCardValue}** of ${firstCardSuit}\n`;
      resultDescription += `Second card: **${secondCardValue}** of ${secondCardSuit}\n\n`;
      resultDescription += `You chose: **${playerChoice.charAt(0).toUpperCase() + playerChoice.slice(1)}**\n\n`;
      
      if (playerWon) {
        resultDescription += `✅ You won! The second card was ${isHigher ? 'higher' : 'lower'} than the first card.\n`;
        resultDescription += `Multiplier: **${multiplier.toFixed(2)}x**\n`;
        resultDescription += `You win **$${winnings}**!`;
      } else if (isTie) {
        resultDescription += `⚠️ It's a tie! The cards are of equal value. Your bet is returned.`;
      } else {
        resultDescription += `❌ You lost! The second card was ${isHigher ? 'higher' : 'lower'} than the first card.\n`;
        resultDescription += `You lose your bet of **$${bet}**.`;
      }
      
      const color = playerWon ? COLORS.SUCCESS : (isTie ? COLORS.INFO : COLORS.ERROR);
      
      const resultEmbed = createEmbed({
        title: `Hi-Lo Game - ${playerWon ? 'WIN' : (isTie ? 'TIE' : 'LOSS')}`,
        description: resultDescription,
        color: color as ColorResolvable,
        fields: [
          { name: 'First Card', value: `${firstCardValue} of ${firstCardSuit}`, inline: true },
          { name: 'Second Card', value: `${secondCardValue} of ${secondCardSuit}`, inline: true },
          { name: 'Your Choice', value: playerChoice.charAt(0).toUpperCase() + playerChoice.slice(1), inline: true },
          { name: 'Bet Amount', value: `$${bet}`, inline: true },
          { name: 'Winnings', value: playerWon ? `$${winnings}` : '$0', inline: true },
          { name: 'New Balance', value: `$${newBalance}`, inline: true }
        ],
        timestamp: true
      });
      
      // Update the message with the result
      await confirmation.update({
        embeds: [resultEmbed],
        components: []
      });
      
    } catch (error) {
      // Time ran out or error occurred
      const timeoutEmbed = createEmbed({
        title: "Hi-Lo Game - CANCELLED",
        description: "You didn't choose in time or an error occurred. Your bet has been returned.",
        color: COLORS.SECONDARY as ColorResolvable,
        timestamp: true
      });
      
      await interaction.editReply({
        embeds: [timeoutEmbed],
        components: []
      });
    }
    
    return null; // Already sent response through the button interaction
  },
  async handleMessage(message: Message, args: string[]) {
    if (args.length < 2) {
      return createErrorEmbed('Please provide your bet amount and your choice (higher/lower). Example: `hilo 100 higher`');
    }
    
    const bet = parseInt(args[0], 10);
    const playerChoice = args[1].toLowerCase();
    
    if (isNaN(bet) || bet <= 0) {
      return createErrorEmbed('Your bet must be a positive number.');
    }
    
    if (playerChoice !== 'higher' && playerChoice !== 'lower') {
      return createErrorEmbed('Your choice must be either "higher" or "lower".');
    }
    
    // Get user or create if doesn't exist
    let user = await storage.getUserByDiscordId(message.author.id);
    
    if (!user) {
      user = await storage.createUser({
        discordId: message.author.id,
        username: message.author.username,
        balance: 1000
      });
    }
    
    // Check if user has enough balance
    if (user.balance < bet) {
      return createErrorEmbed(`You don't have enough balance. Your current balance is $${user.balance}.`);
    }
    
    // Create a deck of cards (simplified)
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    // Assign numeric values to cards for comparison
    const cardValues: { [key: string]: number } = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
      'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    
    // Draw two cards
    const firstCardIndex = Math.floor(Math.random() * values.length);
    const firstCardValue = values[firstCardIndex];
    const firstCardSuit = suits[Math.floor(Math.random() * suits.length)];
    const firstCardNumericValue = cardValues[firstCardValue];
    
    let secondCardIndex = Math.floor(Math.random() * values.length);
    // Ensure second card is different from the first
    while (secondCardIndex === firstCardIndex) {
      secondCardIndex = Math.floor(Math.random() * values.length);
    }
    const secondCardValue = values[secondCardIndex];
    const secondCardSuit = suits[Math.floor(Math.random() * suits.length)];
    const secondCardNumericValue = cardValues[secondCardValue];
    
    // Determine if player won
    const isHigher = secondCardNumericValue > firstCardNumericValue;
    const isLower = secondCardNumericValue < firstCardNumericValue;
    const isTie = secondCardNumericValue === firstCardNumericValue;
    
    const playerWon = (playerChoice === 'higher' && isHigher) || 
                      (playerChoice === 'lower' && isLower);
    
    // Calculate winnings
    // Payout is based on probabilities
    let winnings = 0;
    let multiplier = 0;
    
    if (playerWon) {
      // Calculate win multiplier based on how unlikely the outcome was
      const totalCards = values.length;
      if (playerChoice === 'higher') {
        const cardsHigher = totalCards - firstCardIndex - 1;
        multiplier = Math.max(1.1, (totalCards / cardsHigher) * 0.95); // 5% house edge
      } else { // 'lower'
        const cardsLower = firstCardIndex;
        multiplier = Math.max(1.1, (totalCards / cardsLower) * 0.95); // 5% house edge
      }
      
      // Round to 2 decimal places
      multiplier = Math.round(multiplier * 100) / 100;
      winnings = Math.floor(bet * multiplier);
    } else if (isTie) {
      winnings = bet; // Return bet on tie
    }
    
    // Update user balance
    const newBalance = user.balance - bet + winnings;
    await storage.updateUser(user.id, {
      balance: newBalance,
      gamesPlayed: user.gamesPlayed + 1,
      gamesWon: user.gamesWon + (playerWon ? 1 : 0),
      lastPlayed: new Date()
    });
    
    // Record the game
    await storage.createGame({
      gameType: 'hilo',
      userId: user.id,
      bet,
      outcome: playerWon ? 'win' : (isTie ? 'tie' : 'loss'),
      winAmount: playerWon ? winnings - bet : (isTie ? 0 : -bet)
    });
    
    // Create result description
    let resultDescription = `First card: **${firstCardValue}** of ${firstCardSuit}\n`;
    resultDescription += `Second card: **${secondCardValue}** of ${secondCardSuit}\n\n`;
    resultDescription += `You chose: **${playerChoice.charAt(0).toUpperCase() + playerChoice.slice(1)}**\n\n`;
    
    if (playerWon) {
      resultDescription += `✅ You won! The second card was ${isHigher ? 'higher' : 'lower'} than the first card.\n`;
      resultDescription += `Multiplier: **${multiplier.toFixed(2)}x**\n`;
      resultDescription += `You win **$${winnings}**!`;
    } else if (isTie) {
      resultDescription += `⚠️ It's a tie! The cards are of equal value. Your bet is returned.`;
    } else {
      resultDescription += `❌ You lost! The second card was ${isHigher ? 'higher' : 'lower'} than the first card.\n`;
      resultDescription += `You lose your bet of **$${bet}**.`;
    }
    
    const color = playerWon ? COLORS.SUCCESS : (isTie ? COLORS.INFO : COLORS.ERROR);
    
    return createEmbed({
      title: `Hi-Lo Game - ${playerWon ? 'WIN' : (isTie ? 'TIE' : 'LOSS')}`,
      description: resultDescription,
      color: color as ColorResolvable,
      fields: [
        { name: 'First Card', value: `${firstCardValue} of ${firstCardSuit}`, inline: true },
        { name: 'Second Card', value: `${secondCardValue} of ${secondCardSuit}`, inline: true },
        { name: 'Your Choice', value: playerChoice.charAt(0).toUpperCase() + playerChoice.slice(1), inline: true },
        { name: 'Bet Amount', value: `$${bet}`, inline: true },
        { name: 'Winnings', value: playerWon ? `$${winnings}` : (isTie ? `$${bet}` : '$0'), inline: true },
        { name: 'New Balance', value: `$${newBalance}`, inline: true }
      ],
      timestamp: true
    });
  }
};

// MegaMultiplier game with potential for huge (up to 100,000x) multipliers
export const megaMultiplierCommand: CommandHandler = {
  data: new SlashCommandBuilder()
    .setName('megamultiplier')
    .setDescription('High-risk, high-reward game with multipliers up to 100,000x')
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('The amount to bet')
        .setRequired(true)
        .setMinValue(1)
    )
    .addIntegerOption(option =>
      option.setName('risk')
        .setDescription('Risk level (1-10). Higher risk means bigger potential multipliers but lower odds')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10)
    ) as SlashCommandBuilder,
  aliases: ['megawin', 'megamulti'],
  async execute(interaction: ChatInputCommandInteraction) {
    const bet = interaction.options.getInteger('bet', true);
    const riskLevel = interaction.options.getInteger('risk') || 5; // Default risk level is 5
    
    if (bet <= 0) {
      return createErrorEmbed('Your bet must be greater than 0.');
    }
    
    // Get user or create if doesn't exist
    let user = await storage.getUserByDiscordId(interaction.user.id);
    
    if (!user) {
      user = await storage.createUser({
        discordId: interaction.user.id,
        username: interaction.user.username,
        balance: 1000
      });
    }
    
    // Check if user has enough balance
    if (user.balance < bet) {
      return createErrorEmbed(`You don't have enough balance. Your current balance is $${user.balance}.`);
    }
    
    // Calculate win probability based on risk level
    // Higher risk = lower probability but higher potential rewards
    const baseProbability = 0.25; // 25% base win rate
    const riskFactor = riskLevel / 10; // Risk factor between 0.1 and 1.0
    const winProbability = baseProbability * (1 - (riskFactor * 0.8)); // Reduces win probability as risk increases
    
    // Generate random number to determine outcome
    const randomValue = Math.random();
    const playerWon = randomValue < winProbability;
    
    // Calculate multiplier based on risk level if player won
    let multiplier = 0;
    if (playerWon) {
      // Base multiplier range (2x-10x for risk level 1)
      const baseMultiplierMin = 2;
      const baseMultiplierMax = 10;
      
      // As risk increases, multiplier range expands exponentially
      // Risk level 10 can potentially reach up to 100,000x
      const maxPossibleMultiplier = Math.pow(10, 1 + riskLevel / 2); // Grows exponentially with risk
      
      // Generate a random multiplier using exponential distribution
      // This creates more common lower multipliers and rare massive multipliers
      // The higher the risk, the more skewed toward high values
      const randomFactor = Math.pow(Math.random(), 2 - riskFactor); // Controls curve steepness
      multiplier = baseMultiplierMin + (maxPossibleMultiplier - baseMultiplierMin) * (1 - randomFactor);
      
      // Apply some randomness to make it less predictable
      multiplier *= 0.9 + Math.random() * 0.2;
      
      // Round to 2 decimal places for smaller multipliers, whole numbers for larger ones
      if (multiplier < 100) {
        multiplier = Math.round(multiplier * 100) / 100;
      } else {
        multiplier = Math.floor(multiplier);
      }
      
      // Cap at exactly 100,000 for presentation
      multiplier = Math.min(multiplier, 100000);
    }
    
    // Calculate winnings
    const winnings = playerWon ? Math.floor(bet * multiplier) : 0;
    
    // Update user balance
    const newBalance = user.balance - bet + winnings;
    await storage.updateUser(user.id, {
      balance: newBalance,
      gamesPlayed: user.gamesPlayed + 1,
      gamesWon: user.gamesWon + (playerWon ? 1 : 0),
      lastPlayed: new Date()
    });
    
    // Record the game
    await storage.createGame({
      gameType: 'megamultiplier',
      userId: user.id,
      bet,
      outcome: playerWon ? 'win' : 'loss',
      winAmount: playerWon ? winnings - bet : -bet
    });
    
    // Create visual representation of the multiplier magnitude if player won
    let multiplierVisual = '';
    if (playerWon) {
      if (multiplier < 10) {
        multiplierVisual = '🔹';
      } else if (multiplier < 50) {
        multiplierVisual = '🔹🔹';
      } else if (multiplier < 100) {
        multiplierVisual = '🔹🔹🔹';
      } else if (multiplier < 500) {
        multiplierVisual = '🔷🔷';
      } else if (multiplier < 1000) {
        multiplierVisual = '🔷🔷🔷';
      } else if (multiplier < 5000) {
        multiplierVisual = '💎💎';
      } else if (multiplier < 10000) {
        multiplierVisual = '💎💎💎';
      } else if (multiplier < 50000) {
        multiplierVisual = '💠💠💠💠';
      } else {
        multiplierVisual = '💠💠💠💠💠';
      }
    }
    
    // Create result description
    let resultDescription = `**Risk Level:** ${riskLevel}/10\n\n`;
    
    if (playerWon) {
      resultDescription += `${multiplierVisual} **MEGA WIN!** ${multiplierVisual}\n\n`;
      resultDescription += `✅ You hit a massive **${multiplier.toLocaleString()}x** multiplier!\n`;
      resultDescription += `You win **$${winnings.toLocaleString()}**!`;
      
      // Add special messages for extraordinary wins
      if (multiplier >= 1000) {
        resultDescription += `\n\n🎉 **INCREDIBLE!** You've hit a rare ${multiplier.toLocaleString()}x multiplier! 🎉`;
      }
      if (multiplier >= 10000) {
        resultDescription += `\n\n🔥 **LEGENDARY WIN!** Only 1 in ${Math.floor(10000 * riskLevel)} players hit this! 🔥`;
      }
      if (multiplier >= 50000) {
        resultDescription += `\n\n👑 **JACKPOT ROYALE!** You've made history with this win! 👑`;
      }
    } else {
      resultDescription += `❌ Unfortunately, you didn't hit a multiplier this time.\n`;
      resultDescription += `You lose your bet of **$${bet}**.`;
      resultDescription += `\n\nTry again or adjust your risk level for different odds!`;
    }
    
    const color = playerWon ? COLORS.SUCCESS : COLORS.ERROR;
    
    return createEmbed({
      title: playerWon ? `MegaMultiplier - ${multiplier.toLocaleString()}x WIN!` : 'MegaMultiplier - LOSS',
      description: resultDescription,
      color: color as ColorResolvable,
      fields: [
        { name: 'Risk Level', value: `${riskLevel}/10`, inline: true },
        { name: 'Win Chance', value: `${Math.round(winProbability * 100)}%`, inline: true },
        { name: 'Bet Amount', value: `$${bet}`, inline: true },
        { name: 'Multiplier', value: playerWon ? `${multiplier.toLocaleString()}x` : 'N/A', inline: true },
        { name: 'Winnings', value: playerWon ? `$${winnings.toLocaleString()}` : '$0', inline: true },
        { name: 'New Balance', value: `$${newBalance.toLocaleString()}`, inline: true }
      ],
      timestamp: true
    });
  },
  async handleMessage(message: Message, args: string[]) {
    if (args.length < 1) {
      return createErrorEmbed('Please provide your bet amount. Example: `megamultiplier 100` or `megamultiplier 100 8` (bet 100 with risk level 8)');
    }
    
    const bet = parseInt(args[0], 10);
    const riskLevel = args.length > 1 ? parseInt(args[1], 10) : 5; // Default risk level is 5
    
    if (isNaN(bet) || bet <= 0) {
      return createErrorEmbed('Your bet must be a positive number.');
    }
    
    if (isNaN(riskLevel) || riskLevel < 1 || riskLevel > 10) {
      return createErrorEmbed('Risk level must be between 1 and 10.');
    }
    
    // Get user or create if doesn't exist
    let user = await storage.getUserByDiscordId(message.author.id);
    
    if (!user) {
      user = await storage.createUser({
        discordId: message.author.id,
        username: message.author.username,
        balance: 1000
      });
    }
    
    // Check if user has enough balance
    if (user.balance < bet) {
      return createErrorEmbed(`You don't have enough balance. Your current balance is $${user.balance}.`);
    }
    
    // Calculate win probability based on risk level
    // Higher risk = lower probability but higher potential rewards
    const baseProbability = 0.25; // 25% base win rate
    const riskFactor = riskLevel / 10; // Risk factor between 0.1 and 1.0
    const winProbability = baseProbability * (1 - (riskFactor * 0.8)); // Reduces win probability as risk increases
    
    // Generate random number to determine outcome
    const randomValue = Math.random();
    const playerWon = randomValue < winProbability;
    
    // Calculate multiplier based on risk level if player won
    let multiplier = 0;
    if (playerWon) {
      // Base multiplier range (2x-10x for risk level 1)
      const baseMultiplierMin = 2;
      const baseMultiplierMax = 10;
      
      // As risk increases, multiplier range expands exponentially
      // Risk level 10 can potentially reach up to 100,000x
      const maxPossibleMultiplier = Math.pow(10, 1 + riskLevel / 2); // Grows exponentially with risk
      
      // Generate a random multiplier using exponential distribution
      // This creates more common lower multipliers and rare massive multipliers
      // The higher the risk, the more skewed toward high values
      const randomFactor = Math.pow(Math.random(), 2 - riskFactor); // Controls curve steepness
      multiplier = baseMultiplierMin + (maxPossibleMultiplier - baseMultiplierMin) * (1 - randomFactor);
      
      // Apply some randomness to make it less predictable
      multiplier *= 0.9 + Math.random() * 0.2;
      
      // Round to 2 decimal places for smaller multipliers, whole numbers for larger ones
      if (multiplier < 100) {
        multiplier = Math.round(multiplier * 100) / 100;
      } else {
        multiplier = Math.floor(multiplier);
      }
      
      // Cap at exactly 100,000 for presentation
      multiplier = Math.min(multiplier, 100000);
    }
    
    // Calculate winnings
    const winnings = playerWon ? Math.floor(bet * multiplier) : 0;
    
    // Update user balance
    const newBalance = user.balance - bet + winnings;
    await storage.updateUser(user.id, {
      balance: newBalance,
      gamesPlayed: user.gamesPlayed + 1,
      gamesWon: user.gamesWon + (playerWon ? 1 : 0),
      lastPlayed: new Date()
    });
    
    // Record the game
    await storage.createGame({
      gameType: 'megamultiplier',
      userId: user.id,
      bet,
      outcome: playerWon ? 'win' : 'loss',
      winAmount: playerWon ? winnings - bet : -bet
    });
    
    // Create visual representation of the multiplier magnitude if player won
    let multiplierVisual = '';
    if (playerWon) {
      if (multiplier < 10) {
        multiplierVisual = '🔹';
      } else if (multiplier < 50) {
        multiplierVisual = '🔹🔹';
      } else if (multiplier < 100) {
        multiplierVisual = '🔹🔹🔹';
      } else if (multiplier < 500) {
        multiplierVisual = '🔷🔷';
      } else if (multiplier < 1000) {
        multiplierVisual = '🔷🔷🔷';
      } else if (multiplier < 5000) {
        multiplierVisual = '💎💎';
      } else if (multiplier < 10000) {
        multiplierVisual = '💎💎💎';
      } else if (multiplier < 50000) {
        multiplierVisual = '💠💠💠💠';
      } else {
        multiplierVisual = '💠💠💠💠💠';
      }
    }
    
    // Create result description
    let resultDescription = `**Risk Level:** ${riskLevel}/10\n\n`;
    
    if (playerWon) {
      resultDescription += `${multiplierVisual} **MEGA WIN!** ${multiplierVisual}\n\n`;
      resultDescription += `✅ You hit a massive **${multiplier.toLocaleString()}x** multiplier!\n`;
      resultDescription += `You win **$${winnings.toLocaleString()}**!`;
      
      // Add special messages for extraordinary wins
      if (multiplier >= 1000) {
        resultDescription += `\n\n🎉 **INCREDIBLE!** You've hit a rare ${multiplier.toLocaleString()}x multiplier! 🎉`;
      }
      if (multiplier >= 10000) {
        resultDescription += `\n\n🔥 **LEGENDARY WIN!** Only 1 in ${Math.floor(10000 * riskLevel)} players hit this! 🔥`;
      }
      if (multiplier >= 50000) {
        resultDescription += `\n\n👑 **JACKPOT ROYALE!** You've made history with this win! 👑`;
      }
    } else {
      resultDescription += `❌ Unfortunately, you didn't hit a multiplier this time.\n`;
      resultDescription += `You lose your bet of **$${bet}**.`;
      resultDescription += `\n\nTry again or adjust your risk level for different odds!`;
    }
    
    const color = playerWon ? COLORS.SUCCESS : COLORS.ERROR;
    
    return createEmbed({
      title: playerWon ? `MegaMultiplier - ${multiplier.toLocaleString()}x WIN!` : 'MegaMultiplier - LOSS',
      description: resultDescription,
      color: color as ColorResolvable,
      fields: [
        { name: 'Risk Level', value: `${riskLevel}/10`, inline: true },
        { name: 'Win Chance', value: `${Math.round(winProbability * 100)}%`, inline: true },
        { name: 'Bet Amount', value: `$${bet}`, inline: true },
        { name: 'Multiplier', value: playerWon ? `${multiplier.toLocaleString()}x` : 'N/A', inline: true },
        { name: 'Winnings', value: playerWon ? `$${winnings.toLocaleString()}` : '$0', inline: true },
        { name: 'New Balance', value: `$${newBalance.toLocaleString()}`, inline: true }
      ],
      timestamp: true
    });
  }
};

// Export all commands in a map for easy access
export const commands: { [key: string]: CommandHandler } = {
  help: helpCommand,
  delete_my_data: deleteMyDataCommand,
  donate: donateCommand,
  invite: inviteCommand,
  stats: statsCommand,
  support: supportCommand,
  coinflip: coinflipCommand,
  slots: slotsCommand,
  blackjack: blackjackCommand,
  roulette: rouletteCommand,
  dice: diceCommand,
  poker: pokerCommand,
  crash: crashCommand,
  hilo: hiloCommand,
  megamultiplier: megaMultiplierCommand,
};

// Command aliases for message-based commands
export const aliases: { [key: string]: string } = {};

// Register aliases
Object.entries(commands).forEach(([name, handler]) => {
  if (handler.aliases) {
    handler.aliases.forEach(alias => {
      aliases[alias] = name;
    });
  }
});
