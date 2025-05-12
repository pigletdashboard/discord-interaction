import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface BotSettings {
  prefix: string;
  defaultCurrency: string;
  startingBalance: number;
  logCommands: boolean;
  allowUserReset: boolean;
  cooldownMinutes: number;
  gameEnabled: {
    coinflip: boolean;
    blackjack: boolean;
    slots: boolean;
    roulette: boolean;
    dice: boolean;
  };
}

export default function Settings() {
  const { data: settings, isLoading } = useQuery<BotSettings>({
    queryKey: ['/api/bot/settings'],
  });
  
  const defaultSettings: BotSettings = {
    prefix: "!",
    defaultCurrency: "$",
    startingBalance: 1000,
    logCommands: true,
    allowUserReset: true,
    cooldownMinutes: 5,
    gameEnabled: {
      coinflip: true,
      blackjack: true,
      slots: true,
      roulette: true,
      dice: true,
    }
  };
  
  const [formData, setFormData] = useState<BotSettings>(settings || defaultSettings);
  
  const handleChange = (field: keyof BotSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleGameToggle = (game: keyof BotSettings['gameEnabled'], checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      gameEnabled: {
        ...prev.gameEnabled,
        [game]: checked
      }
    }));
  };
  
  const handleSaveSettings = async () => {
    try {
      await apiRequest("POST", "/api/bot/settings", formData);
      
      queryClient.invalidateQueries({
        queryKey: ['/api/bot/settings'],
      });
      
      toast({
        title: "Settings Saved",
        description: "Bot settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save bot settings.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-discord-background text-discord-light">
      <Sidebar />
      
      <div className="flex-1 flex flex-col bg-discord-dark overflow-hidden">
        <Topbar title="Bot Settings" />
        
        <main className="flex-1 overflow-y-auto p-4">
          <Card className="bg-discord-darker border-none p-4 mb-6">
            <CardHeader>
              <CardTitle className="text-white text-lg">Bot Configuration</CardTitle>
              <CardDescription>
                Manage the bot's settings and configuration options
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-3xl text-primary mb-4"></i>
                  <p>Loading settings...</p>
                </div>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveSettings();
                }}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="prefix">Command Prefix</Label>
                        <Input
                          id="prefix"
                          className="bg-discord-background border-discord-hover text-white"
                          value={formData.prefix}
                          onChange={(e) => handleChange('prefix', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="currency">Default Currency</Label>
                        <Input
                          id="currency"
                          className="bg-discord-background border-discord-hover text-white"
                          value={formData.defaultCurrency}
                          onChange={(e) => handleChange('defaultCurrency', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="balance">Starting Balance</Label>
                        <Input
                          id="balance"
                          type="number"
                          className="bg-discord-background border-discord-hover text-white"
                          value={formData.startingBalance}
                          onChange={(e) => handleChange('startingBalance', parseInt(e.target.value))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cooldown">Command Cooldown (minutes)</Label>
                        <Input
                          id="cooldown"
                          type="number"
                          className="bg-discord-background border-discord-hover text-white"
                          value={formData.cooldownMinutes}
                          onChange={(e) => handleChange('cooldownMinutes', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    
                    <Separator className="my-6 bg-discord-hover" />
                    
                    <div className="space-y-4">
                      <h3 className="text-white font-medium">Bot Behavior</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Log Commands</Label>
                          <p className="text-sm text-discord-light">Log all command usage to the database</p>
                        </div>
                        <Switch
                          checked={formData.logCommands}
                          onCheckedChange={(checked) => handleChange('logCommands', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Allow User Reset</Label>
                          <p className="text-sm text-discord-light">Let users reset their own data</p>
                        </div>
                        <Switch
                          checked={formData.allowUserReset}
                          onCheckedChange={(checked) => handleChange('allowUserReset', checked)}
                        />
                      </div>
                    </div>
                    
                    <Separator className="my-6 bg-discord-hover" />
                    
                    <div className="space-y-4">
                      <h3 className="text-white font-medium">Game Settings</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 bg-discord-background rounded-lg">
                          <div>
                            <Label className="font-medium">Coin Flip</Label>
                          </div>
                          <Switch
                            checked={formData.gameEnabled.coinflip}
                            onCheckedChange={(checked) => handleGameToggle('coinflip', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-discord-background rounded-lg">
                          <div>
                            <Label className="font-medium">Blackjack</Label>
                          </div>
                          <Switch
                            checked={formData.gameEnabled.blackjack}
                            onCheckedChange={(checked) => handleGameToggle('blackjack', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-discord-background rounded-lg">
                          <div>
                            <Label className="font-medium">Slots</Label>
                          </div>
                          <Switch
                            checked={formData.gameEnabled.slots}
                            onCheckedChange={(checked) => handleGameToggle('slots', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-discord-background rounded-lg">
                          <div>
                            <Label className="font-medium">Roulette</Label>
                          </div>
                          <Switch
                            checked={formData.gameEnabled.roulette}
                            onCheckedChange={(checked) => handleGameToggle('roulette', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-discord-background rounded-lg">
                          <div>
                            <Label className="font-medium">Dice Roll</Label>
                          </div>
                          <Switch
                            checked={formData.gameEnabled.dice}
                            onCheckedChange={(checked) => handleGameToggle('dice', checked)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Button type="submit" className="bg-primary hover:bg-opacity-80 text-white">
                        Save Settings
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
