import {
  rpc,
  TransactionBuilder,
  Networks,
  Keypair,
  Asset,
  Address,
  xdr,
  scValToNative,
  nativeToScVal,
  Horizon,
  Contract,
  Transaction,
  Account,
} from "@stellar/stellar-sdk";

// Network Configuration
export const STELLAR_NETWORK = {
  rpcUrl: "https://soroban-testnet.stellar.org",
  horizonUrl: "https://horizon-testnet.stellar.org",
  networkPassphrase: "Test SDF Network ; September 2015",
};

// Contract Address Config - Fallback to mock addresses if not yet deployed
let contracts = {
  registry: "CBA725B6HNEVGL6BQL4X5J36F4GMLHXZVYYG7P2F2GMX5J4LTYPLREGY", // placeholder
  vault: "CCA725B6HNEVGL6BQL4X5J36F4GMLHXZVYYG7P2F2GMX5J4LTYPLVAUL", // placeholder
  asset: "CAS3J7GY3JWCR5P33JH347ZPS6OU473FB7B7YWU754FEV627725Z276F", // Native Token (XLM) SAC on Testnet
};

try {
  const deployed = require("../contracts.json");
  contracts = { ...contracts, ...deployed };
} catch (e) {
  // use defaults
}

export const CONTRACT_ADDRESSES = contracts;

export const rpcServer = new rpc.Server(STELLAR_NETWORK.rpcUrl);
export const horizonServer = new Horizon.Server(STELLAR_NETWORK.horizonUrl);

/**
 * Fetch account details from Horizon.
 */
export async function getAccountDetails(address: string) {
  return await horizonServer.loadAccount(address);
}

/**
 * Perform a read-only (simulation) call to a Soroban contract.
 */
export async function simulateContractCall(
  contractAddress: string,
  methodName: string,
  args: xdr.ScVal[] = []
): Promise<xdr.ScVal | undefined> {
  const mockSource = Keypair.random();
  const contract = new Contract(contractAddress);
  const tx = new TransactionBuilder(
    new Account(mockSource.publicKey(), "0"),
    {
      fee: "100",
      networkPassphrase: STELLAR_NETWORK.networkPassphrase,
    }
  )
    .addOperation(contract.call(methodName, ...args))
    .setTimeout(30)
    .build();

  const simulation = await rpcServer.simulateTransaction(tx);
  
  if (rpc.Api.isSimulationSuccess(simulation)) {
    const result = simulation.result;
    if (result && result.retval) {
      return result.retval;
    }
  } else {
    console.error("Simulation failed:", simulation);
    const errorMsg = (simulation as any).error || "Simulation failed";
    throw new Error(errorMsg);
  }
  return undefined;
}

/**
 * Run a full state-changing contract transaction.
 */
export async function executeContractTx(
  walletAddress: string,
  signFn: (xdr: string) => Promise<string>,
  contractAddress: string,
  methodName: string,
  args: xdr.ScVal[],
  onStatusUpdate: (
    status: "processing" | "confirmed" | "failed",
    txHash: string | null,
    error: string | null
  ) => void
): Promise<string> {
  try {
    // 1. Fetch account sequence
    const account = await getAccountDetails(walletAddress);
    const contract = new Contract(contractAddress);

    // 2. Build preliminary transaction
    const tx = new TransactionBuilder(account, {
      fee: "100", // base fee, will be replaced by simulation
      networkPassphrase: STELLAR_NETWORK.networkPassphrase,
    })
      .addOperation(contract.call(methodName, ...args))
      .setTimeout(60)
      .build();

    // 3. Simulate transaction
    onStatusUpdate("processing", null, null);
    const simulation = await rpcServer.simulateTransaction(tx);
    
    if (!rpc.Api.isSimulationSuccess(simulation)) {
      throw new Error("Transaction simulation failed: " + JSON.stringify(simulation));
    }

    // 4. Assemble the simulated transaction
    const preparedTx = rpc.assembleTransaction(tx, simulation) as any;

    // 5. Send to wallet for signing
    const signedXdr = await signFn(preparedTx.toXDR());

    // 6. Submit transaction to RPC node
    const submitResponse = await rpcServer.sendTransaction(
      TransactionBuilder.fromXDR(signedXdr, STELLAR_NETWORK.networkPassphrase) as Transaction
    );

    if (submitResponse.status === "ERROR") {
      throw new Error("Transaction submission failed: " + JSON.stringify(submitResponse.errorResult));
    }

    const txHash = submitResponse.hash;
    
    // 7. Poll transaction status
    let status: string = submitResponse.status;
    let pollAttempts = 0;
    const maxPollAttempts = 30;

    while (status === "PENDING" && pollAttempts < maxPollAttempts) {
      pollAttempts++;
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const txResult = await rpcServer.getTransaction(txHash);
      status = txResult.status;

      if (status === "SUCCESS") {
        onStatusUpdate("confirmed", txHash, null);
        return txHash;
      } else if (status === "FAILED") {
        const errorResult = (txResult as any).resultXdr || "Transaction failed";
        throw new Error("Transaction execution failed: " + errorResult);
      }
    }

    if (status === "PENDING") {
      throw new Error("Transaction timed out waiting for confirmation.");
    }

    return txHash;
  } catch (err: any) {
    console.error("executeContractTx failed:", err);
    onStatusUpdate("failed", null, err.message || "Unknown error occurred.");
    throw err;
  }
}

// ScVal Conversions Helpers
export function addressToScVal(address: string): xdr.ScVal {
  return new Address(address).toScVal();
}

export function parseProject(scVal: xdr.ScVal) {
  const native = scValToNative(scVal);
  return {
    id: Number(native.id),
    owner: native.owner,
    name: native.name,
    githubUrl: native.github_url,
    description: native.description,
    category: native.category,
    verified: native.verified,
    registeredAt: Number(native.registered_at),
  };
}

export function parseEscrow(scVal: xdr.ScVal) {
  const native = scValToNative(scVal);
  return {
    projectId: Number(native.project_id),
    totalSponsored: Number(native.total_sponsored),
    balance: Number(native.balance),
    milestoneCount: Number(native.milestone_count),
  };
}

export function parseMilestone(scVal: xdr.ScVal) {
  const native = scValToNative(scVal);
  return {
    id: Number(native.id),
    title: native.title,
    description: native.description,
    amount: Number(native.amount),
    status: Number(native.status), // 0 = Proposed, 1 = Active, 2 = Flagged, 3 = Completed, 4 = Claimed
    flagsCount: Number(native.flags_count),
    releaseTime: Number(native.release_time),
  };
}
