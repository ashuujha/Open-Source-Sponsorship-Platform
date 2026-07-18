import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ChartDataPoint } from "../types";

interface MetricChartsProps {
  data: ChartDataPoint[];
}

export default function MetricCharts({ data }: MetricChartsProps) {
  // Custom styled Tooltip component to match OpenSponsor dark slate aesthetic
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-900/95 border border-neutral-800 p-3.5 rounded-xl shadow-xl backdrop-blur-md">
          <p className="text-xs font-semibold text-neutral-400 mb-2 font-sans">{label}</p>
          <div className="space-y-1.5 font-mono text-xs">
            <p className="text-blue-400 flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5 font-sans font-medium text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Total Funding:
              </span>
              <span>${payload[0].value.toLocaleString()}</span>
            </p>
            {payload[1] && (
              <p className="text-emerald-400 flex items-center justify-between gap-6">
                <span className="flex items-center gap-1.5 font-sans font-medium text-neutral-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Active Contributors:
                </span>
                <span>{payload[1].value} developers</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="recharts-metric-container" className="w-full h-[240px] md:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
        >
          <defs>
            {/* Smooth linear gradient backgrounds for Area Charts */}
            <linearGradient id="colorFunding" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorContributors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* Subdued cartesian gridlines */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1f2937"
            opacity={0.3}
            vertical={false}
          />

          {/* X & Y Axis */}
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={8}
            className="font-mono"
          />
          <YAxis
            stroke="#6b7280"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dx={-2}
            className="font-mono"
            tickFormatter={(value) => {
              if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
              return `$${value}`;
            }}
          />

          {/* Interactive custom hover tooltip */}
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#3b82f6", strokeWidth: 1, strokeDasharray: "4 4" }} />

          {/* Funding Area Curve */}
          <Area
            type="monotone"
            dataKey="funding"
            name="Total Funding"
            stroke="#3b82f6"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorFunding)"
            dot={{ r: 3, stroke: "#3b82f6", strokeWidth: 1.5, fill: "#1f2937" }}
            activeDot={{ r: 5, stroke: "#60a5fa", strokeWidth: 2, fill: "#1f2937" }}
          />

          {/* Active Contributors Area Curve */}
          <Area
            type="monotone"
            dataKey="contributors"
            name="Active Contributors"
            stroke="#10b981"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorContributors)"
            dot={{ r: 3, stroke: "#10b981", strokeWidth: 1.5, fill: "#1f2937" }}
            activeDot={{ r: 5, stroke: "#34d399", strokeWidth: 2, fill: "#1f2937" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
