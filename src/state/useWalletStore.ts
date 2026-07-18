import { create } from "zustand";

interface WalletState {
  walletAddress: string | null;
  isConnected: boolean;
  walletType: string | null;
  network: "TESTNET" | "PUBLIC";
  setWallet: (address: string, type: string, network: "TESTNET" | "PUBLIC") => void;
  disconnect: () => void;
  setNetwork: (network: "TESTNET" | "PUBLIC") => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  walletAddress: null,
  isConnected: false,
  walletType: null,
  network: "TESTNET",
  setWallet: (address, type, network) =>
    set({
      walletAddress: address,
      isConnected: true,
      walletType: type,
      network,
    }),
  disconnect: () =>
    set({
      walletAddress: null,
      isConnected: false,
      walletType: null,
    }),
  setNetwork: (network) => set({ network }),
}));
