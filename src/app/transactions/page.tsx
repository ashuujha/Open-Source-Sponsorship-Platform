"use client";

import { useTransactionStore } from "@/state/useTransactionStore";
import { RefreshCw, ExternalLink, AlertCircle, CheckCircle2, Clock, Trash2, RotateCw } from "lucide-react";

export default function TransactionsPage() {
  const { transactions, retryTransaction, clearTransactions } = useTransactionStore();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Processing
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircle2 className="h-3 w-3" />
            Confirmed
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertCircle className="h-3 w-3" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border-dark pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <RefreshCw className="h-8 w-8 text-primary" />
            Transaction Center
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Monitor, inspect, and retry transactions executed on the Stellar Testnet network.
          </p>
        </div>

        {transactions.length > 0 && (
          <button
            onClick={clearTransactions}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all self-start sm:self-center cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            Clear Logs
          </button>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="text-center p-24 glass-panel rounded-3xl border border-border-dark flex flex-col items-center justify-center">
          <Clock className="h-12 w-12 text-border-dark mb-4" />
          <h3 className="font-bold text-gray-300">No Transaction History</h3>
          <p className="text-text-muted text-sm mt-1 max-w-sm">
            Execute smart contract transactions in the Dashboard to track their lifecycles here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="glass-panel p-6 rounded-2xl border border-border-dark flex flex-col gap-4 hover:border-white/10 transition-colors"
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div>
                  <h3 className="font-bold text-white text-base leading-snug">{tx.description}</h3>
                  <span className="text-[10px] text-text-muted mt-1 block">
                    Executed on {new Date(tx.timestamp).toLocaleString()}
                  </span>
                </div>
                {getStatusBadge(tx.status)}
              </div>

              {/* Error log if failed */}
              {tx.status === "failed" && tx.error && (
                <div className="flex items-start gap-2 p-3.5 bg-red-500/5 border border-red-500/10 rounded-xl text-xs text-red-400 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{tx.error}</span>
                </div>
              )}

              {/* Hash and Retry Action */}
              <div className="flex justify-between items-center flex-wrap gap-4 mt-1 pt-3 border-t border-white/5">
                {tx.txHash ? (
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <span>Transaction Hash:</span>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-primary hover:underline flex items-center gap-1 font-semibold"
                    >
                      {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-8)}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ) : (
                  <span className="text-xs text-text-muted">Waiting for transaction hash...</span>
                )}

                {/* Retry action button */}
                {tx.status === "failed" && tx.retryAction && (
                  <button
                    onClick={() => retryTransaction(tx.id)}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer"
                  >
                    <RotateCw className="h-3.5 w-3.5 animate-hover-spin" />
                    Retry Submission
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
