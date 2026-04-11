import React from "react";
import { Progress } from "@/components/ui/progress";

interface StatsListProps {
  data: [string, number][];
  total: number;
  title: string;
}

export function StatsList({ data, total, title }: StatsListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">Visits</span>
      </div>
      <div className="space-y-3">
        {data.map(([name, count]) => (
          <div key={name} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="truncate font-medium max-w-[200px]" title={name}>
                {name}
              </span>
              <span className="font-mono text-muted-foreground">{count.toLocaleString()}</span>
            </div>
            <Progress value={(count / total) * 100} className="h-1" />
          </div>
        ))}
        {data.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground italic">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}
