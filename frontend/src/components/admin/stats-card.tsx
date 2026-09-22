import type { LucideIcon } from 'lucide-react';
import { Card } from '../ui/card';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
}

export function StatsCard({ icon: Icon, label, value, color }: StatsCardProps) {
  return (
    <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </Card>
  );
}
