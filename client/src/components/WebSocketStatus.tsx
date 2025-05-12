import { Card, CardContent } from "@/components/ui/card";
import { ConnectionStatus } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export default function WebSocketStatus() {
  const { data, isLoading, isError } = useQuery<ConnectionStatus>({
    queryKey: ['/api/bot/status'],
    refetchInterval: 5000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return (
    <Card className="bg-discord-darker border-none">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h3 className="text-white font-medium">WebSocket Connection</h3>
            <div className="flex items-center mt-1">
              <div className={`w-3 h-3 ${isLoading || !data ? 'bg-yellow-500' : data.state === 'connected' ? 'bg-discord-green' : 'bg-discord-red'} rounded-full mr-2`}>
                {(isLoading || !data || data?.state === 'connected') && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-discord-green opacity-75 animate-ping"></span>
                )}
              </div>
              <span className="text-sm text-discord-light">
                {isLoading ? 'Checking connection...' : 
                  isError ? 'Connection error (using mock data)' :
                  !data ? 'Connecting to Discord API...' : 
                  data.state === 'connected' ? 'Connected to Discord API' : 
                  data.state === 'reconnecting' ? 'Reconnecting...' : 
                  'Disconnected from Discord API'}
              </span>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-discord-light">Ping</p>
              <p className="text-lg font-bold text-white">{isLoading || isError || !data ? '--' : `${data.ping}ms`}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-discord-light">Uptime</p>
              <p className="text-lg font-bold text-white">{isLoading || isError || !data ? '--' : data.uptime}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
