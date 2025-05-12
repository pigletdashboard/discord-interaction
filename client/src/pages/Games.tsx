import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Game } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

export default function Games() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ['/api/bot/games'],
  });
  
  const defaultGames: Game[] = [
    {
      id: "coinflip",
      name: "Coin Flip",
      description: "Bet on heads or tails and flip a coin to win double your bet",
      playCount: 43289,
      winRate: 49.2,
    },
    {
      id: "blackjack",
      name: "Blackjack",
      description: "Play blackjack against the dealer and try to get as close to 21 as possible",
      playCount: 28431,
      winRate: 42.5,
    },
    {
      id: "slots",
      name: "Slots",
      description: "Spin the slot machine and try to match symbols to win big",
      playCount: 15782,
      winRate: 32.1,
    },
    {
      id: "roulette",
      name: "Roulette",
      description: "Bet on numbers, colors, or groups and spin the wheel to win",
      playCount: 8943,
      winRate: 37.8,
    },
    {
      id: "dice",
      name: "Dice Roll",
      description: "Roll dice and bet on the outcome to win big",
      playCount: 5821,
      winRate: 35.2,
    },
  ];
  
  const displayGames = games || defaultGames;
  
  const filteredGames = displayGames
    .filter(game => 
      game.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      game.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.playCount - a.playCount);

  return (
    <div className="flex h-screen overflow-hidden bg-discord-background text-discord-light">
      <Sidebar />
      
      <div className="flex-1 flex flex-col bg-discord-dark overflow-hidden">
        <Topbar title="Gambling Games" />
        
        <main className="flex-1 overflow-y-auto p-4">
          <Card className="bg-discord-darker border-none p-4 mb-6">
            <CardHeader>
              <CardTitle className="text-white text-lg">All Games</CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-search text-discord-gray"></i>
                  </div>
                  <Input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 rounded-md bg-discord-background text-discord-light border-none focus:ring-2 focus:ring-primary"
                    placeholder="Search games..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-3xl text-primary mb-4"></i>
                  <p>Loading games...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredGames.map((game) => (
                    <Card key={game.id} className="bg-discord-dark border border-discord-hover">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-discord-blurple text-white mr-3">
                              <i className="fas fa-dice"></i>
                            </div>
                            <div>
                              <h4 className="font-medium text-white">{game.name}</h4>
                              <p className="text-sm text-discord-light">{game.description}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-discord-light mb-1">Play Count</p>
                            <p className="text-lg font-semibold text-white">{game.playCount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-discord-light mb-1">Win Rate</p>
                            <div className="flex items-center">
                              <Progress value={game.winRate} className="h-2.5 flex-1 mr-2" />
                              <span className="text-sm font-medium">{game.winRate}%</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {filteredGames.length === 0 && (
                    <div className="text-center py-6">
                      <p>No games found matching "{searchTerm}"</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
