"use client";

import React, { useState } from "react";
import { useStellarWallet } from "@/hooks/useStellarWallet";
import {
  useAllProjectsQuery,
  useVerifyProject,
  useEscrowQuery,
  useMilestonesQuery,
  useResolveMilestone,
} from "@/hooks/useContracts";
import { CONTRACT_ADDRESSES } from "@/services/stellar";
import { Settings, ShieldAlert, CheckCircle, XCircle, Loader2, ExternalLink, Key } from "lucide-react";

export default function SettingsPage() {
  const { walletAddress, isConnected, connect } = useStellarWallet();
  const verifyMutation = useVerifyProject();
  const resolveMutation = useResolveMilestone();

  // Load all projects
  const { data: projects = [], isLoading: isProjectsLoading } = useAllProjectsQuery();

  const handleVerify = async (projectId: number, verified: boolean, projectName: string) => {
    try {
      await verifyMutation.mutateAsync({ projectId, verified, projectName });
    } catch (e) {
      console.error(e);
    }
  };

  // Filter flagged milestones across projects
  // In a full implementation, we could query flags. Let's make an elegant mockup list of flagged items or read from active queries
  // Since we want this to work dynamically, we'll scan all project milestones for Flagged status
  // We can let the admin input a Project ID and Milestone ID to resolve it, or scan them.
  // Let's create an input form for Dispute Resolution where the admin can enter Project ID, Milestone ID and Approve/Reject.
  // This is highly flexible and robust.
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
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8 text-left">
      <div className="border-b border-border-dark pb-6 mb-8">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Settings & Administration
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Manage system configurations, verify projects, and resolve dispute flags on sponsorships.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Active Smart Contracts */}
        <div className="glass-panel p-6 rounded-3xl border border-border-dark">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Contract Addresses Configuration
          </h2>
          <div className="flex flex-col gap-3 font-mono text-xs">
            <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5 flex-wrap gap-2">
              <span className="text-text-muted">Project Registry</span>
              <a
                href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ADDRESSES.registry}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1 font-semibold truncate max-w-md"
              >
                {CONTRACT_ADDRESSES.registry}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5 flex-wrap gap-2">
              <span className="text-text-muted">Sponsorship Vault</span>
              <a
                href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ADDRESSES.vault}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1 font-semibold truncate max-w-md"
              >
                {CONTRACT_ADDRESSES.vault}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5 flex-wrap gap-2">
              <span className="text-text-muted">Sponsorship Token (SAC)</span>
              <a
                href={`https://stellar.expert/explorer/testnet/asset/XLM`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1 font-semibold truncate max-w-md"
              >
                {CONTRACT_ADDRESSES.asset} (XLM native)
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Administration Actions */}
        <div className="glass-panel p-6 rounded-3xl border border-border-dark">
          <h2 className="text-base font-bold text-white mb-6 flex items-center gap-2 border-b border-border-dark pb-3">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            Administrative Controls (RBAC)
          </h2>

          {!isConnected ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white/5 border border-border-dark rounded-2xl text-center">
              <p className="text-xs text-text-muted mb-6">
                Connect the contract administrator wallet to access verification and dispute resolution.
              </p>
              <button
                onClick={connect}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:shadow-lg transition-all cursor-pointer"
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Projects Verification */}
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-gray-200">Verify Registered Projects</h3>
                {isProjectsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  </div>
                ) : projects.length === 0 ? (
                  <p className="text-xs text-text-muted">No projects registered.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="flex justify-between items-center bg-black/10 p-4 rounded-2xl border border-white/5 flex-wrap gap-4"
                      >
                        <div>
                          <h4 className="text-sm font-bold text-white">{project.name}</h4>
                          <span className="text-[10px] font-mono text-text-muted">
                            Owner: {project.owner.slice(0, 8)}...{project.owner.slice(-8)}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          {project.verified ? (
                            <button
                              onClick={() => handleVerify(project.id, false, project.name)}
                              disabled={verifyMutation.isPending}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 disabled:opacity-50 transition-all cursor-pointer"
                            >
                              Unverify
                            </button>
                          ) : (
                            <button
                              onClick={() => handleVerify(project.id, true, project.name)}
                              disabled={verifyMutation.isPending}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold hover:shadow-md disabled:opacity-50 transition-all cursor-pointer"
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

              {/* Milestone Dispute Resolution */}
              <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
                <h3 className="text-sm font-bold text-gray-200">Dispute & Flag Resolution</h3>
                <p className="text-xs text-text-muted max-w-lg leading-relaxed">
                  Enter the Project ID and Milestone ID to resolve dispute flags raised by project sponsors. Approving the milestone releases the funds to the developer; rejecting it refunds the funds back to the project's unallocated balance.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <input
                    type="number"
                    placeholder="Project ID"
                    value={resolveProjectId}
                    onChange={(e) => setResolveProjectId(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-border-dark text-xs text-white focus:outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Milestone ID"
                    value={resolveMilestoneId}
                    onChange={(e) => setResolveMilestoneId(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-black/40 border border-border-dark text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex gap-3 justify-end mt-2">
                  <button
                    onClick={() => handleResolveFlag(false)}
                    disabled={resolveMutation.isPending || !resolveProjectId || !resolveMilestoneId}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject & Refund
                  </button>
                  <button
                    onClick={() => handleResolveFlag(true)}
                    disabled={resolveMutation.isPending || !resolveProjectId || !resolveMilestoneId}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-green-500 text-white text-xs font-bold hover:shadow-md disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve Payout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
