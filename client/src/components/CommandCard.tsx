import { useState } from "react";
import { Command } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

interface CommandCardProps {
  command: Command;
}

export default function CommandCard({ command }: CommandCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="command-card bg-discord-dark border border-discord-hover transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-0">
        <div 
          className="p-4 cursor-pointer" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className={`bg-${command.color} text-white w-10 h-10 rounded-lg flex items-center justify-center`}>
                <i className={`fas ${command.icon}`}></i>
              </div>
              <div className="ml-4">
                <h4 className="text-white font-medium">/{command.name}</h4>
                <p className="text-discord-light text-sm">{command.description}</p>
              </div>
            </div>
            <div>
              <i className={`fas fa-chevron-down text-discord-light transform transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
            </div>
          </div>
        </div>
        
        {isOpen && (
          <div className="px-4 pb-4 pt-1">
            <div className="bg-discord-background rounded-md p-3">
              {command.options && command.options.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm text-discord-light font-medium mb-1">Options</h5>
                  {command.options.map((option, index) => (
                    <div key={index} className="flex items-center mb-1">
                      <code className="font-mono text-xs bg-discord-darker text-discord-light px-2 py-1 rounded">{option.name}</code>
                      <span className="ml-2 text-xs text-discord-light">
                        {option.type} {option.required ? '' : '(optional)'} - {option.description}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mb-3">
                <h5 className="text-sm text-discord-light font-medium mb-1">Help Text</h5>
                <p className="text-sm text-discord-light">{command.helpText}</p>
              </div>
              
              {command.alternatives && command.alternatives.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm text-discord-light font-medium mb-1">Alternatives</h5>
                  <div className="space-y-1">
                    {command.alternatives.map((alt, index) => (
                      <code key={index} className="block font-mono text-xs bg-discord-darker text-discord-light px-2 py-1 rounded">
                        {alt}
                      </code>
                    ))}
                  </div>
                </div>
              )}
              
              {command.examples && command.examples.length > 0 && (
                <div>
                  <h5 className="text-sm text-discord-light font-medium mb-1">Examples</h5>
                  <div className="space-y-1">
                    {command.examples.map((example, index) => (
                      <code key={index} className="block font-mono text-xs bg-discord-darker text-discord-light px-2 py-1 rounded">
                        {example}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
