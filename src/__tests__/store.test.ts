import { describe, it, expect, beforeEach } from "vitest";
import { useWalletStore } from "../state/useWalletStore";
import { useTransactionStore } from "../state/useTransactionStore";

describe("Global Zustand Stores", () => {
  beforeEach(() => {
    useWalletStore.getState().disconnect();
    useTransactionStore.getState().clearTransactions();
  });

  describe("useWalletStore", () => {
    it("should initialize with disconnected state", () => {
      const state = useWalletStore.getState();
      expect(state.isConnected).toBe(false);
      expect(state.walletAddress).toBeNull();
      expect(state.walletType).toBeNull();
    });

    it("should login correctly when setWallet is called", () => {
      useWalletStore.getState().setWallet("GAADAddress", "Freighter", "TESTNET");
      const state = useWalletStore.getState();
      expect(state.isConnected).toBe(true);
      expect(state.walletAddress).toBe("GAADAddress");
      expect(state.walletType).toBe("Freighter");
    });
  });

  describe("useTransactionStore", () => {
    it("should initialize with an empty queue", () => {
      const state = useTransactionStore.getState();
      expect(state.transactions).toHaveLength(0);
    });

    it("should add a pending transaction and update its status on confirmation", () => {
      const store = useTransactionStore.getState();
      const txId = "tx-123";
      store.addTransaction(txId, "Sponsoring project #1", async () => "txhash");

      let state = useTransactionStore.getState();
      expect(state.transactions).toHaveLength(1);
      expect(state.transactions[0].id).toBe(txId);
      expect(state.transactions[0].status).toBe("pending");

      store.updateTransaction(txId, { status: "confirmed", txHash: "0xhash" });
      state = useTransactionStore.getState();
      expect(state.transactions[0].status).toBe("confirmed");
      expect(state.transactions[0].txHash).toBe("0xhash");
    });
  });
});
