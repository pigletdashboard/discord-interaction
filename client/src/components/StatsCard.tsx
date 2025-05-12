import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  growth: string;
  icon: string;
  color: string;
}

export default function StatsCard({ title, value, growth, icon, color }: StatsCardProps) {
  return (
    <Card className="bg-discord-darker border-none">
      <CardContent className="p-4">
        <div className="flex items-center">
          <div className={`p-3 rounded-full bg-opacity-20 ${color} text-${color}`}>
            <i className={`fas ${icon}`}></i>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-discord-light">{title}</h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-white">{value.toLocaleString()}</span>
              <span className="ml-2 text-xs text-discord-green">{growth}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
