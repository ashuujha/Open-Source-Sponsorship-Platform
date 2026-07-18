import { create } from "zustand";

export interface Transaction {
  id: string;
  description: string;
  status: "pending" | "processing" | "confirmed" | "failed";
  txHash: string | null;
  error: string | null;
  timestamp: number;
  retryAction?: () => Promise<any>;
}

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (
    id: string,
    description: string,
    retryAction?: () => Promise<any>
  ) => void;
  updateTransaction: (
    id: string,
    updates: Partial<Omit<Transaction, "id">>
  ) => void;
  clearTransactions: () => void;
  retryTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  addTransaction: (id, description, retryAction) => {
    const newTx: Transaction = {
      id,
      description,
      status: "pending",
      txHash: null,
      error: null,
      timestamp: Date.now(),
      retryAction,
    };
    set((state) => ({
      transactions: [newTx, ...state.transactions].slice(0, 50), // keep last 50
    }));
  },
  updateTransaction: (id, updates) => {
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.id === id ? { ...tx, ...updates } : tx
      ),
    }));
  },
  clearTransactions: () => set({ transactions: [] }),
  retryTransaction: async (id) => {
    const tx = get().transactions.find((t) => t.id === id);
    if (!tx || !tx.retryAction) return;

    // Reset status to pending
    get().updateTransaction(id, { status: "pending", error: null, txHash: null });

    try {
      get().updateTransaction(id, { status: "processing" });
      await tx.retryAction();
    } catch (err: any) {
      get().updateTransaction(id, {
        status: "failed",
        error: err.message || "Transaction failed again.",
      });
    }
  },
}));
