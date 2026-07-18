"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStellarWallet } from "@/hooks/useStellarWallet";
import { useTransactionStore } from "@/state/useTransactionStore";
import { Wallet, Activity, RefreshCw, BarChart2, Settings, Home, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { walletAddress, isConnected, walletType, connect, disconnect } = useStellarWallet();
  const { transactions } = useTransactionStore();

  const activeTxCount = transactions.filter(
    (tx) => tx.status === "pending" || tx.status === "processing"
  ).length;

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Live Feed", href: "/feed", icon: Activity },
    { name: "Tx Center", href: "/transactions", icon: RefreshCw, badge: activeTxCount },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border-dark bg-bg-dark/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-orange-500 text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-all">
                S
              </div>
              <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Stellar<span className="text-primary">Sponsor</span>
              </span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-1 lg:space-x-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-text-muted hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                    {!!item.badge && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isConnected && walletAddress ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs text-text-muted">{walletType} Wallet</span>
                  <span className="text-xs text-gray-300 font-mono font-semibold">
                    {shortenAddress(walletAddress)}
                  </span>
                </div>
                <button
                  onClick={disconnect}
                  className="px-4 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="glow-btn flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-tr from-primary to-orange-500 text-white text-sm font-semibold hover:shadow-lg transition-all cursor-pointer"
              >
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function shortenAddress(addr: string) {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}
