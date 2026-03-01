"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PricePoint } from "@/lib/types";

const RETAILER_COLORS: Record<string, string> = {
  amazon: "#FF9900",
  bestbuy: "#0046BE",
  walmart: "#FFC220",
};

const RETAILER_LABELS: Record<string, string> = {
  amazon: "Amazon",
  bestbuy: "Best Buy",
  walmart: "Walmart",
};

type TimeRange = "30d" | "90d" | "all";

interface PriceHistoryChartProps {
  priceHistory: PricePoint[];
}

export default function PriceHistoryChart({
  priceHistory,
}: PriceHistoryChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("90d");

  const retailers = useMemo(() => {
    const set = new Set(priceHistory.map((p) => p.retailer));
    return Array.from(set);
  }, [priceHistory]);

  const filteredData = useMemo(() => {
    const now = new Date();
    let cutoff: Date;

    if (timeRange === "30d") {
      cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 30);
    } else if (timeRange === "90d") {
      cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 90);
    } else {
      cutoff = new Date(0);
    }

    return priceHistory.filter((p) => new Date(p.recorded_at) >= cutoff);
  }, [priceHistory, timeRange]);

  // Group by date and pivot retailers into columns for recharts
  const chartData = useMemo(() => {
    const dateMap = new Map<
      string,
      Record<string, number | string>
    >();

    for (const point of filteredData) {
      const dateKey = new Date(point.recorded_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const fullDate = new Date(point.recorded_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { date: dateKey, fullDate });
      }

      const entry = dateMap.get(dateKey)!;
      // If multiple points on same date for same retailer, use latest
      entry[point.retailer] = point.price;
    }

    return Array.from(dateMap.values());
  }, [filteredData]);

  if (priceHistory.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Price History</h3>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(["30d", "90d", "all"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === range
                  ? "bg-white text-gray-900 shadow-sm font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {range === "all" ? "All" : range}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
            tickFormatter={(value: number) => `$${value}`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const fullDate =
                (payload[0]?.payload as Record<string, string>)?.fullDate ??
                label;
              return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {fullDate}
                  </p>
                  {payload.map((entry) => (
                    <p
                      key={entry.dataKey}
                      className="text-sm"
                      style={{ color: entry.color }}
                    >
                      {RETAILER_LABELS[entry.dataKey as string] ??
                        entry.dataKey}
                      : ${(entry.value as number)?.toFixed(2)}
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Legend
            formatter={(value: string) => RETAILER_LABELS[value] ?? value}
          />
          {retailers.map((retailer) => (
            <Line
              key={retailer}
              type="monotone"
              dataKey={retailer}
              stroke={RETAILER_COLORS[retailer] ?? "#888"}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
