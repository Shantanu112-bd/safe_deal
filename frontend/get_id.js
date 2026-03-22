import { Asset } from "@stellar/stellar-sdk";
const asset = new Asset("USDC", "GBBD67IF633SHJY6CIGWSBTEU77OUNMTAOOK7N6A4AKX2HPCY5NQXWVN");
console.log(asset.contractId("Test SDF Network ; September 2015"));
