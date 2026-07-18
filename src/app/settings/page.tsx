"use client";

import React, { useState } from "react";
import { useStellarWallet } from "@/hooks/useStellarWallet";
import {
  useAllProjectsQuery,
  useVerifyProject,
  useResolveMilestone,
} from "@/hooks/useContracts";
import { CONTRACT_ADDRESSES } from "@/services/stellar";
import { 
  Settings, ShieldAlert, CheckCircle, XCircle, Loader2, ExternalLink, 
  Key, RefreshCw, Sparkles, Check, AlertTriangle 
} from "lucide-react";

export default function SettingsPage() {
  const { walletAddress, isConnected, connect } = useStellarWallet();
  const verifyMutation = useVerifyProject();
  const resolveMutation = useResolveMilestone();

  // Load all projects from registry
  const { data: projects = [], isLoading: isProjectsLoading } = useAllProjectsQuery();

  const handleVerify = async (projectId: number, verified: boolean, projectName: string) => {
    try {
      await verifyMutation.mutateAsync({ projectId, verified, projectName });
    } catch (e) {
      console.error(e);
    }
  };

  // Dispute resolution states
  const [resolveProjectId, setResolveProjectId] = useState("");
  const [resolveMilestoneId, setResolveMilestoneId] = useState("");

  const handleResolveFlag = async (approve: boolean) => {
    if (!resolveProjectId || !resolveMilestoneId) return;
    try {
      await resolveMutation.mutateAsync({
        projectId: Number(resolveProjectId),
        milestoneId: Number(resolveMilestoneId),
        milestoneTitle: `Milestone #${resolveMilestoneId}`,
        approve,
      });
      setResolveProjectId("");
      setResolveMilestoneId("");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-neutral-200 overflow-x-hidden selection:bg-blue-600/30 selection:text-white flex flex-col font-sans relative">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8 text-left relative z-10">
        {/* Page Header */}
        <div className="border-b border-neutral-900/60 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/20 border border-red-800/25 rounded-full text-[10px] font-bold text-red-400 mb-4">
            <ShieldAlert className="w-3 h-3 text-red-400" />
            Administrator Restricted Access (RBAC)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight flex items-center gap-2">
            <Settings className="h-8 w-8 text-blue-500 animate-spin-slow" />
            Administration Console
          </h1>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1 leading-normal">
            Manage repository verifications, configure deployment footprints, and arbitrate flagged escrow payouts.
          </p>
        </div>

        {/* Configurations grid */}
        <div className="space-y-6">
          {/* Contracts addresses block */}
          <section className="bg-neutral-900/40 border border-neutral-900 rounded-3xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-neutral-200 flex items-center gap-2">
              <Key className="h-4.5 w-4.5 text-blue-500" />
              On-Chain Contract Configurations
            </h2>
            <p className="text-xs text-neutral-400">
              Active address variables deployed on the Stellar testnet ledger. Inspect contracts details using external explorers.
            </p>

            <div className="flex flex-col gap-3 font-mono text-[11px]">
              <div className="flex justify-between items-center bg-neutral-950/50 p-3 rounded-xl border border-neutral-900 flex-wrap gap-2">
                <span className="text-neutral-500 font-sans font-bold">Project Registry:</span>
                <a
                  href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ADDRESSES.registry}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 truncate max-w-md hover:underline"
                >
                  {CONTRACT_ADDRESSES.registry}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="flex justify-between items-center bg-neutral-950/50 p-3 rounded-xl border border-neutral-900 flex-wrap gap-2">
                <span className="text-neutral-500 font-sans font-bold">Sponsorship Vault:</span>
                <a
                  href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ADDRESSES.vault}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 truncate max-w-md hover:underline"
                >
                  {CONTRACT_ADDRESSES.vault}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="flex justify-between items-center bg-neutral-950/50 p-3 rounded-xl border border-neutral-900 flex-wrap gap-2">
                <span className="text-neutral-500 font-sans font-bold">Sponsorship Asset:</span>
                <span className="text-neutral-300 font-bold font-sans">
                  Native Stellar Lumens (XLM)
                </span>
              </div>
            </div>
          </section>

          {/* Admin panel controls */}
          <section className="bg-neutral-900/40 border border-neutral-900 rounded-3xl p-6 space-y-6">
            <h2 className="text-sm font-bold text-neutral-200 flex items-center gap-2 border-b border-neutral-900/60 pb-3">
              <ShieldAlert className="h-4.5 w-4.5 text-red-500" />
              Contract Action Panel
            </h2>

            {!isConnected ? (
              <div className="flex flex-col items-center justify-center p-10 bg-neutral-950/30 border border-neutral-900 rounded-2xl text-center space-y-4">
                <p className="text-xs text-neutral-400 max-w-xs leading-normal">
                  Connect the administrator keypair wallet to sign verification or dispute transactions.
                </p>
                <button
                  onClick={connect}
                  className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/10 cursor-pointer"
                >
                  Connect Wallet
                </button>
              </div>
            ) : (
              <div className="space-y-8 text-xs">
                
                {/* Project registry verification list */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-sans">
                    Verify Project Submissions
                  </h3>
                  {isProjectsLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                    </div>
                  ) : projects.length === 0 ? (
                    <p className="text-neutral-500 text-xs italic">No project submissions registered on contract registry.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {projects.map((project) => (
                        <div
                          key={project.id}
                          className="flex justify-between items-center bg-neutral-950/40 p-4 rounded-xl border border-neutral-900/80 flex-wrap gap-4"
                        >
                          <div className="space-y-1">
                            <h4 className="font-bold text-neutral-200">{project.name}</h4>
                            <p className="text-[10px] text-neutral-500 font-mono">
                              Owner: {project.owner.slice(0, 10)}...{project.owner.slice(-10)}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                              project.verified 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/5" 
                                : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/5"
                            }`}>
                              {project.verified ? "Verified" : "Pending Verification"}
                            </span>

                            {project.verified ? (
                              <button
                                onClick={() => handleVerify(project.id, false, project.name)}
                                disabled={verifyMutation.isPending}
                                className="px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500 hover:text-white text-red-400 font-bold transition-all cursor-pointer"
                              >
                                Revoke
                              </button>
                            ) : (
                              <button
                                onClick={() => handleVerify(project.id, true, project.name)}
                                disabled={verifyMutation.isPending}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all cursor-pointer shadow-md"
                              >
                                Verify Project
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Milestone Dispute resolution center */}
                <div className="space-y-4 border-t border-neutral-900 pt-6">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-sans">
                      Escrow Dispute Arbitration
                    </h3>
                    <p className="text-neutral-400 leading-normal">
                      Resolve dispute flags raised by project backers. Releasing a milestone releases the corresponding XLM payout to the developer. Refusing it returns the funds to the project escrow's unallocated pool.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-2">
                    <div className="w-full space-y-1">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Project ID</label>
                      <input
                        type="number"
                        placeholder="e.g. 1"
                        value={resolveProjectId}
                        onChange={(e) => setResolveProjectId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div className="w-full space-y-1">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Milestone ID</label>
                      <input
                        type="number"
                        placeholder="e.g. 0"
                        value={resolveMilestoneId}
                        onChange={(e) => setResolveMilestoneId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      onClick={() => handleResolveFlag(false)}
                      disabled={resolveMutation.isPending || !resolveProjectId || !resolveMilestoneId}
                      className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500 hover:text-white text-red-400 font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <XCircle className="h-4 w-4" />
                      Arbitrate Refund
                    </button>
                    <button
                      onClick={() => handleResolveFlag(true)}
                      disabled={resolveMutation.isPending || !resolveProjectId || !resolveMilestoneId}
                      className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-500/10"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve Release
                    </button>
                  </div>
                </div>

              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
