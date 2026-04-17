#!/bin/bash
set -e

cd "/Users/macbook/Desktop/Safe deal"

export PATH="$HOME/.cargo/bin:$PATH"
export STELLAR_ACCOUNT=deployer
export STELLAR_NETWORK=testnet

# 1. seller-verification
echo "Deploying seller-verification..."
cd contracts/seller-verification
cargo build --target wasm32-unknown-unknown --release
VER=$(stellar contract deploy --wasm target/wasm32-unknown-unknown/release/seller_verification.wasm)
echo "VERIFICATION_ID=$VER"
# Initialize seller verification with admin
stellar contract invoke --id $VER --network testnet --source deployer -- initialize --admin deployer
cd ../..

# 2. fraud-detection
echo "Deploying fraud-detection..."
cd contracts/fraud-detection
cargo build --target wasm32-unknown-unknown --release
FRAUD=$(stellar contract deploy --wasm target/wasm32-unknown-unknown/release/fraud_detection.wasm)
echo "FRAUD_ID=$FRAUD"
# Initialize fraud detection with admin
stellar contract invoke --id $FRAUD --network testnet --source deployer -- initialize --admin deployer
cd ../..

# 3. dispute-resolution
echo "Deploying dispute-resolution..."
cd contracts/dispute-resolution
cargo build --target wasm32-unknown-unknown --release
DISP=$(stellar contract deploy --wasm target/wasm32-unknown-unknown/release/dispute_resolution.wasm)
echo "DISPUTE_ID=$DISP"
# Initialize dispute resolution with admin
stellar contract invoke --id $DISP --network testnet --source deployer -- initialize --admin deployer
cd ../..

# 4. merchant-escrow
echo "Deploying merchant-escrow..."
cd contracts/merchant-escrow
cargo build --target wasm32-unknown-unknown --release
# Testnet USDC (using Circle's testnet USDC address or equivalent testnet token)
export USDC_TOKEN="CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"

ESC=$(stellar contract deploy --wasm target/wasm32-unknown-unknown/release/merchant_escrow.wasm)
echo "ESCROW_ID=$ESC"
# Initialize escrow with admin and USDC token
stellar contract invoke --id $ESC --network testnet --source deployer -- initialize --admin deployer --token_address $USDC_TOKEN
cd ../..

# 5. fiat-bridge
echo "Deploying fiat-bridge..."
cd contracts/fiat-bridge
cargo build --target wasm32-unknown-unknown --release
FIAT=$(stellar contract deploy --wasm target/wasm32-unknown-unknown/release/fiat_bridge.wasm)
echo "FIAT_ID=$FIAT"
# Initialize fiat bridge with admin and USDC token
stellar contract invoke --id $FIAT --network testnet --source deployer -- initialize --admin deployer --token_address $USDC_TOKEN
cd ../..
