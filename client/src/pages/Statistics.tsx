import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import StatsCard from "@/components/StatsCard";
import { GameStats, UserGameStats, LeaderboardPlayer } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function Statistics() {
  // Fetch game statistics
  const { data: gameStats, isLoading: gameStatsLoading } = useQuery<GameStats[]>({
    queryKey: ['/api/bot/statistics/games']
  });
  
  // Fetch top players
  const { data: topPlayers, isLoading: topPlayersLoading } = useQuery<LeaderboardPlayer[]>({
    queryKey: ['/api/bot/statistics/leaderboard/players']
  });
  
  // Fetch most profitable games
  const { data: mostProfitableGames, isLoading: profitableGamesLoading } = useQuery<GameStats[]>({
    queryKey: ['/api/bot/statistics/leaderboard/mostProfitable']
  });
  
  // Fetch least profitable games
  const { data: leastProfitableGames, isLoading: leastProfitableGamesLoading } = useQuery<GameStats[]>({
    queryKey: ['/api/bot/statistics/leaderboard/leastProfitable']
  });
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  // Format percentage
  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return "0%";
    return `${Math.round((value / total) * 100)}%`;
  };
  
  // Calculate summary statistics
  const summaryStats = {
    totalGamesPlayed: gameStats?.reduce((sum, game) => sum + game.totalPlayed, 0) || 0,
    totalWagered: gameStats?.reduce((sum, game) => sum + game.totalWagered, 0) || 0,
    totalPaidOut: gameStats?.reduce((sum, game) => sum + game.totalPaidOut, 0) || 0,
    houseProfit: gameStats?.reduce((sum, game) => sum + game.totalProfitLoss, 0) || 0,
  };
  
  // Calculate house edge
  const houseEdge = summaryStats.totalWagered > 0 
    ? (summaryStats.houseProfit / summaryStats.totalWagered) * 100 
    : 0;
  
  return (
    <div className="flex h-screen overflow-hidden bg-discord-background text-discord-light">
      <Sidebar />
      
      <div className="flex-1 flex flex-col bg-discord-dark overflow-hidden">
        <Topbar title="Statistics" />
        
        <main className="flex-1 overflow-y-auto p-4">
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard 
              title="Total Games Played"
              value={summaryStats.totalGamesPlayed}
              growth="+15%"
              icon="fa-gamepad"
              color="text-purple-500"
            />
            
            <StatsCard 
              title="Total Wagered"
              value={formatCurrency(summaryStats.totalWagered)}
              growth="+20%"
              icon="fa-coins"
              color="text-yellow-500"
            />
            
            <StatsCard 
              title="Total Payouts"
              value={formatCurrency(summaryStats.totalPaidOut)}
              growth="+18%"
              icon="fa-wallet"
              color="text-green-500"
            />
            
            <StatsCard 
              title="House Profit"
              value={formatCurrency(summaryStats.houseProfit)}
              growth="+12%"
              icon="fa-chart-line"
              color="text-blue-500"
            />
          </div>
          
          {/* Tabs for different statistics views */}
          <Tabs defaultValue="games" className="mb-6">
            <TabsList className="bg-discord-background w-full justify-start mb-4">
              <TabsTrigger value="games">Game Statistics</TabsTrigger>
              <TabsTrigger value="leaderboard">Player Leaderboard</TabsTrigger>
              <TabsTrigger value="profitability">Game Profitability</TabsTrigger>
            </TabsList>
            
            {/* Game Statistics Tab */}
            <TabsContent value="games">
              <Card className="bg-discord-darker border-none">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Game Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Game</TableHead>
                          <TableHead>Total Played</TableHead>
                          <TableHead>Total Wagered</TableHead>
                          <TableHead>Total Paid Out</TableHead>
                          <TableHead>House Edge</TableHead>
                          <TableHead>Largest Win</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gameStatsLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                          </TableRow>
                        ) : gameStats && gameStats.length > 0 ? (
                          gameStats.map((game) => (
                            <TableRow key={game.id}>
                              <TableCell className="font-medium">{game.gameType}</TableCell>
                              <TableCell>{game.totalPlayed.toLocaleString()}</TableCell>
                              <TableCell>{formatCurrency(game.totalWagered)}</TableCell>
                              <TableCell>{formatCurrency(game.totalPaidOut)}</TableCell>
                              <TableCell>
                                {game.totalWagered > 0 
                                  ? `${(game.totalProfitLoss / game.totalWagered * 100).toFixed(2)}%` 
                                  : "0%"}
                              </TableCell>
                              <TableCell>{formatCurrency(game.highestWin)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center">No game statistics available</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Player Leaderboard Tab */}
            <TabsContent value="leaderboard">
              <Card className="bg-discord-darker border-none">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Top Players</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>Player</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Net Profit/Loss</TableHead>
                          <TableHead>Games Played</TableHead>
                          <TableHead>Win Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topPlayersLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                          </TableRow>
                        ) : topPlayers && topPlayers.length > 0 ? (
                          topPlayers.map((player, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{index + 1}</TableCell>
                              <TableCell>{player.username}</TableCell>
                              <TableCell>{formatCurrency(player.balance)}</TableCell>
                              <TableCell className={player.netProfitLoss >= 0 ? "text-green-500" : "text-red-500"}>
                                {formatCurrency(player.netProfitLoss)}
                              </TableCell>
                              <TableCell>{player.gamesPlayed.toLocaleString()}</TableCell>
                              <TableCell>{player.winRate}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center">No player data available</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Game Profitability Tab */}
            <TabsContent value="profitability">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-discord-darker border-none">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Most Profitable Games</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {profitableGamesLoading ? (
                        <p>Loading...</p>
                      ) : mostProfitableGames && mostProfitableGames.length > 0 ? (
                        mostProfitableGames.slice(0, 5).map((game) => (
                          <div key={game.id}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{game.gameType}</span>
                              <span className="text-sm font-medium">{formatCurrency(game.totalProfitLoss)}</span>
                            </div>
                            <Progress 
                              value={game.totalProfitLoss / (mostProfitableGames[0]?.totalProfitLoss || 1) * 100} 
                              className="h-2" 
                            />
                          </div>
                        ))
                      ) : (
                        <p className="text-center">No profitability data available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-discord-darker border-none">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Player-Friendly Games</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {leastProfitableGamesLoading ? (
                        <p>Loading...</p>
                      ) : leastProfitableGames && leastProfitableGames.length > 0 ? (
                        leastProfitableGames.slice(0, 5).map((game) => (
                          <div key={game.id}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{game.gameType}</span>
                              <span className="text-sm font-medium">{formatCurrency(game.totalProfitLoss)}</span>
                            </div>
                            <Progress 
                              value={Math.abs(game.totalProfitLoss) / (Math.abs(leastProfitableGames[0]?.totalProfitLoss) || 1) * 100} 
                              className="h-2" 
                            />
                          </div>
                        ))
                      ) : (
                        <p className="text-center">No profitability data available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* House Edge Summary */}
          <Card className="bg-discord-darker border-none mb-6">
            <CardHeader>
              <CardTitle className="text-white text-lg">House Edge Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall House Edge</span>
                <span className="text-sm font-medium">{houseEdge.toFixed(2)}%</span>
              </div>
              <Progress value={houseEdge} max={20} className="h-2 mb-4" />
              
              <div className="text-sm text-discord-light/80 mt-4">
                <p className="mb-2">
                  <strong>Total Wagered:</strong> {formatCurrency(summaryStats.totalWagered)}
                </p>
                <p className="mb-2">
                  <strong>Total Paid Out:</strong> {formatCurrency(summaryStats.totalPaidOut)}
                </p>
                <p>
                  <strong>House Profit:</strong> {formatCurrency(summaryStats.houseProfit)}
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}