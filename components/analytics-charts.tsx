/**
 * @file components/analytics-charts.tsx
 * @description Collection of charting components for data visualization.
 * Uses Recharts for rendering area, pie, and bar charts.
 */

"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import { format } from "date-fns";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";

/**
 * VisitsTrendChart Component
 * @description Renders a line/area chart showing visitor trends over time.
 * @param {Object} props - Component props.
 * @param {Array<{ date: string; visits: number }>} props.data - Array of date and visit count pairs.
 */
export function VisitsTrendChart({ data }: { data: { date: string; visits: number }[] }) {
  const chartConfig = {
    visits: {
      label: "Visits",
      color: "oklch(0.65 0.2 250)",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <AreaChart data={data} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
        <defs>
          {/* Gradient for the area fill */}
          <linearGradient id="fillVisits" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-visits)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-visits)" stopOpacity={0} />
          </linearGradient>
          {/* Subtle glow filter for the line */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/40" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          tickFormatter={(value) => format(new Date(value), "MMM d")}
          className="text-[11px] text-muted-foreground/80 font-medium"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          className="text-[11px] text-muted-foreground/80 font-medium"
        />
        <ChartTooltip
          cursor={{ stroke: "var(--color-visits)", strokeWidth: 1, strokeDasharray: "4 4" }}
          content={<ChartTooltipContent />}
        />
        <Area
          type="monotone"
          dataKey="visits"
          stroke="var(--color-visits)"
          strokeWidth={4}
          fill="url(#fillVisits)"
          dot={{ r: 4, strokeWidth: 2, fill: "var(--background)", stroke: "var(--color-visits)" }}
          activeDot={{ r: 6, strokeWidth: 0, fill: "var(--color-visits)" }}
          animationDuration={1500}
        />
      </AreaChart>
    </ChartContainer>
  );
}

/**
 * BrowserDistributionChart Component
 * @description Renders a donut chart showing the breakdown of visitor browsers.
 * @param {Object} props - Component props.
 * @param {Array<{ name: string; value: number }>} props.data - Array of browser names and their visit counts.
 */
export function BrowserDistributionChart({ data }: { data: { name: string; value: number }[] }) {
  const COLORS = [
    "oklch(0.65 0.2 250)", // Vivid Blue
    "oklch(0.75 0.15 190)", // Refreshing Cyan
    "oklch(0.8 0.18 140)", // Vibrant Green
    "oklch(0.85 0.12 80)", // Warm Gold
    "oklch(0.65 0.25 30)", // Strong Orange
  ];

  // Dynamically build the chart configuration based on provided browser data
  const chartConfig = data.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <div className="flex flex-col items-center">
      <ChartContainer config={chartConfig} className="aspect-square w-full max-w-[260px]">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={80}
            outerRadius={110}
            paddingAngle={4}
            strokeWidth={0}
            animationBegin={200}
            animationDuration={1200}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                className="hover:opacity-90 transition-opacity cursor-pointer outline-none"
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      {/* Legend section */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-2 w-full px-4">
        {data.slice(0, 4).map((item, i) => (
          <div key={item.name} className="flex items-center justify-between text-[11px] group">
            <span className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              {item.name}
            </span>
            <span className="font-mono font-bold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * TopPagesBarChart Component
 * @description Renders a horizontal bar chart showing the most visited paths.
 * @param {Object} props - Component props.
 * @param {Array<{ path: string; visits: number }>} props.data - Array of page paths and their visit counts.
 */
export function TopPagesBarChart({ data }: { data: { path: string; visits: number }[] }) {
  const chartConfig = {
    visits: {
      label: "Visits",
      color: "oklch(0.7 0.15 190)",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full bg-muted/5 rounded-xl p-2">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
        barSize={40}
      >
        <CartesianGrid horizontal={false} strokeDasharray="4 4" className="stroke-muted/40" />
        <XAxis type="number" hide />
        <YAxis
          dataKey="path"
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          width={130}
          className="text-[11px] font-mono text-muted-foreground/80"
        />
        <ChartTooltip
          cursor={{ fill: "hsl(var(--primary)/5%)" }}
          content={<ChartTooltipContent hideIndicator />}
        />
        <Bar
          dataKey="visits"
          fill="var(--color-visits)"
          radius={[0, 6, 6, 0]}
          className="hover:opacity-90 transition-opacity"
          animationDuration={1000}
        />
      </BarChart>
    </ChartContainer>
  );
}
