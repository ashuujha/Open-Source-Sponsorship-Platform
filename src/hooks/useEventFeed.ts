import { useEffect, useState, useRef } from "react";
import { rpc, scValToNative } from "@stellar/stellar-sdk";
import { rpcServer, CONTRACT_ADDRESSES, STELLAR_NETWORK } from "@/services/stellar";

export interface ContractEvent {
  id: string;
  type: string; // e.g. "project_registered", "project_sponsored"
  contractType: "registry" | "vault";
  timestamp: string;
  description: string;
  txHash: string;
  data: any;
}

export function useEventFeed() {
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const startLedgerRef = useRef<number | null>(null);
  const isPollingRef = useRef<boolean>(false);

  useEffect(() => {
    let intervalId: any;

    const fetchInitialLedgerAndEvents = async () => {
      try {
        // 1. Get latest ledger
        const info = await rpcServer.getLatestLedger();
        const latestLedger = info.sequence;
        
        // Start polling from 100 ledgers ago to show initial history
        startLedgerRef.current = Math.max(1, latestLedger - 100);
        
        await pollEvents();
      } catch (e) {
        console.error("Failed to initialize event feed:", e);
      } finally {
        setIsLoading(false);
      }
    };

    const pollEvents = async () => {
      if (isPollingRef.current || !startLedgerRef.current) return;
      isPollingRef.current = true;

      try {
        const response = await rpcServer.getEvents({
          startLedger: startLedgerRef.current,
          filters: [
            {
              type: "contract",
              contractIds: [CONTRACT_ADDRESSES.registry, CONTRACT_ADDRESSES.vault],
            },
          ],
          limit: 30,
        });

        if (response.events && response.events.length > 0) {
          const parsedEvents = response.events.map((event) => {
            const topic = event.topic[1] ? scValToNative(event.topic[1]) : "";
            const value = scValToNative(event.value);
            
            // Translate the ScVal event data into human-readable strings
            let type = typeof topic === "string" ? topic : "unknown";
            let contractType: "registry" | "vault" = 
              event.contractId?.toString() === CONTRACT_ADDRESSES.registry ? "registry" : "vault";
            let description = "Contract action performed";
            let timestamp = new Date(Number(event.ledgerClosedAt) * 1000).toLocaleTimeString();

            if (type === "project_registered") {
              const [id, owner] = value;
              description = `Developer ${shortenAddress(owner)} registered project #${id}`;
            } else if (type === "project_verified") {
              const [id, verified] = value;
              description = `Project #${id} was ${verified ? "verified" : "unverified"} by admin`;
            } else if (type === "ownership_transferred") {
              const [id, oldOwner, newOwner] = value;
              description = `Project #${id} ownership transferred to ${shortenAddress(newOwner)}`;
            } else if (type === "project_sponsored") {
              const [id, sponsor, amount] = value;
              const xlmAmount = Number(amount) / 10000000;
              description = `${shortenAddress(sponsor)} sponsored project #${id} with ${xlmAmount} XLM`;
            } else if (type === "milestone_proposed") {
              const [id, msId, amount] = value;
              const xlmAmount = Number(amount) / 10000000;
              description = `Project #${id} proposed Milestone #${msId} for ${xlmAmount} XLM`;
            } else if (type === "milestone_activated") {
              const [id, msId, releaseTime] = value;
              description = `Project #${id} started review lock-up for Milestone #${msId}`;
            } else if (type === "milestone_flagged") {
              const [id, msId, sponsor] = value;
              description = `Sponsor ${shortenAddress(sponsor)} FLAGGED Milestone #${msId} on Project #${id}`;
            } else if (type === "milestone_resolved") {
              const [id, msId, approved] = value;
              description = `Admin resolved Milestone #${msId} on Project #${id}: ${approved ? "Approved" : "Rejected & Refunded"}`;
            } else if (type === "milestone_payout_claimed") {
              const [id, msId, owner, amount] = value;
              const xlmAmount = Number(amount) / 10000000;
              description = `Project #${id} owner claimed ${xlmAmount} XLM payout for Milestone #${msId}`;
            }

            return {
              id: event.id,
              type,
              contractType,
              timestamp,
              description,
              txHash: event.txHash,
              data: value,
            };
          });

          // Prepend new events, remove duplicates based on event.id
          setEvents((prev) => {
            const combined = [...parsedEvents, ...prev];
            const uniqueMap = new Map();
            combined.forEach((item) => uniqueMap.set(item.id, item));
            return Array.from(uniqueMap.values()).slice(0, 50); // limit to 50
          });

          // Move start ledger forward to the ledger after the latest event retrieved
          const maxLedger = Math.max(...response.events.map((e) => e.ledger));
          startLedgerRef.current = maxLedger + 1;
        }
      } catch (err) {
        console.error("Error polling events:", err);
      } finally {
        isPollingRef.current = false;
      }
    };

    fetchInitialLedgerAndEvents();
    
    // Poll every 5 seconds
    intervalId = setInterval(pollEvents, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return { events, isLoading };
}

function shortenAddress(addr: string) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 5)}...${addr.slice(-5)}`;
}
