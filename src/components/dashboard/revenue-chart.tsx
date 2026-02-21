"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { formatCurrency } from "@/lib/utils";

interface RevenueData {
  month: string;
  revenue: number;
  leads: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  loading?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-3 shadow-card-hover text-sm">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map(
          (entry: { color: string; name: string; value: number }, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground text-xs">{entry.name}:</span>
              <span className="font-semibold text-xs">
                {entry.name === "Receita"
                  ? formatCurrency(entry.value)
                  : entry.value}
              </span>
            </div>
          )
        )}
      </div>
    );
  }
  return null;
}

export function RevenueChart({ data, loading = false }: RevenueChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (loading) {
    return (
      <div className="h-64 rounded-xl bg-muted shimmer-bg" />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="h-64"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6272f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6272f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: isDark ? "#6b7280" : "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tick={{ fontSize: 11, fill: isDark ? "#6b7280" : "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
            }
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Receita"
            stroke="#6272f1"
            strokeWidth={2.5}
            fill="url(#revenueGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#6272f1" }}
          />
          <Area
            type="monotone"
            dataKey="leads"
            name="Leads"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#leadsGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#10b981" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
