import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import StatsCard from "@/components/StatsCard";
import WebSocketStatus from "@/components/WebSocketStatus";
import { BotStats } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { data: stats, isLoading, isError } = useQuery<BotStats>({
    queryKey: ['/api/bot/stats']
  });
  
  const placeholderStats: BotStats = {
    servers: { count: 1247, growth: "+12%" },
    users: { count: 42853, growth: "+8%" },
    commands: { count: 189452, growth: "+23%" },
    games: { count: 78921, growth: "+15%" }
  };
  
  const displayStats = stats || placeholderStats;

  return (
    <div className="flex h-screen overflow-hidden bg-discord-background text-discord-light">
      <Sidebar />
      
      <div className="flex-1 flex flex-col bg-discord-dark overflow-hidden">
        <Topbar title="Dashboard" />
        
        <main className="flex-1 overflow-y-auto p-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard 
              title="Servers"
              value={displayStats.servers.count}
              growth={displayStats.servers.growth}
              icon="fa-server"
              color="text-blue-500"
            />
            
            <StatsCard 
              title="Users"
              value={displayStats.users.count}
              growth={displayStats.users.growth}
              icon="fa-users"
              color="text-green-500"
            />
            
            <StatsCard 
              title="Commands"
              value={displayStats.commands.count}
              growth={displayStats.commands.growth}
              icon="fa-terminal" 
              color="text-purple-500"
            />
            
            <StatsCard 
              title="Games Played"
              value={displayStats.games.count}
              growth={displayStats.games.growth}
              icon="fa-dice"
              color="text-yellow-500"
            />
          </div>
          
          {/* WebSocket Status */}
          <div className="mb-6">
            <WebSocketStatus />
          </div>
          
          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card className="bg-discord-darker border-none">
              <CardHeader>
                <CardTitle className="text-white text-lg">Popular Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Coin Flip</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Blackjack</span>
                      <span className="text-sm font-medium">32%</span>
                    </div>
                    <Progress value={32} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Slots</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Roulette</span>
                      <span className="text-sm font-medium">8%</span>
                    </div>
                    <Progress value={8} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-discord-darker border-none">
              <CardHeader>
                <CardTitle className="text-white text-lg">Top Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-md bg-discord-background">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-3">
                        <span className="text-xs">1</span>
                      </div>
                      <span>GamblingKing#1234</span>
                    </div>
                    <span className="font-semibold">$24,531</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-md bg-discord-background">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-3">
                        <span className="text-xs">2</span>
                      </div>
                      <span>LuckyStrike#5678</span>
                    </div>
                    <span className="font-semibold">$18,274</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-md bg-discord-background">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-3">
                        <span className="text-xs">3</span>
                      </div>
                      <span>CardShark#9012</span>
                    </div>
                    <span className="font-semibold">$12,839</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
