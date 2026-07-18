"use client";

import { BarChart3, TrendingUp, DollarSign, Award, Target, HelpCircle } from "lucide-react";

export default function AnalyticsPage() {
  const metrics = [
    { label: "Total Platform Volume", value: "284,500 XLM", icon: DollarSign, color: "text-primary" },
    { label: "Sponsorship Transactions", value: "1,248", icon: TrendingUp, color: "text-cyan-400" },
    { label: "Registered Repositories", value: "142", icon: BarChart3, color: "text-purple-400" },
  ];

  const distribution = [
    { name: "Developer Tooling", percent: 45, xlm: "128,025 XLM", color: "bg-primary" },
    { name: "Smart Contracts", percent: 25, xlm: "71,125 XLM", color: "bg-cyan-400" },
    { name: "SDKs & Libraries", percent: 18, xlm: "51,210 XLM", color: "bg-purple-400" },
    { name: "Infrastructure & Apps", percent: 12, xlm: "34,140 XLM", color: "bg-yellow-400" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 text-left">
      <div className="border-b border-border-dark pb-6 mb-8">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          Platform Analytics
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Historical overview of funding volumes, category distributions, and community activity.
        </p>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div
              key={i}
              className="glass-panel p-6 rounded-3xl border border-border-dark flex items-center justify-between"
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-muted font-medium">{metric.label}</span>
                <span className="text-2xl font-black text-white">{metric.value}</span>
              </div>
              <div className={`p-3.5 rounded-2xl bg-black/40 border border-white/5 ${metric.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SVG Line Graph: Monthly Volume Growth */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-border-dark flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-primary" />
              Sponsorship Volume Growth (Monthly)
            </h2>
            <span className="text-xs text-text-muted font-bold font-mono">2026</span>
          </div>

          <div className="relative w-full h-64 bg-black/10 rounded-2xl border border-white/5 p-4 flex items-end">
            {/* SVG Plot */}
            <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="600" y2="50" stroke="#1E2030" strokeWidth="0.5" strokeDasharray="5,5" />
              <line x1="0" y1="100" x2="600" y2="100" stroke="#1E2030" strokeWidth="0.5" strokeDasharray="5,5" />
              <line x1="0" y1="150" x2="600" y2="150" stroke="#1E2030" strokeWidth="0.5" strokeDasharray="5,5" />

              {/* Area path */}
              <path
                d="M 0 170 C 50 150, 100 130, 150 140 C 200 150, 250 100, 300 80 C 350 60, 400 90, 450 50 C 500 10, 550 20, 600 30 L 600 200 L 0 200 Z"
                fill="url(#chartGradient)"
              />

              {/* Line path */}
              <path
                d="M 0 170 C 50 150, 100 130, 150 140 C 200 150, 250 100, 300 80 C 350 60, 400 90, 450 50 C 500 10, 550 20, 600 30"
                fill="none"
                stroke="#FF6B00"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Points */}
              <circle cx="150" cy="140" r="4.5" fill="#050508" stroke="#FF6B00" strokeWidth="2.5" />
              <circle cx="300" cy="80" r="4.5" fill="#050508" stroke="#FF6B00" strokeWidth="2.5" />
              <circle cx="450" cy="50" r="4.5" fill="#050508" stroke="#FF6B00" strokeWidth="2.5" />
              <circle cx="600" cy="30" r="4.5" fill="#050508" stroke="#FF6B00" strokeWidth="2.5" />
            </svg>
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between items-center mt-3 text-[10px] text-text-muted px-2 font-bold font-mono">
            <span>JAN</span>
            <span>FEB</span>
            <span>MAR</span>
            <span>APR</span>
            <span>MAY</span>
            <span>JUN</span>
            <span>JUL</span>
          </div>
        </div>

        {/* Category distribution panel */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-border-dark flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-6 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-primary" />
              Funding by Category
            </h2>

            <div className="flex flex-col gap-5">
              {distribution.map((cat, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold text-gray-200">
                    <span>{cat.name}</span>
                    <span className="text-text-muted">{cat.xlm}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full ${cat.color}`}
                      style={{ width: `${cat.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-text-muted">
            <HelpCircle className="h-4 w-4 text-primary shrink-0" />
            <span>Category allocations are determined directly by the tags specified upon project registration.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
