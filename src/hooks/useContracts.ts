import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  nativeToScVal,
  xdr,
  scValToNative,
} from "@stellar/stellar-sdk";
import {
  simulateContractCall,
  executeContractTx,
  addressToScVal,
  CONTRACT_ADDRESSES,
  parseProject,
  parseEscrow,
  parseMilestone,
} from "@/services/stellar";
import { useStellarWallet } from "@/hooks/useStellarWallet";
import { useTransactionStore } from "@/state/useTransactionStore";

// Queries

export function useProjectQuery(projectId: number) {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      if (!projectId || projectId <= 0) return null;
      const resVal = await simulateContractCall(
        CONTRACT_ADDRESSES.registry,
        "get_project",
        [nativeToScVal(BigInt(projectId), { type: "u64" })]
      );
      if (!resVal) return null;
      const native = scValToNative(resVal);
      if (native === null || native === undefined) return null;
      return parseProject(resVal);
    },
    enabled: projectId > 0,
  });
}

export function useProjectCountQuery() {
  return useQuery({
    queryKey: ["project-count"],
    queryFn: async () => {
      const resVal = await simulateContractCall(
        CONTRACT_ADDRESSES.registry,
        "get_project_count",
        []
      );
      if (!resVal) return 0;
      return Number(scValToNative(resVal));
    },
  });
}

export function useAllProjectsQuery() {
  const { data: count = 0 } = useProjectCountQuery();
  return useQuery({
    queryKey: ["all-projects", count],
    queryFn: async () => {
      const projects = [];
      for (let i = 1; i <= count; i++) {
        try {
          const resVal = await simulateContractCall(
            CONTRACT_ADDRESSES.registry,
            "get_project",
            [nativeToScVal(BigInt(i), { type: "u64" })]
          );
          if (resVal) {
            projects.push(parseProject(resVal));
          }
        } catch (e) {
          console.error(`Error loading project ${i}:`, e);
        }
      }
      return projects.reverse(); // Newest first
    },
    enabled: count >= 0,
  });
}

export function useEscrowQuery(projectId: number) {
  return useQuery({
    queryKey: ["escrow", projectId],
    queryFn: async () => {
      if (!projectId || projectId <= 0) return null;
      const resVal = await simulateContractCall(
        CONTRACT_ADDRESSES.vault,
        "get_escrow",
        [nativeToScVal(BigInt(projectId), { type: "u64" })]
      );
      if (!resVal) return null;
      const native = scValToNative(resVal);
      if (native === null || native === undefined) return null;
      return parseEscrow(resVal);
    },
    enabled: projectId > 0,
  });
}

export function useMilestonesQuery(projectId: number, milestoneCount: number) {
  return useQuery({
    queryKey: ["milestones", projectId, milestoneCount],
    queryFn: async () => {
      if (!projectId || projectId <= 0 || !milestoneCount) return [];
      const milestones = [];
      for (let i = 1; i <= milestoneCount; i++) {
        try {
          const resVal = await simulateContractCall(
            CONTRACT_ADDRESSES.vault,
            "get_milestone",
            [
              nativeToScVal(BigInt(projectId), { type: "u64" }),
              nativeToScVal(i, { type: "u32" }),
            ]
          );
          if (resVal) {
            milestones.push(parseMilestone(resVal));
          }
        } catch (e) {
          console.error(`Error loading milestone ${i}:`, e);
        }
      }
      return milestones;
    },
    enabled: projectId > 0 && milestoneCount > 0,
  });
}

export function useSponsorContributionQuery(projectId: number, sponsorAddress: string | null) {
  return useQuery({
    queryKey: ["contribution", projectId, sponsorAddress],
    queryFn: async () => {
      if (!projectId || !sponsorAddress) return 0;
      const resVal = await simulateContractCall(
        CONTRACT_ADDRESSES.vault,
        "get_contribution",
        [
          nativeToScVal(BigInt(projectId), { type: "u64" }),
          addressToScVal(sponsorAddress),
        ]
      );
      if (!resVal) return 0;
      return Number(scValToNative(resVal));
    },
    enabled: projectId > 0 && !!sponsorAddress,
  });
}

// Mutations

