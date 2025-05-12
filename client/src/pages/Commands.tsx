import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import CommandCard from "@/components/CommandCard";
import { Command } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

export default function Commands() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: commands, isLoading, isError } = useQuery<Command[]>({
    queryKey: ['/api/bot/commands']
  });

  const handleSyncCommands = async () => {
    try {
      await apiRequest("POST", "/api/bot/sync", {});
      toast({
        title: "Commands Synced",
        description: "All commands have been synced with Discord successfully.",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync commands with Discord.",
        variant: "destructive",
      });
    }
  };
  
  const filteredCommands = commands?.filter((cmd: Command) => 
    cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cmd.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Fallback commands for initial render
  const defaultCommands: Command[] = [
    {
      name: "help",
      description: "Show help for all commands",
      helpText: "Show the help for all the commands available in the bot",
      options: [
        {
          name: "command_name",
          type: "STRING",
          required: false,
          description: "The command to look up"
        }
      ],
      alternatives: [
        "@Discord Gambling Bot help [<command> | <alias> | bets | guild | player | games]",
        "@Discord Gambling Bot h [<command> | <alias> | bets | guild | player | games]",
        "@Discord Gambling Bot wtf [<command> | <alias> | bets | guild | player | games]"
      ],
      examples: [
        "@Discord Gambling Bot help",
        "@Discord Gambling Bot help help",
        "@Discord Gambling Bot help connectFour",
        "@Discord Gambling Bot help c4"
      ],
      icon: "fa-question",
      color: "discord-blurple"
    },
    {
      name: "delete_my_data",
      description: "Clear all your data from the bot",
      helpText: "The command used to clear all of your data from the bot. Use this if you want to start from scratch",
      alternatives: [
        "@Discord Gambling Bot deleteMyData"
      ],
      icon: "fa-trash-alt",
      color: "discord-red"
    },
    {
      name: "donate",
      description: "Shares a link to donate to the bot",
      helpText: "Shares a link to donate to the bot",
      alternatives: [
        "@Discord Gambling Bot donate"
      ],
      examples: [
        "@Discord Gambling Bot donate",
        "@Discord Gambling Bot donate paypal",
        "@Discord Gambling Bot donate patreon"
      ],
      icon: "fa-donate",
      color: "discord-green"
    },
    {
      name: "invite",
      description: "Shares the details of how to add the bot",
      helpText: "Shares the details of how to add the bot",
      alternatives: [
        "@Discord Gambling Bot invite"
      ],
      icon: "fa-plus",
      color: "purple-500"
    },
    {
      name: "stats",
      description: "Shows bot stats including ping, player count, etc.",
      helpText: "Shows a selection of bot stats including ping, player count, guild count etc.",
      alternatives: [
        "@Discord Gambling Bot stats",
        "@Discord Gambling Bot ping",
        "@Discord Gambling Bot status",
        "@Discord Gambling Bot about",
        "@Discord Gambling Bot info",
        "@Discord Gambling Bot owner"
      ],
      icon: "fa-chart-bar",
      color: "blue-500"
    },
    {
      name: "support",
      description: "Shares a link to the support server",
      helpText: "Shares a link to the support server",
      alternatives: [
        "@Discord Gambling Bot support"
      ],
      icon: "fa-hands-helping",
      color: "yellow-500"
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-discord-background text-discord-light">
      <Sidebar />
      
      <div className="flex-1 flex flex-col bg-discord-dark overflow-hidden">
        <Topbar title="Commands Dashboard" />
        
        <main className="flex-1 overflow-y-auto p-4">
          <Card className="bg-discord-darker border-none p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Slash Commands</h3>
              <Button 
                className="bg-primary hover:bg-opacity-80 text-white"
                onClick={handleSyncCommands}
              >
                <i className="fas fa-sync-alt mr-1"></i> Sync Commands
              </Button>
            </div>
            
            {/* Commands Search */}
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-discord-gray"></i>
                </div>
                <Input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 rounded-md bg-discord-background text-discord-light border-none focus:ring-2 focus:ring-primary"
                  placeholder="Search commands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Command Cards */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-3xl text-primary mb-4"></i>
                  <p>Loading commands...</p>
                </div>
              ) : filteredCommands.length > 0 ? (
                filteredCommands.map((command: Command, index: number) => (
                  <CommandCard key={index} command={command} />
                ))
              ) : defaultCommands
                .filter((cmd: Command) => 
                  cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  cmd.description.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((command: Command, index: number) => (
                  <CommandCard key={index} command={command} />
                ))
              }
              
              {!isLoading && filteredCommands.length === 0 && searchTerm !== "" && (
                <div className="text-center py-6">
                  <p>No commands found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
