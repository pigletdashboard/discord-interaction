import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TopbarProps {
  title: string;
}

export default function Topbar({ title }: TopbarProps) {
  return (
    <header className="bg-discord-dark border-b border-discord-hover p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        <div className="flex items-center space-x-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-discord-light hover:text-white">
                <i className="fas fa-bell"></i>
              </button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-discord-light hover:text-white">
                <i className="fas fa-question-circle"></i>
              </button>
            </TooltipTrigger>
            <TooltipContent>Help</TooltipContent>
          </Tooltip>

          <Button 
            variant="default"
            className="bg-primary hover:bg-opacity-80 text-white"
            onClick={() => window.open('https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands', '_blank')}
          >
            Invite Bot
          </Button>
        </div>
      </div>
    </header>
  );
}
