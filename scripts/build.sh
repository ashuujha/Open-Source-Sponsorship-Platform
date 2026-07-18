#!/bin/bash
set -e

echo "Building Soroban smart contracts..."
cargo build --manifest-path contracts/Cargo.toml --target wasm32-unknown-unknown --release
echo "Contracts built successfully!"
