"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DailyCount } from "@/lib/api";

type TrafficChartProps = {
  data: DailyCount[];
};

export function TrafficChart({ data }: TrafficChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#3f3f46" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "#a1a1aa", fontSize: 12 }}
          axisLine={{ stroke: "#3f3f46" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#a1a1aa", fontSize: 12 }}
          axisLine={{ stroke: "#3f3f46" }}
          tickLine={false}
          width={40}
        />
        <Tooltip
          contentStyle={{
            borderColor: "#3f3f46",
            backgroundColor: "#18181b",
            color: "#e4e4e7",
            borderRadius: "0.5rem",
          }}
          labelStyle={{ color: "#d4d4d8", fontWeight: 600 }}
          itemStyle={{ color: "#e4e4e7" }}
        />
        <Legend wrapperStyle={{ color: "#e4e4e7", fontSize: "12px" }} />
        <Line
          type="monotone"
          dataKey="safeRequests"
          name="Safe Requests"
          stroke="#22c55e"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="threatsBlocked"
          name="Threats Blocked"
          stroke="#ef4444"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
