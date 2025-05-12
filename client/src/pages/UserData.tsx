import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { GamblingUser } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

export default function UserData() {
  const [searchTerm, setSearchTerm] = useState("");
  const [userToDelete, setUserToDelete] = useState<GamblingUser | null>(null);
  
  const { data: users, isLoading } = useQuery<GamblingUser[]>({
    queryKey: ['/api/bot/users'],
  });
  
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/bot/users/${userToDelete.id}`, {});
      
      queryClient.invalidateQueries({
        queryKey: ['/api/bot/users'],
      });
      
      toast({
        title: "User Deleted",
        description: `User ${userToDelete.username} has been deleted successfully.`,
      });
      
      setUserToDelete(null);
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete user data.",
        variant: "destructive",
      });
    }
  };
  
  const defaultUsers: GamblingUser[] = [
    {
      id: 1,
      discordId: "123456789012345678",
      username: "GamblingKing#1234",
      balance: 24531,
      gamesPlayed: 432,
      gamesWon: 187,
      lastPlayed: "2023-06-12T15:24:32Z",
    },
    {
      id: 2,
      discordId: "234567890123456789",
      username: "LuckyStrike#5678",
      balance: 18274,
      gamesPlayed: 315,
      gamesWon: 142,
      lastPlayed: "2023-06-13T09:12:45Z",
    },
    {
      id: 3,
      discordId: "345678901234567890",
      username: "CardShark#9012",
      balance: 12839,
      gamesPlayed: 267,
      gamesWon: 103,
      lastPlayed: "2023-06-13T11:38:21Z",
    },
    {
      id: 4,
      discordId: "456789012345678901",
      username: "HighRoller#3456",
      balance: 8752,
      gamesPlayed: 198,
      gamesWon: 82,
      lastPlayed: "2023-06-12T22:45:18Z",
    },
    {
      id: 5,
      discordId: "567890123456789012",
      username: "JackpotJane#7890",
      balance: 6543,
      gamesPlayed: 154,
      gamesWon: 61,
      lastPlayed: "2023-06-13T14:03:52Z",
    },
  ];
  
  const displayUsers = users || defaultUsers;
  
  const filteredUsers = displayUsers
    .filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.discordId.includes(searchTerm)
    )
    .sort((a, b) => b.balance - a.balance);

  return (
    <div className="flex h-screen overflow-hidden bg-discord-background text-discord-light">
      <Sidebar />
      
      <div className="flex-1 flex flex-col bg-discord-dark overflow-hidden">
        <Topbar title="User Data" />
        
        <main className="flex-1 overflow-y-auto p-4">
          <Card className="bg-discord-darker border-none p-4 mb-6">
            <CardHeader>
              <CardTitle className="text-white text-lg">All Users</CardTitle>
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
                    placeholder="Search users by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-3xl text-primary mb-4"></i>
                  <p>Loading users...</p>
                </div>
              ) : (
                <div className="rounded-md border border-discord-hover overflow-hidden">
                  <Table>
                    <TableHeader className="bg-discord-background">
                      <TableRow className="hover:bg-transparent border-discord-hover">
                        <TableHead className="text-discord-light">Username</TableHead>
                        <TableHead className="text-discord-light text-right">Balance</TableHead>
                        <TableHead className="text-discord-light text-right hidden md:table-cell">Games Played</TableHead>
                        <TableHead className="text-discord-light text-right hidden md:table-cell">Games Won</TableHead>
                        <TableHead className="text-discord-light text-right hidden lg:table-cell">Last Played</TableHead>
                        <TableHead className="text-discord-light text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-discord-hover border-discord-hover">
                          <TableCell className="font-medium text-white">
                            {user.username}
                            <div className="text-xs text-discord-light mt-1">{user.discordId}</div>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-400">${user.balance.toLocaleString()}</TableCell>
                          <TableCell className="text-right hidden md:table-cell">{user.gamesPlayed.toLocaleString()}</TableCell>
                          <TableCell className="text-right hidden md:table-cell">{user.gamesWon.toLocaleString()}</TableCell>
                          <TableCell className="text-right hidden lg:table-cell">
                            {new Date(user.lastPlayed).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => setUserToDelete(user)}
                            >
                              <i className="fas fa-trash-alt mr-1"></i> Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-6 bg-discord-background">
                      <p>No users found matching "{searchTerm}"</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent className="bg-discord-dark border-discord-hover">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete User Data</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the data for {userToDelete?.username}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-discord-background hover:bg-discord-hover text-discord-light">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteUser}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
