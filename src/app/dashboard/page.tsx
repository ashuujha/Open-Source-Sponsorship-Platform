"use client";

import React, { useState, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useStellarWallet } from "@/hooks/useStellarWallet";
import {
  useAllProjectsQuery,
  useEscrowQuery,
  useMilestonesQuery,
  useRegisterProject,
  useVerifyProject,
} from "@/hooks/useContracts";
import {
  Search,
  Star,
  Users,
  Heart,
  Plus,
  Loader2,
  TrendingUp,
  Award,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import MetricCharts from "@/components/MetricCharts";
import Heatmap from "@/components/Heatmap";
import SponsorModal from "@/components/SponsorModal";
import CreatorWorkspace from "@/components/CreatorWorkspace";
import { Project, Sponsor } from "@/types";

function DashboardContent() {
  const searchParams = useSearchParams();
  const { walletAddress, isConnected, connect } = useStellarWallet();
  const registerMutation = useRegisterProject();

  // Selected project ID on dashboard
  const [selectedProjId, setSelectedProjId] = useState<string>("1");
  const [activeTab, setActiveTab] = useState<"marketplace" | "studio">("marketplace");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [timeframe, setTimeframe] = useState<"30days" | "6months" | "year">("30days");
  
  // Modals state
  const [sponsorModalProject, setSponsorModalProject] = useState<Project | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Project registration form
  const [regName, setRegName] = useState("");
  const [regGithub, setRegGithub] = useState("");
  const [regDesc, setRegDesc] = useState("");
  const [regCat, setRegCat] = useState("Library");
  const [regError, setRegError] = useState<string | null>(null);

  // Load real projects from registry contract
  const { data: dbProjects = [], isLoading: isProjectsLoading } = useAllProjectsQuery();

  // Category list mapping
  const categories = useMemo(() => {
    const list = new Set(dbProjects.map((p) => p.category));
    return ["all", ...Array.from(list)];
  }, [dbProjects]);

  // Map blockchain projects (id: number/string) to UI Project type
  const uiProjects = useMemo((): Project[] => {
    return dbProjects.map((p) => {
      // Mock some developer/maintainer metrics to fit high-fidelity UI design
      const starsMock = 12000 + (Number(p.id) * 3500) % 80000;
      const backersMock = 45 + (Number(p.id) * 12) % 650;
      const contributorsMock = 8 + (Number(p.id) * 3) % 40;
      const goalMock = 5000 + (Number(p.id) * 1000) % 20000;

      return {
        id: p.id.toString(),
        name: p.name,
        description: p.description,
        category: p.category,
        logo: p.name.slice(0, 2).toUpperCase(),
        tags: ["Stellar", p.category, "Open Source"],
        stars: starsMock,
        activeContributors: contributorsMock,
        monthlySponsors: backersMock,
        currentFunding: 0, // will fetch from escrow
        goalFunding: goalMock,
        maintainerName: p.owner.slice(0, 8) + "..." + p.owner.slice(-8),
        maintainerAvatar: `https://images.unsplash.com/photo-${1500000000000 + (Number(p.id) * 88888) % 999999}?auto=format&fit=crop&w=100&h=100&q=80`,
        recentSponsors: [],
      };
    });
  }, [dbProjects]);

  // Find currently active project detail selection
  const activeUiProject = useMemo(() => {
    return uiProjects.find((p) => p.id === selectedProjId) || uiProjects[0];
  }, [uiProjects, selectedProjId]);

  // Fetch live escrow balance for active project
  const activeProjectIdNum = parseInt(activeUiProject?.id || "1", 10) || 1;
  const { data: escrow } = useEscrowQuery(activeProjectIdNum);

  // Live updates to project runway funding balance
  const activeProjectWithEscrow = useMemo((): Project | null => {
    if (!activeUiProject) return null;
    const balanceXlm = escrow ? Number(escrow.totalSponsored) / 10000000 : 0;
    return {
      ...activeUiProject,
      currentFunding: balanceXlm,
    };
  }, [activeUiProject, escrow]);

  // Render area charts metric data points
  const chartData = useMemo(() => {
    if (!activeProjectWithEscrow) return [];
    const pointsCount = timeframe === "30days" ? 10 : timeframe === "6months" ? 6 : 12;
    const data = [];
    const labels = timeframe === "30days" 
      ? ["Jan 1", "Jan 5", "Jan 7", "Jan 10", "Jan 13", "Jan 15", "Jan 17", "Jan 20", "Jan 25", "Jan 28"]
      : ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];

    for (let i = 0; i < pointsCount; i++) {
      const fraction = (i + 1) / pointsCount;
      const variation = 0.9 + (i % 3 === 0 ? 0.1 : -0.04);
      data.push({
        date: labels[i % labels.length],
        funding: Math.floor(activeProjectWithEscrow.currentFunding * fraction * variation),
        contributors: Math.floor(activeProjectWithEscrow.activeContributors * fraction * variation),
      });
    }
    return data;
  }, [activeProjectWithEscrow, timeframe]);

  // Filter projects list
  const filteredProjects = useMemo(() => {
    return uiProjects.filter((p) => {
      const matchQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === "all" || p.category === selectedCategory;
      return matchQuery && matchCat;
    });
  }, [uiProjects, searchQuery, selectedCategory]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!isConnected || !walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      await registerMutation.mutateAsync({
        name: regName.trim(),
        githubUrl: regGithub.trim(),
        description: regDesc.trim(),
        category: regCat,
      });

      setRegName("");
      setRegGithub("");
      setRegDesc("");
      setIsRegisterOpen(false);
    } catch (err: any) {
      setRegError(err.message || "Failed to register project.");
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-neutral-200 overflow-x-hidden selection:bg-blue-600/30 selection:text-white flex flex-col font-sans relative">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* View switching bar */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="bg-neutral-900/60 p-1 rounded-xl flex items-center border border-neutral-800/80">
          <button
            onClick={() => setActiveTab("marketplace")}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "marketplace"
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            Marketplace Explorer
          </button>
          <button
            onClick={() => setActiveTab("studio")}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "studio"
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            Developer Studio
          </button>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-600/10 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Register Project
        </button>
      </div>

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-12">
        <AnimatePresence mode="wait">
          {activeTab === "marketplace" ? (
            <motion.div
              key="marketplace"
              className="space-y-12 text-left"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {/* Explorer Search & Grid */}
              <section className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
                      Explore Open-Source Repositories
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                      Verify and sponsor critical developer tools locked in Soroban escrows.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Search field */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
                      <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 rounded-xl pl-9 pr-4 py-2 w-52 focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* Category selectors */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`text-[9px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                            selectedCategory === cat
                              ? "bg-blue-600 border-blue-500 text-white"
                              : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200"
                          }`}
                        >
                          {cat === "all" ? "All categories" : cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {isProjectsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <div className="glass-panel border-neutral-900 p-12 text-center rounded-3xl">
                    <p className="text-sm text-neutral-500">No registered projects found matching filters.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((proj) => {
                      const isSelected = proj.id === selectedProjId;
                      // Display dynamic runway if loaded
                      const runwayFunding = proj.id === selectedProjId && escrow 
                        ? Number(escrow.totalSponsored) / 10000000 
                        : 0;

                      return (
                        <div
                          key={proj.id}
                          className={`p-5 rounded-2xl border transition-all duration-300 relative group flex flex-col justify-between ${
                            isSelected
                              ? "bg-neutral-900/45 border-blue-500/50 shadow-lg shadow-blue-500/5"
                              : "bg-neutral-900/20 border-neutral-800/60 hover:border-neutral-700/80"
                          }`}
                        >
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-lg font-bold">
                                  {proj.logo}
                                </div>
                                <div>
                                  <h3 className="text-sm font-bold text-neutral-100 group-hover:text-blue-400 transition-colors">
                                    {proj.name}
                                  </h3>
                                  <span className="text-[10px] text-neutral-400">
                                    {proj.category}
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => setSelectedProjId(proj.id)}
                                className={`text-[9px] font-bold px-2.5 py-1 rounded bg-neutral-950 border transition-all cursor-pointer ${
                                  isSelected
                                    ? "border-blue-500 text-blue-400"
                                    : "border-neutral-800 text-neutral-400 hover:border-neutral-700"
                                }`}
                              >
                                {isSelected ? "Selected View" : "View Metrics"}
                              </button>
                            </div>

                            <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                              {proj.description}
                            </p>

                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {proj.tags.map((t) => (
                                <span key={t} className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-neutral-900/60 border border-neutral-800/40 text-neutral-400">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mt-5 pt-4 border-t border-neutral-900 space-y-4">
                            {/* Budget statistics */}
                            <div className="flex justify-between items-center text-xs font-mono">
                              <span className="text-neutral-500">Runway Goal:</span>
                              <span className="font-bold text-neutral-200">
                                {proj.goalFunding.toLocaleString()} XLM
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                              <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
                                <span>{(proj.stars / 1000).toFixed(1)}k stars</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-blue-400" />
                                <span>{proj.monthlySponsors} backers</span>
                              </div>
                            </div>

                            <button
                              onClick={() => setSponsorModalProject(proj)}
                              className="w-full h-9 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 text-[11px] font-bold transition-all cursor-pointer"
                            >
                              <Heart className="w-3.5 h-3.5" />
                              Sponsor Repository
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Dynamic Insights & Metric Charts */}
              {activeProjectWithEscrow && (
                <section className="bg-neutral-900/20 border border-neutral-900 rounded-3xl p-6 sm:p-8 space-y-6 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/2 rounded-full blur-[80px] pointer-events-none" />

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-900">
                    <div className="space-y-1">
                      <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        Project Analytics & Contributions
                      </h2>
                      <p className="text-xs text-neutral-400">
                        Active statistics overview for <span className="font-semibold text-neutral-200">{activeProjectWithEscrow.name}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={selectedProjId}
                        onChange={(e) => setSelectedProjId(e.target.value)}
                        className="bg-neutral-900 border border-neutral-800 focus:border-blue-500 text-xs text-neutral-300 px-3 py-1.5 rounded-xl outline-none"
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
                        className="bg-neutral-900 border border-neutral-800 focus:border-blue-500 text-xs text-neutral-300 px-3 py-1.5 rounded-xl outline-none"
                      >
                        <option value="30days">Last 30 Days</option>
                        <option value="6months">Last 6 Months</option>
                        <option value="year">Last Year</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-neutral-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span>In Escrow ({activeProjectWithEscrow.currentFunding.toLocaleString()} XLM)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Active Contributors ({activeProjectWithEscrow.activeContributors})</span>
                    </div>
                  </div>

                  {/* Render Chart */}
                  <MetricCharts data={chartData} />

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
                    <div className="lg:col-span-7">
                      <Heatmap projectName={activeProjectWithEscrow.name} />
                    </div>

                    {/* Funding progress block */}
                    <div className="lg:col-span-5 bg-neutral-950/40 border border-neutral-900 p-5 rounded-2xl flex flex-col justify-between space-y-5">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-neutral-300">Runway Progress</h4>
                          <span className="text-[10px] font-mono text-neutral-500">
                            Goal: {activeProjectWithEscrow.goalFunding.toLocaleString()} XLM
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-950 relative">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, (activeProjectWithEscrow.currentFunding / activeProjectWithEscrow.goalFunding) * 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[11px] font-mono">
                            <span className="font-semibold text-blue-400">
                              {Math.floor((activeProjectWithEscrow.currentFunding / activeProjectWithEscrow.goalFunding) * 100)}% funded
                            </span>
                            <span className="text-neutral-500">
                              {Math.max(0, activeProjectWithEscrow.goalFunding - activeProjectWithEscrow.currentFunding).toLocaleString()} XLM remaining
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-neutral-900/30 border border-neutral-800/40 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-bold text-neutral-200 leading-normal">Verified Developer Account</p>
                          <span className="text-[10px] text-neutral-500">Owner: {activeProjectWithEscrow.maintainerName}</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/5 font-mono">
                          Verified
                        </span>
                      </div>

                      <button
                        onClick={() => setSponsorModalProject(activeProjectWithEscrow)}
                        className="w-full h-10.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow cursor-pointer"
                      >
                        <Heart className="w-4 h-4 fill-white/10" />
                        Boost Sponsorship & Support
                      </button>
                    </div>
                  </div>
                </section>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="studio"
              className="space-y-6 text-left"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {/* Creator Studio Workspace */}
              <CreatorWorkspace
                projects={uiProjects}
                onUpdateProjectGoal={(id, val) => console.log(`Goal update requested: project ${id} to ${val}`)}
                onAddProjectUpdate={(id, title, desc) => console.log(`Broadcast published: ${title}`)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Sponsoring Modal popup */}
      <AnimatePresence>
        {sponsorModalProject && (
          <SponsorModal
            project={sponsorModalProject}
            onClose={() => setSponsorModalProject(null)}
            onSponsorSuccess={() => {
              setSponsorModalProject(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Project Registration Modal */}
      <AnimatePresence>
        {isRegisterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !registerMutation.isPending && setIsRegisterOpen(false)}
            />
            <motion.div
              className="relative bg-neutral-950 border border-neutral-900 rounded-3xl p-6 w-full max-w-md shadow-2xl z-10 text-left space-y-4"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
            >
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" />
                Register New Project
              </h3>
              
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-400 block mb-1.5">Project Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Astro, Next.js"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-400 block mb-1.5">GitHub Repository URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/user/repo"
                    value={regGithub}
                    onChange={(e) => setRegGithub(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-400 block mb-1.5">Project Description</label>
                  <textarea
                    placeholder="Provide a description of your repository's purpose..."
                    value={regDesc}
                    onChange={(e) => setRegDesc(e.target.value)}
                    rows={3}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-400 block mb-1.5">Category</label>
                  <select
                    value={regCat}
                    onChange={(e) => setRegCat(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Library">Library</option>
                    <option value="Framework">Framework</option>
                    <option value="Compiler">Compiler</option>
                    <option value="Database">Database / Backend</option>
                    <option value="Developer Tool">Developer Tool</option>
                  </select>
                </div>

                {regError && (
                  <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-xs text-red-400 flex items-start gap-1.5">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRegisterOpen(false)}
                    disabled={registerMutation.isPending}
                    className="w-1/3 h-10 border border-neutral-800 hover:border-neutral-700 text-xs font-semibold text-neutral-300 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="flex-1 h-10 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg cursor-pointer disabled:opacity-80"
                  >
                    {registerMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Submit Registry
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
