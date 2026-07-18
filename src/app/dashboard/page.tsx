"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useStellarWallet } from "@/hooks/useStellarWallet";
import {
  useAllProjectsQuery,
  useEscrowQuery,
  useMilestonesQuery,
  useSponsorContributionQuery,
  useRegisterProject,
  useSponsorProject,
  useProposeMilestone,
  useStartMilestone,
  useFlagMilestone,
  useClaimMilestone,
} from "@/hooks/useContracts";
import {
  Plus,
  Coins,
  Award,
  ShieldAlert,
  Loader2,
  Calendar,
  AlertTriangle,
  Folder,
  Send,
  Lock,
  Unlock,
  CheckCircle2,
} from "lucide-react";

function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { walletAddress, isConnected, connect } = useStellarWallet();

  // Page tabs: "browse" or "register"
  const [activeTab, setActiveTab] = useState<"browse" | "register">("browse");

  // Selected project in explorer
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Read URL query params on mount
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "register") {
      setActiveTab("register");
    }
  }, [searchParams]);

  // Queries
  const { data: projects = [], isLoading: isProjectsLoading } = useAllProjectsQuery();

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Render main content
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-border-dark pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Project Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">
            Browse open-source projects or list your own to start collecting decentralized milestone-based sponsorships.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 p-1.5 rounded-xl bg-surface-dark border border-border-dark self-start">
          <button
            onClick={() => {
              setActiveTab("browse");
              router.push("/dashboard");
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "browse"
                ? "bg-primary text-white shadow-md"
                : "text-text-muted hover:text-white"
            }`}
          >
            Explore Projects
          </button>
          <button
            onClick={() => {
              setActiveTab("register");
              router.push("/dashboard?action=register");
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "register"
                ? "bg-primary text-white shadow-md"
                : "text-text-muted hover:text-white"
            }`}
          >
            Register Project
          </button>
        </div>
      </div>

      {activeTab === "browse" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Projects List Explorer */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Folder className="h-5 w-5 text-primary" />
              Project Explorer
            </h2>

            {isProjectsLoading ? (
              <div className="flex flex-col items-center justify-center p-20 glass-panel rounded-2xl">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <span className="text-text-muted text-sm mt-4">Querying ProjectRegistry contract...</span>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center p-16 glass-panel rounded-2xl border border-border-dark">
                <p className="text-text-muted text-sm">No projects registered yet.</p>
                <button
                  onClick={() => setActiveTab("register")}
                  className="mt-4 px-4 py-2 rounded-xl bg-primary/20 text-primary border border-primary/30 text-xs font-bold hover:bg-primary/30 transition-all cursor-pointer"
                >
                  Be the first to Register!
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`glass-panel p-5 rounded-2xl border text-left transition-all hover:scale-[1.01] cursor-pointer ${
                      selectedProjectId === project.id
                        ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/5"
                        : "border-border-dark hover:border-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-white text-base truncate">{project.name}</h3>
                      <span
                        className={`px-2 py-0.5 text-[10px] rounded-full font-bold uppercase ${
                          project.verified
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        }`}
                      >
                        {project.verified ? "Verified" : "Pending"}
                      </span>
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[11px] text-text-muted">
                      {project.category}
                    </span>
                    <p className="text-xs text-text-muted line-clamp-2 mt-3 mb-4 leading-relaxed">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-text-muted font-mono bg-black/20 p-2 rounded-lg">
                      <GithubIcon className="h-3.5 w-3.5" />
                      <span className="truncate">{project.githubUrl}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Project Details Panel */}
          <div className="lg:col-span-7">
            {selectedProject ? (
              <ProjectDetailsView project={selectedProject} />
            ) : (
              <div className="flex flex-col items-center justify-center p-32 glass-panel rounded-3xl border border-border-dark h-full text-center">
                <Folder className="h-12 w-12 text-border-dark mb-4" />
                <h3 className="font-bold text-lg text-gray-300">No Project Selected</h3>
                <p className="text-text-muted text-sm max-w-sm mt-1">
                  Select a project from the explorer on the left to view its escrows, milestones, and sponsor details.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <RegisterProjectForm onSuccess={() => setActiveTab("browse")} />
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Component: ProjectDetailsView
// -------------------------------------------------------------
interface Project {
  id: number;
  owner: string;
  name: string;
  githubUrl: string;
  description: string;
  category: string;
  verified: boolean;
  registeredAt: number;
}

function ProjectDetailsView({ project }: { project: Project }) {
  const { walletAddress, isConnected, connect, sign } = useStellarWallet();

  // Queries
  const { data: escrow, isLoading: isEscrowLoading } = useEscrowQuery(project.id);
  const { data: milestones = [], isLoading: isMilestonesLoading } = useMilestonesQuery(
    project.id,
    escrow?.milestoneCount || 0
  );
  const { data: userContribution = 0 } = useSponsorContributionQuery(project.id, walletAddress);

  // Mutations
  const sponsorMutation = useSponsorProject();
  const proposeMutation = useProposeMilestone();

  // Local Form States
  const [sponsorAmt, setSponsorAmt] = useState("");
  const [proposeTitle, setProposeTitle] = useState("");
  const [proposeDesc, setProposeDesc] = useState("");
  const [proposeAmt, setProposeAmt] = useState("");

  const isOwner = !!(walletAddress && walletAddress.toUpperCase() === project.owner.toUpperCase());

  const handleSponsorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorAmt || isNaN(Number(sponsorAmt))) return;
    try {
      await sponsorMutation.mutateAsync({
        projectId: project.id,
        amount: Number(sponsorAmt),
        projectName: project.name,
      });
      setSponsorAmt("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleProposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposeTitle || !proposeDesc || !proposeAmt || isNaN(Number(proposeAmt))) return;
    try {
      await proposeMutation.mutateAsync({
        projectId: project.id,
        title: proposeTitle,
        description: proposeDesc,
        amount: Number(proposeAmt),
        projectName: project.name,
      });
      setProposeTitle("");
      setProposeDesc("");
      setProposeAmt("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Info */}
      <div className="glass-panel p-6 rounded-3xl border border-border-dark flex flex-col gap-4">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <span className="text-xs text-primary font-bold uppercase tracking-wider">Project #{project.id}</span>
            <h2 className="text-2xl font-black text-white mt-1">{project.name}</h2>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              project.verified
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
            }`}
          >
            {project.verified ? "Verified" : "Verification Pending"}
          </span>
        </div>

        <p className="text-gray-300 text-sm leading-relaxed">{project.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-black/30 border border-border-dark">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Project Owner</span>
            <span className="text-xs font-mono text-gray-200 truncate">{project.owner}</span>
          </div>
          <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-black/30 border border-border-dark">
            <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">GitHub Repository</span>
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-primary truncate hover:underline flex items-center gap-1"
            >
              <GithubIcon className="h-3.5 w-3.5 inline" />
              {project.githubUrl}
            </a>
          </div>
        </div>
      </div>

      {/* Escrow Financial Details & Sponsor Action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Escrow Status Card */}
        <div className="glass-panel p-6 rounded-3xl border border-border-dark flex flex-col justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Coins className="h-5 w-5 text-primary" />
            Financial Escrow
          </h3>

          {isEscrowLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-border-dark pb-3">
                <span className="text-xs text-text-muted">Total Funded</span>
                <span className="text-lg font-extrabold text-white">
                  {escrow ? escrow.totalSponsored / 10000000 : 0} XLM
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-border-dark pb-3">
                <span className="text-xs text-text-muted">Unallocated Balance</span>
                <span className="text-lg font-extrabold text-primary">
                  {escrow ? escrow.balance / 10000000 : 0} XLM
                </span>
              </div>
              {isConnected && (
                <div className="flex justify-between items-center pb-1">
                  <span className="text-xs text-text-muted">Your Contributions</span>
                  <span className="text-sm font-bold text-cyan-400">
                    {userContribution / 10000000} XLM
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sponsor Form */}
        <div className="glass-panel p-6 rounded-3xl border border-border-dark">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-primary" />
            Sponsor Project
          </h3>

          {!project.verified ? (
            <div className="flex flex-col items-center justify-center p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl text-center">
              <ShieldAlert className="h-8 w-8 text-yellow-500 mb-2" />
              <p className="text-xs text-yellow-400 font-medium max-w-[200px]">
                Sponsorships are locked until the project is verified by admins.
              </p>
            </div>
          ) : !isConnected ? (
            <div className="flex flex-col items-center justify-center p-6 bg-white/5 border border-border-dark rounded-2xl text-center">
              <p className="text-xs text-text-muted mb-4">Connect wallet to fund this project.</p>
              <button
                onClick={connect}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:shadow-lg transition-all cursor-pointer"
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <form onSubmit={handleSponsorSubmit} className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type="number"
                  placeholder="Sponsorship amount (XLM)"
                  value={sponsorAmt}
                  onChange={(e) => setSponsorAmt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-border-dark text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary"
                  required
                  min="1"
                />
                <span className="absolute right-4 top-3 text-xs text-text-muted font-bold">XLM</span>
              </div>
              <button
                type="submit"
                disabled={sponsorMutation.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-tr from-primary to-orange-500 text-white text-sm font-bold shadow-md hover:shadow-primary/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {sponsorMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Sponsorship
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Milestones Sections */}
      <div className="glass-panel p-6 rounded-3xl border border-border-dark">
        <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2 border-b border-border-dark pb-3">
          <Calendar className="h-5 w-5 text-primary" />
          Milestones tracker
        </h3>

        {isMilestonesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : milestones.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-text-muted text-sm">No milestones proposed for this project yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {milestones.map((ms) => (
              <MilestoneItem
                key={ms.id}
                milestone={ms}
                projectId={project.id}
                projectName={project.name}
                isOwner={isOwner}
                userContribution={userContribution}
              />
            ))}
          </div>
        )}

        {/* Propose Milestone Panel (Owner Only) */}
        {isOwner && escrow && escrow.balance > 0 && (
          <div className="mt-8 pt-6 border-t border-border-dark">
            <h4 className="text-sm font-bold text-white mb-4">Propose New Milestone</h4>
            <form onSubmit={handleProposeSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Milestone Title (e.g. Phase 1)"
                  value={proposeTitle}
                  onChange={(e) => setProposeTitle(e.target.value)}
                  className="md:col-span-2 px-4 py-2 rounded-xl bg-black/40 border border-border-dark text-xs text-white focus:outline-none focus:border-primary"
                  required
                />
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={proposeAmt}
                    onChange={(e) => setProposeAmt(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-border-dark text-xs text-white focus:outline-none focus:border-primary"
                    required
                    min="1"
                    max={escrow.balance / 10000000}
                  />
                  <span className="absolute right-4 top-2 text-[10px] text-text-muted font-bold">XLM</span>
                </div>
              </div>
              <textarea
                placeholder="Describe milestone achievements and verification evidence..."
                value={proposeDesc}
                onChange={(e) => setProposeDesc(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-border-dark text-xs text-white focus:outline-none focus:border-primary h-20 resize-none"
                required
              />
              <button
                type="submit"
                disabled={proposeMutation.isPending}
                className="self-end px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {proposeMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                Propose Milestone
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: MilestoneItem
// -------------------------------------------------------------
interface Milestone {
  id: number;
  title: string;
  description: string;
  amount: number;
  status: number; // 0 = Proposed, 1 = Active, 2 = Flagged, 3 = Completed, 4 = Claimed
  flagsCount: number;
  releaseTime: number;
}

function MilestoneItem({
  milestone,
  projectId,
  projectName,
  isOwner,
  userContribution,
}: {
  milestone: Milestone;
  projectId: number;
  projectName: string;
  isOwner: boolean;
  userContribution: number;
}) {
  const { walletAddress } = useStellarWallet();
  const startMsMutation = useStartMilestone();
  const flagMsMutation = useFlagMilestone();
  const claimMsMutation = useClaimMilestone();

  const xlmAmt = milestone.amount / 10000000;
  const isSponsor = userContribution > 0;

  // Status mapping
  const statuses = [
    { label: "Proposed", color: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
    { label: "Dispute Window", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
    { label: "Flagged / Disputed", color: "bg-red-500/10 text-red-400 border-red-500/20" },
    { label: "Verification Confirmed", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    { label: "Claimed", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  ];

  const currentStatus = statuses[milestone.status] || { label: "Unknown", color: "bg-gray-500/10 text-gray-400" };

  // Timer calculation
  const [timeLeft, setTimeLeft] = useState("");
  const [isLocked, setIsLocked] = useState(true);

  useEffect(() => {
    if (milestone.status !== 1) return;

    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const diff = milestone.releaseTime - now;

      if (diff <= 0) {
        setTimeLeft("Unlocked (Pending Claim)");
        setIsLocked(false);
        clearInterval(timer);
      } else {
        const d = Math.floor(diff / 86400);
        const h = Math.floor((diff % 86400) / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        let str = "";
        if (d > 0) str += `${d}d `;
        if (h > 0 || d > 0) str += `${h}h `;
        str += `${m}m ${s}s`;
        setTimeLeft(str);
        setIsLocked(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [milestone.status, milestone.releaseTime]);

  const handleStartReview = async () => {
    try {
      // 5 minutes lockup duration for testing/live demo purposes, in production this would be 7 days
      await startMsMutation.mutateAsync({
        projectId,
        milestoneId: milestone.id,
        milestoneTitle: milestone.title,
        lockupDurationSeconds: 300,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleFlag = async () => {
    try {
      await flagMsMutation.mutateAsync({
        projectId,
        milestoneId: milestone.id,
        milestoneTitle: milestone.title,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleClaim = async () => {
    try {
      await claimMsMutation.mutateAsync({
        projectId,
        milestoneId: milestone.id,
        milestoneTitle: milestone.title,
        amount: xlmAmt,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl bg-black/20 border border-border-dark text-left">
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Milestone #{milestone.id}</span>
          <h4 className="text-base font-bold text-white mt-0.5">{milestone.title}</h4>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm font-extrabold text-white">{xlmAmt} XLM</span>
          <span className={`px-2 py-0.5 text-[9px] rounded-full font-bold uppercase border ${currentStatus.color}`}>
            {currentStatus.label}
          </span>
        </div>
      </div>

      <p className="text-xs text-text-muted leading-relaxed">{milestone.description}</p>

      {/* Dynamic Action Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-3 border-t border-white/5">
        {/* Status display details */}
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          {milestone.status === 1 && (
            <>
              {isLocked ? <Lock className="h-3.5 w-3.5 text-cyan-400" /> : <Unlock className="h-3.5 w-3.5 text-green-400" />}
              <span>Challenge window ends in: <strong className="text-gray-200">{timeLeft}</strong></span>
            </>
          )}
          {milestone.status === 2 && (
            <>
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-red-400 font-medium">Disputed ({milestone.flagsCount} flags). Admin resolution pending.</span>
            </>
          )}
          {milestone.status === 4 && (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span className="text-green-400 font-medium">Claimed successfully</span>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          {/* Owner: Start Dispute window */}
          {isOwner && milestone.status === 0 && (
            <button
              onClick={handleStartReview}
              disabled={startMsMutation.isPending}
              className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1"
            >
              {startMsMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
              Initiate Review Window
            </button>
          )}

          {/* Owner: Claim Payout */}
          {isOwner && (milestone.status === 3 || (milestone.status === 1 && !isLocked)) && (
            <button
              onClick={handleClaim}
              disabled={claimMsMutation.isPending}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-600 text-white text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1"
            >
              {claimMsMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
              Claim Payout
            </button>
          )}

          {/* Sponsor: Flag Milestone */}
          {isSponsor && milestone.status === 1 && (
            <button
              onClick={handleFlag}
              disabled={flagMsMutation.isPending}
              className="px-3.5 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1"
            >
              {flagMsMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
              Flag Dispute
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: RegisterProjectForm
// -------------------------------------------------------------
function RegisterProjectForm({ onSuccess }: { onSuccess: () => void }) {
  const { walletAddress, isConnected, connect } = useStellarWallet();
  const registerMutation = useRegisterProject();

  const [name, setName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Developer Tooling");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;
    try {
      await registerMutation.mutateAsync({
        name,
        githubUrl,
        description,
        category,
      });
      setName("");
      setGithubUrl("");
      setDescription("");
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-panel p-8 rounded-3xl border border-border-dark flex flex-col gap-6 text-left">
      <div>
        <h2 className="text-xl font-black text-white">Register Your Repository</h2>
        <p className="text-xs text-text-muted mt-1 leading-relaxed">
          Sponsors fund project escrows in our smart contract. You can propose milestones and request payouts.
        </p>
      </div>

      {!isConnected ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white/5 border border-border-dark rounded-2xl text-center">
          <Lock className="h-10 w-10 text-border-dark mb-4" />
          <h3 className="font-bold text-gray-300">Wallet Connection Required</h3>
          <p className="text-text-muted text-xs max-w-sm mt-1 mb-6">
            You must connect Freighter or Albedo wallet to authenticate and register projects in the `ProjectRegistry` smart contract.
          </p>
          <button
            onClick={connect}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:shadow-lg transition-all cursor-pointer"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-300">Project Name</label>
            <input
              type="text"
              placeholder="e.g. Soroban React Hooks"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-black/40 border border-border-dark text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-300">GitHub Repository URL</label>
            <input
              type="url"
              placeholder="https://github.com/your-username/your-repo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-black/40 border border-border-dark text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary font-mono"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-300">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-black/40 border border-border-dark text-sm text-white focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="Developer Tooling">Developer Tooling</option>
              <option value="Smart Contracts">Smart Contracts</option>
              <option value="SDKs & Libraries">SDKs & Libraries</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Applications">Applications</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-300">Description</label>
            <textarea
              placeholder="Provide a detailed description of the project, its goals, and why people should sponsor it..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="px-4 py-3 rounded-xl bg-black/40 border border-border-dark text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary h-28 resize-none leading-relaxed"
              required
            />
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-tr from-primary to-orange-500 text-white text-sm font-bold shadow-md hover:shadow-primary/20 disabled:opacity-50 transition-all cursor-pointer mt-2"
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting to ProjectRegistry...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Register Project
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center p-32">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="text-xs text-text-muted mt-4">Loading Dashboard Content...</span>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
