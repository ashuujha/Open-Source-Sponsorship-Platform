import { useEffect, useState } from "react";
import { StellarWalletsKit, Networks } from "@creit.tech/stellar-wallets-kit";
import { FreighterModule } from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { AlbedoModule } from "@creit.tech/stellar-wallets-kit/modules/albedo";
import { xBullModule } from "@creit.tech/stellar-wallets-kit/modules/xbull";
import { useWalletStore } from "@/state/useWalletStore";
import { useTransactionStore } from "@/state/useTransactionStore";

let kitInitialized = false;

export function initializeKit() {
  if (typeof window === "undefined") return;
  if (!kitInitialized) {
    StellarWalletsKit.init({
      network: Networks.TESTNET,
      modules: [
        new FreighterModule(),
        new AlbedoModule(),
        new xBullModule(),
      ],
    });
    kitInitialized = true;
  }
}

export function useStellarWallet() {
  const { walletAddress, isConnected, walletType, network, setWallet, disconnect } =
    useWalletStore();
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize and check for existing connections on mount
  useEffect(() => {
    if (typeof window !== "undefined" && !isConnected) {
      const savedAddress = localStorage.getItem("OS_SPONSOR_WALLET_ADDR");
      const savedType = localStorage.getItem("OS_SPONSOR_WALLET_TYPE");
      if (savedAddress && savedType) {
        initializeKit();
        // Set active wallet name in kit memory if we saved it
        try {
          if (savedType === "Freighter") StellarWalletsKit.setWallet("freighter");
          else if (savedType === "Albedo") StellarWalletsKit.setWallet("albedo");
          else if (savedType === "xBull") StellarWalletsKit.setWallet("xbull");
        } catch (e) {}
        setWallet(savedAddress, savedType, "TESTNET");
      }
    }
  }, [isConnected, setWallet]);

  const connectWallet = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    initializeKit();

    try {
      const result = await StellarWalletsKit.authModal();
      if (result && result.address) {
        let walletName = "Stellar";
        try {
          walletName = StellarWalletsKit.selectedModule.productName || "Stellar";
        } catch (e) {}

        setWallet(result.address, walletName, "TESTNET");
        localStorage.setItem("OS_SPONSOR_WALLET_ADDR", result.address);
        localStorage.setItem("OS_SPONSOR_WALLET_TYPE", walletName);
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await StellarWalletsKit.disconnect();
    } catch (e) {}
    disconnect();
    localStorage.removeItem("OS_SPONSOR_WALLET_ADDR");
    localStorage.removeItem("OS_SPONSOR_WALLET_TYPE");
  };

  const signTransaction = async (txXdr: string): Promise<string> => {
    initializeKit();
    if (!isConnected || !walletAddress) {
      throw new Error("Wallet not connected");
    }

    const signed = await StellarWalletsKit.signTransaction(txXdr);
    
    if (typeof signed === "string") return signed;
    if (signed && typeof signed === "object") {
      const val = (signed as any).signedTxXdr || (signed as any).xdr || (signed as any).signedTx;
      if (val) return val;
    }
    
    throw new Error("Invalid signature format returned from wallet");
  };

  return {
    walletAddress,
    isConnected,
    walletType,
    network,
    isConnecting,
    connect: connectWallet,
    disconnect: disconnectWallet,
    sign: signTransaction,
  };
}
