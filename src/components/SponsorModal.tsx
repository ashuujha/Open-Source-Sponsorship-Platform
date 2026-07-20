import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, ShieldCheck, Star, Users, Check, Flame, Wallet, AlertCircle } from "lucide-react";
import { Project } from "../types";
import { useSponsorProject } from "@/hooks/useContracts";
import { useStellarWallet } from "@/hooks/useStellarWallet";

interface SponsorModalProps {
  project: Project;
  onClose: () => void;
  onSponsorSuccess: (amount: number, sponsorName: string, tierName: string, message?: string, txHash?: string) => void;
}

interface Tier {
  name: string;
  amount: number;
  perks: string[];
  color: string;
}

export default function SponsorModal({ project, onClose, onSponsorSuccess }: SponsorModalProps) {
  const { walletAddress, isConnected, connect } = useStellarWallet();
  const sponsorMutation = useSponsorProject();

  const [selectedTier, setSelectedTier] = useState<number>(1); // default Supporter (50 XLM)
  const [customAmount, setCustomAmount] = useState<string>("");
  const [sponsorName, setSponsorName] = useState<string>("");
  const [sponsorMessage, setSponsorMessage] = useState<string>("");
  const [step, setStep] = useState<"details" | "payment" | "success">("details");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdTxHash, setCreatedTxHash] = useState<string>("");

  const tiers: Tier[] = [
    { name: "Backer", amount: 10, perks: ["Sponsor badge on profile", "Name in README.md", "Access to sponsor Discord"], color: "border-neutral-800 hover:border-neutral-500" },
    { name: "Supporter", amount: 50, perks: ["All previous perks", "Prioritized issue support", "Early access to feature roadmaps"], color: "border-blue-500/50 hover:border-blue-500 shadow-blue-500/5" },
    { name: "Bronze Sponsor", amount: 250, perks: ["All previous perks", "Your logo on website footer", "Monthly dev feedback call"], color: "border-amber-700/60 hover:border-amber-600 shadow-amber-600/5" },
    { name: "Silver Sponsor", amount: 1000, perks: ["All previous perks", "Medium logo in README", "1x dedicated support hour/mo"], color: "border-slate-400/50 hover:border-slate-300 shadow-slate-300/5" },
    { name: "Gold Sponsor", amount: 5000, perks: ["All previous perks", "Large logo on primary page", "4x dedicated consulting hours/mo"], color: "border-yellow-500/50 hover:border-yellow-400 shadow-yellow-500/5" },
  ];

  const getAmount = () => {
    if (selectedTier === -1) {
      return parseFloat(customAmount) || 0;
    }
    return tiers[selectedTier].amount;
  };

  const getTierName = () => {
    if (selectedTier === -1) {
      return "Custom Champion";
    }
    return tiers[selectedTier].name;
  };

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorName.trim()) {
      alert("Please enter your name or organization.");
      return;
    }
    if (getAmount() <= 0) {
      alert("Sponsorship amount must be greater than 0 XLM.");
      return;
    }
    setStep("payment");
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isConnected || !walletAddress) {
      try {
        await connect();
        return;
      } catch (err: any) {
        setErrorMsg("Failed to connect wallet. Please open Freighter or Albedo.");
        return;
      }
    }

    setIsProcessing(true);
    try {
      const blockchainProjectId = parseInt(project.id, 10) || 1;
      
      const txHash = await sponsorMutation.mutateAsync({
        projectId: blockchainProjectId,
        amount: getAmount(),
        projectName: project.name,
      });

      setCreatedTxHash(txHash);
      setIsProcessing(false);
      setStep("success");
      onSponsorSuccess(getAmount(), sponsorName.trim(), getTierName(), sponsorMessage.trim() || undefined, txHash);
    } catch (err: any) {
      setIsProcessing(false);
      let rawMsg = err?.message || "Transaction failed. Please check your wallet configuration.";
      if (typeof rawMsg !== "string") {
        try { rawMsg = JSON.stringify(rawMsg); } catch (e) { rawMsg = String(rawMsg); }
      }
      if (rawMsg.includes("is_project_verified") || rawMsg.includes("Contract, #3") || rawMsg.includes('"contractCode":3')) {
        rawMsg = "Project is not verified on the smart contract registry (Contract Error #3). Only verified projects can receive sponsorships. Please verify this project in the Admin Console (/settings).";
      } else if (rawMsg.includes("Simulation failed") && rawMsg.includes("{")) {
        rawMsg = "Transaction simulation failed. Please ensure the project is verified and your wallet has sufficient XLM balance.";
      }
      setErrorMsg(rawMsg);
    }
  };

  return (
    <div id="modal-portal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={step !== "success" && !isProcessing ? onClose : undefined}
      />

      {/* Modal Card */}
      <motion.div
        id="modal-window"
        className="relative bg-neutral-950 border border-neutral-900 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-left z-10 flex flex-col max-h-[90vh]"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
      >
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />

        {/* Modal Header */}
        <div className="p-6 border-b border-neutral-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-blue-500 fill-blue-500/10" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100 font-sans">
                {step === "success" ? "Thank You!" : `Sponsor ${project.name}`}
              </h3>
              <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                {step === "details" && "Select support level & share an encouraging message"}
                {step === "payment" && "Confirm your Stellar transaction details"}
                {step === "success" && "Your sponsorship is active!"}
              </p>
            </div>
          </div>
          {step !== "success" && !isProcessing && (
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-300 p-1.5 rounded-lg hover:bg-neutral-900 transition-colors cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence mode="wait">
            {step === "details" && (
              <motion.form
                key="details"
                onSubmit={handleNextToPayment}
                className="space-y-6"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Tiers list */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-neutral-400 font-sans uppercase tracking-wider block">
                    Choose Support Level
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tiers.map((t, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedTier(idx)}
                        className={`p-4 rounded-2xl border bg-neutral-900/40 cursor-pointer select-none transition-all duration-300 ${t.color} ${
                          selectedTier === idx
                            ? "bg-blue-950/20 ring-1 ring-blue-500/50 scale-[1.01]"
                            : ""
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-neutral-200">{t.name}</h4>
                          <span className="text-xs font-bold text-blue-400 font-mono">
                            {t.amount} XLM
                          </span>
                        </div>
                        <ul className="mt-2.5 space-y-1">
                          {t.perks.slice(0, 2).map((p, pIdx) => (
                            <li key={pIdx} className="text-[10px] text-neutral-400 flex items-center gap-1.5">
                              <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                              <span className="truncate">{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    {/* Custom tier */}
                    <div
                      onClick={() => setSelectedTier(-1)}
                      className={`p-4 rounded-2xl border bg-neutral-900/40 cursor-pointer select-none transition-all duration-300 border-neutral-800 hover:border-neutral-600 ${
                        selectedTier === -1
                          ? "bg-blue-950/20 ring-1 ring-blue-500/50 border-blue-500/50 scale-[1.01]"
                          : ""
                      }`}
                    >
                      <h4 className="text-xs font-bold text-neutral-200">Custom Sponsor</h4>
                      <p className="text-[10px] text-neutral-400 mt-1">Specify custom XLM budget</p>
                      {selectedTier === -1 && (
                        <div className="mt-2 flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5">
                          <input
                            type="number"
                            placeholder="Amount"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            className="bg-transparent text-xs text-neutral-100 focus:outline-none w-full font-mono"
                            min="1"
                            required={selectedTier === -1}
                          />
                          <span className="text-[10px] text-neutral-500 font-sans">XLM</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sender Details */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-400 font-sans uppercase tracking-wider block mb-2">
                      Sponsor Name / Organization
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp, Jane Doe"
                      value={sponsorName}
                      onChange={(e) => setSponsorName(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl px-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-semibold text-neutral-400 font-sans uppercase tracking-wider block">
                        Message to Maintainers (Optional)
                      </label>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {sponsorMessage.length}/120
                      </span>
                    </div>
                    <textarea
                      placeholder="Thank you for making open-source better! We rely heavily on this package."
                      value={sponsorMessage}
                      onChange={(e) => setSponsorMessage(e.target.value.slice(0, 120))}
                      rows={2}
                      className="w-full bg-neutral-900 border border-neutral-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl px-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-bold transition-all shadow-lg shadow-blue-600/10 cursor-pointer active:scale-98"
                >
                  Proceed to Checkout ({getAmount()} XLM)
                </button>
              </motion.form>
            )}

            {step === "payment" && (
              <motion.form
                key="payment"
                onSubmit={handlePay}
                className="space-y-6"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Web3 Wallet confirmation card */}
                <div className="space-y-4">
                  <div className="bg-neutral-900/60 p-4 border border-neutral-800 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-200">Decentralized Payment Escrow</h4>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        Funds are safely locked in a Soroban smart contract and released only upon milestone reviews.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl space-y-3.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-400">Recipient Contract:</span>
                      <span className="font-semibold text-neutral-200 font-mono">SponsorVault (Soroban)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-400">Target Project:</span>
                      <span className="font-semibold text-neutral-200">{project.name}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-400">Sponsor Tier:</span>
                      <span className="font-semibold text-blue-400">{getTierName()}</span>
                    </div>
                    <div className="flex justify-between text-xs border-t border-neutral-800 pt-2.5">
                      <span className="text-neutral-400">Connected Wallet:</span>
                      <span className="font-semibold text-neutral-300 font-mono">
                        {walletAddress ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}` : "Not connected"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs border-t border-neutral-800 pt-2.5">
                      <span className="text-neutral-400 font-bold">Total Contribution:</span>
                      <span className="font-extrabold text-emerald-400 font-mono">{getAmount()} XLM</span>
                    </div>
                  </div>
                </div>

                {project.verified === false && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2 text-xs text-amber-300">
                    <AlertCircle className="w-4.5 h-4.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Project Pending Admin Verification</p>
                      <p className="text-[11px] text-amber-400/80 mt-0.5">
                        This project is registered on-chain but has not been verified by the platform admin. Smart contract escrows require admin verification before receiving funds. You can verify it in the Admin Console (/settings).
                      </p>
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl flex items-start gap-2 text-xs text-red-400">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("details")}
                    disabled={isProcessing}
                    className="w-1/3 h-11 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 text-neutral-300 rounded-xl font-sans text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing || project.verified === false}
                    className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-bold transition-all shadow-lg shadow-emerald-600/10 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 cursor-pointer"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Approving in Wallet...
                      </span>
                    ) : project.verified === false ? (
                      <span>Unverified (Requires Admin Verification)</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        Authorize {getAmount()} XLM
                      </span>
                    )}
                  </button>
                </div>
              </motion.form>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                className="text-center py-6 space-y-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative flex items-center justify-center mx-auto w-20 h-20">
                  <motion.div
                    className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                  <div className="relative w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                </div>

                <div className="space-y-2 max-w-sm mx-auto">
                  <h3 className="text-lg font-bold text-neutral-100 font-sans">
                    Sponsorship Confirmed!
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    You have successfully sponsored <span className="font-semibold text-neutral-200">{project.name}</span> on the Stellar Testnet ledger. Your transaction is now securely registered!
                  </p>
                </div>

                <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-4 text-left divide-y divide-neutral-800/60 max-w-sm mx-auto">
                  <div className="pb-2.5 flex justify-between text-xs">
                    <span className="text-neutral-400">Sponsor Account:</span>
                    <span className="font-semibold text-neutral-200 font-mono">
                      {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}` : ""}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between text-xs">
                    <span className="text-neutral-400">Sponsor Tier:</span>
                    <span className="font-semibold text-blue-400">{getTierName()}</span>
                  </div>
                  <div className="py-2.5 flex justify-between text-xs">
                    <span className="text-neutral-400 font-sans">Contribution:</span>
                    <span className="font-bold text-emerald-400 font-mono">{getAmount()} XLM</span>
                  </div>
                  {createdTxHash && (
                    <div className="pt-2.5 flex justify-between text-xs">
                      <span className="text-neutral-400">Transaction:</span>
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${createdTxHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 font-bold hover:underline font-mono"
                      >
                        {createdTxHash.slice(0, 6)}...{createdTxHash.slice(-6)} ↗
                      </a>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full max-w-sm mx-auto h-11 flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-bold transition-all shadow-lg cursor-pointer"
                >
                  Close & Refresh Page
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