export function useRegisterProject() {
  const { walletAddress, sign } = useStellarWallet();
  const { addTransaction, updateTransaction } = useTransactionStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      githubUrl,
      description,
      category,
    }: {
      name: string;
      githubUrl: string;
      description: string;
      category: string;
    }) => {
      if (!walletAddress) throw new Error("Wallet not connected");
      const txId = `reg-${Date.now()}`;
      
      const execute = async () => {
        return executeContractTx(
          walletAddress,
          sign,
          CONTRACT_ADDRESSES.registry,
          "register_project",
          [
            addressToScVal(walletAddress),
            nativeToScVal(name, { type: "string" }),
            nativeToScVal(githubUrl, { type: "string" }),
            nativeToScVal(description, { type: "string" }),
            nativeToScVal(category, { type: "string" }),
          ],
          (status, txHash, error) => {
            updateTransaction(txId, { status, txHash, error });
          }
        );
      };

      addTransaction(txId, `Register project: "${name}"`, execute);
      const txHash = await execute();
      queryClient.invalidateQueries({ queryKey: ["project-count"] });
      queryClient.invalidateQueries({ queryKey: ["all-projects"] });
      return txHash;
    },
  });
}

export function useSponsorProject() {
  const { walletAddress, sign } = useStellarWallet();
  const { addTransaction, updateTransaction } = useTransactionStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      amount,
      projectName,
    }: {
      projectId: number;
      amount: number;
      projectName: string;
    }) => {
      if (!walletAddress) throw new Error("Wallet not connected");
      const txId = `spon-${Date.now()}`;
      
      // Amount in stroops (10^7 factor)
      const tokenAmount = BigInt(amount) * 10000000n;

      const execute = async () => {
        return executeContractTx(
          walletAddress,
          sign,
          CONTRACT_ADDRESSES.vault,
          "sponsor_project",
          [
            addressToScVal(walletAddress),
            nativeToScVal(BigInt(projectId), { type: "u64" }),
            nativeToScVal(tokenAmount, { type: "i128" }),
          ],
          (status, txHash, error) => {
            updateTransaction(txId, { status, txHash, error });
          }
        );
      };

      addTransaction(txId, `Sponsor project "${projectName}" with ${amount} XLM`, execute);
      const txHash = await execute();
      queryClient.invalidateQueries({ queryKey: ["escrow", projectId] });
      queryClient.invalidateQueries({ queryKey: ["contribution", projectId, walletAddress] });
      return txHash;
    },
  });
}

export function useVerifyProject() {
  const { walletAddress, sign } = useStellarWallet();
  const { addTransaction, updateTransaction } = useTransactionStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      verified,
      projectName,
    }: {
      projectId: number;
      verified: boolean;
      projectName: string;
    }) => {
      if (!walletAddress) throw new Error("Wallet not connected");
      const txId = `ver-${Date.now()}`;

      const execute = async () => {
        return executeContractTx(
          walletAddress,
          sign,
          CONTRACT_ADDRESSES.registry,
          "verify_project",
          [
            nativeToScVal(BigInt(projectId), { type: "u64" }),
            nativeToScVal(verified),
          ],
          (status, txHash, error) => {
            updateTransaction(txId, { status, txHash, error });
          }
        );
      };

      addTransaction(
        txId,
        `${verified ? "Verify" : "Unverify"} project "${projectName}"`,
        execute
      );
      const txHash = await execute();
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["all-projects"] });
      return txHash;
    },
  });
}

export function useProposeMilestone() {
  const { walletAddress, sign } = useStellarWallet();
  const { addTransaction, updateTransaction } = useTransactionStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      title,
      description,
      amount,
      projectName,
    }: {
      projectId: number;
      title: string;
      description: string;
      amount: number;
      projectName: string;
    }) => {
      if (!walletAddress) throw new Error("Wallet not connected");
      const txId = `prop-ms-${Date.now()}`;
      const tokenAmount = BigInt(amount) * 10000000n;

      const execute = async () => {
        return executeContractTx(
          walletAddress,
          sign,
          CONTRACT_ADDRESSES.vault,
          "propose_milestone",
          [
            nativeToScVal(BigInt(projectId), { type: "u64" }),
            nativeToScVal(title, { type: "string" }),
            nativeToScVal(description, { type: "string" }),
            nativeToScVal(tokenAmount, { type: "i128" }),
          ],
          (status, txHash, error) => {
            updateTransaction(txId, { status, txHash, error });
          }
        );
      };

      addTransaction(
        txId,
        `Propose milestone "${title}" for project "${projectName}" (${amount} XLM)`,
        execute
      );
      const txHash = await execute();
      queryClient.invalidateQueries({ queryKey: ["escrow", projectId] });
      queryClient.invalidateQueries({ queryKey: ["milestones", projectId] });
      return txHash;
    },
  });
}

