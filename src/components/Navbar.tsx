"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStellarWallet } from "@/hooks/useStellarWallet";
import { useTransactionStore } from "@/state/useTransactionStore";
import { Wallet, Activity, RefreshCw, BarChart2, Settings, Home, LayoutDashboard, Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { walletAddress, isConnected, walletType, connect, disconnect } = useStellarWallet();
  const { transactions } = useTransactionStore();
  const [isOpen, setIsOpen] = useState(false);

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
    <nav className="sticky top-0 z-50 border-b border-neutral-800 bg-[#0b0c10]/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center w-full justify-between md:justify-start">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-base shadow group-hover:bg-blue-500 transition-all">
                S
              </div>
              <span className="text-sm font-bold text-white tracking-wide uppercase font-sans">
                Stellar<span className="text-blue-500">Sponsor</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-1 lg:space-x-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? "text-blue-400 bg-neutral-900 border border-neutral-800"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.name}
                    {!!item.badge && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Hamburger Toggle for Mobile */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 focus:outline-none transition-colors"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
          
          {/* Desktop Wallet Section */}
          <div className="hidden md:flex items-center gap-4">
            {isConnected && walletAddress ? (
              <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5">
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
                  className="px-2.5 py-1 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500 hover:text-white text-[10px] font-bold transition-all cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Wallet className="h-3.5 w-3.5" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-neutral-800 bg-[#0b0c10] px-4 py-4 space-y-3">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "text-blue-400 bg-neutral-900 border border-neutral-800"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {!!item.badge && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-neutral-800 flex flex-col">
            {isConnected && walletAddress ? (
              <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2">
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider font-mono">
                    {walletType} Wallet
                  </span>
                  <span className="text-[10px] text-neutral-300 font-mono font-bold">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    disconnect();
                    setIsOpen(false);
                  }}
                  className="px-3 py-1 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500 hover:text-white text-[10px] font-bold transition-all"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  connect();
                  setIsOpen(false);
                }}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
              >
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
