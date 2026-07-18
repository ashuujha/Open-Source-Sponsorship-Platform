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
    { name: "Admin", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-900/60 bg-[#070709]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-base shadow-lg shadow-blue-500/10 group-hover:scale-[1.03] transition-all">
                S
              </div>
              <span className="hidden sm:block text-sm font-black text-white tracking-tight uppercase font-mono">
                Stellar<span className="text-blue-500">Sponsor</span>
              </span>
            </Link>
            
            <div className="hidden md:ml-10 md:flex md:space-x-1 lg:space-x-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? "text-blue-400 bg-blue-950/20 border border-blue-800/10"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.name}
                    {!!item.badge && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-black text-white animate-pulse">
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
              <div className="flex items-center gap-3 bg-neutral-900/30 border border-neutral-900 rounded-2xl px-3 py-1.5">
                <div className="flex flex-col text-right">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider font-mono">
                    {walletType}
                  </span>
                  <span className="text-[10px] text-neutral-300 font-mono font-bold">
                    {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={disconnect}
                  className="px-2.5 py-1 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500 text-red-400 hover:text-white text-[10px] font-bold transition-all cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="h-9.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/10 cursor-pointer"
              >
                <Wallet className="h-3.5 w-3.5" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