export function useStartMilestone() {
  const { walletAddress, sign } = useStellarWallet();
  const { addTransaction, updateTransaction } = useTransactionStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      milestoneId,
      milestoneTitle,
      lockupDurationSeconds,
    }: {
      projectId: number;
      milestoneId: number;
      milestoneTitle: string;
      lockupDurationSeconds: number;
    }) => {
      if (!walletAddress) throw new Error("Wallet not connected");
      const txId = `start-ms-${Date.now()}`;

      const execute = async () => {
        return executeContractTx(
          walletAddress,
          sign,
          CONTRACT_ADDRESSES.vault,
          "start_milestone",
          [
            nativeToScVal(BigInt(projectId), { type: "u64" }),
            nativeToScVal(milestoneId, { type: "u32" }),
            nativeToScVal(BigInt(lockupDurationSeconds), { type: "u64" }),
          ],
          (status, txHash, error) => {
            updateTransaction(txId, { status, txHash, error });
          }
        );
      };

      addTransaction(txId, `Start review lockup window for milestone "${milestoneTitle}"`, execute);
      const txHash = await execute();
      queryClient.invalidateQueries({ queryKey: ["milestones", projectId] });
      return txHash;
    },
  });
}

export function useFlagMilestone() {
  const { walletAddress, sign } = useStellarWallet();
  const { addTransaction, updateTransaction } = useTransactionStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      milestoneId,
      milestoneTitle,
    }: {
      projectId: number;
      milestoneId: number;
      milestoneTitle: string;
    }) => {
      if (!walletAddress) throw new Error("Wallet not connected");
      const txId = `flag-ms-${Date.now()}`;

      const execute = async () => {
        return executeContractTx(
          walletAddress,
          sign,
          CONTRACT_ADDRESSES.vault,
          "flag_milestone",
          [
            addressToScVal(walletAddress),
            nativeToScVal(BigInt(projectId), { type: "u64" }),
            nativeToScVal(milestoneId, { type: "u32" }),
          ],
          (status, txHash, error) => {
            updateTransaction(txId, { status, txHash, error });
          }
        );
      };

      addTransaction(txId, `Flag milestone payout dispute for "${milestoneTitle}"`, execute);
      const txHash = await execute();
      queryClient.invalidateQueries({ queryKey: ["milestones", projectId] });
      return txHash;
    },
  });
}

export function useResolveMilestone() {
  const { walletAddress, sign } = useStellarWallet();
  const { addTransaction, updateTransaction } = useTransactionStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      milestoneId,
      milestoneTitle,
      approve,
    }: {
      projectId: number;
      milestoneId: number;
      milestoneTitle: string;
      approve: boolean;
    }) => {
      if (!walletAddress) throw new Error("Wallet not connected");
      const txId = `resolve-ms-${Date.now()}`;

      const execute = async () => {
        return executeContractTx(
          walletAddress,
          sign,
          CONTRACT_ADDRESSES.vault,
          "resolve_flagged_milestone",
          [
            nativeToScVal(BigInt(projectId), { type: "u64" }),
            nativeToScVal(milestoneId, { type: "u32" }),
            nativeToScVal(approve),
          ],
          (status, txHash, error) => {
            updateTransaction(txId, { status, txHash, error });
          }
        );
      };

      addTransaction(
        txId,
        `Admin resolve milestone "${milestoneTitle}" - ${approve ? "Approve Payout" : "Reject & Refund"}`,
        execute
      );
      const txHash = await execute();
      queryClient.invalidateQueries({ queryKey: ["escrow", projectId] });
      queryClient.invalidateQueries({ queryKey: ["milestones", projectId] });
      return txHash;
    },
  });
}

export function useClaimMilestone() {
  const { walletAddress, sign } = useStellarWallet();
  const { addTransaction, updateTransaction } = useTransactionStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      milestoneId,
      milestoneTitle,
      amount,
    }: {
      projectId: number;
      milestoneId: number;
      milestoneTitle: string;
      amount: number;
    }) => {
      if (!walletAddress) throw new Error("Wallet not connected");
      const txId = `claim-ms-${Date.now()}`;

      const execute = async () => {
        return executeContractTx(
          walletAddress,
          sign,
          CONTRACT_ADDRESSES.vault,
          "claim_milestone_payout",
          [
            nativeToScVal(BigInt(projectId), { type: "u64" }),
            nativeToScVal(milestoneId, { type: "u32" }),
          ],
          (status, txHash, error) => {
            updateTransaction(txId, { status, txHash, error });
          }
        );
      };

      addTransaction(txId, `Claim milestone payout for "${milestoneTitle}" (${amount} XLM)`, execute);
      const txHash = await execute();
      queryClient.invalidateQueries({ queryKey: ["escrow", projectId] });
      queryClient.invalidateQueries({ queryKey: ["milestones", projectId] });
      return txHash;
    },
  });
}
