"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useStellarWallet } from "@/hooks/useStellarWallet";
import {
  Sparkles,
  ArrowUpRight,
  Heart,
  Users,
  Search,
  BarChart3,
  ChevronRight,
  ShieldCheck,
  Code
} from "lucide-react";
import TechFlowDiagram from "@/components/TechFlowDiagram";

export default function LandingPage() {
  const { isConnected, connect } = useStellarWallet();
  const [infoCardModal, setInfoCardModal] = useState<{ title: string; desc: string; icon: string } | null>(null);

  const trustLogos = [
    { emoji: "🐙", name: "GitHub" },
    { emoji: "▲", name: "Vercel" },
    { emoji: "⚡", name: "Supabase" },
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-neutral-200 overflow-x-hidden selection:bg-blue-600/30 selection:text-white flex flex-col font-sans relative">
      
      {/* Background radial effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />

      {/* Main Content Space */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-16 space-y-24">
        
        {/* Hero Segment */}
        <section id="hero-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Side: Pitch info */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-950/20 border border-blue-800/25 rounded-full text-[10px] font-bold text-blue-400">
              <Sparkles className="w-3 h-3 text-blue-400" />
              Now supporting live Stellar & Soroban testnet escrows
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display text-white tracking-tight leading-[1.1] max-w-2xl">
              Fund Open Source. <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                Build the Future Together.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-xl font-sans">
              Accelerate innovation with direct, transparent blockchain sponsorships. Connect with maintainers, verify project repositories, and secure runway budgets locked in smart contracts.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/dashboard"
                className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/10 transition-colors cursor-pointer"
              >
                Start Sponsoring
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              {!isConnected ? (
                <button
                  onClick={connect}
                  className="h-11 px-5 rounded-xl border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60 text-neutral-300 text-xs font-semibold inline-flex items-center justify-center transition-all cursor-pointer"
                >
                  Connect Wallet
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  className="h-11 px-5 rounded-xl border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60 text-neutral-300 text-xs font-semibold inline-flex items-center justify-center transition-all cursor-pointer"
                >
                  Developer Studio
                </Link>
              )}
            </div>
          </div>

          {/* Right Side: Interactive tech flows */}
          <div className="lg:col-span-5 relative w-full">
            <TechFlowDiagram />
          </div>
        </section>

        {/* Logo Row: Trusted by standard */}
        <section className="text-center py-6 border-y border-neutral-900/40 space-y-4">
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
            TRUSTED COMPILER STACK & PARTNERS
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 text-neutral-400 font-sans font-bold text-sm">
            {trustLogos.map((l) => (
              <div key={l.name} className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-pointer">
                <span>{l.emoji}</span>
                <span>{l.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Features grid */}
        <section id="features-section" className="space-y-8 text-left">
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
              The Smart Contract Sponsorship Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-normal mt-2.5">
              We've eliminated payment intermediaries, introduced milestone dispute review windows, and unlocked trustless open-source backing.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Direct sponsorships - large primary block */}
            <div
              onClick={() => setInfoCardModal({
                title: "Decentralized Escrow",
                desc: "Platform donations lock directly into a secure Soroban smart contract. Instead of sending funds blindly, your backing XLM sits safely in an escrow vault, released incrementally as maintainers hit proposed development goals.",
                icon: "🛡️"
              })}
              className="glow-card border border-blue-500/10 hover:border-blue-500/30 p-6 md:col-span-2 rounded-3xl cursor-pointer group flex flex-col justify-between min-h-[190px] transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                  <Heart className="w-5 h-5 fill-blue-500/15" />
                </div>
                <h3 className="text-base font-bold text-neutral-100 font-sans">
                  Decentralized Smart Escrows
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed max-w-xl">
                  Sustain open-source repositories directly with recurring corporate and personal contributions. Zero platform processing fees for creators. Keep development healthy.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-blue-400 uppercase tracking-wider font-mono">
                <span>Learn about escrow mechanics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Team Collaboration */}
            <div
              onClick={() => setInfoCardModal({
                title: "Milestone Dispute Toggles",
                desc: "Sponsors maintain oversight. If a maintainer fails to deliver on a proposed milestone, you can instantly flag the milestone. Flagging holds the payout and signals the administrator to resolve the dispute, preventing capital loss.",
                icon: "⚠️"
              })}
              className="glow-card border border-neutral-900 p-6 rounded-3xl cursor-pointer group flex flex-col justify-between min-h-[190px] transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-100 font-sans">
                  Community Dispute Windows
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Establish developer review groups, inspect delivery timelines, and dispute milestones collectively prior to release.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-purple-400 uppercase tracking-wider font-mono">
                <span>Learn more</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Project Discovery */}
            <div
              onClick={() => setInfoCardModal({
                title: "Trust Verification",
                desc: "Maintain project integrity. Admin verification ensures that registered projects are legitimate open-source utilities. Verified projects unlock direct milestone-based sponsorship channels on the Stellar network.",
                icon: "🔍"
              })}
              className="glow-card border border-neutral-900 p-6 rounded-3xl cursor-pointer group flex flex-col justify-between min-h-[190px] transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-100 font-sans">
                  Verified Project Registries
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Avoid supply chain risks. Find, register, and verify underfunded dependencies inside your codebase and back them.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono">
                <span>Discover dependencies</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Impact Analytics */}
            <div
              onClick={() => setInfoCardModal({
                title: "Stellar Payments",
                desc: "Sponsoring taking seconds. Harnessing Stellar’s Native XLM Asset and Soroban smart contract footprint optimization, each transaction is confirmed in seconds with fractions of a cent in network fees.",
                icon: "⚡"
              })}
              className="glow-card border border-neutral-900 p-6 rounded-3xl col-span-1 md:col-span-2 cursor-pointer group flex flex-col justify-between min-h-[190px] transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-100 font-sans">
                  High-Performance Stellar Rails
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Track your sponsor capital's real impact. Verify transaction status, inspect ledger confirmation times, and explore on-chain logs in high fidelity.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                <span>Track contributions</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </section>

        {/* Developer CTA section */}
        <section className="bg-neutral-900/20 border border-neutral-900 rounded-3xl p-6 sm:p-12 space-y-6 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/2 rounded-full blur-[80px] pointer-events-none" />
          <div className="md:flex items-center justify-between gap-8">
            <div className="max-w-2xl space-y-2">
              <h3 className="text-xl font-bold text-white">Are you an Open-Source Developer?</h3>
              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                List your repository in our registry, proposed milestone roadmaps, and secure funding runway directly from backers worldwide. We support Freighter and Albedo wallets for instant authentication.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="mt-6 md:mt-0 inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-white text-neutral-950 font-bold hover:bg-neutral-200 transition-all shadow-lg whitespace-nowrap cursor-pointer text-xs"
            >
              <Code className="h-4 w-4" />
              Register Your Project
            </Link>
          </div>
        </section>
      </main>

      {/* Info Modal Detail */}
      <AnimatePresence>
        {infoCardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInfoCardModal(null)}
            />
            <motion.div
              className="relative bg-neutral-950 border border-neutral-900 rounded-3xl p-6 w-full max-w-md shadow-2xl z-10 text-left space-y-4"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
            >
              <div className="text-4xl">{infoCardModal.icon}</div>
              <h3 className="text-base font-bold text-white font-sans">{infoCardModal.title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">{infoCardModal.desc}</p>
              <button
                onClick={() => setInfoCardModal(null)}
                className="w-full h-10 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-semibold text-neutral-200 transition-colors cursor-pointer"
              >
                Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
