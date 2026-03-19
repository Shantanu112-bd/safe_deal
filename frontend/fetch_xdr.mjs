import { rpc, Contract, Address, Networks } from "@stellar/stellar-sdk";

const rpcServer = new rpc.Server("https://soroban-testnet.stellar.org", { allowHttp: true });
const contractId = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID || "CDNK66APDPFR4IG5DNNV2RJBZEXNMVRYGU7XKZCFV5TU7AFUPZVLBS7Y";

async function main() {
  const contract = new Contract(contractId);
  // Real account that hopefully has a deal, wait, we don't know it! Let's just create one really quickly on-chain to test decoding! Or just retrieve all deals if there was a way? No.
  const myKey = "GBYQYFOWGJJJ4N6Y7AIOAIFD2R6BYB5YZLGLHGBR2EFSRE4VMFKHK6J6"; // Random valid ed25519 key
  
  const args = [new Address(myKey).toScVal()];
  const call = contract.call("get_seller_deals", ...args);
  
  const tx = new rpc.TransactionBuilder(await rpcServer.getAccount("GABWUKW7P5K7M6IKS47YY73T46TCR5OOGCHZ4LZNRMWX77HOHYQOWDDO"), {
    fee: "100",
    networkPassphrase: Networks.TESTNET
  }).addOperation(call).setTimeout(30).build();

  const sim = await rpcServer.simulateTransaction(tx);
  if (rpc.Api.isSimulationSuccess(sim) && sim.result) {
    const val = sim.result.retval;
    console.log("XDR TYPE:", val.switch().name);
    console.log("XDR BASE64:", val.toXDR("base64"));
  } else {
    console.log("Simulation failed", sim);
  }
}
main();
