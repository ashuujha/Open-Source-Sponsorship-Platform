import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, DollarSign, Users, Award, Bell, MessageSquare, Send, Check, 
  Clock, AlertTriangle, CheckCircle, ShieldAlert, Loader2, Play 
} from "lucide-react";
import { Project } from "../types";
import { useStellarWallet } from "@/hooks/useStellarWallet";
import { 
  useEscrowQuery, 
  useMilestonesQuery, 
  useProposeMilestone, 
  useStartMilestone, 
  useClaimMilestone, 
  useFlagMilestone, 
  useResolveMilestone 
} from "@/hooks/useContracts";

interface CreatorWorkspaceProps {
  projects: Project[];
  onUpdateProjectGoal: (projectId: string, newGoal: number) => void;
  onAddProjectUpdate: (projectId: string, title: string, content: string) => void;
}

interface Update {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  likes: number;
}

export default function CreatorWorkspace({ projects, onUpdateProjectGoal, onAddProjectUpdate }: CreatorWorkspaceProps) {
  const { walletAddress, isConnected } = useStellarWallet();
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const [newGoalValue, setNewGoalValue] = useState("");
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateContent, setUpdateContent] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [isSubmittingMilestone, setIsSubmittingMilestone] = useState(false);

  // New Milestone Form States
  const [msTitle, setMsTitle] = useState("");
  const [msDescription, setMsDescription] = useState("");
  const [msAmount, setMsAmount] = useState("");

  const activeProject = projects[selectedProjectIndex] || projects[0];
  const blockchainProjectId = parseInt(activeProject.id, 10) || 1;

  // Real-time Escrow & Milestones Queries
  const { data: escrow, isLoading: isEscrowLoading } = useEscrowQuery(blockchainProjectId);
  const { data: milestones = [], isLoading: isMilestonesLoading } = useMilestonesQuery(
    blockchainProjectId,
    escrow?.milestoneCount || 0
  );

  // Contract Action Mutations
  const proposeMilestoneMutation = useProposeMilestone();
  const startMilestoneMutation = useStartMilestone();
  const claimMilestoneMutation = useClaimMilestone();
  const flagMilestoneMutation = useFlagMilestone();
  const resolveMilestoneMutation = useResolveMilestone();

  const handleUpdateGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newGoalValue);
    if (!isNaN(val) && val > 0) {
      onUpdateProjectGoal(activeProject.id, val);
      setNewGoalValue("");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const handleProposeMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msTitle.trim() || !msDescription.trim() || !msAmount.trim()) return;

    setIsSubmittingMilestone(true);
    try {
      await proposeMilestoneMutation.mutateAsync({
        projectId: blockchainProjectId,
        title: msTitle.trim(),
        description: msDescription.trim(),
        amount: parseFloat(msAmount),
        projectName: activeProject.name,
      });

      setMsTitle("");
      setMsDescription("");
      setMsAmount("");
    } catch (err) {
      console.error("Failed to propose milestone:", err);
    } finally {
      setIsSubmittingMilestone(false);
    }
  };

  const handleStartReview = async (milestoneId: number, title: string) => {
    try {
      await startMilestoneMutation.mutateAsync({
        projectId: blockchainProjectId,
        milestoneId,
        milestoneTitle: title,
        lockupDurationSeconds: 120, // 2 minutes for quick testing/review in demo
      });
    } catch (err) {
      console.error("Failed to start milestone:", err);
    }
  };

  const handleClaimPayout = async (milestoneId: number, title: string, amount: number) => {
    try {
      await claimMilestoneMutation.mutateAsync({
        projectId: blockchainProjectId,
        milestoneId,
        milestoneTitle: title,
        amount,
      });
    } catch (err) {
      console.error("Failed to claim milestone:", err);
    }
  };

  const handleFlagDispute = async (milestoneId: number, title: string) => {
    try {
      await flagMilestoneMutation.mutateAsync({
        projectId: blockchainProjectId,
        milestoneId,
        milestoneTitle: title,
      });
    } catch (err) {
      console.error("Failed to flag milestone:", err);
    }
  };

  const handleResolveDispute = async (milestoneId: number, title: string, approve: boolean) => {
    try {
      await resolveMilestoneMutation.mutateAsync({
        projectId: blockchainProjectId,
        milestoneId,
        milestoneTitle: title,
        approve,
      });
    } catch (err) {
      console.error("Failed to resolve dispute:", err);
    }
  };

  const isOwner = walletAddress && activeProject.id && activeProject.maintainerName; // Simple check

  return (
    <div id="creator-workspace-container" className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      {/* Sidebar: Projects selector & Adjust Goals */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-neutral-900/40 border border-neutral-900 rounded-3xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-sans">
            Managed Projects
          </h3>
          <div className="space-y-2">
            {projects.map((proj, idx) => (
              <div
                key={proj.id}
                onClick={() => setSelectedProjectIndex(idx)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                  selectedProjectIndex === idx
                    ? "bg-blue-950/20 border-blue-500/50"
                    : "bg-neutral-950/40 border-neutral-800/40 hover:border-neutral-700/60"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-lg flex-shrink-0">
                    {proj.logo}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-neutral-100 truncate font-sans">
                      {proj.name}
                    </h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5 truncate">
                      {proj.category}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 font-mono">
                  <span className="text-[10px] font-bold text-emerald-400">
                    {escrow ? `${(Number(escrow.totalSponsored) / 10000000).toLocaleString()} XLM` : "0 XLM"}
                  </span>
                  <p className="text-[9px] text-neutral-500">locked</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Adjust monthly goal */}
        <div className="bg-neutral-900/40 border border-neutral-900 rounded-3xl p-5 space-y-4 relative overflow-hidden">
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-sans">
            Adjust Goals
          </h3>
          <form onSubmit={handleUpdateGoalSubmit} className="space-y-3.5">
            <div>
              <p className="text-[11px] text-neutral-400 leading-relaxed mb-3">
                Need more resources for development? Raise your monthly funding target to unlock subsequent core maintainer hiring goals.
              </p>
              <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 focus-within:border-blue-500 rounded-xl px-3 py-2 transition-colors">
                <input
                  type="number"
                  placeholder={`Current goal: ${activeProject.goalFunding.toLocaleString()} XLM`}
                  value={newGoalValue}
                  onChange={(e) => setNewGoalValue(e.target.value)}
                  className="bg-transparent text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none w-full font-mono"
                  required
                />
                <span className="text-[10px] text-neutral-500 font-sans">XLM/mo</span>
              </div>
            </div>
            <button
              type="submit"
              className="w-full h-9.5 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-bold transition-colors cursor-pointer"
            >
              Update Goal
            </button>
          </form>

          {/* Success Banner */}
          <AnimatePresence>
            {showAlert && (
              <motion.div
                className="absolute inset-x-0 bottom-0 bg-emerald-600/95 py-2.5 px-4 text-center flex items-center justify-center gap-2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
              >
                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                <span className="text-[10px] font-bold text-white font-sans">
                  Monthly funding goal updated successfully!
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Panel: Insights & Dynamic Sponsor List */}
      <div className="lg:col-span-2 space-y-6">
        {/* Creator Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-900/30 border border-neutral-800/40 p-4 rounded-2xl flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                Total Locked
              </p>
              <h4 className="text-sm font-bold text-neutral-100 font-mono mt-0.5">
                {escrow ? `${(Number(escrow.totalSponsored) / 10000000).toLocaleString()}` : "0"} XLM
              </h4>
            </div>
          </div>

          <div className="bg-neutral-900/30 border border-neutral-800/40 p-4 rounded-2xl flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                Unallocated Escrow
              </p>
              <h4 className="text-sm font-bold text-neutral-100 font-mono mt-0.5">
                {escrow ? `${(Number(escrow.balance) / 10000000).toLocaleString()}` : "0"} XLM
              </h4>
            </div>
          </div>

          <div className="bg-neutral-900/30 border border-neutral-800/40 p-4 rounded-2xl flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                Active Milestones
              </p>
              <h4 className="text-sm font-bold text-neutral-100 font-mono mt-0.5">
                {escrow ? escrow.milestoneCount.toString() : "0"} Proposed
              </h4>
            </div>
          </div>
        </div>

        {/* Milestone Tracker & Escrow Control Section */}
        <div className="bg-neutral-900/40 border border-neutral-900 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-sans flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-500" />
              On-Chain Milestones Roadmap
            </h3>
            <span className="text-[9px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/10 font-mono">
              Smart Contract Enforced
            </span>
          </div>

          {isMilestonesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
            </div>
          ) : milestones.length === 0 ? (
            <p className="text-xs text-neutral-500 py-6 text-center">No milestones proposed for this project yet.</p>
          ) : (
            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {milestones.map((ms) => {
                const amountXlm = Number(ms.amount) / 10000000;
                
                // Status Mapping: 0 = Proposed, 1 = Approved, 2 = Claimed, 3 = Disputed
                const isProposed = ms.status === 0;
                const isActive = ms.status === 1;
                const isClaimed = ms.status === 2;
                const isDisputed = ms.status === 3;

                // Simple check if lockup has expired
                const now = Math.floor(Date.now() / 1000);
                const hasExpired = Number(ms.releaseTime) > 0 && now > Number(ms.releaseTime);

                return (
                  <div key={ms.id} className="p-4 bg-neutral-950/50 border border-neutral-900 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1.5 text-xs flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-neutral-200">Milestone #{ms.id}: {ms.title}</span>
                        {isProposed && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/5 text-yellow-500 uppercase">Proposed</span>}
                        {isActive && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/5 text-blue-400 uppercase animate-pulse">In Review</span>}
                        {isClaimed && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/5 text-emerald-400 uppercase">Claimed</span>}
                        {isDisputed && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/5 text-red-500 uppercase">Disputed</span>}
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">{ms.description}</p>
                      
                      {isActive && (
                        <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-mono">
                          <Clock className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Review ends: {new Date(Number(ms.releaseTime) * 1000).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2.5 min-w-[120px]">
                      <span className="text-xs font-black text-emerald-400 font-mono">{amountXlm.toLocaleString()} XLM</span>
                      
                      <div className="flex flex-wrap gap-1.5 justify-end">
                        {/* Creator actions */}
                        {isProposed && (
                          <button
                            onClick={() => handleStartReview(ms.id, ms.title)}
                            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-white/20" />
                            Start Review
                          </button>
                        )}

                        {isActive && hasExpired && (
                          <button
                            onClick={() => handleClaimPayout(ms.id, ms.title, amountXlm)}
                            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Claim Payout
                          </button>
                        )}

                        {/* Backer action */}
                        {isActive && !hasExpired && (
                          <button
                            onClick={() => handleFlagDispute(ms.id, ms.title)}
                            className="px-3 py-1 rounded bg-red-950/20 hover:bg-red-900/30 border border-red-900/20 text-red-400 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            Flag Dispute
                          </button>
                        )}

                        {/* Admin dispute arbitration */}
                        {isDisputed && (
                          <>
                            <button
                              onClick={() => handleResolveDispute(ms.id, ms.title, true)}
                              className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/10 text-[9px] font-bold transition-all cursor-pointer"
                            >
                              Resolve Release
                            </button>
                            <button
                              onClick={() => handleResolveDispute(ms.id, ms.title, false)}
                              className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/10 text-[9px] font-bold transition-all cursor-pointer"
                            >
                              Resolve Refund
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Two column split: Propose Milestone Form vs Broadcast Update */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Propose a Milestone Form */}
          <div className="bg-neutral-900/40 border border-neutral-900 rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-sans flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-500" />
              Propose New Milestone
            </h3>
            <form onSubmit={handleProposeMilestoneSubmit} className="space-y-3.5">
              <div>
                <input
                  type="text"
                  placeholder="Milestone Title (e.g. Beta release)"
                  value={msTitle}
                  onChange={(e) => setMsTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="Describe what will be delivered for this milestone to your sponsors..."
                  value={msDescription}
                  onChange={(e) => setMsDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none resize-none"
                  required
                />
              </div>
              <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 focus-within:border-blue-500 rounded-xl px-3 py-2">
                <input
                  type="number"
                  placeholder="Milestone Payout Budget"
                  value={msAmount}
                  onChange={(e) => setMsAmount(e.target.value)}
                  className="bg-transparent text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none w-full font-mono"
                  min="1"
                  required
                />
                <span className="text-[10px] text-neutral-500 font-sans">XLM</span>
              </div>
              <button
                type="submit"
                disabled={isSubmittingMilestone}
                className="w-full h-9.5 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingMilestone ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Propose Milestone
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Post updates for sponsors */}
          <div className="bg-neutral-900/40 border border-neutral-900 rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-sans flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              Broadcast Update
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (updateTitle.trim() && updateContent.trim()) {
                onAddProjectUpdate(activeProject.id, updateTitle, updateContent);
                setUpdateTitle("");
                setUpdateContent("");
              }
            }} className="space-y-3.5">
              <div>
                <input
                  type="text"
                  placeholder="Update Title (e.g. Next.js 15 Release)"
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="Write a message to your loyal sponsors. This will be posted immediately on the sponsor board..."
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  rows={2}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full h-9.5 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-bold transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Publish to Board
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
