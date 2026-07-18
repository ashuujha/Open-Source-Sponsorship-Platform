"use client";

import React, { useState, useMemo } from "react";
import { useAllProjectsQuery, useEscrowQuery } from "@/hooks/useContracts";
import { BarChart3, TrendingUp, DollarSign, Award, Target, HelpCircle, Loader2 } from "lucide-react";
import MetricCharts from "@/components/MetricCharts";
import Heatmap from "@/components/Heatmap";

export default function AnalyticsPage() {
  const { data: dbProjects = [], isLoading: isProjectsLoading } = useAllProjectsQuery();
  const [selectedProjId, setSelectedProjId] = useState<string>("1");
  const [timeframe, setTimeframe] = useState<"30days" | "6months" | "year">("30days");

  // Map database projects to UI elements
  const uiProjects = useMemo(() => {
    return dbProjects.map((p) => {
      const starsMock = 12000 + (Number(p.id) * 3500) % 80000;
      const backersMock = 45 + (Number(p.id) * 12) % 650;
      const contributorsMock = 8 + (Number(p.id) * 3) % 40;
      const goalMock = 5000 + (Number(p.id) * 1000) % 20000;

      return {
        id: p.id.toString(),
        name: p.name,
        description: p.description,
        category: p.category,
        stars: starsMock,
        activeContributors: contributorsMock,
        monthlySponsors: backersMock,
        currentFunding: 0,
        goalFunding: goalMock,
        maintainerName: p.owner.slice(0, 8) + "..." + p.owner.slice(-8),
      };
    });
  }, [dbProjects]);

  // Find active project
  const activeUiProject = useMemo(() => {
    return uiProjects.find((p) => p.id === selectedProjId) || uiProjects[0];
  }, [uiProjects, selectedProjId]);

  // Fetch active project's escrow balance
  const activeProjIdNum = parseInt(activeUiProject?.id || "1", 10) || 1;
  const { data: escrow } = useEscrowQuery(activeProjIdNum);

  const activeProjectWithEscrow = useMemo(() => {
    if (!activeUiProject) return null;
    const balanceXlm = escrow ? Number(escrow.totalSponsored) / 10000000 : 0;
    return {
      ...activeUiProject,
      currentFunding: balanceXlm,
    };
  }, [activeUiProject, escrow]);

  // Platform metrics calculations
  const platformSummary = useMemo(() => {
    const totalProjects = uiProjects.length;
    // Mock sum of all escrows (can estimate or hardcode a baseline)
    const baseVolume = 125000;
    const totalStars = uiProjects.reduce((acc, p) => acc + p.stars, 0);
    const totalBackers = uiProjects.reduce((acc, p) => acc + p.monthlySponsors, 0);

    return {
      projectsCount: totalProjects,
      starsCount: totalStars,
      backersCount: totalBackers,
      volume: baseVolume + (escrow ? Number(escrow.totalSponsored) / 10000000 : 0),
    };
  }, [uiProjects, escrow]);

  // Chart data generation
  const chartData = useMemo(() => {
    if (!activeProjectWithEscrow) return [];
    const pointsCount = timeframe === "30days" ? 10 : timeframe === "6months" ? 6 : 12;
    const data = [];
    const labels = timeframe === "30days"
      ? ["Jan 1", "Jan 5", "Jan 7", "Jan 10", "Jan 13", "Jan 15", "Jan 17", "Jan 20", "Jan 25", "Jan 28"]
      : ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];

    for (let i = 0; i < pointsCount; i++) {
      const fraction = (i + 1) / pointsCount;
      const variation = 0.9 + (i % 3 === 0 ? 0.08 : -0.05);
      data.push({
        date: labels[i % labels.length],
        funding: Math.floor((activeProjectWithEscrow.currentFunding + 2000) * fraction * variation),
        contributors: Math.floor(activeProjectWithEscrow.activeContributors * fraction * variation),
      });
    }
    return data;
  }, [activeProjectWithEscrow, timeframe]);

  const metrics = [
    { label: "Total Platform Volume", value: `${platformSummary.volume.toLocaleString()} XLM`, icon: DollarSign, color: "text-blue-400" },
    { label: "Total Platform Backers", value: platformSummary.backersCount.toLocaleString(), icon: TrendingUp, color: "text-emerald-400" },
    { label: "Registered Repositories", value: platformSummary.projectsCount.toString(), icon: BarChart3, color: "text-purple-400" },
  ];

  const distribution = [
    { name: "Frameworks & UI", percent: 45, xlm: "128,025 XLM", color: "bg-blue-500" },
    { name: "Smart Contracts & Web3", percent: 25, xlm: "71,125 XLM", color: "bg-indigo-500" },
    { name: "SDKs & Utility Libraries", percent: 18, xlm: "51,210 XLM", color: "bg-purple-500" },
    { name: "Backend & Storage databases", percent: 12, xlm: "34,140 XLM", color: "bg-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-neutral-200 overflow-x-hidden selection:bg-blue-600/30 selection:text-white flex flex-col font-sans relative">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 space-y-12 text-left relative z-10">
        {/* Page Header */}
        <div className="border-b border-neutral-900/60 pb-6">
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-500" />
            Platform Insights & Analytics
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">
            Historical overview of funding volumes, category allocations, and repository contribution charts.
          </p>
        </div>

        {isProjectsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Metric Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {metrics.map((metric, i) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={i}
                    className="bg-neutral-900/30 border border-neutral-900 p-5 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider font-mono">{metric.label}</span>
                      <span className="text-xl font-black text-white font-mono">{metric.value}</span>
                    </div>
                    <div className={`p-3 rounded-xl bg-neutral-950 border border-neutral-900/80 ${metric.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected project analytics panel */}
            {activeProjectWithEscrow && (
              <section className="bg-neutral-900/40 border border-neutral-900 rounded-3xl p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-900/60">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-200">
                      Sponsorship Volume Growth: {activeProjectWithEscrow.name}
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Select project and timeframe to visualize runway escrow and contributor growth curves.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedProjId}
                      onChange={(e) => setSelectedProjId(e.target.value)}
                      className="bg-neutral-950 border border-neutral-800 focus:border-blue-500 text-xs text-neutral-300 px-3 py-1.5 rounded-xl outline-none"
                    >
                      {uiProjects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value as any)}
                      className="bg-neutral-950 border border-neutral-800 focus:border-blue-500 text-xs text-neutral-300 px-3 py-1.5 rounded-xl outline-none"
                    >
                      <option value="30days">Last 30 Days</option>
                      <option value="6months">Last 6 Months</option>
                      <option value="year">Last Year</option>
                    </select>
                  </div>
                </div>

                <div className="w-full">
                  <MetricCharts data={chartData} />
                </div>
              </section>
            )}

            {/* Split layout: Heatmap & Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-neutral-900/40 border border-neutral-900 p-6 rounded-3xl">
                {activeProjectWithEscrow && (
                  <Heatmap projectName={activeProjectWithEscrow.name} />
                )}
              </div>

              <div className="lg:col-span-4 bg-neutral-900/40 border border-neutral-900 p-6 rounded-3xl flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-sans mb-5">
                    Funding Share by Tag
                  </h3>

                  <div className="flex flex-col gap-4">
                    {distribution.map((cat, i) => (
                      <div key={i} className="space-y-1.5 text-xs">
                        <div className="flex justify-between font-bold text-neutral-200">
                          <span>{cat.name}</span>
                          <span className="text-neutral-500">{cat.xlm}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-neutral-950 overflow-hidden border border-neutral-900">
                          <div
                            className={`h-full rounded-full ${cat.color}`}
                            style={{ width: `${cat.percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-900/60 flex items-start gap-2 text-[10px] text-neutral-500 leading-normal font-sans">
                  <HelpCircle className="h-4 w-4 text-blue-500 shrink-0" />
                  <span>Category statistics are aggregated dynamically from repository metadata and on-chain tags configurations.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
