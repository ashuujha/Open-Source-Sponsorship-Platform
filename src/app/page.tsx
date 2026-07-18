"use client";

import Link from "next/link";
import { useStellarWallet } from "@/hooks/useStellarWallet";
import { ArrowRight, Code, ShieldCheck, Coins, Zap, Users, Globe } from "lucide-react";

export default function LandingPage() {
  const { isConnected, connect } = useStellarWallet();

  const stats = [
    { label: "Total Sponsored", value: "250K+ XLM" },
    { label: "Open Source Projects", value: "140+" },
    { label: "Disputes Resolved", value: "100%" },
  ];

  const features = [
    {
      title: "Decentralized Escrow",
      description: "Sponsorship funds are securely locked in Soroban smart contracts and only released when project owners complete pre-defined milestones.",
      icon: ShieldCheck,
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Milestone Dispute Windows",
      description: "Sponsors have a dispute window to review milestone delivery. If any issues arise, sponsors can flag the milestone to hold the payout.",
      icon: Coins,
      color: "from-cyan-500 to-blue-500",
    },
    {
      title: "Zero Border Fees",
      description: "Enjoy borderless, low-cost micro-payments powered by the Stellar network. Sponsoring your favorite developer takes seconds.",
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
    },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8 text-center">
        <div className="absolute top-0 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
          Empowering Open-Source with <br />
          <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
            Smart Blockchain Sponsorships
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-text-muted">
          A decentralized platform for supporting open-source maintainers. Secure milestone-based payouts, community review windows, and borderless transactions on Stellar.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard"
            className="glow-btn flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-tr from-primary to-orange-500 text-white font-semibold shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
          >
            Explore Projects
            <ArrowRight className="h-4 w-4" />
          </Link>
          {!isConnected ? (
            <button
              onClick={connect}
              className="px-6 py-3 rounded-xl border border-border-dark bg-white/5 text-gray-200 font-semibold hover:bg-white/10 hover:border-gray-500 transition-all cursor-pointer"
            >
              Connect Wallet
            </button>
          ) : (
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl border border-border-dark bg-white/5 text-gray-200 font-semibold hover:bg-white/10 hover:border-gray-500 transition-all cursor-pointer"
            >
              Go to Dashboard
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="mx-auto mt-20 max-w-4xl grid grid-cols-1 gap-6 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="glass-panel rounded-2xl p-6 border border-border-dark flex flex-col items-center justify-center"
            >
              <span className="text-3xl font-extrabold text-white">{stat.value}</span>
              <span className="mt-2 text-sm text-text-muted">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-border-dark">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Why StellarSponsor?
          </h2>
          <p className="mt-4 text-text-muted">
            We bridge the gap between open-source sponsors and developers, ensuring transparency and trust with smart contract governance.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="glass-panel glass-panel-hover rounded-3xl p-8 flex flex-col items-start text-left"
              >
                <div className={`p-3 rounded-2xl bg-gradient-to-tr ${feature.color} text-white mb-6 shadow-md`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust & Verification CTA */}
      <section className="w-full max-w-5xl px-4 py-16 mb-20 sm:px-6 lg:px-8 glass-panel rounded-3xl border border-border-dark relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/10 rounded-full blur-2xl" />
        <div className="md:flex items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold text-white mb-2">Are you an Open-Source Developer?</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              List your repository, configure development milestones, and start receiving verified support from sponsors worldwide. We support Freighter and Albedo wallets for instant authentication.
            </p>
          </div>
          <Link
            href="/dashboard?action=register"
            className="mt-6 md:mt-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-bg-dark font-bold hover:bg-gray-200 transition-all shadow-lg whitespace-nowrap cursor-pointer"
          >
            <Code className="h-4 w-4" />
            Register Your Project
          </Link>
        </div>
      </section>
    </div>
  );
}
