import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Sidebar() {
  const [location] = useLocation();
  
  const navItems = [
    {
      path: "/",
      name: "Dashboard",
      icon: "fa-tachometer-alt",
    },
    {
      path: "/commands",
      name: "Commands",
      icon: "fa-terminal",
    },
    {
      path: "/games",
      name: "Games",
      icon: "fa-gamepad",
    },
    {
      path: "/userdata",
      name: "User Data",
      icon: "fa-database",
    },
    {
      path: "/statistics",
      name: "Statistics",
      icon: "fa-chart-bar",
    },
    {
      path: "/settings",
      name: "Settings",
      icon: "fa-cog",
    },
  ];

  return (
    <div className="w-16 md:w-64 bg-discord-darker flex-shrink-0 h-screen">
      <div className="flex flex-col h-full">
        {/* Logo and Header */}
        <div className="py-4 px-4 flex items-center justify-center md:justify-start">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center relative">
            <i className="fas fa-dice-d20 text-white text-xl"></i>
            <div className="absolute w-3 h-3 bg-discord-green rounded-full -bottom-1 -right-1 border-2 border-discord-darker"></div>
          </div>
          <h1 className="hidden md:block ml-3 text-white font-bold">Discord Gambling Bot</h1>
        </div>
        
        {/* Navigation */}
        <nav className="mt-5 flex-1">
          <div className="px-2 space-y-1">
            {navItems.map((item) => (
              <TooltipProvider key={item.path}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={item.path}>
                      <a
                        className={cn(
                          "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                          location === item.path
                            ? "bg-discord-selected text-white"
                            : "text-discord-light hover:bg-discord-hover"
                        )}
                      >
                        <i className={`fas ${item.icon} w-6 h-6 mr-3 text-center`}></i>
                        <span className="hidden md:inline">{item.name}</span>
                      </a>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="md:hidden">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </nav>
        
        {/* Bot Status */}
        <div className="p-4 border-t border-discord-hover">
          <div className="flex items-center">
            <div className="relative">
              <div className="w-3 h-3 bg-discord-green rounded-full absolute -top-1 -right-1">
                <span className="absolute inline-flex h-full w-full rounded-full bg-discord-green opacity-75 animate-ping"></span>
              </div>
              <i className="fas fa-robot text-discord-light"></i>
            </div>
            <div className="ml-3 hidden md:block">
              <p className="text-sm font-medium text-white">Bot Status</p>
              <p className="text-xs text-discord-green">Online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
