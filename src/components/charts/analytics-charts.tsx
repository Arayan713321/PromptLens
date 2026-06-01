"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  background: "var(--card-solid)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--foreground)",
};

interface ChartProps {
  data: {
    month: string;
    score: number;
    passRate: number;
    cost: number;
    latency: number;
  }[];
}

export function PerformanceChart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis dataKey="month" stroke="var(--muted)" tickLine={false} axisLine={false} />
        <YAxis stroke="var(--muted)" tickLine={false} axisLine={false} domain={[60, 100]} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} fill="url(#scoreGradient)" />
        <Line type="monotone" dataKey="passRate" stroke="#0f766e" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CostChart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis dataKey="month" stroke="var(--muted)" tickLine={false} axisLine={false} />
        <YAxis stroke="var(--muted)" tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="cost" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LatencyChart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis dataKey="month" stroke="var(--muted)" tickLine={false} axisLine={false} />
        <YAxis stroke="var(--muted)" tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="latency" stroke="#0f766e" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

