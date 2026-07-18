#!/bin/bash
set -e

# Configuration
NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
PASSPHRASE="Test SDF Network ; September 2015"
ADMIN_ALIAS="admin"
TOKEN_ADDRESS="CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC" # native XLM testnet fallback

echo "Deploying Soroban smart contracts to $NETWORK..."

# 1. Setup Network in stellar-cli
stellar network add --global $NETWORK --rpc-url $RPC_URL --network-passphrase "$PASSPHRASE"

# 2. Check if admin key exists, generate if missing
if ! stellar keys address $ADMIN_ALIAS &>/dev/null; then
  echo "Generating admin keypair..."
  stellar keys generate $ADMIN_ALIAS --network $NETWORK
fi

ADMIN_ADDRESS=$(stellar keys address $ADMIN_ALIAS)
echo "Admin Address: $ADMIN_ADDRESS"

# 3. Build contracts
./scripts/build.sh

# 4. Deploy Registry
echo "Deploying Project Registry..."
REGISTRY_ID=$(stellar contract deploy \
  --wasm contracts/target/wasm32-unknown-unknown/release/project_registry.wasm \
  --source $ADMIN_ALIAS \
  --network $NETWORK)
echo "Project Registry Contract ID: $REGISTRY_ID"

# 5. Deploy Vault
echo "Deploying Sponsorship Vault..."
VAULT_ID=$(stellar contract deploy \
  --wasm contracts/target/wasm32-unknown-unknown/release/sponsorship_vault.wasm \
  --source $ADMIN_ALIAS \
  --network $NETWORK)
echo "Sponsorship Vault Contract ID: $VAULT_ID"

# 6. Initialize Registry
echo "Initializing Project Registry..."
stellar contract invoke \
  --id $REGISTRY_ID \
  --source $ADMIN_ALIAS \
  --network $NETWORK \
  -- \
  initialize \
  --admin $ADMIN_ADDRESS

# 7. Initialize Vault
echo "Initializing Sponsorship Vault..."
stellar contract invoke \
  --id $VAULT_ID \
  --source $ADMIN_ALIAS \
  --network $NETWORK \
  -- \
  initialize \
  --admin $ADMIN_ADDRESS \
  --registry $REGISTRY_ID \
  --token $TOKEN_ADDRESS

# 8. Write to src/contracts.json
cat <<EOF > src/contracts.json
{
  "registry": "$REGISTRY_ID",
  "vault": "$VAULT_ID",
  "asset": "$TOKEN_ADDRESS"
}
EOF

echo "Deployment completed! Contract IDs written to src/contracts.json"
